package com.example.demojpa.service;

import com.example.demojpa.entity.Customer;
import com.example.demojpa.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service: CustomerService (Quản lý nghiệp vụ Khách hàng thành viên)
 */
@Service
public class CustomerService {

    private final CustomerRepository customerRepo;

    public CustomerService(CustomerRepository customerRepo) {
        this.customerRepo = customerRepo;
    }

    public List<Customer> getAllCustomers() {
        return customerRepo.findAll();
    }

    public Optional<Customer> getCustomerById(Long id) {
        return customerRepo.findById(id);
    }

    public Optional<Customer> findByPhone(String phone) {
        return customerRepo.findByPhone(phone);
    }

    public Optional<Customer> findByEmail(String email) {
        return customerRepo.findByEmail(email);
    }

    /**
     * Tra cứu khách hàng theo số điện thoại hoặc email (không phân biệt hoa/thường).
     *
     * @param identifier số điện thoại hoặc email
     * @return Optional chứa khách hàng nếu tìm thấy
     */
    public Optional<Customer> lookup(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            throw new IllegalArgumentException("Thông tin tra cứu không được để trống");
        }
        String trimmed = identifier.trim();
        // Thử tìm theo số điện thoại trước
        Optional<Customer> byPhone = customerRepo.findByPhone(trimmed);
        if (byPhone.isPresent()) {
            return byPhone;
        }
        // Nếu không có thì tìm theo email (không phân biệt hoa/thường)
        return customerRepo.findByEmailIgnoreCase(trimmed);
    }

    public Customer createCustomer(Customer customer) {
        if (customer.getPhone() == null || customer.getPhone().isBlank()) {
            throw new IllegalArgumentException("Số điện thoại không được để trống");
        }
        String phone = customer.getPhone().trim();
        if (customerRepo.findByPhone(phone).isPresent()) {
            throw new DuplicatePhoneException();
        }
        customer.setPhone(phone);
        return customerRepo.save(customer);
    }

    public static class DuplicatePhoneException extends IllegalArgumentException {
        public DuplicatePhoneException() {
            super("Số điện thoại này đã được đăng ký thành viên");
        }
    }

    public Optional<Customer> updateCustomer(Long id, Customer updated) {
        return customerRepo.findById(id).map(existing -> {
            existing.setFullName(updated.getFullName());
            existing.setPhone(updated.getPhone());
            existing.setEmail(updated.getEmail());
            existing.setAddress(updated.getAddress());
            return customerRepo.save(existing);
        });
    }

    public boolean deleteCustomer(Long id) {
        if (customerRepo.existsById(id)) {
            customerRepo.deleteById(id);
            return true;
        }
        return false;
    }
}
