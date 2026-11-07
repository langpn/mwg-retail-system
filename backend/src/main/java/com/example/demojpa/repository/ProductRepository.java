package com.example.demojpa.repository;

import com.example.demojpa.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
     * Dùng LEFT JOIN FETCH để nạp kèm Category & Brand trong CÙNG 1 câu SQL duy nhất,
     * loại bỏ hoàn toàn N+1 Query khi Jackson serialize product.category / product.brand.
     * CAST(p.description AS string) đảm bảo tương thích kiểu TEXT/CLOB trên cả MySQL và H2.
     */
    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category c LEFT JOIN FETCH p.brand b " +
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

    /**
     * PHÂN TRANG CẤP CƠ SỞ DỮ LIỆU (Server-Side Pagination) kèm lọc đa tiêu chí.
     *
     * Kỹ thuật quan trọng:
     *  1. Query chính dùng LEFT JOIN FETCH p.category c LEFT JOIN FETCH p.brand b
     *     => nạp luôn 2 bảng quan hệ trong 1 câu SQL, không phát sinh N+1 Query.
     *     (Category và Brand đều là @ManyToOne nên FETCH JOIN không nhân bản dòng,
     *      do đó LIMIT/OFFSET vẫn chính xác 100%.)
     *  2. countQuery riêng dùng LEFT JOIN thường (KHÔNG FETCH) => Hibernate đếm đúng
     *     tổng số bản ghi và sinh câu SELECT COUNT(*) tối ưu.
     *  3. brandNames rỗng: Service truyền hasBrands = false và List.of("__none__")
     *     => điều kiện (:hasBrands = false OR LOWER(b.name) IN :brandNames) luôn đúng,
     *     tránh hoàn toàn lỗi cú pháp "IN (NULL)" trên H2 lẫn MySQL 8.
     */
    @Query(value = "SELECT p FROM Product p " +
                   "LEFT JOIN FETCH p.category c LEFT JOIN FETCH p.brand b " +
                   "WHERE (:categoryCode IS NULL OR LOWER(c.code) = LOWER(:categoryCode)) " +
                   "AND (:hasBrands = false OR LOWER(b.name) IN :brandNames) " +
                   "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
                   "AND (:maxPrice IS NULL OR p.price <= :maxPrice) " +
                   "AND (:keyword IS NULL " +
                   "     OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                   "     OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                   "     OR LOWER(CAST(p.description AS string)) LIKE LOWER(CONCAT('%', :keyword, '%')))",
           countQuery = "SELECT COUNT(p) FROM Product p " +
                        "LEFT JOIN p.category c LEFT JOIN p.brand b " +
                        "WHERE (:categoryCode IS NULL OR LOWER(c.code) = LOWER(:categoryCode)) " +
                        "AND (:hasBrands = false OR LOWER(b.name) IN :brandNames) " +
                        "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
                        "AND (:maxPrice IS NULL OR p.price <= :maxPrice) " +
                        "AND (:keyword IS NULL " +
                        "     OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                        "     OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                        "     OR LOWER(CAST(p.description AS string)) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Product> searchByFiltersPage(
            @Param("categoryCode") String categoryCode,
            @Param("brandNames") List<String> brandNames,
            @Param("hasBrands") boolean hasBrands,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("keyword") String keyword,
            Pageable pageable
    );
}
