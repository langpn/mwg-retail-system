package com.example.demojpa.service;

import com.example.demojpa.dto.CreateOrderRequest;
import com.example.demojpa.dto.OrderQuote;
import com.example.demojpa.entity.*;
import com.example.demojpa.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Service: OrderService (Quản lý nghiệp vụ Đặt mua hàng & Trừ tồn kho chi nhánh)
 * Phân hệ 3 do bạn Toàn phụ trách chính.
 */
@Service
public class OrderService {

    /** Bốn trạng thái hợp lệ của vòng đời đơn hàng. */
    public static final Set<String> VALID_STATUSES =
            Set.of("PENDING", "CONFIRMED", "COMPLETED", "CANCELLED");

    /**
     * Bảng chuyển trạng thái hợp lệ. Mỗi trạng thái chỉ được đi tới các trạng thái trong danh sách.
     * Nhờ đó không thể huỷ một đơn đã giao xong, cũng không thể hồi sinh đơn đã huỷ.
     */
    private static final java.util.Map<String, Set<String>> ALLOWED_TRANSITIONS = java.util.Map.of(
            "PENDING",   Set.of("CONFIRMED", "CANCELLED"),
            "CONFIRMED", Set.of("COMPLETED", "CANCELLED"),
            "COMPLETED", Set.of(),   // đã giao xong: trạng thái cuối
            "CANCELLED", Set.of()    // đã huỷ: trạng thái cuối
    );

    private final CustomerOrderRepository orderRepo;
    private final OrderItemRepository orderItemRepo;
    private final CustomerRepository customerRepo;
    private final PromotionRepository promoRepo;
    private final ProductRepository productRepo;
    private final InventoryRepository inventoryRepo;
    private final StoreBranchRepository branchRepo;
    private final OrderPricingService pricingService;

    public OrderService(
            CustomerOrderRepository orderRepo,
            OrderItemRepository orderItemRepo,
            CustomerRepository customerRepo,
            PromotionRepository promoRepo,
            ProductRepository productRepo,
            InventoryRepository inventoryRepo,
            StoreBranchRepository branchRepo,
            OrderPricingService pricingService
    ) {
        this.orderRepo = orderRepo;
        this.orderItemRepo = orderItemRepo;
        this.customerRepo = customerRepo;
        this.promoRepo = promoRepo;
        this.productRepo = productRepo;
        this.inventoryRepo = inventoryRepo;
        this.branchRepo = branchRepo;
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
        // Chuẩn hoá SĐT và bắt buộc đúng định dạng Việt Nam (10 số, bắt đầu bằng 0)
        String phone = req.getPhone().replaceAll("[\\s.\\-]", "").trim();
        if (!phone.matches("^0\\d{9}$")) {
            throw new IllegalArgumentException("Số điện thoại không hợp lệ (phải gồm 10 chữ số và bắt đầu bằng 0)");
        }
        req.setPhone(phone);

        // 1. Trừ tồn kho TRƯỚC khi ghi đơn, bằng câu UPDATE nguyên tử có điều kiện quantity >= qty.
        //    MySQL tự kiểm tra và tự khoá dòng, nên hai đơn đặt đồng thời không thể cùng trừ
        //    một món hàng cuối cùng: đơn thứ hai nhận 0 dòng cập nhật và bị từ chối.
        if (req.getBranchId() != null) {
            java.util.List<OrderQuote.QuoteItem> deducted = new java.util.ArrayList<>();
            for (OrderQuote.QuoteItem qi : quote.getItems()) {
                int affected = inventoryRepo.deductStock(qi.getProductId(), req.getBranchId(), qi.getQuantity());
                if (affected == 0) {
                    // Không đủ hàng -> hoàn lại những món đã trừ trước đó rồi báo lỗi
                    for (OrderQuote.QuoteItem done : deducted) {
                        inventoryRepo.restoreStock(done.getProductId(), req.getBranchId(), done.getQuantity());
                    }
                    int available = inventoryRepo
                            .findByProduct_IdAndStoreBranch_Id(qi.getProductId(), req.getBranchId())
                            .map(Inventory::getQuantity).orElse(0);
                    throw new IllegalArgumentException(
                            "Sản phẩm '" + qi.getName() + "' không đủ tồn kho tại chi nhánh đã chọn (còn "
                                    + available + ")");
                }
                deducted.add(qi);
            }
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

        // 4. Chi nhánh nhận hàng — lưu lại để còn hoàn kho khi huỷ đơn
        StoreBranch branch = null;
        if (req.getBranchId() != null) {
            branch = branchRepo.findById(req.getBranchId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chi nhánh ID: " + req.getBranchId()));
        }

        // 5. Tạo đơn hàng với tổng tiền từ báo giá (nguồn sự thật duy nhất)
        CustomerOrder order = new CustomerOrder(
                req.getCustomerName(),
                req.getPhone(),
                req.getShippingAddress() != null ? req.getShippingAddress() : "",
                quote.getTotal(),
                customer,
                promotion
        );
        order.setStoreBranch(branch);
        order = orderRepo.save(order);

        // 6. Lưu từng OrderItem, dùng giá từ báo giá
        for (OrderQuote.QuoteItem qi : quote.getItems()) {
            Product product = productRepo.findById(qi.getProductId()).orElseThrow();
            OrderItem item = new OrderItem(order, product, qi.getQuantity(), qi.getUnitPrice());
            OrderItem saved = orderItemRepo.save(item);
            order.getOrderItems().add(saved);
        }

        return orderRepo.save(order);
    }

    /**
     * Cập nhật trạng thái đơn hàng theo đúng vòng đời nghiệp vụ.
     * - Chỉ chấp nhận 4 trạng thái PENDING / CONFIRMED / COMPLETED / CANCELLED.
     * - Chỉ cho phép chuyển trạng thái hợp lệ (không huỷ được đơn đã giao).
     * - Chuyển sang CANCELLED sẽ hoàn lại số lượng vào đúng chi nhánh đã đặt.
     */
    @Transactional
    public Optional<CustomerOrder> updateOrderStatus(Long orderId, String status) {
        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("Trạng thái đơn hàng không được để trống");
        }
        String target = status.trim().toUpperCase(java.util.Locale.ROOT);
        if (!VALID_STATUSES.contains(target)) {
            throw new IllegalArgumentException(
                    "Trạng thái không hợp lệ: '" + status + "'. Chỉ chấp nhận PENDING, CONFIRMED, COMPLETED, CANCELLED");
        }

        return orderRepo.findById(orderId).map(order -> {
            String current = order.getStatus() == null ? "PENDING" : order.getStatus().toUpperCase(java.util.Locale.ROOT);

            if (current.equals(target)) {
                return order; // không đổi gì, trả về nguyên trạng
            }

            Set<String> allowed = ALLOWED_TRANSITIONS.getOrDefault(current, Set.of());
            if (!allowed.contains(target)) {
                throw new IllegalArgumentException(
                        "Không thể chuyển đơn hàng từ " + current + " sang " + target);
            }

            // Huỷ đơn -> hoàn hàng về đúng chi nhánh đã đặt
            if ("CANCELLED".equals(target)) {
                restoreStock(order);
            }

            order.setStatus(target);
            return orderRepo.save(order);
        });
    }

    /**
     * Hoàn lại số lượng của từng món trong đơn vào tồn kho chi nhánh.
     * Dùng findForUpdate để khoá dòng tồn kho, tránh ghi đè khi có giao dịch khác cùng lúc.
     */
    private void restoreStock(CustomerOrder order) {
        if (order.getStoreBranch() == null) {
            // Đơn cũ (tạo trước khi lưu chi nhánh) không xác định được kho để hoàn.
            return;
        }
        Long branchId = order.getStoreBranch().getId();
        for (OrderItem item : order.getOrderItems()) {
            if (item.getProduct() == null) {
                continue;
            }
            inventoryRepo.restoreStock(item.getProduct().getId(), branchId, item.getQuantity());
        }
    }
}
