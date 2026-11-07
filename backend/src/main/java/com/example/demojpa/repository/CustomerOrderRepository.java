package com.example.demojpa.repository;

import com.example.demojpa.entity.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {
    List<CustomerOrder> findByCustomer_Id(Long customerId);
    List<CustomerOrder> findByStatus(String status);
    List<CustomerOrder> findByPhone(String phone);

    /**
     * Lấy tất cả đơn hàng kèm JOIN FETCH đầy đủ, loại bỏ N+1 Query.
     * Sắp xếp mới nhất trước (ORDER BY o.id DESC).
     */
    @Query("SELECT DISTINCT o FROM CustomerOrder o " +
           "LEFT JOIN FETCH o.customer " +
           "LEFT JOIN FETCH o.promotion " +
           "LEFT JOIN FETCH o.orderItems i " +
           "LEFT JOIN FETCH i.product p " +
           "LEFT JOIN FETCH p.category " +
           "LEFT JOIN FETCH p.brand " +
           "ORDER BY o.id DESC")
    List<CustomerOrder> findAllWithDetails();

    /**
     * Lấy 1 đơn hàng theo ID kèm JOIN FETCH đầy đủ.
     */
    @Query("SELECT DISTINCT o FROM CustomerOrder o " +
           "LEFT JOIN FETCH o.customer " +
           "LEFT JOIN FETCH o.promotion " +
           "LEFT JOIN FETCH o.orderItems i " +
           "LEFT JOIN FETCH i.product p " +
           "LEFT JOIN FETCH p.category " +
           "LEFT JOIN FETCH p.brand " +
           "WHERE o.id = :id")
    Optional<CustomerOrder> findByIdWithDetails(@Param("id") Long id);
}
