package com.example.demojpa.dto;

/**
 * DTO: StockEntry — Một dòng trong ma trận tồn kho phẳng (productId × branchId).
 * Dùng cho endpoint GET /api/v1/inventory/stock-matrix.
 */
public class StockEntry {

    private Long productId;
    private String sku;
    private Long branchId;
    private Integer quantity;

    public StockEntry() {
    }

    public StockEntry(Long productId, String sku, Long branchId, Integer quantity) {
        this.productId = productId;
        this.sku = sku;
        this.branchId = branchId;
        this.quantity = quantity;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public Long getBranchId() {
        return branchId;
    }

    public void setBranchId(Long branchId) {
        this.branchId = branchId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
