package com.example.demojpa.config;

import com.example.demojpa.service.CustomerService.DuplicatePhoneException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

/**
 * Xử lý ngoại lệ tập trung cho toàn bộ @RestController.
 * Ánh xạ IllegalArgumentException → 400 {"error": "..."}.
 * Chỉ áp dụng cho @RestController, không ảnh hưởng tới Spring MVC / Thymeleaf.
 */
@RestControllerAdvice(annotations = RestController.class)
public class ApiExceptionHandler {

    @ExceptionHandler(DuplicatePhoneException.class)
    public ResponseEntity<Map<String, String>> handleDuplicatePhone(DuplicatePhoneException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", ex.getMessage()));
    }

    /**
     * Xử lý lỗi nghiệp vụ: dữ liệu đầu vào không hợp lệ.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    /**
     * Xử lý lỗi JSON không thể đọc được (body thiếu, sai cú pháp...).
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleNotReadable(HttpMessageNotReadableException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Dữ liệu gửi lên không hợp lệ"));
    }
}
