# ADR-0001 — Backend là nguồn sự thật duy nhất cho tiền tệ

- **Trạng thái:** Đã chấp nhận (07/11/2026)
- **Bối cảnh:** Trước đây giá được tính ở năm nơi: `PROMO_CODES` trong `frontend/lib/dmx-data.ts`, trang giỏ hàng, trang thanh toán, `placeOrder`, `placeCartOrder`, và `OrderService`. Frontend chặn mã `TET2027` ở mức 1.500.000 ₫ còn backend giảm đủ 10%, nên số tiền hiện trên màn hình khác số tiền lưu trong CSDL.
- **Quyết định:** Mọi quy tắc tiền tệ nằm trong `OrderPricingService` ở backend, truy cập qua một interface duy nhất là `quote()`. Màn hình gọi `POST /api/v1/orders/quote`; `createOrder` dùng lại chính kết quả đó để ghi đơn. Frontend chỉ còn một bản sao công thức trong `lib/catalog.ts`, dùng riêng cho chế độ offline khi mất kết nối backend.
- **Hệ quả:**
  - Báo giá và đơn đã lưu không thể lệch nhau.
  - Thêm quy tắc giá mới (ví dụ giảm theo hạng thành viên) chỉ sửa một chỗ.
  - Cần một vòng gọi mạng khi hiển thị giỏ hàng; đã giảm nhẹ bằng debounce 300 ms và huỷ request cũ.
  - Không được thêm logic tính tiền vào component hay vào lớp controller.
