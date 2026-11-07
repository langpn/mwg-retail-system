package com.example.demojpa.repository;

import com.example.demojpa.entity.ProductReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {

    @Query("SELECT r FROM ProductReview r JOIN FETCH r.product p JOIN FETCH p.category LEFT JOIN FETCH p.brand JOIN FETCH r.customer ORDER BY r.id DESC")
    List<ProductReview> findAllWithDetails();

    @Query("SELECT r FROM ProductReview r JOIN FETCH r.product p JOIN FETCH p.category LEFT JOIN FETCH p.brand JOIN FETCH r.customer WHERE p.id = :productId ORDER BY r.id DESC")
    List<ProductReview> findByProductIdWithDetails(@Param("productId") Long productId);

    List<ProductReview> findByProduct_Id(Long productId);
    List<ProductReview> findByCustomer_Id(Long customerId);
}
