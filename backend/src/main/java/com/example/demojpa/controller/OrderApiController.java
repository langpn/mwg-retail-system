package com.example.demojpa.controller;

import com.example.demojpa.dto.CreateOrderRequest;
import com.example.demojpa.entity.CustomerOrder;
import com.example.demojpa.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    public OrderApiController(OrderService orderService) {
        this.orderService = orderService;
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
     * POST /api/v1/orders
     * Tạo đơn đặt hàng mới và tự động trừ số lượng tồn kho (HTTP POST)
     */
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest req) {
        try {
            CustomerOrder order = orderService.createOrder(req);
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
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
