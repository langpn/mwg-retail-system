# 02. Cẩm Nang Vấn Đáp Bảo Vệ Đồ Án (Oral Defense Playbook)

> **Chủ đề nguyên tử (Atomic Scope):** Bộ câu hỏi và đáp án chuẩn xác phục vụ buổi **chấm vấn đáp trực tiếp Bài tập lớn** tại Phòng Giáo viên, được trích xuất từ **chính các câu hỏi thầy đã gọi sinh viên trả lời trên lớp** (kèm mốc phút:giây) và ánh xạ trực tiếp vào mã nguồn `mwg-retail-system`.
>
> **Không chứa:** Đề cương ôn thi tự luận trên giấy cuối kỳ (xem [`03-final-exam-study-guide.md`](./03-final-exam-study-guide.md)).

---

## PHẦN A — CÁC CÂU THẦY ĐÃ GỌI HỎI ĐÍCH DANH THÀNH VIÊN NHÓM TRÊN LỚP (ƯU TIÊN SỐ 1!)

> **Cảnh báo đặc biệt từ băng ghi hình Buổi 11:** Trong buổi tổng ôn cuối cùng ([PL1-B11 `_0lFUb8cU4I`](https://www.youtube.com/watch?v=_0lFUb8cU4I)), thầy đã gọi đích danh **Phạm Ngọc Lang (`25765251`)** 2 lần và trước đó gọi **Bùi Dương Diễm** ở Buổi 1. Khi lên chấm đồ án trực tiếp, xác suất rất cao thầy sẽ hỏi lại đúng các khái niệm này để kiểm tra sự tiến bộ!

### Câu A1. *"Trong kiến trúc ứng dụng của mình, Service gọi Model hay Model gọi Service? Và `Repository` là cái gì — có phải kho GitHub không?"*
* **Mốc thầy hỏi trực tiếp MSSV `25765251`:** [PL1-B11 `20:33`–`23:20`](https://www.youtube.com/watch?v=_0lFUb8cU4I&t=20m33s) | [PL2-S10 `21:00`–`25:01`](https://www.youtube.com/watch?v=kuJZxQC4n_4&t=21m00s).
* **Cách trả lời ăn điểm tuyệt đối:**
  > *"Dạ thưa thầy, luồng gọi một chiều từ trên xuống là **`Controller` gọi `Service`, `Service` gọi `Repository`, và `Repository` thao tác với Database thông qua các class `Entity` (`Model`)**.
  > Trong Spring Boot, **`Repository` hoàn toàn không liên quan gì đến kho mã nguồn Git/GitHub**, mà nó là **tầng tàng thư / cái kho dữ liệu** sử dụng kỹ thuật **Spring Data JPA** (ví dụ `ProductRepository extends JpaRepository<Product, Long>`) để tự động sinh các câu truy vấn CRUD xuống MySQL ạ!"*

### Câu A2. *"Trong kiến trúc MVC của Spring Boot có dùng kỹ thuật `Injection` (Dependency Injection) không? Bản chất nó là gì và khai báo ngầm định bằng dấu gì?"*
* **Mốc thầy hỏi trực tiếp MSSV `25765251`:** [PL1-B11 `27:38`–`34:22`](https://www.youtube.com/watch?v=_0lFUb8cU4I&t=27m38s) | [PL2-S10 `29:55`–`36:03`](https://www.youtube.com/watch?v=kuJZxQC4n_4&t=29m55s).
* **Cách trả lời ăn điểm tuyệt đối (tránh nhầm sang ORM như lần trên lớp):**
  > *"Dạ có ạ, **Dependency Injection (Tiêm phụ thuộc)** là kỹ thuật cốt lõi bậc nhất của Spring Boot (tách biệt với JPA làm nhiệm vụ ánh xạ CSDL). Thay vì lập trình viên phải khởi tạo đối tượng tường minh (*explicit*) bằng từ khóa `new ProductCatalogService()`, ta dùng các **Annotation bắt đầu bằng dấu `@` (A còng)** như `@Service`, `@Repository`, `@RestController` để khai báo ngầm định (*implicit*). Khi cần dùng ở đâu, Spring IoC Container sẽ tự động 'phun/tiêm' đối tượng Bean đó vào qua Constructor của class đó ạ!"*

### Câu A3. *"Web Service nằm ở phía Frontend hay Backend? Nó trao đổi dữ liệu dạng gì và gồm những HTTP Verbs nào?"*
* **Mốc thầy hỏi & cảnh cáo học lại nếu trả lời sai:** [PL1-B11 `08:58`–`15:00`](https://www.youtube.com/watch?v=_0lFUb8cU4I&t=8m58s) | [PL2-S10 `10:57`–`17:17`](https://www.youtube.com/watch?v=kuJZxQC4n_4&t=10m57s).
* **Cách trả lời chuẩn:**
  > *"Dạ Web Service **bắt buộc thuộc phía Backend**, chịu trách nhiệm xử lý nghiệp vụ và dữ liệu bên trong. Trong môn học mình dùng chuẩn **RESTful API** trao đổi dữ liệu thô định dạng **JSON** (khác với SOAP dùng XML), tuân thủ 4 HTTP Verbs: **`GET`** (lấy dữ liệu), **`POST`** (đẩy mới lưu vào DB), **`PUT`** (cập nhật dữ liệu), và **`DELETE`** (xóa dữ liệu) ạ."*

---

## PHẦN B — CÁC CÂU HỎI XOÁY TRỰC TIẾP VÀO SOURCE CODE `mwg-retail-system`

### Câu B1. *"Em mở code phân biệt cho thầy `@Controller` và `@RestController` khác nhau chỗ nào?"*
* **Mốc thầy giảng:** [PL1-B01 `23:41`](https://www.youtube.com/watch?v=4W27ZZ8sKfc&t=23m41s), [PL1-B03 `01:03:39`](https://www.youtube.com/watch?v=bu4zCN4I1nA&t=1h03m39s), [PL2-B05 `36:55`–`40:00`](https://www.youtube.com/watch?v=acNPtD44jWU&t=36m55s).
* **Trả lời & Chỉ tay vào file:**
  * `@Controller` dùng cho mô hình MVC truyền thống: nạp dữ liệu vào `Model` và trả về tên file HTML trong `src/main/resources/templates/` để View Engine (`Thymeleaf`) render ra trang web hoàn chỉnh.
  * `@RestController` (như `ProductApiController.java`) không trả về View mà trả trực tiếp Java Object / `List<Product>`; Spring Boot dùng thư viện **Jackson** tự động chuyển đổi ngầm định đối tượng đó thành chuỗi **JSON** gửi về Client.

### Câu B2. *"Khi nào em dùng `@PathVariable`, khi nào dùng `@RequestParam`? Chỉ trong code của nhóm xem!"*
* **Mốc thầy giảng:** [PL2-B05 `42:51`–`44:34`](https://www.youtube.com/watch?v=acNPtD44jWU&t=42m51s) | [PL1-B06 `33:50`–`35:16`](https://www.youtube.com/watch?v=SMDSzotHLF0&t=33m50s).
* **Trả lời & Chỉ tay vào `ProductApiController.java`:**
  * Dùng **`@PathVariable`** khi tham số là mã định danh duy nhất của tài nguyên nằm ngay trên đường dẫn: `GET /api/v1/products/{id}` hay `PUT /api/v1/products/{id}`.
  * Dùng **`@RequestParam`** khi tham số là các bộ lọc tùy chọn nằm sau dấu `?`: `GET /api/v1/products?category=MAYGIAT&brand=Toshiba&maxPrice=8000000`.

### Câu B3. *"Quan hệ 1–Nhiều cấu hình thế nào? Làm sao nhóm tránh được lỗi vòng lặp vô tận (Circular Reference) khi trả JSON?"* *(Câu hỏi gắn liền giải thưởng +2 điểm của thầy!)*
* **Mốc thầy giảng:** [PL1-B10 `28:53`–`35:37`](https://www.youtube.com/watch?v=puX0LDumypE&t=28m53s) | [PL2-S09 `26:16`–`35:25`](https://www.youtube.com/watch?v=Ac686eKMcd4&t=26m16s).
* **Trả lời & Chỉ tay vào `Product.java` và `Category.java`:**
  * Ở bảng Nhiều (`Product.java` — bên giữ khóa ngoại): gắn `@ManyToOne` và `@JoinColumn(name = "category_id")`.
  * Ở bảng Một (`Category.java`): gắn `@OneToMany(mappedBy = "category")` để báo Hibernate khóa ngoại đã do biến `category` bên `Product` quản lý, không tạo bảng trung gian thừa.
  * Để chặn lỗi **Circular Reference** (`Category` gọi `List<Product>`, mỗi `Product` lại gọi `Category` lặp vô tận gây `StackOverflowError` khi Jackson xuất JSON), nhóm gắn **`@JsonIgnore`** ở chiều danh sách nghịch (`Category.products`) và dùng các lớp **DTO** (`CreateOrderRequest`, `StockUpdateRequest`) cho chiều nhận dữ liệu vào.

### Câu B4. *"Tại sao trong bảng `order_items` đã nối khóa ngoại sang `products` (có sẵn cột `price`) mà nhóm vẫn tạo thêm cột `unit_price`?"*
* **Trả lời:**
  > *"Dạ vì `products.price` là giá bán niêm yết hiện hành có thể tăng hoặc giảm theo từng đợt khuyến mãi. Còn `order_items.unit_price` lưu **đơn giá thực tế tại đúng thời điểm khách chốt đơn**. Nếu không tách riêng `unit_price`, sau này siêu thị đổi giá sản phẩm thì tổng tiền lịch sử của toàn bộ các đơn hàng cũ trong quá khứ sẽ bị nhảy sai hết ạ!"*

### Câu B5. *"Khi khách bấm Đặt hàng ở `/checkout`, làm sao hệ thống đảm bảo vừa tạo đơn vừa trừ đúng tồn kho mà không bị âm kho?"*
* **Trả lời & Chỉ tay vào `OrderService.java`:**
  * Hàm `createOrder()` được đánh dấu `@Transactional`.
  * Hệ thống kiểm tra bản ghi `Inventory` theo cặp `(product_id, branch_id)`. Nếu `inventory.getQuantity() < requestedQty` sẽ lập tức ném ngoại lệ báo hết hàng và rollback toàn bộ giao dịch; nếu đủ hàng mới trừ `inventory.setQuantity(...)`, áp dụng phần trăm giảm giá từ bảng `promotions` và lưu `CustomerOrder` + `OrderItem` xuống MySQL.

### Câu B6. *"Làm sao nhóm giải quyết bài toán không để trang web tải chậm quá 3 giây và không bị lỗi khi đổi cổng Server?"*
* **Mốc thầy giảng:** [PL1-B08 `08:05`](https://www.youtube.com/watch?v=YxOeRIoG_dI&t=8m05s) và [`01:41:00`](https://www.youtube.com/watch?v=YxOeRIoG_dI&t=1h41m00s).
* **Trả lời:**
  1. Toàn bộ khung trang và danh mục sản phẩm được biên dịch sẵn thành HTML tĩnh (Static Pre-rendering) đặt ngay trong `src/main/resources/static/` (cùng cơ chế nạp sẵn combobox ở trang MVC `Thymeleaf`), giúp trình duyệt hiển thị ngay lập tức dưới 200ms thay vì màn hình trắng chờ `window.onload`.
  2. Mọi lời gọi Fetch API sử dụng đường dẫn tương đối `/api/v1/...` trên cùng origin của Spring Boot nên hoàn toàn độc lập với cổng cấu hình và không phát sinh lỗi CORS.
