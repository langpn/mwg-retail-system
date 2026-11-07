package com.example.demojpa.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity: CustomerOrder (Đơn đặt mua hàng của khách)
 * Quan hệ: 
 * - Thuộc về 1 Customer (N - 1)
 * - Có thể áp dụng 1 Promotion (N - 1)
 * - Có Nhiều chi tiết OrderItem (1 - N)
 */
@Entity
@Table(name = "customer_orders")
public class CustomerOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_name", nullable = false, length = 100)
    private String customerName;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "shipping_address", nullable = false, length = 255)
    private String shippingAddress;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "PENDING"; // PENDING, CONFIRMED, COMPLETED, CANCELLED

    @Column(name = "order_date", nullable = false)
    private LocalDateTime orderDate = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "promotion_id")
    private Promotion promotion;

    /**
     * Chi nhánh siêu thị nơi đơn hàng được đặt.
     * Bắt buộc phải lưu lại để khi huỷ đơn còn biết hoàn hàng về đúng kho chi nhánh nào.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "branch_id")
    private StoreBranch storeBranch;

    @OneToMany(mappedBy = "customerOrder", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<OrderItem> orderItems = new ArrayList<>();

    public CustomerOrder() {
    }

    public CustomerOrder(String customerName, String phone, String shippingAddress, Double totalAmount) {
        this.customerName = customerName;
        this.phone = phone;
        this.shippingAddress = shippingAddress;
        this.totalAmount = totalAmount;
        this.status = "PENDING";
        this.orderDate = LocalDateTime.now();
    }

    public CustomerOrder(String customerName, String phone, String shippingAddress, Double totalAmount, Customer customer, Promotion promotion) {
        this.customerName = customerName;
        this.phone = phone;
        this.shippingAddress = shippingAddress;
        this.totalAmount = totalAmount;
        this.customer = customer;
        this.promotion = promotion;
        this.status = "PENDING";
        this.orderDate = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public Promotion getPromotion() {
        return promotion;
    }

    public void setPromotion(Promotion promotion) {
        this.promotion = promotion;
    }

    public StoreBranch getStoreBranch() {
        return storeBranch;
    }

    public void setStoreBranch(StoreBranch storeBranch) {
        this.storeBranch = storeBranch;
    }

    public List<OrderItem> getOrderItems() {
        return orderItems;
    }

    public void setOrderItems(List<OrderItem> orderItems) {
        this.orderItems = orderItems;
    }
}
