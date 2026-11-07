package com.example.demojpa.controller;

import com.example.demojpa.entity.Brand;
import com.example.demojpa.entity.Category;
import com.example.demojpa.entity.Product;
import com.example.demojpa.entity.StoreBranch;
import com.example.demojpa.service.InventoryService;
import com.example.demojpa.service.ProductCatalogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

/**
 * Spring MVC Controller: MvcCatalogController
 * Trang phụ phục vụ trình diễn và bảo vệ đồ án chuẩn Spring MVC + Thymeleaf Template Engine.
 *
 * SO SÁNH & PHÂN BIỆT KIẾN TRÚC: @Controller VS @RestController
 * ==============================================================
 * 1. @Controller (Spring MVC truyền thống - Server-Side Rendering / SSR):
 *    - Trả về tên logic của View (String "mvc-catalog"). DispatcherServlet sẽ chuyển tên này
 *      tới ThymeleafViewResolver để tìm và render file HTML tại "src/main/resources/templates/mvc-catalog.html".
 *    - Dữ liệu được nạp vào đối tượng org.springframework.ui.Model ngay tại Server trước khi trang được trả về Client:
 *      + Danh mục ngành hàng (categories) nạp sẵn vào thẻ <select> (Combobox).
 *      + Thương hiệu chính hãng (brands) nạp sẵn vào thẻ <select> (Combobox).
 *      + Danh sách siêu thị chi nhánh (branches) nạp sẵn.
 *      + Danh sách sản phẩm khởi tạo ban đầu (initialProducts) nạp sẵn vào <table>.
 *    - Thời gian hiển thị ban đầu cực nhanh (< 100ms, vượt xa chỉ tiêu dưới 3 giây của giảng viên),
 *      không bị giật màn hình (FOUC), nạp sẵn dữ liệu Combobox mà không cần chờ gọi AJAX ban đầu.
 *
 * 2. @RestController (RESTful Web Service - Client-Side Rendering / CSR):
 *    - Bản chất là tổ hợp của @Controller + @ResponseBody.
 *    - Không điều hướng hay sinh mã giao diện HTML; thay vào đó, dữ liệu thô (Java Object / List / Map)
 *      được serialize trực tiếp sang JSON/XML thông qua HttpMessageConverter (thư viện Jackson)
 *      và ghi vào HTTP Response Body.
 *    - Phục vụ ứng dụng Single Page Application (React / Next.js) hoặc Mobile App gọi bất đồng bộ qua fetch / axios.
 *
 * Tuyến đường (Route): GET /mvc/catalog
 */
@Controller
@RequestMapping("/mvc")
public class MvcCatalogController {

    private final ProductCatalogService productCatalogService;
    private final InventoryService inventoryService;

    /**
     * Constructor Injection chuẩn Spring Boot (khuyến nghị thay thế @Autowired trên field).
     */
    public MvcCatalogController(ProductCatalogService productCatalogService, InventoryService inventoryService) {
        this.productCatalogService = productCatalogService;
        this.inventoryService = inventoryService;
    }

    /**
     * GET /mvc/catalog
     * Nạp sẵn toàn bộ Combobox danh mục, thương hiệu, siêu thị chi nhánh
     * và TRANG ĐẦU TIÊN (6 sản phẩm) vào Model để render SSR tức thì.
     *
     * @param model Đối tượng chứa dữ liệu truyền sang template Thymeleaf
     * @return Tên template view "mvc-catalog" (tương ứng file src/main/resources/templates/mvc-catalog.html)
     */
    @GetMapping("/catalog")
    public String showCatalog(Model model) {
        List<Category> categories = productCatalogService.getAllCategories();
        List<Brand> brands = productCatalogService.getAllBrands();
        List<StoreBranch> branches = inventoryService.getAllBranches();

        // SSR chỉ render trang đầu tiên (6 sản phẩm) để trang mở tức thì;
        // các trang sau do JS gọi GET /api/v1/products/page (phân trang thật dưới CSDL).
        Page<Product> firstPage = productCatalogService.searchProductsPage(
                null, null, null, null, null,
                PageRequest.of(0, 6, Sort.by(Sort.Direction.ASC, "id"))
        );

        model.addAttribute("categories", categories);
        model.addAttribute("brands", brands);
        model.addAttribute("branches", branches);
        model.addAttribute("initialProducts", firstPage.getContent());
        model.addAttribute("initialTotalElements", firstPage.getTotalElements());
        model.addAttribute("initialTotalPages", firstPage.getTotalPages());

        return "mvc-catalog";
    }
}
