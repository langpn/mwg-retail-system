package com.example.demojpa.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity: Category (Danh mục sản phẩm Điện Máy Xanh)
 * Quan hệ: 1 Danh mục có Nhiều Sản phẩm (1 - N với Product)
 */
@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "description", length = 255)
    private String description;

    /**
     * @OneToMany: 1 danh mục có nhiều sản phẩm.
     * mappedBy = "category": Thuộc tính 'category' bên class Product làm chủ quan hệ.
     * cascade = {CascadeType.PERSIST, CascadeType.MERGE}: Không dùng CascadeType.REMOVE để tránh xóa nhầm dây chuyền toàn bộ sản phẩm khi thao tác danh mục.
     * @JsonIgnore: Chống lỗi vòng lặp đệ quy vô hạn khi Spring Boot serialize sang JSON.
     */
    @OneToMany(mappedBy = "category", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Product> products = new ArrayList<>();

    // Constructor mặc định bắt buộc cho JPA
    public Category() {
    }

    public Category(String name, String code, String description) {
        this.name = name;
        this.code = code;
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

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
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
