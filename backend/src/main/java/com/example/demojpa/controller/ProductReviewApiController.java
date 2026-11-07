package com.example.demojpa.controller;

import com.example.demojpa.entity.ProductReview;
import com.example.demojpa.service.ProductReviewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
@CrossOrigin(origins = "*")
public class ProductReviewApiController {

    private final ProductReviewService reviewService;

    public ProductReviewApiController(ProductReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    public ResponseEntity<List<ProductReview>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductReview>> getReviewsByProductId(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getReviewsByProductId(productId));
    }

    /** ApiExceptionHandler xử lý IllegalArgumentException → 400 {"error": "..."} */
    @PostMapping
    public ResponseEntity<ProductReview> createReview(@RequestBody ProductReview review) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.createReview(review));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        return reviewService.deleteReview(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
