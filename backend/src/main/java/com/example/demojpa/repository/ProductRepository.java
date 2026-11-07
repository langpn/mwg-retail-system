package com.example.demojpa.repository;

import com.example.demojpa.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySku(String sku);
    List<Product> findByCategory_Code(String categoryCode);
    List<Product> findByBrand_Name(String brandName);
    List<Product> findByPriceLessThanEqual(Double maxPrice);
    List<Product> findByNameContainingIgnoreCase(String keyword);

    /**
     * JPQL lọc đa tiêu chí linh hoạt kết hợp Category, Brand, khoảng giá và từ khóa.
     * Sử dụng LEFT JOIN để không bỏ sót sản phẩm chưa gán danh mục/thương hiệu.
     * CAST(p.description AS string) đảm bảo tương thích kiểu TEXT/CLOB trên cả MySQL và H2.
     */
    @Query("SELECT p FROM Product p LEFT JOIN p.category c LEFT JOIN p.brand b " +
           "WHERE (:categoryCode IS NULL OR LOWER(c.code) = LOWER(:categoryCode)) " +
           "AND (:brandName IS NULL OR LOWER(b.name) = LOWER(:brandName)) " +
           "AND (:maxPrice IS NULL OR p.price <= :maxPrice) " +
           "AND (:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(CAST(p.description AS string)) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Product> searchByFilters(
            @Param("categoryCode") String categoryCode,
            @Param("brandName") String brandName,
            @Param("maxPrice") Double maxPrice,
            @Param("keyword") String keyword
    );
}
