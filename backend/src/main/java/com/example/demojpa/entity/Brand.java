package com.example.demojpa.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity: Brand (Thương hiệu sản phẩm - Samsung, LG, Toshiba, Sony, Panasonic...)
 * Quan hệ: 1 Thương hiệu có Nhiều Sản phẩm (1 - N với Product)
 */
@Entity
@Table(name = "brands")
public class Brand {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "description", length = 255)
    private String description;

    /**
     * @OneToMany: 1 thương hiệu có nhiều sản phẩm.
     * mappedBy = "brand": Thuộc tính 'brand' bên class Product làm chủ quan hệ.
     * cascade = {CascadeType.PERSIST, CascadeType.MERGE}: Không dùng CascadeType.REMOVE để tránh xóa nhầm dây chuyền toàn bộ sản phẩm khi thao tác thương hiệu.
     * @JsonIgnore: Chống lỗi vòng lặp đệ quy vô hạn khi Spring Boot serialize sang JSON.
     */
    @OneToMany(mappedBy = "brand", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Product> products = new ArrayList<>();

    public Brand() {
    }

    public Brand(String name, String country, String description) {
        this.name = name;
        this.country = country;
        this.description = description;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<Product> getProducts() {
        return products;
    }

    public void setProducts(List<Product> products) {
        this.products = products;
    }
}
