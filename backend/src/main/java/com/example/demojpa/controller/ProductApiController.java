package com.example.demojpa.controller;

import com.example.demojpa.dto.PagedResponse;
import com.example.demojpa.entity.Brand;
import com.example.demojpa.entity.Category;
import com.example.demojpa.entity.Product;
import com.example.demojpa.service.ProductCatalogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

/**
 * REST Controller: ProductApiController
 * Cung cấp Web Service cho Phân hệ 1 (Sản phẩm & Danh mục)
 * Tuân thủ đầy đủ các phương thức HTTP: GET, POST, PUT, DELETE
 */
@RestController
@RequestMapping("/api/v1/products")
@CrossOrigin(origins = "*")
public class ProductApiController {

    private final ProductCatalogService catalogService;

    public ProductApiController(ProductCatalogService catalogService) {
        this.catalogService = catalogService;
    }

    /**
     * GET /api/v1/products
     * Hỗ trợ lọc theo danh mục, thương hiệu, mức giá trần và từ khóa tìm kiếm
     */
    @GetMapping
    public ResponseEntity<List<Product>> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String keyword
    ) {
        List<Product> products = catalogService.searchProducts(category, brand, maxPrice, keyword);
        return ResponseEntity.ok(products);
    }

    /**
     * GET /api/v1/products/page
     * PHÂN TRANG CẤP CƠ SỞ DỮ LIỆU (Server-Side Pagination) + Lọc đa tiêu chí + Sắp xếp linh hoạt.
     *
     * Khác biệt cốt lõi so với GET /api/v1/products:
     *  - Endpoint cũ trả về TOÀN BỘ mảng sản phẩm (giữ nguyên 100% để tương thích ngược).
     *  - Endpoint này chỉ trả về đúng `size` bản ghi của trang `page` nhờ LIMIT/OFFSET dưới CSDL,
     *    kèm metadata totalElements / totalPages / first / last cho thanh nút số trang.
     *
     * @param page     chỉ số trang, bắt đầu từ 0 (âm sẽ được ép về 0)
     * @param size     số bản ghi mỗi trang, kẹp trong khoảng an toàn 1..50
     * @param sortBy   id | price | name | sku (giá trị lạ tự động fallback về "id")
     * @param sortDir  asc | desc (mặc định asc)
     * @param category mã danh mục, ví dụ MAYGIAT
     * @param brand    1 hãng "Toshiba" hoặc nhiều hãng "Toshiba,Samsung"
     * @param minPrice giá thấp nhất
     * @param maxPrice giá cao nhất
     * @param keyword  từ khóa tên / SKU / mô tả
     */
    @GetMapping("/page")
    public ResponseEntity<PagedResponse<Product>> getProductsPage(
            @RequestParam(defaultValue = "0") String page,
            @RequestParam(defaultValue = "8") String size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String keyword
    ) {
        // 1. Chuẩn hóa tham số phân trang: page >= 0, size kẹp trong 1..50.
        //    Parse thủ công để tham số rác (ví dụ "abc") không làm văng lỗi 400.
        int safePage = Math.max(0, parseIntOr(page, 0));
        int safeSize = Math.min(50, Math.max(1, parseIntOr(size, 8)));

        // 2. Whitelist sortBy để chặn hoàn toàn lỗi PropertyReferenceException
        //    và chặn luôn nguy cơ injection qua tên thuộc tính.
        Set<String> allowedSortFields = Set.of("id", "price", "name", "sku");
        String safeSortBy = (sortBy != null && allowedSortFields.contains(sortBy.trim().toLowerCase()))
                ? sortBy.trim().toLowerCase()
                : "id";

        // 3. Chiều sắp xếp: chỉ "desc" mới là giảm dần, mọi giá trị khác đều là tăng dần.
        Sort.Direction direction = (sortDir != null && "desc".equalsIgnoreCase(sortDir.trim()))
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(direction, safeSortBy));

        Page<Product> pageObj = catalogService.searchProductsPage(
                category, brand, minPrice, maxPrice, keyword, pageable);

        return ResponseEntity.ok(PagedResponse.from(pageObj));
    }

    /**
     * Parse số nguyên an toàn: chuỗi rỗng / null / không phải số đều trả về giá trị mặc định.
     */
    private static int parseIntOr(String raw, int fallback) {
        if (raw == null || raw.trim().isEmpty()) {
            return fallback;
        }
        try {
            return Integer.parseInt(raw.trim());
        } catch (NumberFormatException ex) {
            return fallback;
        }
    }

    /**
     * GET /api/v1/products/{id}
     * Lấy chi tiết 1 sản phẩm theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return catalogService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/v1/products/categories
     * Lấy toàn bộ danh mục sản phẩm Điện Máy Xanh
     */
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(catalogService.getAllCategories());
    }

    /**
     * GET /api/v1/products/brands
     * Lấy toàn bộ danh sách thương hiệu chính hãng
     */
    @GetMapping("/brands")
    public ResponseEntity<List<Brand>> getBrands() {
        return ResponseEntity.ok(catalogService.getAllBrands());
    }

    /**
     * POST /api/v1/products
     * Thêm mới một sản phẩm vào hệ thống
     */
    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        Product saved = catalogService.createProduct(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * PUT /api/v1/products/{id}
     * Cập nhật thông tin sản phẩm theo ID
     */
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        return catalogService.updateProduct(id, product)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * DELETE /api/v1/products/{id}
     * Xóa một sản phẩm khỏi danh mục
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        boolean deleted = catalogService.deleteProduct(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
