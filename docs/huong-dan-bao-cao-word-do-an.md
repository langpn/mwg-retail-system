# HƯỚNG DẪN VÀ YÊU CẦU CHI TIẾT VỀ FILE BÁO CÁO WORD BÀI TẬP LỚN / ĐỒ ÁN
**Môn học:** Công cụ Web và Website hướng dữ liệu  
**Giảng viên dặn dò:** Trích xuất toàn bộ từ chuỗi bài giảng Buổi 1 đến Buổi 10  

---

## I. QUY ĐỊNH CHUNG VỀ FILE BÁO CÁO WORD

1. **Định dạng file:** 
   * Trình bày dưới dạng file **Microsoft Word (.docx)** hoặc xuất file **PDF** từ Word [129].
2. **Giới hạn số trang (Rất quan trọng):** 
   * Độ dài báo cáo **TỐI ĐA 17 TRANG** [129].
   * *Lưu ý của giảng viên:* Bài tập lớn môn học có quy mô vừa phải, trình bày súc tích, ngắn gọn, tập trung vào trọng tâm kiến trúc và phân tích thiết kế [129]. Tuyệt đối không viết dài dòng như Khóa luận tốt nghiệp (60–70 trang) [129].
3. **Quy tắc phân công công việc (Nguyên tắc phân hoạch dọc):**
   * **KHÔNG phân hoạch ngang:** Tuyệt đối cấm việc phân chia 1 người chỉ chuyên viết báo cáo Word, 1 người chỉ chuyên viết code [136].
   * **BẮT BUỘC phân hoạch dọc:** Tất cả các thành viên trong nhóm (3 người/nhóm) đều phải trực tiếp tham gia lập trình và tham gia viết báo cáo [136, 138]. Mỗi thành viên đều phải nắm vững toàn bộ nội dung file báo cáo cũng như toàn bộ các đoạn code trong dự án [130, 138].

---

## II. CẤU TRÚC VÀ DÀN Ý CHUẨN CỦA FILE BÁO CÁO (DƯỚI 17 TRANG)

Giảng viên yêu cầu file báo cáo phải thể hiện đầy đủ các phần phân tích hệ thống, kiến trúc và minh họa chức năng theo dàn ý sau [129, 130]:

### **Trang bìa & Thông tin thủ tục**
* Tên trường, Khoa Công nghệ thông tin.
* Tên môn học: *Công cụ Web và Website hướng dữ liệu*.
* Tên đề tài bài tập lớn (mô phỏng ứng dụng thực tế vừa sức).
* Danh sách thành viên nhóm (Họ tên, Mã sinh viên, Ca thực hành).
* Tên giảng viên hướng dẫn.

---

### **Phần 1: Bối cảnh, Lý do chọn đề tài & Mục tiêu (Khoảng 1 – 2 trang)**
* **Bối cảnh & Lý do chọn đề tài:** Mô tả bài toán thực tế mà ứng dụng hướng tới (Ví dụ: Ứng dụng quản lý bán vé, đăng ký du lịch, quảng cáo bất động sản, quản lý nhóm trẻ mầm non, quản lý trường học, v.v.) [59, 125, 129].
* **Mục tiêu đề tài:** Nêu rõ các mục tiêu ứng dụng web cần đạt được, giải quyết nhu cầu gì cho người dùng [129].
* **Phạm vi & Điểm mới của đề tài:** Nêu rõ phạm vi triển khai của bài tập lớn, chỉ ra những chức năng sáng tạo/điểm mới so với các bài tập thực hành cơ bản trên lớp [129, 131].

---

### **Phần 2: Kịch bản sử dụng & Biểu đồ Use Case (Khoảng 2 – 3 trang)**
* **Kịch bản sử dụng (User Scenarios):** Mô tả chi tiết kịch bản các luồng người dùng tương tác với hệ thống [129, 130].
* **Biểu đồ Use Case (Use Case Diagram):** 
  * Vẽ sơ đồ tổng quan các Actor (Admin, Người dùng/Khách hàng, Giáo viên/Quản lý...) và các Use Case chức năng.
  * Liệt kê mô tả tóm tắt các Use Case chức năng chính trong ứng dụng [129, 130].

---

### **Phần 3: Kiến trúc Hệ thống & Tech Stack (Khoảng 2 – 3 trang)**
* **Sơ đồ Kiến trúc hệ thống (System Architecture):**
  * Mô tả mô hình tổ chức phân tầng: **Model - View - Controller (MVC)** [99, 101, 149].
  * Tích hợp **RESTful API Services** (HTTP Verbs: GET, POST, PUT, DELETE) tương tác giữa Server và Client qua định dạng dữ liệu JSON [6, 102, 148].
  * Kiến trúc **Single Page Application (SPA)**: Kết hợp Controller trả View ban đầu và REST API kết hợp DOM Scripting/JavaScript để render bảng dữ liệu không reload trang [6, 88].
* **Danh sách Công nghệ & Công cụ (Tech Stack):**
  * *Backend:* Java, Spring Boot (Spring Web, Spring Data JPA) [47, 86, 101].
  * *Database & ORM:* MySQL Server, MySQL Workbench, Hibernate/JPA [76, 82, 101].
  * *Frontend:* HTML5, CSS3, JavaScript (DOM, AJAX/Fetch/jQuery), Thymeleaf Engine, Bootstrap / Dashboard Template [4, 104, 105, 144, 145].
  * *Công cụ:* Eclipse Enterprise Edition (Java EE), Maven, Postman, Git/GitHub [46, 87, 102, 103].

---

### **Phần 4: Phân tích & Thiết kế Cơ sở Dữ liệu (Khoảng 4 – 5 trang) (RẤT QUAN TRỌNG)**
* **Sơ đồ Thực thể - Mối quan hệ (ERD - Entity Relationship Diagram):**
  * Bản vẽ thiết kế các Entity và mối quan hệ giữa chúng (One-to-One, One-to-Many, Many-to-Many) [183, 186, 188].
* **Lược đồ CSDL Vật lý (Physical Database Schema / Tables):**
  * Trình bày danh sách các bảng CSDL.
  * **Yêu cầu quy mô:** CSDL bắt buộc phải đạt quy mô từ **6 đến 10 bảng** [163].
  * Mô tả chi tiết cấu trúc từng bảng (Tên cột, Kiểu dữ liệu, Khóa chính Primary Key, Khóa ngoại Foreign Key, Ràng buộc Null/Unique/Length) [83, 191].
* **Thiết lập Ánh xạ ORM & JPA Relationship trong Code Java:**
  * Minh họa các Annotation JPA cốt lõi trong Entity: `@Entity`, `@Table`, `@Id`, `@GeneratedValue`, `@Column` [82, 83, 191].
  * Khai báo mối quan hệ Entity: `@ManyToOne`, `@OneToMany(mappedBy = "...")`, `@JoinColumn(name = "...")` [190, 191, 193].
  * Giải thích cấu hình `cascade = CascadeType.ALL` (hoặc Cascade Delete) để quản lý dữ liệu liên quan và tránh hiện tượng dữ liệu mồ côi (orphan data) [193].

---

### **Phần 5: Mô tả Chức năng & Giao diện Minh họa (Khoảng 3 – 4 trang)**
* **Các Chức năng Bắt buộc (CRUD Operations):**
  * Chức năng hiển thị danh sách & Lọc dữ liệu theo Combobox (VD: Chọn Khoa/Nhóm -> Render danh sách Sinh viên/Sản phẩm tương ứng) [6, 60, 88].
  * Chức năng Thêm mới (POST), Cập nhật/Sửa (PUT/POST), Xóa (DELETE) và Tìm kiếm (Search) [6, 12, 88].
* **Giao diện Minh họa (Screenshots):**
  * Chụp ảnh màn hình các trang giao diện Web động (Dashboard, Danh sách, Form nhập liệu).
  * Chụp ảnh màn hình kiểm thử kết quả REST API trên **Postman** (trả về kết quả JSON) [8, 87].

---

### **Phần 6: Phân công Công việc & Kết luận (Khoảng 1 trang)**
* **Bảng Phân công Công việc Chi tiết:**
  * Liệt kê cụ thể từng thành viên phụ trách phần việc gì (mỗi thành viên phải làm cả phần backend/frontend/code chức năng + phần viết báo cáo liên quan) [136, 138].
* **Kết luận & Hướng phát triển:** Tóm tắt kết quả đạt được và những điểm có thể mở rộng nâng cấp trong tương lai [129, 130].

---

## III. NGUYÊN TẮC VÀ LƯU Ý KHI THUYẾT TRÌNH BẢO VỆ BÁO CÁO

1. **Hình thức Thuyết trình & Đánh giá:**
   * Các nhóm mang file **Báo cáo Word**, **Slide**, **Source Code** và **CSDL MySQL** đến trực tiếp phòng giáo viên (cạnh Khoa CNTT) để báo cáo trước giảng viên [143, 161].
   * Thời gian báo cáo diễn ra trước kỳ thi lý thuyết 1 tuần (hoặc vào ngày giảng viên ấn định cả ngày từ 9:00 - 17:30, ví dụ ngày 01/11) [143, 161].
2. **Cách thức Giảng viên Kiểm tra & Hỏi bài:**
   * Giảng viên sẽ mở ngẫu nhiên file Báo cáo Word và Source code của nhóm [138, 160].
   * Giảng viên gọi **bất kỳ thành viên nào** trong nhóm lên giải thích một đoạn code hoặc một sơ đồ trong báo cáo [138, 160].
   * Nếu thành viên trả lời *"Phần này do bạn khác trong nhóm làm/code"* -> Giảng viên sẽ **ĐÁNH GIÁ RỚT** hoặc cho điểm rất thấp [138].
3. **Thang điểm & Điểm thưởng/trừ:**
   * **Điểm 5.5 - 6.0:** Chương trình chạy được, đáp ứng chức năng cơ bản, hiểu kiến trúc cơ bản [131].
   * **Điểm 7.5:** Giải thích rõ ràng code, hiểu sâu các khái niệm MVC, JPA, REST API, SPA [131].
   * **Điểm 8.5 - 9.0:** Có tính năng sáng tạo, điểm mới thực tế khác biệt [131].
   * **Điểm 9.5:** Sản phẩm xuất sắc, đạt chuẩn gửi báo cáo khoa học hoặc dự thi [131].
   * **Điều kiện bắt buộc:** Phải nộp báo cáo và đạt điểm Bài tập lớn mới có tên trong danh sách đủ điều kiện thi lý thuyết cuối kỳ [185].
