package com.example.demojpa.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity: Promotion (Chương trình khuyến mãi & Mã giảm giá ĐMX)
 * Quan hệ: 1 Khuyến mãi có thể áp dụng cho Nhiều Đơn hàng (1 - N với CustomerOrder)
 */
@Entity
@Table(name = "promotions")
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "promo_code", nullable = false, unique = true, length = 50)
    private String promoCode;

    @Column(name = "discount_percent", nullable = false)
    private Double discountPercent;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    /** Mức giảm giá tối đa (VNĐ). null = không giới hạn. */
    @Column(name = "max_discount_amount")
    private Double maxDiscountAmount;

    @OneToMany(mappedBy = "promotion", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<CustomerOrder> orders = new ArrayList<>();

    public Promotion() {
    }

    public Promotion(String promoCode, Double discountPercent, String description, Boolean isActive) {
        this.promoCode = promoCode;
        this.discountPercent = discountPercent;
        this.description = description;
        this.isActive = isActive;
    }

    public Promotion(String promoCode, Double discountPercent, String description, Boolean isActive, Double maxDiscountAmount) {
        this.promoCode = promoCode;
        this.discountPercent = discountPercent;
        this.description = description;
        this.isActive = isActive;
        this.maxDiscountAmount = maxDiscountAmount;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPromoCode() {
        return promoCode;
    }

    public void setPromoCode(String promoCode) {
        this.promoCode = promoCode;
    }

    public Double getDiscountPercent() {
        return discountPercent;
    }

    public void setDiscountPercent(Double discountPercent) {
        this.discountPercent = discountPercent;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Double getMaxDiscountAmount() {
        return maxDiscountAmount;
    }

    public void setMaxDiscountAmount(Double maxDiscountAmount) {
        this.maxDiscountAmount = maxDiscountAmount;
    }

    public List<CustomerOrder> getOrders() {
        return orders;
    }

    public void setOrders(List<CustomerOrder> orders) {
        this.orders = orders;
    }
}
