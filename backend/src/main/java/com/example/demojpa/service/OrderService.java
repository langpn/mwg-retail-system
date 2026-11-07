package com.example.demojpa.service;

import com.example.demojpa.dto.CreateOrderRequest;
import com.example.demojpa.dto.OrderItemRequest;
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

    public OrderService(
            CustomerOrderRepository orderRepo,
            OrderItemRepository orderItemRepo,
            CustomerRepository customerRepo,
            PromotionRepository promoRepo,
            ProductRepository productRepo,
            InventoryRepository inventoryRepo
    ) {
        this.orderRepo = orderRepo;
        this.orderItemRepo = orderItemRepo;
        this.customerRepo = customerRepo;
        this.promoRepo = promoRepo;
        this.productRepo = productRepo;
        this.inventoryRepo = inventoryRepo;
    }

    public List<CustomerOrder> getAllOrders() {
        return orderRepo.findAll();
    }

    public Optional<CustomerOrder> getOrderById(Long id) {
        return orderRepo.findById(id);
    }

    @Transactional
    public CustomerOrder createOrder(CreateOrderRequest req) {
        // 1. Tìm hoặc tạo mới khách hàng qua số điện thoại
        Customer customer = customerRepo.findByPhone(req.getPhone())
                .orElseGet(() -> customerRepo.save(new Customer(
                        req.getCustomerName(),
                        req.getPhone(),
                        null,
                        req.getShippingAddress()
                )));

        // 2. Kiểm tra mã khuyến mãi (nếu có)
        Promotion promotion = null;
        double discountPercent = 0.0;
        if (req.getPromoCode() != null && !req.getPromoCode().trim().isEmpty()) {
            Optional<Promotion> promoOpt = promoRepo.findByPromoCodeAndIsActiveTrue(req.getPromoCode());
            if (promoOpt.isPresent()) {
                promotion = promoOpt.get();
                discountPercent = promotion.getDiscountPercent();
            }
        }

        // 3. Tạo đối tượng đơn hàng ban đầu
        CustomerOrder order = new CustomerOrder(
                req.getCustomerName(),
                req.getPhone(),
                req.getShippingAddress(),
                0.0,
                customer,
                promotion
        );
        order = orderRepo.save(order);

        // 4. Tính toán chi tiết các món hàng và trừ tồn kho
        double total = 0.0;
        if (req.getItems() != null) {
            for (OrderItemRequest itemReq : req.getItems()) {
                Product product = productRepo.findById(itemReq.getProductId())
                        .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm ID: " + itemReq.getProductId()));

                int qty = itemReq.getQuantity() != null && itemReq.getQuantity() > 0 ? itemReq.getQuantity() : 1;
                double itemPrice = product.getPrice();
                total += itemPrice * qty;

                // Trừ số lượng tồn kho tại chi nhánh nếu có branchId (ném ngoại lệ nếu không đủ hàng)
                if (req.getBranchId() != null) {
                    Optional<Inventory> invOpt = inventoryRepo.findByProduct_IdAndStoreBranch_Id(product.getId(), req.getBranchId());
                    if (invOpt.isEmpty() || invOpt.get().getQuantity() < qty) {
                        throw new IllegalArgumentException("Sản phẩm '" + product.getName() + "' không đủ tồn kho tại chi nhánh đã chọn (còn " + (invOpt.map(Inventory::getQuantity).orElse(0)) + ")");
                    }
                    Inventory inv = invOpt.get();
                    inv.setQuantity(inv.getQuantity() - qty);
                    inventoryRepo.save(inv);
                }

                // Lưu OrderItem và cập nhật danh sách orderItems của order
                OrderItem item = new OrderItem(order, product, qty, itemPrice);
                OrderItem savedItem = orderItemRepo.save(item);
                order.getOrderItems().add(savedItem);
            }
        }

        // 5. Áp dụng chiết khấu khuyến mãi (nếu có)
        if (discountPercent > 0.0) {
            total = total * (1.0 - (discountPercent / 100.0));
        }
        order.setTotalAmount(total);

        return orderRepo.save(order);
    }

    public Optional<CustomerOrder> updateOrderStatus(Long orderId, String status) {
        return orderRepo.findById(orderId).map(order -> {
            order.setStatus(status);
            return orderRepo.save(order);
        });
    }
}
