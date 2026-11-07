# ADR-0003 — Giữ mô hình Controller → Service → Repository

- **Trạng thái:** Đã chấp nhận
- **Bối cảnh:** Theo phép thử xoá module (deletion test), `PromotionService`, `ProductReviewService`, `CustomerService` gần như chỉ chuyển tiếp lệnh xuống repository. Xoá chúng không làm độ phức tạp xuất hiện lại ở nơi khác.
- **Quyết định:** Vẫn giữ ba tầng, vì đây là mô hình giảng viên dùng để chấm điểm và để đọc mã nguồn. Thay vì xoá, đưa quy tắc nghiệp vụ về đúng service: kiểm tra trùng số điện thoại nằm trong `CustomerService`, không nằm ở controller.
- **Hệ quả:** Không đề xuất xoá các service này trong các đợt rà soát kiến trúc sau, trừ khi mô hình chấm điểm thay đổi.
