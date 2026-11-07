package com.example.demojpa.dto;

public class StockUpdateRequest {
    private Long productId;
    private Long branchId;
    private Integer quantity;

    public StockUpdateRequest() {}

    public StockUpdateRequest(Long productId, Long branchId, Integer quantity) {
        this.productId = productId;
        this.branchId = branchId;
        this.quantity = quantity;
    }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}
