package com.example.demojpa.repository;

import com.example.demojpa.dto.StockEntry;
import com.example.demojpa.entity.Inventory;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByProduct_IdAndStoreBranch_Id(Long productId, Long branchId);

    /**
     * Đọc dòng tồn kho kèm khoá ghi bi quan (SELECT ... FOR UPDATE).
     * Lưu ý: chỉ dùng để đọc thông tin; việc trừ/hoàn tồn kho phải dùng
     * deductStock / restoreStock bên dưới vì chúng nguyên tử ở tầng CSDL.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Inventory i WHERE i.product.id = :productId AND i.storeBranch.id = :branchId")
    Optional<Inventory> findForUpdate(@Param("productId") Long productId, @Param("branchId") Long branchId);

    /**
     * Trừ tồn kho bằng MỘT câu UPDATE nguyên tử, có điều kiện quantity >= :qty.
     * Trả về 1 nếu trừ thành công, 0 nếu không đủ hàng.
     *
     * Đây là lớp bảo vệ chống bán vượt tồn kho đáng tin cậy nhất:
     *  - Khoá bi quan (@Lock) không đủ vì Hibernate có thể trả entity đã nằm sẵn
     *    trong persistence context (do quote() đọc trước đó) mà không đọc lại DB.
     *  - Câu UPDATE ... WHERE quantity >= ? để chính MySQL kiểm tra và quyết định,
     *    hai đơn đồng thời sẽ bị MySQL xếp hàng ở tầng khoá dòng.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Inventory i SET i.quantity = i.quantity - :qty " +
           "WHERE i.product.id = :productId AND i.storeBranch.id = :branchId AND i.quantity >= :qty")
    int deductStock(@Param("productId") Long productId,
                    @Param("branchId") Long branchId,
                    @Param("qty") int qty);

    /**
     * Hoàn tồn kho bằng một câu UPDATE nguyên tử (dùng khi huỷ đơn).
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Inventory i SET i.quantity = i.quantity + :qty " +
           "WHERE i.product.id = :productId AND i.storeBranch.id = :branchId")
    int restoreStock(@Param("productId") Long productId,
                     @Param("branchId") Long branchId,
                     @Param("qty") int qty);
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
