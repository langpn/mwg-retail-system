# ADR-0002 — Bundle Next.js được commit vào `backend/src/main/resources/static/`

- **Trạng thái:** Đã chấp nhận
- **Bối cảnh:** Đồ án phải chạy được trên máy chấm chỉ với JDK và MySQL, không cài Node.js. Mặt khác, commit thư mục build đi ngược nguyên tắc chung là không đưa artifact sinh tự động lên Git, và làm diff của mỗi lần build rất nhiễu.
- **Quyết định:** Chấp nhận commit bundle tĩnh, vì lợi ích "một lệnh là chạy" quan trọng hơn với bối cảnh vấn đáp. Bù lại:
  - `.gitattributes` đánh dấu cả thư mục là `linguist-generated` và `-diff`, để review chỉ đọc diff của source thật.
  - Mỗi lần build lại phải nằm trong một commit riêng (`chore: rebuild frontend static bundle`), không trộn với commit tính năng.
- **Hệ quả:** Repo nặng thêm khoảng 11 MB và lịch sử có các commit chỉ chứa file sinh tự động. Nếu sau này chuyển sang CI, có thể thay bằng `frontend-maven-plugin` để `mvnw package` tự build.
