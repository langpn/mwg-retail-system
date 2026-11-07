package com.example.demojpa.controller;

import com.example.demojpa.entity.Customer;
import com.example.demojpa.service.CustomerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller: CustomerApiController
 * Cung cấp Web Service cho Phân hệ Khách hàng thành viên
 * Tuân thủ đầy đủ các phương thức HTTP: GET, POST, PUT, DELETE
 */
@RestController
@RequestMapping("/api/v1/customers")
@CrossOrigin(origins = "*")
public class CustomerApiController {

    private final CustomerService customerService;

    public CustomerApiController(CustomerService customerService) {
        this.customerService = customerService;
    }

    /**
     * GET /api/v1/customers
     * Lấy toàn bộ danh sách khách hàng thành viên (hoặc lọc theo số điện thoại)
     */
    @GetMapping
    public ResponseEntity<List<Customer>> getAllCustomers(@RequestParam(required = false) String phone) {
        if (phone != null && !phone.isBlank()) {
            return ResponseEntity.ok(
                    customerService.findByPhone(phone.trim())
                            .map(List::of)
                            .orElse(List.of()));
        }
        return ResponseEntity.ok(customerService.getAllCustomers());
    }

    /**
     * GET /api/v1/customers/lookup?identifier=...
     * Tra cứu khách hàng theo số điện thoại hoặc email (không phân biệt hoa/thường).
     * Trả về 404 nếu không tìm thấy, 400 nếu identifier trống.
     */
    @GetMapping("/lookup")
    public ResponseEntity<Customer> lookupCustomer(@RequestParam String identifier) {
        return customerService.lookup(identifier)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/v1/customers/phone/{phone}
     * Tìm khách hàng thành viên theo số điện thoại
     */
    @GetMapping("/phone/{phone}")
    public ResponseEntity<Customer> getCustomerByPhone(@PathVariable String phone) {
        return customerService.findByPhone(phone.trim())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/v1/customers/{id}
     * Lấy chi tiết 1 khách hàng theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable Long id) {
        return customerService.getCustomerById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/v1/customers
     * Thêm mới một khách hàng vào hệ thống
     */
    @PostMapping
    public ResponseEntity<?> createCustomer(@RequestBody Customer customer) {
        if (customer.getPhone() == null || customer.getPhone().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Số điện thoại không được để trống"));
        }
        Customer saved = customerService.createCustomer(customer);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * PUT /api/v1/customers/{id}
     * Cập nhật thông tin khách hàng theo ID
     */
    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(@PathVariable Long id, @RequestBody Customer customer) {
        return customerService.updateCustomer(id, customer)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * DELETE /api/v1/customers/{id}
     * Xóa một khách hàng khỏi hệ thống
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        boolean deleted = customerService.deleteCustomer(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
