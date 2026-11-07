package com.example.demojpa.service;

import com.example.demojpa.dto.CreateOrderRequest;
import com.example.demojpa.dto.OrderQuote;
import com.example.demojpa.entity.*;
import com.example.demojpa.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service: OrderService (Quản lý nghiệp vụ Đặt mua hàng & Trừ tồn kho chi nhánh)
 * Phân hệ 3 do bạn Toàn phụ trách chính.
 */
@Service
public class OrderService {

    private final CustomerOrderRepository orderRepo;
    private final OrderItemRepository orderItemRepo;
    private final CustomerRepository customerRepo;
    private final PromotionRepository promoRepo;
    private final ProductRepository productRepo;
    private final InventoryRepository inventoryRepo;
    private final OrderPricingService pricingService;

    public OrderService(
            CustomerOrderRepository orderRepo,
            OrderItemRepository orderItemRepo,
            CustomerRepository customerRepo,
            PromotionRepository promoRepo,
            ProductRepository productRepo,
            InventoryRepository inventoryRepo,
            OrderPricingService pricingService
    ) {
        this.orderRepo = orderRepo;
        this.orderItemRepo = orderItemRepo;
        this.customerRepo = customerRepo;
        this.promoRepo = promoRepo;
        this.productRepo = productRepo;
        this.inventoryRepo = inventoryRepo;
        this.pricingService = pricingService;
    }

    public List<CustomerOrder> getAllOrders() {
        return orderRepo.findAllWithDetails();
    }

    public Optional<CustomerOrder> getOrderById(Long id) {
        return orderRepo.findByIdWithDetails(id);
    }

    @Transactional
    public CustomerOrder createOrder(CreateOrderRequest req) {
        // Tính báo giá và kiểm tra sản phẩm, khuyến mãi, tồn kho trước khi ghi dữ liệu.
        OrderQuote quote = pricingService.quote(req);

        // Yêu cầu thêm cho createOrder: tên khách và số điện thoại không được trống
        if (req.getCustomerName() == null || req.getCustomerName().isBlank()) {
            throw new IllegalArgumentException("Tên khách hàng không được để trống");
        }
        if (req.getPhone() == null || req.getPhone().isBlank()) {
            throw new IllegalArgumentException("Số điện thoại không được để trống");
        }

        // 2. Tìm hoặc tạo mới khách hàng qua số điện thoại
        Customer customer = customerRepo.findByPhone(req.getPhone())
                .orElseGet(() -> customerRepo.save(new Customer(
                        req.getCustomerName(),
                        req.getPhone(),
                        null,
                        req.getShippingAddress()
                )));

        // 3. Tra cứu Promotion entity để gắn vào đơn hàng (nếu có)
        Promotion promotion = null;
        if (quote.getPromoApplied() && quote.getPromoCode() != null) {
            promotion = promoRepo.findByPromoCodeAndIsActiveTrue(quote.getPromoCode()).orElse(null);
        }

        // 4. Tạo đơn hàng với tổng tiền từ báo giá (nguồn sự thật duy nhất)
        CustomerOrder order = new CustomerOrder(
                req.getCustomerName(),
                req.getPhone(),
                req.getShippingAddress() != null ? req.getShippingAddress() : "",
                quote.getTotal(),
                customer,
                promotion
        );
        order = orderRepo.save(order);

        // 5. Lưu từng OrderItem và trừ tồn kho, dùng giá từ báo giá
        for (OrderQuote.QuoteItem qi : quote.getItems()) {
            Product product = productRepo.findById(qi.getProductId()).orElseThrow();
            int qty = qi.getQuantity();

            // Trừ tồn kho tại chi nhánh nếu có branchId
            if (req.getBranchId() != null) {
                Inventory inv = inventoryRepo
                        .findByProduct_IdAndStoreBranch_Id(product.getId(), req.getBranchId())
                        .orElseThrow();
                inv.setQuantity(inv.getQuantity() - qty);
                inventoryRepo.save(inv);
            }

            OrderItem item = new OrderItem(order, product, qty, qi.getUnitPrice());
            OrderItem saved = orderItemRepo.save(item);
            order.getOrderItems().add(saved);
        }

        return orderRepo.save(order);
    }

    public Optional<CustomerOrder> updateOrderStatus(Long orderId, String status) {
        return orderRepo.findById(orderId).map(order -> {
            order.setStatus(status);
            return orderRepo.save(order);
        });
    }
}
