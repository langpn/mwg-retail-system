package com.example.demojpa.service;

import com.example.demojpa.entity.Brand;
import com.example.demojpa.entity.Category;
import com.example.demojpa.entity.Product;
import com.example.demojpa.repository.BrandRepository;
import com.example.demojpa.repository.CategoryRepository;
import com.example.demojpa.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

/**
 * Service: ProductCatalogService (Quản lý nghiệp vụ Sản phẩm, Danh mục, Thương hiệu)
 * Phân hệ 1 do Lang phụ trách chính.
 */
@Service
public class ProductCatalogService {

    private final ProductRepository productRepo;
    private final CategoryRepository categoryRepo;
    private final BrandRepository brandRepo;

    public ProductCatalogService(ProductRepository productRepo, CategoryRepository categoryRepo, BrandRepository brandRepo) {
        this.productRepo = productRepo;
        this.categoryRepo = categoryRepo;
        this.brandRepo = brandRepo;
    }

    public List<Product> getAllProducts() {
        return productRepo.findAll();
    }

    public List<Category> getAllCategories() {
        return categoryRepo.findAll();
    }

    public List<Brand> getAllBrands() {
        return brandRepo.findAll();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepo.findById(id);
    }

    public Optional<Product> getProductBySku(String sku) {
        return productRepo.findBySku(sku);
    }

    public List<Product> searchProducts(String categoryCode, String brandName, Double maxPrice, String keyword) {
        String cleanCategoryCode = (categoryCode != null && !categoryCode.trim().isEmpty()) ? categoryCode.trim() : null;
        String cleanBrandName = (brandName != null && !brandName.trim().isEmpty()) ? brandName.trim() : null;
        Double cleanMaxPrice = (maxPrice != null && maxPrice > 0) ? maxPrice : null;
        String cleanKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;

        return productRepo.searchByFilters(cleanCategoryCode, cleanBrandName, cleanMaxPrice, cleanKeyword);
    }

    /**
     * PHÂN TRANG CẤP CƠ SỞ DỮ LIỆU (Server-Side Pagination).
     * Toàn bộ việc lọc + sắp xếp + LIMIT/OFFSET diễn ra dưới MySQL/H2,
     * Client chỉ nhận đúng pageSize bản ghi của trang hiện tại => tải trang cực nhanh.
     *
     * @param categoryCode mã danh mục (nullable)
     * @param brand       1 hãng ("Toshiba") hoặc nhiều hãng ("Toshiba,Samsung"), nullable
     * @param minPrice    giá thấp nhất (nullable)
     * @param maxPrice    giá cao nhất (nullable)
     * @param keyword     từ khóa tên/SKU/mô tả (nullable)
     * @param pageable    thông tin trang + sắp xếp do Controller dựng
     */
    public Page<Product> searchProductsPage(String categoryCode, String brand,
                                            Double minPrice, Double maxPrice,
                                            String keyword, Pageable pageable) {
        String cleanCategoryCode = (categoryCode != null && !categoryCode.trim().isEmpty())
                ? categoryCode.trim() : null;

        // Tách chuỗi "Toshiba, Samsung" -> ["toshiba", "samsung"] (trim + lowercase, bỏ phần tử rỗng)
        List<String> brandNames = (brand != null && !brand.trim().isEmpty())
                ? Arrays.stream(brand.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .map(s -> s.toLowerCase())
                        .distinct()
                        .toList()
                : List.of();

        // Cờ hasBrands: khi rỗng phải truyền false + List.of("__none__") để tránh lỗi "IN (NULL)"
        boolean hasBrands = !brandNames.isEmpty();
        List<String> safeBrandNames = hasBrands ? brandNames : List.of("__none__");

        Double cleanMinPrice = (minPrice != null && minPrice >= 0) ? minPrice : null;
        Double cleanMaxPrice = (maxPrice != null && maxPrice > 0) ? maxPrice : null;
        String cleanKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;

        return productRepo.searchByFiltersPage(
                cleanCategoryCode,
                safeBrandNames,
                hasBrands,
                cleanMinPrice,
                cleanMaxPrice,
                cleanKeyword,
                pageable
        );
    }

    public Product createProduct(Product product) {
        return productRepo.save(product);
    }

    public Optional<Product> updateProduct(Long id, Product updated) {
        return productRepo.findById(id).map(p -> {
            p.setName(updated.getName());
            p.setPrice(updated.getPrice());
            p.setDescription(updated.getDescription());
            p.setSku(updated.getSku());
            if (updated.getCategory() != null) p.setCategory(updated.getCategory());
            if (updated.getBrand() != null) p.setBrand(updated.getBrand());
            return productRepo.save(p);
        });
    }

    public boolean deleteProduct(Long id) {
        if (productRepo.existsById(id)) {
            productRepo.deleteById(id);
            return true;
        }
        return false;
    }
}
