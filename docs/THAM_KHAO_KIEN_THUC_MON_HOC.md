> **⚠️ GHI CHÚ CỦA NHÓM — ĐỌC TRƯỚC KHI DÙNG FILE NÀY**
>
> Đây là **bản ghi lại kiến thức và yêu cầu của giảng viên** (do nhóm tự tổng hợp), đưa vào repo
> chỉ để **tra cứu khi cần nhớ lại yêu cầu môn học**.
>
> - **KHÔNG** phải checklist bắt buộc, **KHÔNG** phải lúc nào cũng đúng với dự án hiện tại và
>   **KHÔNG** cần bám xác 100%. Mỗi khi cần thì mở ra đối chiếu, phần nào còn phù hợp thì áp dụng.
> - Nội dung bên dưới giữ **nguyên văn** tài liệu gốc, không sửa, để tránh hiểu sai ý giảng viên.
>   Ghi chú của nhóm chỉ nằm trong khối này.
> - Một số điểm đã khác so với dự án `mwg-retail-system` hiện tại (ví dụ: giao diện dùng Next.js
>   build tĩnh thay cho Thymeleaf + Bootstrap; REST API đã có đủ GET/POST/PUT/DELETE; CSDL 10 bảng).
>   Khi đọc thấy khác thì **ưu tiên thực tế của dự án**, không sửa theo file này.
> - Nếu giảng viên đổi yêu cầu trong buổi học, cập nhật lại file này — đừng coi đây là nguồn chân lý cuối cùng.
>
> *Nguồn: `tong-hop-kien-thuc-do-an-web.md` — thêm vào repo ngày 07/11/2026.*

---

# TỔNG HỢP KIẾN THỨC VÀ CHỈ DẪN BÀI TẬP LỚN
## Môn học: Công cụ Web và Website hướng dữ liệu

---

## PHẦN 1: TỔNG HỢP KIẾN THỨC CHUYÊN MÔN CỐT LÕI

### 1. Kiến trúc Web, RESTful API & Nền tảng Frontend (Buổi 1, Buổi 5)
* **Mô hình Client - Server & HTTP Verbs**:
  * Luồng trao đổi dữ liệu qua **Request - Response**.
  * 4 phương thức HTTP Verbs cốt lõi: **GET** (lấy dữ liệu), **POST** (thêm mới dữ liệu xuống DB), **PUT** (cập nhật), **DELETE** (xóa dữ liệu).
* **Đặc tả dữ liệu JSON & DOM Scripting**:
  * Chuỗi **JSON** thay thế XML để giảm tải băng thông mạng. Thao tác chuyển đổi bằng `JSON.parse()` (chuyển chuỗi JSON thành đối tượng JavaScript) và `JSON.stringify()` (chuyển đối tượng thành chuỗi JSON).
  * Lập trình **DOM (Document Object Model)** dùng JavaScript/jQuery để tìm kiếm phần tử theo ID (`document.getElementById`) và gán dữ liệu vào thẻ HTML (`innerHTML`).
  * Lưu ý bản chất của JavaScript là **chạy bất đồng bộ (asynchronous)**, cần kiểm tra trạng thái document đã load xong trước khi thực thi script để tránh lỗi.

### 2. Lập trình Hướng đối tượng (OOP) trong Java (Buổi 2)
* **Các nguyên lý cốt lõi**:
  * **Encapsulation**: Khai báo thuộc tính `private` và truy cập qua các phương thức `getter/setter`.
  * **Inheritance & Polymorphism**: Kế thừa lớp qua từ khóa `extends`, ghi đè phương thức với `@Override`.
* **Abstract Class & Interface**:
  * **Abstract Class**: Lớp trừu tượng chứa phương thức ảo (không có thân hàm `{}`), không thể khởi tạo trực tiếp bằng `new`, bắt buộc lớp con thừa kế phải override định nghĩa body.
  * **Interface**: Định nghĩa chữ ký phương thức (signature), đóng vai trò quy ước khung chức năng thống nhất cho toàn bộ hệ thống.
* **Demo bài giảng**: Xây dựng `abstract class Person`, các lớp con `Student` và `Teacher` kế thừa `Person`, cùng `interface` quy định các hàm thao tác lưu trữ dữ liệu.

### 3. Khởi tạo Web Server với Spring Boot & Maven (Buổi 3)
* **Quy trình dựng Server**:
  * Sử dụng **Spring Initializr** (`start.spring.io`) khởi tạo dự án Java Maven. Cấu hình thư viện trong file `pom.xml`.
  * Nhập dự án vào Eclipse, chạy ứng dụng chứa hàm `main` để kích hoạt container **Tomcat nhúng** ở cổng `8080`.
* **Demo bài giảng**: Tạo `@Controller` xử lý đường dẫn `@GetMapping("/welcome")`, trả về trang View `hello.html` lưu trong thư mục `src/main/resources/templates/`.

### 4. Tạo Trang Web Động với Thymeleaf Engine (Buổi 4)
* **Mô hình đun dữ liệu vào View**:
  * Thymeleaf đóng vai trò View Engine trong MVC để gắn dữ liệu động vào trang HTML.
  * Controller đẩy dữ liệu qua đối tượng **`Model`** bằng hàm `model.addAttribute("key", value)`.
* **Cú pháp Thymeleaf chính**:
  * `th:each`: Duyệt danh sách đối tượng (Collection/List).
  * `th:text`: Đổ thuộc tính của đối tượng vào thẻ HTML.
  * Xử lý hiển thị quan hệ phụ thuộc 2 danh sách (Khoa - Sinh viên, Nhóm hàng - Sản phẩm).

### 5. Xây dựng REST Service & Cấu trúc Phân tầng (Buổi 5, Buổi 7)
* **REST Controller**:
  * Đánh dấu lớp bằng `@RestController`.
  * Spring Boot tự động chuyển đổi ngầm định Java Object thành JSON gửi về Client.
  * Bắt tham số từ URL bằng `@PathVariable` (VD: `/api/faculty/{id}/student`).
* **Cấu trúc Layered Architecture**:
  * Phân chia package chuẩn: `model` (hoặc `entity`), `controller`, `service`, `repository`.
  * Sử dụng tính năng Refactor -> Rename trong Eclipse để đổi tên class/field đồng bộ.

### 6. Kiến trúc Ứng dụng Trang đơn (SPA - Single Page Application) (Buổi 6)
* **Quy trình 3 bước thực hiện**:
  1. *Bước 1*: Dùng MVC Controller tải trang SPA ban đầu chứa danh sách lựa chọn trong Combobox (`<select>`).
  2. *Bước 2*: Lắng nghe sự kiện chọn trên Combobox -> Gọi REST API -> Bắt dữ liệu JSON -> Dùng lập trình DOM bóc tách và render vào thẻ bảng (`<table>`).
  3. *Bước 3*: Thêm các nút chức năng CRUD (Thêm, Xóa, Sửa, Tìm kiếm) tương tác với REST Service.

### 7. Lập trình Cơ sở dữ liệu với Spring Data JPA & MySQL (Buổi 8, Buổi 9, Buổi 10)
* **Cơ chế ORM & Code First**:
  * **Object-Relational Mapping (ORM)** ánh xạ các lớp Java thành bảng CSDL MySQL. Tự động sinh bảng khi khởi chạy ứng dụng.
* **Các Annotation JPA quan trọng**:
  * `@Entity`: Khai báo Java class là một Entity/bảng CSDL.
  * `@Table(name = "...")`: Đặt tên bảng CSDL.
  * `@Id` & `@GeneratedValue`: Khai báo khóa chính và cơ chế sinh giá trị tự động.
  * `@Column(length = 100, nullable = false, unique = true)`: Đặt ràng buộc cho cột.
* **Repository Interface**:
  * Tạo interface mở rộng `JpaRepository<Entity, ID>` (VD: `StudentRepository extends JpaRepository<Student, Long>`) cung cấp sẵn các phương thức CRUD.
* **Thiết lập Quan hệ Entity (JPA Relationships)**:
  * Quan hệ 1 - Nhiều: `@OneToMany(mappedBy = "...")` trên Entity một và `@ManyToOne`, `@JoinColumn(name = "faculty_id")` trên Entity nhiều.
  * Cơ chế Cascade: Cấu hình `cascade = CascadeType.ALL` để tự động cập nhật/xóa dữ liệu liên quan, tránh lỗi dữ liệu mồ côi.

---

## PHẦN 2: CHỈ DẪN VỀ BÀI TẬP LỚN & ĐỒ ÁN CUỐI KỲ

### 1. Quy định đề tài & Yêu cầu chức năng
* **Phạm vi đề tài**: Đề tài mang tính mô phỏng ứng dụng thực tế vừa sức môn học (VD: Ứng dụng web quản lý bán vé, đăng ký du lịch, quảng cáo bất động sản, quản lý nhóm trẻ mầm non, quản lý trường học...).
* **Quy mô CSDL**: CSDL bài tập lớn bắt buộc phải đạt quy mô từ **6 đến 10 bảng**.
* **Yêu cầu chức năng bắt buộc**:
  * Áp dụng kiến trúc MVC và Spring Data JPA kết nối CSDL MySQL.
  * Thiết kế giao diện web động (Thymeleaf / Bootstrap / Dashboard template).
  * Cung cấp và tích hợp REST API thực hiện đầy đủ các chức năng CRUD (Thêm, Xóa, Sửa, Tìm kiếm).
  * Dùng JavaScript/jQuery lập trình DOM tương tác dữ liệu giữa Combobox và Table theo mô hình SPA.

### 2. Công nghệ & Tech Stack
* **Backend**: Java, Spring Boot (Spring Web, Spring Data JPA).
* **View / Template**: Thymeleaf Engine.
* **Database & ORM**: MySQL Server, MySQL Workbench, Spring Data JPA / Hibernate (ORM, Code First tự tạo bảng).
* **Frontend**: HTML5, CSS3, JavaScript (DOM, Fetch API / AJAX / jQuery), Bootstrap / Dashboard Template.
* **Công cụ & Thư viện**:
  * **IDE**: Eclipse Enterprise Edition (bản Java EE) hoặc VS Code.
  * **Build Tool**: Maven (`pom.xml`).
  * **Kiểm thử API**: Postman.
  * **Quản lý mã nguồn & Khởi tạo**: Git / GitHub, Spring Initializr (`start.spring.io`).

### 3. Hình thức làm việc & Nhóm
* **Số lượng thành viên**: Quy định **3 sinh viên / 1 nhóm** (khuyến khích cùng ca thực hành).
* **Ngoại lệ nhóm >3 người**: Nhóm 4 người phải gặp trực tiếp giảng viên trình bày lý do đặc biệt (đề tài phạm vi rộng, khối lượng lớn) để được phê duyệt.
* **Phân chia công việc**: **TUYỆT ĐỐI KHÔNG phân hoạch ngang** (ví dụ: 1 người chỉ viết báo cáo, 1 người chỉ code là không được phép). Bắt buộc phải **phân hoạch dọc**: tất cả thành viên đều phải tham gia viết code, làm báo cáo và phải hiểu toàn bộ hệ thống. Giảng viên sẽ gọi hỏi code bất kỳ thành viên nào.

### 4. Yêu cầu báo cáo & Sản phẩm bàn giao
* **Cấu trúc & Quy mô Báo cáo**: File báo cáo dạng Word/PDF có độ dài **tối đa 17 trang**. Cấu trúc bao gồm: Bối cảnh & Lý do chọn đề tài, Mục tiêu, Kịch bản sử dụng, Biểu đồ Use Case, Kiến trúc hệ thống, Sơ đồ ERD và Lược đồ CSDL vật lý.
* **Sản phẩm bàn giao**:
  * Source code ứng dụng Spring Boot hoàn chỉnh.
  * File báo cáo Word/PDF (dưới 17 trang).
  * Script CSDL MySQL (`.sql`) hoặc Entity Java tự sinh bảng.
  * *Lưu ý về Video demo*: **Không có thông tin trong các buổi học** về yêu cầu nộp video demo (sinh viên báo cáo và demo sản phẩm trực tiếp với giảng viên tại phòng giáo viên).

### 5. Tiêu chí đánh giá & Điểm cộng/trừ
* **Thang điểm đánh giá**:
  * *5.5 - 6.0 điểm*: Chương trình chạy được, đáp ứng chức năng cơ bản, hiểu kiến trúc nền tảng.
  * *7.5 điểm*: Giải thích rõ ràng code, hiểu sâu các khái niệm và cơ chế hoạt động khi giảng viên hỏi.
  * *8.5 - 9.0 điểm*: Có tính năng sáng tạo, điểm mới khác biệt đáp ứng đúng nhu cầu thị trường.
  * *9.5 điểm*: Sản phẩm xuất sắc, có thể báo cáo hội đồng khoa học, tham gia cuộc thi hoặc đăng bài.
* **Lỗi cần tránh & Điểm trừ**:
  * Không hiểu dòng code do thành viên khác làm hoặc do AI viết sẽ bị đánh giá rớt/điểm thấp.
  * **Lưu ý bắt buộc**: Bắt buộc phải có điểm Bài tập lớn mới đủ điều kiện có tên trong danh sách dự thi lý thuyết cuối kỳ.

### 6. Mốc thời gian (Deadline)
* **Hạn nộp danh sách nhóm & đề tài**: Gửi email cho giảng viên gồm danh sách thành viên, tên đề tài, phạm vi chức năng (nếu chưa chốt đề tài thì ghi rõ xin gia hạn 1 tuần để giảng viên tư vấn).
* **Hạn nộp Báo cáo & Lịch Thuyết trình**: Báo cáo trực tiếp tại phòng giáo viên (cạnh Khoa CNTT) **trước kỳ thi lý thuyết 1 tuần** (Giảng viên dành riêng 1 ngày từ 9:00 đến 17:30, VD: Ngày 01/11, để các nhóm lên báo cáo trực tiếp).
