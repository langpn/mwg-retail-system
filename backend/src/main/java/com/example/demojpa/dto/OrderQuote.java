package com.example.demojpa.dto;

import java.util.List;

/**
 * DTO: OrderQuote — Kết quả tính giá đơn hàng (nguồn sự thật duy nhất cho tiền tệ).
 * Được trả về bởi POST /api/v1/orders/quote và dùng nội bộ trong createOrder.
 */
public class OrderQuote {

    /** Danh sách chi tiết từng mặt hàng trong báo giá. */
    private List<QuoteItem> items;

    /** Tổng tiền trước giảm giá (VNĐ). */
    private Double subtotal;

    /** Mã khuyến mãi đã chuẩn hóa (trim + uppercase), null nếu không áp dụng. */
    private String promoCode;

    /** true nếu mã khuyến mãi hợp lệ và được áp dụng. */
    private Boolean promoApplied;

    /** Mô tả chương trình khuyến mãi, null nếu không áp dụng. */
    private String promoLabel;

    /** Lý do tại sao mã không áp dụng được, null nếu không có mã hoặc áp dụng thành công. */
    private String promoMessage;

    /** Số tiền giảm giá (VNĐ, đã làm tròn nguyên). */
    private Double discount;

    /** Tổng tiền sau giảm giá = subtotal - discount. */
    private Double total;

    public OrderQuote() {
    }

    // Getters and Setters
    public List<QuoteItem> getItems() {
        return items;
    }

    public void setItems(List<QuoteItem> items) {
        this.items = items;
    }

    public Double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }

    public String getPromoCode() {
        return promoCode;
    }

    public void setPromoCode(String promoCode) {
        this.promoCode = promoCode;
    }

    public Boolean getPromoApplied() {
        return promoApplied;
    }

    public void setPromoApplied(Boolean promoApplied) {
        this.promoApplied = promoApplied;
    }

    public String getPromoLabel() {
        return promoLabel;
    }

    public void setPromoLabel(String promoLabel) {
        this.promoLabel = promoLabel;
    }

    public String getPromoMessage() {
        return promoMessage;
    }

    public void setPromoMessage(String promoMessage) {
        this.promoMessage = promoMessage;
    }

    public Double getDiscount() {
        return discount;
    }

    public void setDiscount(Double discount) {
        this.discount = discount;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }

    /**
     * Chi tiết 1 mặt hàng trong báo giá.
     */
    public static class QuoteItem {
        private Long productId;
        private String sku;
        private String name;
        private Double unitPrice;
        private Integer quantity;
        private Double lineTotal;

        public QuoteItem() {
        }

        public QuoteItem(Long productId, String sku, String name, Double unitPrice, Integer quantity) {
            this.productId = productId;
            this.sku = sku;
            this.name = name;
            this.unitPrice = unitPrice;
            this.quantity = quantity;
            this.lineTotal = unitPrice * quantity;
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

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public Double getUnitPrice() {
            return unitPrice;
        }

        public void setUnitPrice(Double unitPrice) {
            this.unitPrice = unitPrice;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }

        public Double getLineTotal() {
            return lineTotal;
        }

        public void setLineTotal(Double lineTotal) {
            this.lineTotal = lineTotal;
        }
    }
}
