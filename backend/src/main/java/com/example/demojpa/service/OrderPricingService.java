package com.example.demojpa.service;

import com.example.demojpa.dto.CreateOrderRequest;
import com.example.demojpa.dto.OrderItemRequest;
import com.example.demojpa.dto.OrderQuote;
import com.example.demojpa.entity.Inventory;
import com.example.demojpa.entity.Product;
import com.example.demojpa.entity.Promotion;
import com.example.demojpa.repository.InventoryRepository;
import com.example.demojpa.repository.ProductRepository;
import com.example.demojpa.repository.PromotionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

/**
 * Service: OrderPricingService — Module tính giá sâu (nguồn sự thật duy nhất cho tiền tệ).
 * Giao diện công khai duy nhất: quote() — chỉ đọc, không ghi dữ liệu.
 */
@Service
public class OrderPricingService {

    private final ProductRepository productRepo;
    private final PromotionRepository promoRepo;
    private final InventoryRepository inventoryRepo;

    public OrderPricingService(ProductRepository productRepo,
                               PromotionRepository promoRepo,
                               InventoryRepository inventoryRepo) {
        this.productRepo = productRepo;
        this.promoRepo = promoRepo;
        this.inventoryRepo = inventoryRepo;
    }

    /**
     * Tính toán báo giá đơn hàng (read-only, không ghi CSDL).
     * Kiểm tra hợp lệ, nạp sản phẩm, tính tổng tiền, áp mã giảm giá và kiểm tra tồn kho.
     *
     * @param req yêu cầu tạo đơn hàng (customerName/phone/address có thể để trống khi chỉ báo giá)
     * @return OrderQuote chứa đầy đủ thông tin báo giá
     * @throws IllegalArgumentException khi dữ liệu đầu vào không hợp lệ
     */
    @Transactional(readOnly = true)
    public OrderQuote quote(CreateOrderRequest req) {
        // Kiểm tra danh sách mặt hàng không được rỗng
        if (req == null || req.getItems() == null || req.getItems().isEmpty()) {
            throw new IllegalArgumentException("Danh sách mặt hàng không được để trống");
        }

        List<OrderQuote.QuoteItem> quoteItems = new ArrayList<>();
        Map<Long, Long> quantitiesByProduct = new HashMap<>();
        double subtotal = 0.0;

        for (OrderItemRequest itemReq : req.getItems()) {
            if (itemReq == null || itemReq.getProductId() == null) {
                throw new IllegalArgumentException("productId không được để trống");
            }
            if (itemReq.getQuantity() == null || itemReq.getQuantity() < 1) {
                throw new IllegalArgumentException("Số lượng phải >= 1 cho sản phẩm ID: " + itemReq.getProductId());
            }

            Product product = productRepo.findById(itemReq.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Không tìm thấy sản phẩm ID: " + itemReq.getProductId()));

            int qty = itemReq.getQuantity();
            double lineTotal = product.getPrice() * qty;
            subtotal += lineTotal;

            // Kiểm tra tồn kho nếu có branchId
            if (req.getBranchId() != null) {
                Optional<Inventory> invOpt = inventoryRepo.findByProduct_IdAndStoreBranch_Id(
                        product.getId(), req.getBranchId());
                long requested = quantitiesByProduct.merge(product.getId(), (long) qty, Long::sum);
                if (invOpt.isEmpty() || invOpt.get().getQuantity() < requested) {
                    int available = invOpt.map(Inventory::getQuantity).orElse(0);
                    throw new IllegalArgumentException(
                            "Sản phẩm '" + product.getName() + "' không đủ tồn kho tại chi nhánh đã chọn (còn " + available + ")");
                }
            }

            quoteItems.add(new OrderQuote.QuoteItem(
                    product.getId(), product.getSku(), product.getName(),
                    product.getPrice(), qty));
        }

        // Xử lý mã khuyến mãi
        String rawCode = req.getPromoCode();
        String normalizedCode = (rawCode != null) ? rawCode.trim().toUpperCase(Locale.ROOT) : null;

        double discount = 0.0;
        boolean promoApplied = false;
        String promoLabel = null;
        String promoMessage = null;
        String promoCodeOut = null;

        if (normalizedCode != null && !normalizedCode.isEmpty()) {
            Optional<Promotion> promoOpt = promoRepo.findByPromoCodeAndIsActiveTrue(normalizedCode);
            if (promoOpt.isPresent()) {
                Promotion promo = promoOpt.get();
                // discount = min(round(subtotal * percent/100), maxDiscountAmount nếu có)
                double rawDiscount = Math.round(subtotal * promo.getDiscountPercent() / 100.0);
                if (promo.getMaxDiscountAmount() != null) {
                    rawDiscount = Math.min(rawDiscount, promo.getMaxDiscountAmount());
                }
                discount = rawDiscount;
                promoApplied = true;
                promoLabel = promo.getDescription();
                promoCodeOut = normalizedCode;
            } else {
                promoMessage = "Mã khuyến mãi không hợp lệ hoặc đã hết hạn";
            }
        }

        double total = subtotal - discount;

        OrderQuote quote = new OrderQuote();
        quote.setItems(quoteItems);
        quote.setSubtotal(subtotal);
        quote.setPromoCode(promoCodeOut);
        quote.setPromoApplied(promoApplied);
        quote.setPromoLabel(promoLabel);
        quote.setPromoMessage(promoMessage);
        quote.setDiscount(discount);
        quote.setTotal(total);

        return quote;
    }
}
