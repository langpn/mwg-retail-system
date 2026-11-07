package com.example.demojpa;

import com.example.demojpa.entity.Inventory;
import com.example.demojpa.entity.Product;
import com.example.demojpa.entity.StoreBranch;
import com.example.demojpa.repository.*;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.metamodel.EntityType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Set;
import java.util.stream.Collectors;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Bộ kiểm thử tích hợp toàn diện (JUnit 5 + MockMvc) cho Hệ thống Bán lẻ Điện Máy Xanh (MWG).
 * Phục vụ báo cáo và bảo vệ đồ án kết thúc học phần Lập trình Java Nâng cao / Spring Boot JPA.
 *
 * Kiểm chứng đầy đủ:
 *  1. Metamodel JPA chuẩn 10 Thực thể (không còn Student) & 10/10 Repositories có dữ liệu DataSeeder.
 *  2. REST API Phân hệ 1: Tìm kiếm & Lọc đa tiêu chí Sản phẩm qua JPQL, Danh mục, Thương hiệu.
 *  3. REST API Phân hệ 2: Tra cứu tồn kho theo SKU & Quận, Cập nhật tồn kho (HTTP PUT).
 *  4. REST API Phân hệ 3: Tạo đơn hàng áp dụng mã giảm giá MWG5, tự động trừ tồn kho, từ chối hàng hết (400 Bad Request).
 *  5. Tuần tự hóa JSON sạch sẽ (Jackson Clean Serialization) không dính đệ quy vòng lặp cho Khách hàng, Khuyến mãi, Đánh giá, Đơn hàng.
 *  6. Định tuyến tĩnh React SPA (/dashboard -> /dashboard.html) & Giao diện phụ Spring MVC Thymeleaf SSR (/mvc/catalog).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class DemojpaApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EntityManagerFactory entityManagerFactory;

    @Autowired
    private CategoryRepository categoryRepo;

    @Autowired
    private BrandRepository brandRepo;

    @Autowired
    private ProductRepository productRepo;

    @Autowired
    private StoreBranchRepository branchRepo;

    @Autowired
    private InventoryRepository inventoryRepo;

    @Autowired
    private CustomerRepository customerRepo;

    @Autowired
    private PromotionRepository promoRepo;

    @Autowired
    private ProductReviewRepository reviewRepo;

    @Autowired
    private CustomerOrderRepository orderRepo;

    @Autowired
    private OrderItemRepository orderItemRepo;

    /**
     * Test 1: Kiểm chứng CSDL đã chuẩn hóa chính xác 10 Thực thể Bán lẻ MWG và 10/10 Repositories có dữ liệu.
     */
    @Test
    @DisplayName("1. Metamodel JPA có đúng 10 Entities bán lẻ (loại bỏ sạch Student) & 10 Repositories có dữ liệu")
    void metamodelHasExactly10RetailEntitiesAndSeededData() {
        Set<EntityType<?>> entities = entityManagerFactory.getMetamodel().getEntities();
        Set<String> entityNames = entities.stream()
                .map(EntityType::getName)
                .collect(Collectors.toSet());

        // Khẳng định đúng 10 entities
        assertEquals(10, entities.size(), "Hệ thống CSDL bán lẻ MWG phải có đúng 10 Thực thể JPA");

        // Khẳng định tuyệt đối không còn thực thể mẫu 'Student'
        assertFalse(entityNames.contains("Student"), "Tuyệt đối không còn thực thể Student từ bài thực hành cũ");

        // Khẳng định đủ 10 thực thể nghiệp vụ bán lẻ
        Set<String> expectedEntities = Set.of(
                "Brand", "Category", "Customer", "CustomerOrder", "Inventory",
                "OrderItem", "Product", "ProductReview", "Promotion", "StoreBranch"
        );
        assertTrue(entityNames.containsAll(expectedEntities), "Metamodel phải chứa đầy đủ 10 thực thể MWG");

        // Khẳng định cả 10/10 Repositories đều có dữ liệu mẫu được nạp bởi DataSeeder
        assertTrue(categoryRepo.count() > 0, "CategoryRepository count > 0");
        assertTrue(brandRepo.count() > 0, "BrandRepository count > 0");
        assertTrue(productRepo.count() > 0, "ProductRepository count > 0");
        assertTrue(branchRepo.count() > 0, "StoreBranchRepository count > 0");
        assertTrue(inventoryRepo.count() > 0, "InventoryRepository count > 0");
        assertTrue(customerRepo.count() > 0, "CustomerRepository count > 0");
        assertTrue(promoRepo.count() > 0, "PromotionRepository count > 0");
        assertTrue(reviewRepo.count() > 0, "ProductReviewRepository count > 0");
        assertTrue(orderRepo.count() > 0, "CustomerOrderRepository count > 0");
        assertTrue(orderItemRepo.count() > 0, "OrderItemRepository count > 0");
    }

    /**
     * Test 2: Kiểm chứng REST API tìm kiếm và lọc đa tiêu chí Sản phẩm qua JPQL, Danh mục và Thương hiệu.
     */
    @Test
    @DisplayName("2. REST API Sản phẩm lọc đa tiêu chí JPQL (Danh mục MAYGIAT, giá <= 8tr) & Danh mục, Thương hiệu")
    void productSearchFilterAndCrudWorks() throws Exception {
        // 1. Lọc sản phẩm máy giặt có giá <= 8.000.000đ: Phải chứa Toshiba (7.49tr) và loại bỏ LG (8.99tr), Panasonic (9.89tr)
        mockMvc.perform(get("/api/v1/products")
                        .param("category", "MAYGIAT")
                        .param("maxPrice", "8000000"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[?(@.sku == 'DMX-MG-001')]").exists())
                .andExpect(jsonPath("$[?(@.sku == 'DMX-MG-002')]").doesNotExist())
                .andExpect(jsonPath("$[?(@.sku == 'DMX-MG-003')]").doesNotExist())
                .andExpect(jsonPath("$[?(@.price > 8000000)]").doesNotExist());

        // 2. Tra cứu danh sách danh mục
        mockMvc.perform(get("/api/v1/products/categories"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(3))))
                .andExpect(jsonPath("$[?(@.code == 'MAYGIAT')]").exists());

        // 3. Tra cứu danh sách thương hiệu
        mockMvc.perform(get("/api/v1/products/brands"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(4))))
                .andExpect(jsonPath("$[?(@.name == 'Toshiba')]").exists());
    }

    /**
     * Test 3: Kiểm chứng REST API tra cứu tồn kho theo chi nhánh/quận và cập nhật tồn kho (HTTP PUT).
     */
    @Test
    @DisplayName("3. REST API Tồn kho tra cứu theo SKU & Quận và cập nhật số lượng tồn kho (HTTP PUT)")
    void inventoryCheckAndUpdateWorks() throws Exception {
        // 1. Kiểm tra tồn kho khả dụng của DMX-MG-001 tại Quận 9
        mockMvc.perform(get("/api/v1/inventory/check")
                        .param("sku", "DMX-MG-001")
                        .param("district", "Quận 9"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.product.sku", is("DMX-MG-001")))
                .andExpect(jsonPath("$.storeBranch.district", containsString("Quận 9")))
                .andExpect(jsonPath("$.quantity", greaterThanOrEqualTo(0)));

        // 2. Cập nhật tồn kho qua HTTP PUT: Tăng tồn kho sản phẩm 1 tại chi nhánh Quận 9 lên 18
        Product p1 = productRepo.findBySku("DMX-MG-001").orElseThrow();
        StoreBranch branchQ9 = branchRepo.findAll().stream()
                .filter(b -> b.getDistrict().contains("9"))
                .findFirst()
                .orElseThrow();

        String updatePayload = String.format("{\"productId\": %d, \"branchId\": %d, \"quantity\": 18}",
                p1.getId(), branchQ9.getId());

        mockMvc.perform(put("/api/v1/inventory/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatePayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity", is(18)));

        // Kiểm tra trực tiếp trong CSDL
        Inventory updatedInv = inventoryRepo.findByProduct_IdAndStoreBranch_Id(p1.getId(), branchQ9.getId()).orElseThrow();
        assertEquals(18, updatedInv.getQuantity(), "Tồn kho trong CSDL phải được cập nhật thành 18");
    }

    /**
     * Test 4: Kiểm chứng quy trình đặt mua hàng: áp dụng mã giảm giá, trừ kho chi nhánh và từ chối hàng hết.
     */
    @Test
    @DisplayName("4. REST API Tạo đơn hàng: áp dụng mã MWG5 giảm 5%, tự động trừ tồn kho, từ chối khi hết hàng (400 Bad Request)")
    void orderCreationAppliesPromoDeductsStockAndRejectsOutOfStock() throws Exception {
        Product p1 = productRepo.findBySku("DMX-MG-001").orElseThrow();
        StoreBranch branchQ9 = branchRepo.findAll().stream()
                .filter(b -> b.getDistrict().contains("9"))
                .findFirst()
                .orElseThrow();

        // 1. Đọc tồn kho ban đầu của sản phẩm 1 tại chi nhánh Quận 9
        Inventory invBefore = inventoryRepo.findByProduct_IdAndStoreBranch_Id(p1.getId(), branchQ9.getId()).orElseThrow();
        int stockBefore = invBefore.getQuantity();
        assertTrue(stockBefore > 0, "Cần có tồn kho khả dụng ban đầu để thực hiện đặt hàng");

        // 2. Gửi POST /api/v1/orders mua 1 sản phẩm kèm mã giảm giá MWG5 (giảm 5%)
        double expectedTotal = p1.getPrice() * 0.95;
        String createOrderPayload = String.format("""
                {
                    "customerName": "Kiểm Thử Viên MWG",
                    "phone": "0987654321",
                    "shippingAddress": "123 Xa Lộ Hà Nội, P. Tăng Nhơn Phú B, TP. Thủ Đức",
                    "promoCode": "MWG5",
                    "branchId": %d,
                    "items": [
                        {
                            "productId": %d,
                            "quantity": 1
                        }
                    ]
                }
                """, branchQ9.getId(), p1.getId());

        mockMvc.perform(post("/api/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createOrderPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.status", is("PENDING")))
                .andExpect(jsonPath("$.totalAmount", is(closeTo(expectedTotal, 0.1))))
                .andExpect(jsonPath("$.orderItems", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.orderItems[0].unitPrice", is(closeTo(p1.getPrice(), 0.1))))
                .andExpect(jsonPath("$.orderItems[0].quantity", is(1)));

        // Kiểm tra tồn kho tại chi nhánh đã bị trừ chính xác 1 đơn vị
        Inventory invAfter = inventoryRepo.findByProduct_IdAndStoreBranch_Id(p1.getId(), branchQ9.getId()).orElseThrow();
        assertEquals(stockBefore - 1, invAfter.getQuantity(), "Số lượng tồn kho chi nhánh phải giảm đúng 1");

        // 3. Kiểm chứng nghiệp vụ từ chối khi sản phẩm hết hàng (Out-of-Stock)
        // DataSeeder đã thiết lập DMX-MG-003 tại chi nhánh Quận 9 có tồn kho = 0
        Product p3 = productRepo.findBySku("DMX-MG-003").orElseThrow();
        Inventory invP3 = inventoryRepo.findByProduct_IdAndStoreBranch_Id(p3.getId(), branchQ9.getId()).orElseThrow();
        assertEquals(0, invP3.getQuantity(), "DMX-MG-003 tại Quận 9 được seed tồn kho = 0");

        String outOfStockPayload = String.format("""
                {
                    "customerName": "Khách Đặt Mua Hụt",
                    "phone": "0999888777",
                    "shippingAddress": "123 Lê Văn Việt, Quận 9",
                    "branchId": %d,
                    "items": [
                        {
                            "productId": %d,
                            "quantity": 1
                        }
                    ]
                }
                """, branchQ9.getId(), p3.getId());

        mockMvc.perform(post("/api/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(outOfStockPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists())
                .andExpect(jsonPath("$.error", containsString("không đủ tồn kho")));
    }

    /**
     * Test 5: Kiểm chứng các Endpoint Khách hàng, Khuyến mãi, Đánh giá, Đơn hàng serialize JSON hợp lệ không bị đệ quy vòng lặp.
     */
    @Test
    @DisplayName("5. Các endpoint Customers, Promotions, Reviews, Orders trả về JSON hợp lệ (không lỗi Jackson recursion)")
    void customerPromotionAndReviewEndpointsSerializeCleanly() throws Exception {
        // GET /api/v1/customers
        mockMvc.perform(get("/api/v1/customers"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[0].fullName").exists())
                .andExpect(jsonPath("$[0].phone").exists());

        // GET /api/v1/promotions
        mockMvc.perform(get("/api/v1/promotions"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[0].promoCode").exists())
                .andExpect(jsonPath("$[0].discountPercent").exists());

        // GET /api/v1/reviews
        mockMvc.perform(get("/api/v1/reviews"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[0].rating").exists())
                .andExpect(jsonPath("$[0].product.sku").exists());

        // GET /api/v1/orders
        mockMvc.perform(get("/api/v1/orders"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[0].totalAmount").exists());
    }

    /**
     * Test 6: Kiểm chứng định tuyến tĩnh React SPA qua StaticPageRoutingFilter & Render Thymeleaf SSR tại /mvc/catalog.
     */
    @Test
    @DisplayName("6. Tuyến đường tĩnh React SPA (/dashboard -> /dashboard.html) & Giao diện phụ Spring MVC Thymeleaf SSR")
    void reactSpaStaticRoutesAndMvcCatalogRenderFast() throws Exception {
        // 1. Tuyến đường trang chủ tĩnh index.html
        mockMvc.perform(get("/index.html"))
                .andExpect(status().isOk());

        // 2. Tuyến đường sạch Next.js /dashboard được StaticPageRoutingFilter chuyển tiếp nội bộ sang /dashboard.html
        mockMvc.perform(get("/dashboard"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/dashboard.html"));

        // 3. Tuyến đường Spring MVC Thymeleaf SSR tại /mvc/catalog
        mockMvc.perform(get("/mvc/catalog"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_HTML))
                .andExpect(content().string(containsString("<select id=\"filterCategory\"")))
                .andExpect(content().string(containsString("Máy giặt")))
                .andExpect(content().string(containsString("Tủ lạnh")))
                .andExpect(content().string(containsString("Smart Tivi")));
    }
}
