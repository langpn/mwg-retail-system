package com.example.demojpa.controller;

import com.example.demojpa.dto.CreateOrderRequest;
import com.example.demojpa.dto.OrderQuote;
import com.example.demojpa.entity.CustomerOrder;
import com.example.demojpa.service.OrderPricingService;
import com.example.demojpa.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller: OrderApiController
 * Cung cấp Web Service cho Phân hệ 3 (Đơn hàng & Khách hàng)
 * Tuân thủ phương thức: GET, POST, PUT
 */
@RestController
@RequestMapping("/api/v1/orders")
@CrossOrigin(origins = "*")
public class OrderApiController {

    private final OrderService orderService;
    private final OrderPricingService pricingService;

    public OrderApiController(OrderService orderService, OrderPricingService pricingService) {
        this.orderService = orderService;
        this.pricingService = pricingService;
    }

    /**
     * GET /api/v1/orders
     * Lấy toàn bộ danh sách đơn đặt hàng
     */
    @GetMapping
    public ResponseEntity<List<CustomerOrder>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    /**
     * GET /api/v1/orders/{id}
     * Lấy thông tin chi tiết của 1 đơn hàng theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<CustomerOrder> getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/v1/orders/quote
     * Tính toán báo giá đơn hàng (không ghi CSDL).
     * customerName/phone/address có thể để trống khi chỉ báo giá.
     */
    @PostMapping("/quote")
    public ResponseEntity<OrderQuote> quoteOrder(@RequestBody CreateOrderRequest req) {
        OrderQuote quote = pricingService.quote(req);
        return ResponseEntity.ok(quote);
    }

    /**
     * POST /api/v1/orders
     * Tạo đơn đặt hàng mới và tự động trừ số lượng tồn kho (HTTP POST)
     */
    @PostMapping
    public ResponseEntity<CustomerOrder> createOrder(@RequestBody CreateOrderRequest req) {
        CustomerOrder order = orderService.createOrder(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    /**
     * PUT /api/v1/orders/{id}/status?status=CONFIRMED
     * Cập nhật trạng thái đơn hàng (HTTP PUT)
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<CustomerOrder> updateStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        return orderService.updateOrderStatus(id, status)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
