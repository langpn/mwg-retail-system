package com.example.demojpa.repository;

import com.example.demojpa.dto.StockEntry;
import com.example.demojpa.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByProduct_IdAndStoreBranch_Id(Long productId, Long branchId);
    Optional<Inventory> findByProduct_SkuAndStoreBranch_District(String sku, String district);
    List<Inventory> findByProduct_Id(Long productId);
    List<Inventory> findByQuantityGreaterThan(Integer minQty);

    /**
     * Lấy tồn kho theo chi nhánh với JOIN FETCH đầy đủ, loại bỏ N+1 Query.
     */
    @Query("SELECT i FROM Inventory i " +
           "JOIN FETCH i.product p " +
           "JOIN FETCH p.category " +
           "LEFT JOIN FETCH p.brand " +
           "JOIN FETCH i.storeBranch " +
           "WHERE i.storeBranch.id = :branchId")
    List<Inventory> findByBranchWithDetails(@Param("branchId") Long branchId);

    /**
     * Ma trận tồn kho phẳng: 1 câu JPQL constructor query duy nhất.
     * Trả về List<StockEntry> gồm productId, sku, branchId, quantity.
     */
    @Query("SELECT new com.example.demojpa.dto.StockEntry(p.id, p.sku, b.id, i.quantity) " +
           "FROM Inventory i " +
           "JOIN i.product p " +
           "JOIN i.storeBranch b " +
           "ORDER BY p.id ASC, b.id ASC")
    List<StockEntry> findStockMatrix();
}
