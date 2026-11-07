package com.example.demojpa.service;

import com.example.demojpa.entity.Customer;
import com.example.demojpa.entity.Product;
import com.example.demojpa.entity.ProductReview;
import com.example.demojpa.repository.CustomerRepository;
import com.example.demojpa.repository.ProductRepository;
import com.example.demojpa.repository.ProductReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ProductReviewService {

    private final ProductReviewRepository reviewRepo;
    private final ProductRepository productRepo;
    private final CustomerRepository customerRepo;

    public ProductReviewService(ProductReviewRepository reviewRepo,
                                ProductRepository productRepo,
                                CustomerRepository customerRepo) {
        this.reviewRepo = reviewRepo;
        this.productRepo = productRepo;
        this.customerRepo = customerRepo;
    }

    public List<ProductReview> getAllReviews() {
        return reviewRepo.findAllWithDetails();
    }

    public Optional<ProductReview> getReviewById(Long id) {
        return reviewRepo.findById(id);
    }

    public List<ProductReview> getReviewsByProductId(Long productId) {
        return reviewRepo.findByProductIdWithDetails(productId);
    }

    @Transactional
    public ProductReview createReview(ProductReview review) {
        if (review.getRating() == null || review.getRating() < 1 || review.getRating() > 5) {
            throw new IllegalArgumentException("Điểm đánh giá phải từ 1 đến 5");
        }
        if (review.getProduct() == null || review.getProduct().getId() == null) {
            throw new IllegalArgumentException("Thiếu sản phẩm đánh giá");
        }

        Product product = productRepo.findById(review.getProduct().getId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm"));
        review.setProduct(product);

        Customer customer;
        if (review.getCustomer() != null && review.getCustomer().getId() != null) {
            customer = customerRepo.findById(review.getCustomer().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khách hàng"));
        } else if (review.getCustomer() != null
                && review.getCustomer().getPhone() != null
                && !review.getCustomer().getPhone().isBlank()) {
            String phone = review.getCustomer().getPhone().trim();
            String name = (review.getCustomer().getFullName() != null && !review.getCustomer().getFullName().isBlank())
                    ? review.getCustomer().getFullName().trim() : "Khách hàng";
            customer = customerRepo.findByPhone(phone)
                    .orElseGet(() -> customerRepo.save(new Customer(name, phone, null, null)));
        } else {
            throw new IllegalArgumentException("Thiếu thông tin khách hàng đánh giá");
        }
        review.setCustomer(customer);

        return reviewRepo.save(review);
    }

    public boolean deleteReview(Long id) {
        if (reviewRepo.existsById(id)) {
            reviewRepo.deleteById(id);
            return true;
        }
        return false;
    }
}
