package com.example.demojpa.service;

import com.example.demojpa.entity.Promotion;
import com.example.demojpa.repository.PromotionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service: PromotionService (Quản lý nghiệp vụ Khuyến mãi & Mã giảm giá)
 */
@Service
public class PromotionService {

    private final PromotionRepository promotionRepo;

    public PromotionService(PromotionRepository promotionRepo) {
        this.promotionRepo = promotionRepo;
    }

    public List<Promotion> getAllPromotions() {
        return promotionRepo.findAll();
    }

    public Optional<Promotion> getPromotionById(Long id) {
        return promotionRepo.findById(id);
    }

    public Promotion createPromotion(Promotion promotion) {
        validatePromotion(promotion);
        return promotionRepo.save(promotion);
    }

    public Optional<Promotion> updatePromotion(Long id, Promotion updated) {
        validatePromotion(updated);
        return promotionRepo.findById(id).map(existing -> {
            existing.setPromoCode(updated.getPromoCode());
            existing.setDiscountPercent(updated.getDiscountPercent());
            existing.setDescription(updated.getDescription());
            existing.setIsActive(updated.getIsActive());
            existing.setMaxDiscountAmount(updated.getMaxDiscountAmount());
            return promotionRepo.save(existing);
        });
    }

    /**
     * Kiểm tra tính hợp lệ của chương trình khuyến mãi trước khi ghi CSDL.
     * Mục đích: không cho tồn tại mã giảm giá vô lý (âm, hoặc vượt 100% khiến tổng tiền âm).
     */
    private void validatePromotion(Promotion promotion) {
        if (promotion == null) {
            throw new IllegalArgumentException("Dữ liệu khuyến mãi không được để trống");
        }
        if (promotion.getPromoCode() == null || promotion.getPromoCode().isBlank()) {
            throw new IllegalArgumentException("Mã khuyến mãi không được để trống");
        }
        Double percent = promotion.getDiscountPercent();
        if (percent == null) {
            throw new IllegalArgumentException("Phần trăm giảm giá không được để trống");
        }
        if (percent <= 0) {
            throw new IllegalArgumentException("Phần trăm giảm giá phải lớn hơn 0");
        }
        if (percent > 100) {
            throw new IllegalArgumentException("Phần trăm giảm giá không được vượt quá 100");
        }
        if (promotion.getMaxDiscountAmount() != null && promotion.getMaxDiscountAmount() <= 0) {
            throw new IllegalArgumentException("Mức giảm tối đa phải lớn hơn 0");
        }
        promotion.setPromoCode(promotion.getPromoCode().trim().toUpperCase(java.util.Locale.ROOT));
    }

    public boolean deletePromotion(Long id) {
        if (promotionRepo.existsById(id)) {
            promotionRepo.deleteById(id);
            return true;
        }
        return false;
    }
}
