package com.example.demojpa;

import com.example.demojpa.entity.Inventory;
import com.example.demojpa.entity.Product;
import com.example.demojpa.entity.Promotion;
import com.example.demojpa.seeder.DataSeeder;
import com.example.demojpa.entity.StoreBranch;
import com.example.demojpa.repository.*;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.metamodel.EntityType;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.BeforeEach;
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
 *  7. Server-Side Pagination (Pageable + LIMIT/OFFSET).
 *  8. OrderPricingService: báo giá, giới hạn giảm giá, mã không hợp lệ, kiểm tra số lượng.
 *  9. N+1 Query Elimination: kiểm đếm PrepareStatement cho các endpoint chính.
 * 10. Stock Matrix, Customer Lookup.
 */
@SpringBootTest(properties = {
        "spring.jpa.properties.hibernate.generate_statistics=true"
})
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

    @Autowired
    private DataSeeder dataSeeder;

    private Statistics hibernateStats;

    @BeforeEach
    void setUpStats() {
        hibernateStats = entityManagerFactory.unwrap(SessionFactory.class).getStatistics();
        hibernateStats.setStatisticsEnabled(true);
    }

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
        // expectedTotal = round(7490000 * 5 / 100) = 374500; total = 7490000 - 374500 = 7115500
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
     * Test 7: Kiểm chứng Server-Side Pagination thật ở tầng CSDL (Pageable + LIMIT/OFFSET).
     * Yêu cầu: 16 sản phẩm seed sẵn, pageSize 6 => 3 trang; sắp xếp giá tăng dần
     * thì phần tử đầu tiên phải là sản phẩm rẻ nhất (Nồi chiên Toshiba 1.990.000đ);
     * trang cuối (page=2) chỉ còn 4 phần tử và cờ last = true.
     */
    @Test
    @DisplayName("7. Server-Side Pagination: GET /api/v1/products/page trả totalElements=16, totalPages=3, trang cuối 4 phần tử")
    void productPaginationEndpointWorks() throws Exception {
        // 1. Trang đầu tiên: page=0, size=6, sắp xếp giá tăng dần
        mockMvc.perform(get("/api/v1/products/page")
                        .param("page", "0")
                        .param("size", "6")
                        .param("sortBy", "price")
                        .param("sortDir", "asc"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.totalElements", is(16)))
                .andExpect(jsonPath("$.totalPages", is(3)))
                .andExpect(jsonPath("$.page", is(0)))
                .andExpect(jsonPath("$.size", is(6)))
                .andExpect(jsonPath("$.first", is(true)))
                .andExpect(jsonPath("$.last", is(false)))
                .andExpect(jsonPath("$.content", hasSize(6)))
                // Sản phẩm rẻ nhất toàn hệ thống: Nồi chiên không dầu Toshiba 1.990.000đ
                .andExpect(jsonPath("$.content[0].price", is(closeTo(1990000.0, 0.01))))
                .andExpect(jsonPath("$.content[0].sku", is("DMX-GD-001")))
                // LEFT JOIN FETCH: Category & Brand phải có sẵn trong cùng payload, không N+1
                .andExpect(jsonPath("$.content[0].category.name", is("Gia dụng")))
                .andExpect(jsonPath("$.content[0].brand.name", is("Toshiba")))
                // Giá phải đơn điệu tăng trong trang
                .andExpect(jsonPath("$.content[1].price", greaterThanOrEqualTo(1990000.0)));

        // 2. Trang cuối cùng: page=2, size=6 => chỉ còn 16 - 12 = 4 phần tử, last = true
        mockMvc.perform(get("/api/v1/products/page")
                        .param("page", "2")
                        .param("size", "6")
                        .param("sortBy", "price")
                        .param("sortDir", "asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page", is(2)))
                .andExpect(jsonPath("$.totalElements", is(16)))
                .andExpect(jsonPath("$.totalPages", is(3)))
                .andExpect(jsonPath("$.content", hasSize(4)))
                .andExpect(jsonPath("$.first", is(false)))
                .andExpect(jsonPath("$.last", is(true)))
                // Giá cao nhất toàn hệ thống nằm ở cuối trang cuối: Tủ lạnh LG 32.490.000đ
                .andExpect(jsonPath("$.content[3].sku", is("DMX-TL-004")))
                .andExpect(jsonPath("$.content[3].price", is(closeTo(32490000.0, 0.01))));

        // 3. Lọc kết hợp phân trang: chỉ danh mục GIADUNG (4 SKU) => 1 trang duy nhất
        mockMvc.perform(get("/api/v1/products/page")
                        .param("page", "0")
                        .param("size", "6")
                        .param("category", "GIADUNG"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(4)))
                .andExpect(jsonPath("$.totalPages", is(1)))
                .andExpect(jsonPath("$.content", hasSize(4)))
                .andExpect(jsonPath("$.first", is(true)))
                .andExpect(jsonPath("$.last", is(true)));

        // 4. Lọc nhiều thương hiệu cùng lúc (brand="Toshiba,Panasonic") + khoảng giá
        //    Toshiba trong khoảng 2-10tr: MG-001 (7.49tr), TL-002 (8.49tr), TV-003 (9.49tr)
        //    Panasonic trong khoảng 2-10tr: MG-003 (9.89tr), GD-002 (4.29tr) => tổng 5 SKU
        mockMvc.perform(get("/api/v1/products/page")
                        .param("page", "0")
                        .param("size", "50")
                        .param("brand", "Toshiba,Panasonic")
                        .param("minPrice", "2000000")
                        .param("maxPrice", "10000000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(5)))
                .andExpect(jsonPath("$.content[*].brand.name", everyItem(anyOf(is("Toshiba"), is("Panasonic")))))
                .andExpect(jsonPath("$.content[*].price", everyItem(allOf(
                        greaterThanOrEqualTo(2000000.0),
                        lessThanOrEqualTo(10000000.0)
                ))));

        // 5. Tham số rác không được làm văng lỗi 400: sortBy lạ fallback về "id", page âm ép về 0
        mockMvc.perform(get("/api/v1/products/page")
                        .param("page", "-5")
                        .param("size", "999")
                        .param("sortBy", "khong_ton_tai")
                        .param("sortDir", "xyz"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page", is(0)))
                .andExpect(jsonPath("$.size", is(50)))
                .andExpect(jsonPath("$.content", hasSize(16)))
                .andExpect(jsonPath("$.content[0].sku", is("DMX-MG-001")));
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

    // ========================================================================
    // TEST 8: OrderPricingService — báo giá, giới hạn giảm giá, mã không hợp lệ
    // ========================================================================

    /**
     * Test 8a: Quote TET2027 trên 1×DMX-TL-004 tại chi nhánh Thủ Đức.
     * subtotal=32490000, discount bị cap ở 1500000, total=30990000.
     */
    @Test
    @DisplayName("8a. Quote TET2027 trên DMX-TL-004 (chi nhánh Thủ Đức): discount bị cap 1,500,000đ")
    void quoteTet2027WithCapOnTl004() throws Exception {
        Product tl004 = productRepo.findBySku("DMX-TL-004").orElseThrow();
        StoreBranch thuDuc = branchRepo.findAll().stream()
                .filter(b -> b.getDistrict().contains("Thủ Đức"))
                .findFirst()
                .orElseThrow();

        String payload = String.format("""
                {
                    "promoCode": "  tEt2027  ",
                    "branchId": %d,
                    "items": [{"productId": %d, "quantity": 1}]
                }
                """, thuDuc.getId(), tl004.getId());

        mockMvc.perform(post("/api/v1/orders/quote")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subtotal", is(closeTo(32490000.0, 0.01))))
                .andExpect(jsonPath("$.promoApplied", is(true)))
                .andExpect(jsonPath("$.promoCode", is("TET2027")))
                .andExpect(jsonPath("$.promoLabel", containsString("Tết 2027")))
                .andExpect(jsonPath("$.promoMessage").value(nullValue()))
                .andExpect(jsonPath("$.items[0].productId", is(tl004.getId().intValue())))
                .andExpect(jsonPath("$.items[0].sku", is("DMX-TL-004")))
                .andExpect(jsonPath("$.items[0].name").isNotEmpty())
                .andExpect(jsonPath("$.items[0].unitPrice", is(closeTo(32490000.0, 0.01))))
                .andExpect(jsonPath("$.items[0].quantity", is(1)))
                .andExpect(jsonPath("$.items[0].lineTotal", is(closeTo(32490000.0, 0.01))))
                .andExpect(jsonPath("$.discount", is(closeTo(1500000.0, 0.01))))
                .andExpect(jsonPath("$.total", is(closeTo(30990000.0, 0.01))));
    }

    /**
     * Test 8b: Quote MWG5 trên 2×DMX-MG-001.
     * subtotal=14980000, discount=round(14980000*0.05)=749000, total=14231000.
     */
    @Test
    @DisplayName("8b. Quote MWG5 trên 2×DMX-MG-001: discount=749000 (không giới hạn)")
    void quoteMwg5OnTwoDmxMg001() throws Exception {
        Product mg001 = productRepo.findBySku("DMX-MG-001").orElseThrow();

        String payload = String.format("""
                {
                    "promoCode": "MWG5",
                    "items": [{"productId": %d, "quantity": 2}]
                }
                """, mg001.getId());

        mockMvc.perform(post("/api/v1/orders/quote")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subtotal", is(closeTo(14980000.0, 0.01))))
                .andExpect(jsonPath("$.promoApplied", is(true)))
                .andExpect(jsonPath("$.discount", is(closeTo(749000.0, 0.01))))
                .andExpect(jsonPath("$.total", is(closeTo(14231000.0, 0.01))));
    }

    /**
     * Test 8c: Quote với mã không tồn tại → discount=0, promoApplied=false, promoMessage non-null.
     */
    @Test
    @DisplayName("8c. Quote với mã không tồn tại: promoApplied=false, promoMessage không null")
    void quoteWithUnknownPromoCode() throws Exception {
        Product gd001 = productRepo.findBySku("DMX-GD-001").orElseThrow();

        String payload = String.format("""
                {
                    "promoCode": "INVALID_CODE_XYZ",
                    "items": [{"productId": %d, "quantity": 1}]
                }
                """, gd001.getId());

        mockMvc.perform(post("/api/v1/orders/quote")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.promoApplied", is(false)))
                .andExpect(jsonPath("$.discount", is(closeTo(0.0, 0.01))))
                .andExpect(jsonPath("$.promoMessage").isNotEmpty());
    }

    /**
     * Test 8d: Quote với quantity=0 → 400 với "error".
     */
    @Test
    @DisplayName("8d. Quote quantity=0 → 400 Bad Request với field 'error'")
    void quoteWithZeroQuantityReturns400() throws Exception {
        Product mg001 = productRepo.findBySku("DMX-MG-001").orElseThrow();

        String payload = String.format("""
                {
                    "items": [{"productId": %d, "quantity": 0}]
                }
                """, mg001.getId());

        mockMvc.perform(post("/api/v1/orders/quote")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    /**
     * Test 8e: Quote với items rỗng → 400 với "error".
     */
    @Test
    @DisplayName("8e. Quote items rỗng → 400 Bad Request với field 'error'")
    void quoteWithEmptyItemsReturns400() throws Exception {
        mockMvc.perform(post("/api/v1/orders/quote")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"items\": []}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    /**
     * Test 8f: createOrder đa mặt hàng (2 sản phẩm khác nhau):
     * - orderItems có 2 phần tử
     * - totalAmount bằng đúng quote.total cho cùng request
     * - tồn kho bị trừ cho cả 2 sản phẩm
     */
    @Test
    @DisplayName("8f. createOrder đa mặt hàng: 2 orderItems, totalAmount = quote.total, stock giảm cho cả 2 sản phẩm")
    void createOrderMultiItemMatchesQuoteAndDecrementsStock() throws Exception {
        Product mg001 = productRepo.findBySku("DMX-MG-001").orElseThrow();
        Product gd001 = productRepo.findBySku("DMX-GD-001").orElseThrow();
        StoreBranch branchQ9 = branchRepo.findAll().stream()
                .filter(b -> b.getDistrict().contains("9"))
                .findFirst()
                .orElseThrow();

        // Đọc tồn kho ban đầu
        Inventory invMg = inventoryRepo.findByProduct_IdAndStoreBranch_Id(mg001.getId(), branchQ9.getId()).orElseThrow();
        Inventory invGd = inventoryRepo.findByProduct_IdAndStoreBranch_Id(gd001.getId(), branchQ9.getId()).orElseThrow();
        int stockMgBefore = invMg.getQuantity();
        int stockGdBefore = invGd.getQuantity();
        assertTrue(stockMgBefore > 0, "DMX-MG-001 tại Q9 cần có tồn kho");
        assertTrue(stockGdBefore > 0, "DMX-GD-001 tại Q9 cần có tồn kho");

        // Lấy quote trước để kiểm tra totalAmount
        String quotePayload = String.format("""
                {
                    "promoCode": "MWG5",
                    "branchId": %d,
                    "items": [
                        {"productId": %d, "quantity": 1},
                        {"productId": %d, "quantity": 2}
                    ]
                }
                """, branchQ9.getId(), mg001.getId(), gd001.getId());

        var quoteResult = mockMvc.perform(post("/api/v1/orders/quote")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(quotePayload))
                .andExpect(status().isOk())
                .andReturn();

        // Trích total từ response JSON
        String quoteBody = quoteResult.getResponse().getContentAsString();
        double expectedTotal = ((Number) com.jayway.jsonpath.JsonPath.read(quoteBody, "$.total")).doubleValue();

        // Tạo đơn hàng với cùng payload
        String orderPayload = String.format("""
                {
                    "customerName": "Khách Đa Món",
                    "phone": "0911222333",
                    "shippingAddress": "10 Lê Văn Việt, Q9",
                    "promoCode": "MWG5",
                    "branchId": %d,
                    "items": [
                        {"productId": %d, "quantity": 1},
                        {"productId": %d, "quantity": 2}
                    ]
                }
                """, branchQ9.getId(), mg001.getId(), gd001.getId());

        mockMvc.perform(post("/api/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(orderPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderItems", hasSize(2)))
                .andExpect(jsonPath("$.totalAmount", is(closeTo(expectedTotal, 0.01))));

        // Kiểm tra tồn kho đã bị trừ
        Inventory invMgAfter = inventoryRepo.findByProduct_IdAndStoreBranch_Id(mg001.getId(), branchQ9.getId()).orElseThrow();
        Inventory invGdAfter = inventoryRepo.findByProduct_IdAndStoreBranch_Id(gd001.getId(), branchQ9.getId()).orElseThrow();
        assertEquals(stockMgBefore - 1, invMgAfter.getQuantity(), "Tồn kho MG-001 phải giảm 1");
        assertEquals(stockGdBefore - 2, invGdAfter.getQuantity(), "Tồn kho GD-001 phải giảm 2");
    }

    /**
     * Test 8g: createOrder thất bại khi hết hàng → tồn kho không bị thay đổi (rollback).
     * Dùng DMX-TL-004 tại chi nhánh Quận 9 (seed = 0).
     */
    @Test
    @DisplayName("8g. createOrder thất bại khi hết hàng (stock=0) → rollback, tồn kho không đổi")
    void createOrderFailsOnOutOfStockAndRollsBack() throws Exception {
        Product tl004 = productRepo.findBySku("DMX-TL-004").orElseThrow();
        Product inStockProduct = productRepo.findBySku("DMX-GD-001").orElseThrow();
        StoreBranch branchQ9 = branchRepo.findAll().stream()
                .filter(b -> b.getDistrict().contains("9"))
                .findFirst()
                .orElseThrow();

        Inventory inv = inventoryRepo.findByProduct_IdAndStoreBranch_Id(tl004.getId(), branchQ9.getId()).orElseThrow();
        int stockBefore = inv.getQuantity();
        // DMX-TL-004 tại Q9 được seed = 0
        assertEquals(0, stockBefore, "DMX-TL-004 tại Q9 phải có tồn kho = 0 (theo DataSeeder)");
        int availableBefore = inventoryRepo.findByProduct_IdAndStoreBranch_Id(inStockProduct.getId(), branchQ9.getId())
                .orElseThrow().getQuantity();
        assertTrue(availableBefore > 0);
        long ordersBefore = orderRepo.count();

        String payload = String.format("""
                {
                    "customerName": "Khách Hết Hàng",
                    "phone": "0922333444",
                    "shippingAddress": "999 Q9",
                    "branchId": %d,
                    "items": [{"productId": %d, "quantity": 1}, {"productId": %d, "quantity": 1}]
                }
                """, branchQ9.getId(), inStockProduct.getId(), tl004.getId());

        mockMvc.perform(post("/api/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());

        // Tồn kho vẫn phải là 0 (không thay đổi)
        Inventory invAfter = inventoryRepo.findByProduct_IdAndStoreBranch_Id(tl004.getId(), branchQ9.getId()).orElseThrow();
        assertEquals(0, invAfter.getQuantity(), "Tồn kho vẫn phải là 0 sau khi rollback");
        assertEquals(availableBefore, inventoryRepo.findByProduct_IdAndStoreBranch_Id(inStockProduct.getId(), branchQ9.getId())
                .orElseThrow().getQuantity());
        assertEquals(ordersBefore, orderRepo.count());
        assertTrue(customerRepo.findByPhone("0922333444").isEmpty());
    }

    // ========================================================================
    // TEST 9: Stock Matrix và Customer Lookup
    // ========================================================================

    /**
     * Test 9a: GET /api/v1/inventory/stock-matrix trả về đúng 32 dòng (16 sản phẩm × 2 chi nhánh).
     */
    @Test
    @DisplayName("9a. GET /api/v1/inventory/stock-matrix trả về 32 dòng (16 SP × 2 chi nhánh)")
    void stockMatrixReturns32Entries() throws Exception {
        mockMvc.perform(get("/api/v1/inventory/stock-matrix"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(32)))
                .andExpect(jsonPath("$[0].productId").exists())
                .andExpect(jsonPath("$[0].sku").exists())
                .andExpect(jsonPath("$[0].branchId").exists())
                .andExpect(jsonPath("$[0].quantity").exists());
    }

    /**
     * Test 9b: Customer Lookup theo số điện thoại → 200.
     */
    @Test
    @DisplayName("9b. GET /api/v1/customers/lookup?identifier=<phone> → 200 trả đúng khách hàng")
    void customerLookupByPhone() throws Exception {
        mockMvc.perform(get("/api/v1/customers/lookup")
                        .param("identifier", "0901234567"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.phone", is("0901234567")))
                .andExpect(jsonPath("$.fullName").exists());
    }

    /**
     * Test 9c: Customer Lookup theo email (không phân biệt hoa/thường) → 200.
     */
    @Test
    @DisplayName("9c. GET /api/v1/customers/lookup?identifier=<EMAIL_UPPERCASE> → 200 (case-insensitive)")
    void customerLookupByEmailCaseInsensitive() throws Exception {
        mockMvc.perform(get("/api/v1/customers/lookup")
                        .param("identifier", "AN.NGUYEN@GMAIL.COM"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").exists())
                .andExpect(jsonPath("$.fullName").exists());
    }

    /**
     * Test 9d: Customer Lookup với identifier không tồn tại → 404.
     */
    @Test
    @DisplayName("9d. GET /api/v1/customers/lookup?identifier=<không tồn tại> → 404")
    void customerLookupUnknownReturns404() throws Exception {
        mockMvc.perform(get("/api/v1/customers/lookup")
                        .param("identifier", "0000000000"))
                .andExpect(status().isNotFound());
    }

    // ========================================================================
    // TEST 10: N+1 Query Elimination — kiểm đếm PrepareStatement
    // ========================================================================

    @Test
    void repeatedProductLinesMustNotExceedAvailableStock() throws Exception {
        Product product = productRepo.findBySku("DMX-GD-001").orElseThrow();
        StoreBranch branch = branchRepo.findAll().stream()
                .filter(b -> b.getDistrict().equals("Quận 9")).findFirst().orElseThrow();
        int before = inventoryRepo.findByProduct_IdAndStoreBranch_Id(product.getId(), branch.getId())
                .orElseThrow().getQuantity();
        assertTrue(before > 0);
        String request = String.format("""
                {"customerName":"Khách thử", "phone":"0944000001", "shippingAddress":"Q9",
                 "branchId":%d, "items":[{"productId":%d,"quantity":%d},{"productId":%d,"quantity":1}]}
                """, branch.getId(), product.getId(), before, product.getId());

        mockMvc.perform(post("/api/v1/orders/quote").contentType(MediaType.APPLICATION_JSON).content(request))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").exists());
        mockMvc.perform(post("/api/v1/orders").contentType(MediaType.APPLICATION_JSON).content(request))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").exists());
        assertEquals(before, inventoryRepo.findByProduct_IdAndStoreBranch_Id(product.getId(), branch.getId())
                .orElseThrow().getQuantity());
        assertTrue(customerRepo.findByPhone("0944000001").isEmpty());
    }

    @Test
    void quoteRejectsNullItemAndMalformedJson() throws Exception {
        mockMvc.perform(post("/api/v1/orders/quote").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"items\":[null]}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").exists());
        mockMvc.perform(post("/api/v1/orders/quote").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"items\":["))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", is("Dữ liệu gửi lên không hợp lệ")));
    }

    @Test
    void existingTetPromotionReceivesCapOnSeed() throws Exception {
        Promotion promotion = promoRepo.findByPromoCode("TET2027").orElseThrow();
        Double originalCap = promotion.getMaxDiscountAmount();
        try {
            promotion.setMaxDiscountAmount(null);
            promoRepo.saveAndFlush(promotion);
            dataSeeder.run();
            assertEquals(1500000.0, promoRepo.findByPromoCode("TET2027").orElseThrow().getMaxDiscountAmount());
        } finally {
            promotion = promoRepo.findByPromoCode("TET2027").orElseThrow();
            promotion.setMaxDiscountAmount(originalCap);
            promoRepo.saveAndFlush(promotion);
        }
    }

    @Test
    void quoteRoundsWholeDongAndIgnoresInactivePromotion() throws Exception {
        Product product = productRepo.findBySku("DMX-GD-001").orElseThrow();
        promoRepo.save(new Promotion("ROUNDTEST", 1.234, "Làm tròn", true));
        promoRepo.save(new Promotion("INACTIVE_TEST", 10.0, "Không áp dụng", false));
        String request = "{\"promoCode\":\"%s\",\"items\":[{\"productId\":%d,\"quantity\":1}]}";
        mockMvc.perform(post("/api/v1/orders/quote").contentType(MediaType.APPLICATION_JSON)
                        .content(String.format(request, "ROUNDTEST", product.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.discount", is(closeTo(24557.0, 0.01))))
                .andExpect(jsonPath("$.total", is(closeTo(1965443.0, 0.01))));
        mockMvc.perform(post("/api/v1/orders/quote").contentType(MediaType.APPLICATION_JSON)
                        .content(String.format(request, "INACTIVE_TEST", product.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.promoApplied", is(false)))
                .andExpect(jsonPath("$.promoCode").value(nullValue()))
                .andExpect(jsonPath("$.promoLabel").value(nullValue()))
                .andExpect(jsonPath("$.promoMessage", is("Mã khuyến mãi không hợp lệ hoặc đã hết hạn")))
                .andExpect(jsonPath("$.discount", is(closeTo(0.0, 0.01))));
    }

    @Test
    void quoteRejectsInvalidProductAndQuantity() throws Exception {
        Product product = productRepo.findBySku("DMX-GD-001").orElseThrow();
        String[] invalidRequests = {
                "{\"items\":[{\"quantity\":1}]}",
                "{\"items\":[{\"productId\":999999,\"quantity\":1}]}",
                String.format("{\"items\":[{\"productId\":%d,\"quantity\":-1}]}", product.getId()),
                String.format("{\"items\":[{\"productId\":%d}]}", product.getId())
        };
        for (String request : invalidRequests) {
            mockMvc.perform(post("/api/v1/orders/quote").contentType(MediaType.APPLICATION_JSON).content(request))
                    .andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").exists());
        }
    }

    @Test
    void createOrderRequiresCustomerNameAndPhone() throws Exception {
        Long productId = productRepo.findBySku("DMX-GD-001").orElseThrow().getId();
        String item = "\"items\":[{\"productId\":" + productId + ",\"quantity\":1}]";
        mockMvc.perform(post("/api/v1/orders").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"phone\":\"0901234567\"," + item + "}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").exists());
        mockMvc.perform(post("/api/v1/orders").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"customerName\":\"Khách\",\"phone\":\" \"," + item + "}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").exists());
    }

    @Test
    void existingOrderDetailAndStatusSerializeWithOpenInViewDisabled() throws Exception {
        mockMvc.perform(get("/api/v1/orders/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderItems[0].product.category.name").exists());
        mockMvc.perform(put("/api/v1/orders/1/status").param("status", "COMPLETED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("COMPLETED")))
                .andExpect(jsonPath("$.orderItems[0].product.sku").exists());
    }

    @Test
    void lookupRejectsBlankAndTrimsPhone() throws Exception {
        mockMvc.perform(get("/api/v1/customers/lookup").param("identifier", "   "))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").exists());
        mockMvc.perform(get("/api/v1/customers/lookup").param("identifier", "  0901234567  "))
                .andExpect(status().isOk()).andExpect(jsonPath("$.phone", is("0901234567")));
    }

    @Test
    void duplicateCustomerPhoneReturnsExistingMessageShape() throws Exception {
        mockMvc.perform(post("/api/v1/customers").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"Thử\",\"phone\":\" 0901234567 \"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", is("Số điện thoại này đã được đăng ký thành viên")));
    }

    /**
     * Test 10a: GET /api/v1/orders không phát sinh N+1 (prepareStatementCount <= 2).
     */
    @Test
    @DisplayName("10a. GET /api/v1/orders không N+1: prepareStatementCount <= 2")
    void ordersEndpointNoNPlusOne() throws Exception {
        for (String sku : new String[]{"DMX-TL-004", "DMX-GD-001", "DMX-TV-001"}) {
            Long productId = productRepo.findBySku(sku).orElseThrow().getId();
            String request = String.format("""
                    {"customerName":"Nguyễn Văn An","phone":"0901234567","shippingAddress":"Q9",
                     "items":[{"productId":%d,"quantity":1}]}
                    """, productId);
            mockMvc.perform(post("/api/v1/orders").contentType(MediaType.APPLICATION_JSON).content(request))
                    .andExpect(status().isCreated());
        }
        hibernateStats.clear();
        mockMvc.perform(get("/api/v1/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(4))))
                .andExpect(jsonPath("$[0].orderItems[0].product.category.name").exists());
        long stmtCount = hibernateStats.getPrepareStatementCount();
        System.out.println("STATEMENTS /api/v1/orders: " + stmtCount);
        assertTrue(stmtCount <= 2,
                "GET /api/v1/orders phải dùng <= 2 PrepareStatement (thực tế: " + stmtCount + ")");
    }

    /**
     * Test 10b: GET /api/v1/inventory/branch/1 không phát sinh N+1 (prepareStatementCount <= 2).
     */
    @Test
    @DisplayName("10b. GET /api/v1/inventory/branch/1 không N+1: prepareStatementCount <= 2")
    void inventoryBranchEndpointNoNPlusOne() throws Exception {
        StoreBranch branchQ9 = branchRepo.findAll().stream()
                .filter(b -> b.getDistrict().contains("9"))
                .findFirst()
                .orElseThrow();

        hibernateStats.clear();
        mockMvc.perform(get("/api/v1/inventory/branch/" + branchQ9.getId()))
                .andExpect(status().isOk());
        long stmtCount = hibernateStats.getPrepareStatementCount();
        System.out.println("STATEMENTS /api/v1/inventory/branch/1: " + stmtCount);
        assertTrue(stmtCount <= 2,
                "GET /api/v1/inventory/branch/{id} phải dùng <= 2 PrepareStatement (thực tế: " + stmtCount + ")");
    }

    /**
     * Test 10c: GET /api/v1/inventory/stock-matrix không phát sinh N+1 (prepareStatementCount <= 2).
     */
    @Test
    @DisplayName("10c. GET /api/v1/inventory/stock-matrix không N+1: prepareStatementCount <= 2")
    void stockMatrixEndpointNoNPlusOne() throws Exception {
        hibernateStats.clear();
        mockMvc.perform(get("/api/v1/inventory/stock-matrix"))
                .andExpect(status().isOk());
        long stmtCount = hibernateStats.getPrepareStatementCount();
        System.out.println("STATEMENTS /api/v1/inventory/stock-matrix: " + stmtCount);
        assertTrue(stmtCount <= 2,
                "GET /api/v1/inventory/stock-matrix phải dùng <= 2 PrepareStatement (thực tế: " + stmtCount + ")");
    }

    /**
     * Test 10d: GET /api/v1/products/page không phát sinh N+1 (prepareStatementCount <= 2).
     */
    @Test
    @DisplayName("10d. GET /api/v1/products/page không N+1: prepareStatementCount <= 2")
    void productPageEndpointNoNPlusOne() throws Exception {
        hibernateStats.clear();
        mockMvc.perform(get("/api/v1/products/page")
                        .param("page", "0")
                        .param("size", "6"))
                .andExpect(status().isOk());
        long stmtCount = hibernateStats.getPrepareStatementCount();
        System.out.println("STATEMENTS /api/v1/products/page: " + stmtCount);
        assertTrue(stmtCount <= 2,
                "GET /api/v1/products/page phải dùng <= 2 PrepareStatement (thực tế: " + stmtCount + ")");
    }
}
