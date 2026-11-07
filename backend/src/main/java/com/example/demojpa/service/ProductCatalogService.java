package com.example.demojpa.service;

import com.example.demojpa.entity.Brand;
import com.example.demojpa.entity.Category;
import com.example.demojpa.entity.Product;
import com.example.demojpa.repository.BrandRepository;
import com.example.demojpa.repository.CategoryRepository;
import com.example.demojpa.repository.ProductRepository;
import org.springframework.stereotype.Service;

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
