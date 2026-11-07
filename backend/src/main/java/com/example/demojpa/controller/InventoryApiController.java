package com.example.demojpa.controller;

import com.example.demojpa.dto.StockUpdateRequest;
import com.example.demojpa.entity.Inventory;
import com.example.demojpa.entity.StoreBranch;
import com.example.demojpa.service.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller: InventoryApiController
 * Cung cấp Web Service cho Phân hệ 2 (Tồn kho & Siêu thị chi nhánh)
 * Tuân thủ phương thức: GET, PUT
 */
@RestController
@RequestMapping("/api/v1/inventory")
@CrossOrigin(origins = "*")
public class InventoryApiController {

    private final InventoryService inventoryService;

    public InventoryApiController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    /**
     * GET /api/v1/inventory/branches
     * Lấy toàn bộ danh sách siêu thị Điện Máy Xanh
     */
    @GetMapping("/branches")
    public ResponseEntity<List<StoreBranch>> getAllBranches() {
        return ResponseEntity.ok(inventoryService.getAllBranches());
    }

    /**
     * GET /api/v1/inventory/check?sku=...&district=...
     * Kiểm tra số lượng tồn kho khả dụng theo mã SKU và khu vực quận/huyện
     */
    @GetMapping("/check")
    public ResponseEntity<Inventory> checkInventory(
            @RequestParam String sku,
            @RequestParam String district
    ) {
        return inventoryService.checkInventory(sku, district)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/v1/inventory/branch/{branchId}
     * Lấy toàn bộ danh sách tồn kho của một siêu thị
     */
    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<Inventory>> getBranchInventory(@PathVariable Long branchId) {
        return ResponseEntity.ok(inventoryService.getInventoryByBranch(branchId));
    }

    /**
     * PUT /api/v1/inventory/update
     * Cập nhật số lượng tồn kho thực tế của sản phẩm tại chi nhánh (HTTP PUT)
     */
    @PutMapping("/update")
    public ResponseEntity<Inventory> updateStock(@RequestBody StockUpdateRequest req) {
        try {
            Inventory updated = inventoryService.updateStock(req.getProductId(), req.getBranchId(), req.getQuantity());
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
