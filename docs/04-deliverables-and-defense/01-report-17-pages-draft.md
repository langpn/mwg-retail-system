# 01. Bản Thảo Cuốn Báo Cáo Môn Học (Chuẩn Quy Định ≤ 17 Trang)

> **Chủ đề nguyên tử (Atomic Scope):** Bản thảo chuẩn hóa của **Cuốn Báo Cáo Bài Tập Lớn** (khống chế đúng chuẩn **17 trang trở lại** theo quy định tại [PL1-B01 `01:25:06`](https://www.youtube.com/watch?v=4W27ZZ8sKfc&t=1h25m06s) | [PL2-B01 `01:30:33`](https://www.youtube.com/watch?v=1edL45bgl2g&t=1h30m33s)), trình bày đúng quy chuẩn biểu mẫu IUH (Logo IUH, font `Times New Roman 13pt`, Header/Footer kẻ đôi + thanh xám đánh số trang, trang `Nhận xét của Giảng viên`).
>
> **File Word in ấn đã xuất sẵn:** [`./BAO_CAO_DO_AN_MWG_RETAIL_SYSTEM.docx`](./BAO_CAO_DO_AN_MWG_RETAIL_SYSTEM.docx) *(mở bằng Microsoft Word / WPS Office, dán 4 ảnh chụp màn hình vào khung chỉ dẫn là mang đi in đóng quyển ngay).*

---

## [TRANG 1] TRANG BÌA CHÍNH THỨC (THEO FORM CHUẨN `baocao_mau.docx` IUH)

```text
   [Logo ngang IUH góc trái trên]
                       BỘ CÔNG THƯƠNG
       TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TP. HỒ CHÍ MINH
                       ----------------------
                    Khoa: Công Nghệ Thông Tin
                   [Logo tròn IUH chính giữa]

                    BÁO CÁO BÀI TẬP LỚN
        HỌC PHẦN: CÔNG CỤ WEB VÀ WEBSITE HƯỚNG DỮ LIỆU

                         ĐỀ TÀI:
   HỆ THỐNG QUẢN LÝ DỮ LIỆU & BÁN LẺ ĐA CHI NHÁNH ĐIỆN MÁY XANH
                    (MWG RETAIL SYSTEM)

   Giảng viên hướng dẫn:      Trương Bá Phúc
   Lớp học phần (Class Code): DHCNTT21BVL
   Khoa quản lý (Faculty):    Công Nghệ Thông Tin (IUH)
   Nhóm sinh viên thực hiện:
     1. Bùi Dương Diễm        — MSSV: 25765281 (Nhóm trưởng)
     2. Phạm Ngọc Lang        — MSSV: 25765251 (Thành viên)
     3. Nguyễn Thanh Toàn     — MSSV: 25765051 (Thành viên)
   Kho mã nguồn GitHub:       https://github.com/langpn/mwg-retail-system
   Thời gian hoàn thành:      11/2026
```

---

## [TRANG 2] NHẬN XÉT CỦA GIẢNG VIÊN HƯỚNG DẪN (THEO FORM IUH)

| Tiêu chí đánh giá vấn đáp & cuốn báo cáo | Nhận xét của Giảng viên |
| :--- | :--- |
| **1. Kiến trúc hệ thống (MVC, RESTful API, SPA, JPA/Hibernate) & CSDL 10 bảng** | *(Để trống 3 dòng khi in)* |
| **2. Mức độ hoàn thiện chức năng CRUD, lọc đa chiều & kiểm thử Postman** | *(Để trống 3 dòng khi in)* |
| **3. Đánh giá cá nhân Nhóm trưởng — Bùi Dương Diễm (`25765281`)** | *(Để trống 2 dòng khi in)* |
| **4. Đánh giá cá nhân Thành viên — Phạm Ngọc Lang (`25765251`)** | *(Để trống 2 dòng khi in)* |
| **5. Đánh giá cá nhân Thành viên — Nguyễn Thanh Toàn (`25765051`)** | *(Để trống 2 dòng khi in)* |

* **Điểm Bài tập lớn (Bằng số / Bằng chữ):** `..............................................................`

---

## [TRANG 3] BẢNG PHÂN CÔNG PHÂN HOẠCH DỌC & TỔNG QUAN ĐỀ TÀI

### 1. Lời Mở Đầu
Đề tài **"Hệ Thống Dữ Liệu & Bán Lẻ Đa Chi Nhánh Điện Máy Xanh (`mwg-retail-system`)"** giải quyết bài toán đồng bộ danh mục hàng hóa, tra cứu tồn kho theo từng siêu thị quận/huyện và tự động khấu trừ tồn kho khi phát sinh đơn đặt hàng. Hệ thống vận dụng trọn vẹn kiến trúc phân tầng **Spring Boot 3**, **Spring Data JPA / Hibernate (Code-First)** trên **MySQL 8 (10 bảng quan hệ)**, **29 RESTful API Endpoints** chuẩn JSON và giao diện thương mại điện tử **Next.js 16 Static SPA** tích hợp chung một cổng `8088`.

### 2. Bảng Phân Công Công Việc Theo Mô Hình Phân Hoạch Dọc (Vertical Slicing)
Tuân thủ quy tắc **không phân hoạch ngang**, cả 3 thành viên đều trực tiếp lập trình xuyên suốt từ `Entity` → `Repository` → `Service` → `Controller` → `Giao diện` và biên soạn báo cáo:

| Thành viên | Nhánh nghiệp vụ phụ trách dọc | Hạng mục Code & Báo cáo đảm nhiệm | Tỷ lệ |
| :--- | :--- | :--- | :---: |
| **Bùi Dương Diễm**<br>*(25765281 — Nhóm trưởng)* | **Điều phối chung & Phân hệ Siêu thị, Tồn kho, Đánh giá**<br>(`store_branches`, `inventories`, `product_reviews`) | • 3 Entities, 3 Repositories, `InventoryService`, `ProductReviewService`.<br>• `InventoryApiController` (4 APIs) & `ProductReviewApiController` (4 APIs).<br>• Giao diện Ma trận tồn kho theo siêu thị, Quản lý đánh giá & Phần 1, 2, 6 Báo cáo. | **33.4%** |
| **Phạm Ngọc Lang**<br>*(25765251 — Thành viên)* | **Hạ tầng Spring Boot & Phân hệ Sản phẩm, Danh mục, Hãng**<br>(`categories`, `brands`, `products`) | • Khởi tạo kiến trúc, cấu hình Maven, MySQL, `DataSeeder`, `StaticPageRoutingFilter`.<br>• 3 Entities, 3 Repositories, `ProductCatalogService`, `ProductApiController` (7 APIs) + `MvcCatalogController`.<br>• Giao diện Trang chủ (`/`), Chi tiết SP (`/product/[sku]`), trang MVC & Phần 3, 4 Báo cáo. | **33.3%** |
| **Nguyễn Thanh Toàn**<br>*(25765051 — Thành viên)* | **Kiểm thử Postman & Phân hệ Khách hàng, Khuyến mãi, Đơn hàng**<br>(`customers`, `promotions`, `customer_orders`, `order_items`) | • 4 Entities, 4 Repositories, `OrderService` (`@Transactional` trừ tồn kho), `CustomerService`, `PromotionService`.<br>• 3 REST Controllers (14 APIs: Orders, Customers, Promotions).<br>• Giao diện Giỏ hàng (`/cart`), Thanh toán (`/checkout`), Dashboard Đơn/Khách/KM & Phần 5 Báo cáo. | **33.3%** |

---

## [TRANG 3] BỐI CẢNH, MỤC TIÊU & ĐIỂM MỚI CỦA ĐỀ TÀI

### 1. Bối Cảnh Nghiệp Vụ & Lý Do Chọn Đề Tài
Trong chuỗi bán lẻ điện máy đa chi nhánh (như Điện Máy Xanh), khách hàng không chỉ xem giá niêm yết mà cần biết chính xác **mặt hàng đó còn sẵn bao nhiêu chiếc tại siêu thị gần nhà nhất** (ví dụ Quận 9 hay TP. Thủ Đức). Khi đơn hàng được xác lập, tồn kho tại đúng chi nhánh xuất hàng phải giảm tức thì để ngăn chặn bán vượt số lượng thực có (*overselling*).

### 2. Mục Tiêu & Phạm Vi Thực Hiện
* **Mục tiêu kỹ thuật:** Thiết kế CSDL chuẩn hóa **10 bảng quan hệ**, ánh xạ tự động bằng Spring Data JPA, cung cấp đầy đủ các thao tác CRUD thông qua 4 phương thức HTTP (`GET`, `POST`, `PUT`, `DELETE`) và đảm bảo thời gian phản hồi giao diện dưới 1 giây.
* **Điểm mới nổi bật:**
  1. Liên kết dữ liệu đa tầng sâu (Danh mục/Hãng → Sản phẩm → Tồn kho theo Chi nhánh → Đơn hàng & Chi tiết đơn có lưu tách biệt đơn giá thời điểm mua `unitPrice`).
  2. Tích hợp giao diện Next.js 16 xuất tĩnh trực tiếp vào `src/main/resources/static/` của Spring Boot, vận hành trọn gói chỉ với 1 cổng `8088` duy nhất.

---

## [TRANG 4 – 5] KỊCH BẢN SỬ DỤNG & SƠ ĐỒ USE CASE

### 1. Các Yêu Cầu Chức Năng Cốt Lõi
* **UC-01 (Tra cứu & Lọc sản phẩm đa chiều):** Tìm theo từ khóa, danh mục, thương hiệu, mức giá trần và sắp xếp giá tăng/giảm.
* **UC-02 (Kiểm tra & Điều chỉnh tồn kho đa chi nhánh):** Xem ma trận tồn kho từng siêu thị; nhân viên cập nhật số lượng kho qua HTTP `PUT`.
* **UC-03 (Giỏ hàng, Khuyến mãi & Đặt mua tự động trừ kho):** Áp dụng mã voucher (`MWG5`, `TET2027`), tạo đơn hàng mới và tự động khấu trừ tồn kho chi nhánh trong cùng một giao dịch `@Transactional`.
* **UC-04 (Quản trị toàn diện CRUD 6 phân hệ):** Quản lý Sản phẩm, Tồn kho, Đơn hàng, Khách hàng, Khuyến mãi và Đánh giá trên trang `/dashboard`.

### 2. Sơ Đồ Use Case Tổng Quát
```text
                    HỆ THỐNG BÁN LẺ ĐA CHI NHÁNH MWG
               ┌──────────────────────────────────────────┐
               │  (UC-01: Lọc Danh Mục, Hãng & Khoảng Giá)│
┌──────────┐   │  (UC-02: Xem Chi Tiết SP & Tồn Kho CN)   │   ┌──────────────┐
│  KHÁCH   │───┼──(UC-03: Đặt Hàng + Áp Mã Voucher)───────┼───│ QUẢN TRỊ VIÊN│
│   HÀNG   │   │            │ <<include>>                 │   │  SIÊU THỊ    │
└──────────┘   │            ▼                             │   └──────┬───────┘
     │         │  (Tự Động Khấu Trừ Tồn Kho Chi Nhánh)    │          │
     └─────────┼──(UC-04: Gửi Đánh Giá Sản Phẩm 1–5 Sao)  │          │
               │  (UC-05: Quản Trị CRUD SP/Kho/Đơn/KM/KH) ◄──────────┘
               └──────────────────────────────────────────┘
```

---

## [TRANG 6 – 7] KIẾN TRÚC HỆ THỐNG 4 TẦNG & BỘ CÔNG NGHỆ

### 1. Luồng Xử Lý Dữ Liệu Phân Tầng Chuẩn Spring Boot
1. **Tầng Giao diện (Presentation Layer):** Next.js 16 (App Router) + React 19 + Tailwind CSS 4 được biên dịch tĩnh (`output: 'export'`) vào `static/` (kèm trang MVC `Thymeleaf`), tải trang tức thì (< 3 giây) và gọi REST API bằng đường dẫn tương đối `/api/v1/...`.
2. **Tầng Điều khiển (`controller`):** 6 lớp `@RestController` tiếp nhận HTTP Request, phân tách tham số `@PathVariable` / `@RequestParam` / `@RequestBody` và trả `ResponseEntity` dạng JSON qua thư viện Jackson.
3. **Tầng Nghiệp vụ (`service`):** 6 lớp `@Service` xử lý quy tắc kinh doanh, tính chiết khấu khuyến mãi và quản lý giao dịch `@Transactional`.
4. **Tầng Tàng thư dữ liệu (`repository`) & Thực thể (`entity`):** 10 interface mở rộng `JpaRepository<T, Long>` làm việc với 10 lớp `@Entity` ánh xạ xuống MySQL 8.

### 2. Danh Sách 10 Công Cụ Web Sử Dụng Trong Dự Án
1. **Eclipse EE / IntelliJ IDEA** (IDE lập trình Java Enterprise)
2. **Visual Studio Code** (IDE phát triển giao diện Frontend)
3. **Spring Initializr** (`start.spring.io` khởi tạo dự án)
4. **Apache Maven** (`pom.xml` quản lý thư viện & đóng gói)
5. **MySQL Community Server 8.0** (Hệ quản trị CSDL quan hệ)
6. **MySQL Workbench** (Thiết kế Physical Schema & quản trị trực quan)
7. **Postman** (Kiểm thử độc lập 29 RESTful API endpoints)
8. **Git & GitHub** (Quản lý phiên bản mã nguồn nhóm)
9. **Chrome DevTools** (Kiểm tra Network JSON, DOM & hiệu năng)
10. **Terminal / Command Line** (Thực thi lệnh build và vận hành server)

*(Lưu ý phân loại chuẩn: Spring Boot, Hibernate, React/Next.js, Tailwind/Bootstrap là các **Framework/Thư viện**, không tính lẫn vào nhóm Công cụ phần mềm).*

---

## [TRANG 8 – 11] THIẾT KẾ CSDL: ERD & ĐẶC TẢ 10 BẢNG VẬT LÝ

### 1. Sơ Đồ Quan Hệ Thực Thể 10 Bảng
```text
[CATEGORIES] 1───N [PRODUCTS] N───1 [BRANDS]
                     │    │    │
        ┌────────────┘    │    └────────────┐
        ▼ N               ▼ N               ▼ N
[PRODUCT_REVIEWS]   [INVENTORIES]     [ORDER_ITEMS]
        │ N               │ N               │ N
        ▼ 1               ▼ 1               ▼ 1
   [CUSTOMERS] 1──N [STORE_BRANCHES] [CUSTOMER_ORDERS] N──1 [PROMOTIONS]
        │                                   ▲
        └─────────────────1─────────────────┘
```

### 2. Bảng Tóm Tắt Lược Đồ Vật Lý 10 Bảng
1. **`categories`**: `id` (PK, Auto), `name` (NN), `code` (NN, UQ), `description`.
2. **`brands`**: `id` (PK, Auto), `name` (NN, UQ), `country`, `description`.
3. **`products`**: `id` (PK, Auto), `sku` (NN, UQ), `name` (NN), `price` (NN), `description` (TEXT), `category_id` (FK), `brand_id` (FK).
4. **`store_branches`**: `id` (PK, Auto), `branch_name` (NN), `district` (NN), `address` (NN), `phone`.
5. **`inventories`**: `id` (PK, Auto), `product_id` (FK), `branch_id` (FK), `quantity` (NN) — `UNIQUE(product_id, branch_id)`.
6. **`product_reviews`**: `id` (PK, Auto), `product_id` (FK), `customer_id` (FK), `rating` (NN, 1–5), `comment`, `review_date` (NN).
7. **`customers`**: `id` (PK, Auto), `full_name` (NN), `phone` (NN, UQ), `email`, `address`.
8. **`promotions`**: `id` (PK, Auto), `promo_code` (NN, UQ), `discount_percent` (NN), `description`, `is_active` (NN).
9. **`customer_orders`**: `id` (PK, Auto), `customer_name` (NN), `phone` (NN), `shipping_address` (NN), `total_amount` (NN), `status` (NN), `order_date` (NN), `customer_id` (FK), `promotion_id` (FK).
10. **`order_items`**: `id` (PK, Auto), `order_id` (FK), `product_id` (FK), `quantity` (NN), `unit_price` (NN).

*(Khi xuất bản Word/PDF in ấn: chèn ảnh chụp sơ đồ **Reverse Engineer EER Diagram** trực tiếp từ MySQL Workbench tại Trang 9).*

---

## [TRANG 12 – 14] ĐẶC TẢ HỆ THỐNG 29 RESTful API ENDPOINTS

| Phân hệ Controller | Endpoints cung cấp (Đầy đủ `GET`, `POST`, `PUT`, `DELETE`) |
| :--- | :--- |
| **1. `ProductApiController`**<br>`/api/v1/products` (7 APIs) | • `GET /` (lọc `category`, `brand`, `maxPrice`, `keyword`)<br>• `GET /{id}` \| `GET /categories` \| `GET /brands`<br>• `POST /` (tạo SP) \| `PUT /{id}` (cập nhật SP) \| `DELETE /{id}` (xóa SP) |
| **2. `InventoryApiController`**<br>`/api/v1/inventory` (4 APIs) | • `GET /branches` (danh sách siêu thị)<br>• `GET /branch/{branchId}` (tồn kho theo siêu thị)<br>• `GET /check?sku=...&district=...` \| `PUT /update` (cập nhật tồn kho) |
| **3. `ProductReviewApiController`**<br>`/api/v1/reviews` (4 APIs) | • `GET /` (tất cả đánh giá) \| `GET /product/{productId}`<br>• `POST /` (thêm đánh giá) \| `DELETE /{id}` (xóa đánh giá) |
| **4. `OrderApiController`**<br>`/api/v1/orders` (4 APIs) | • `GET /` (danh sách đơn) \| `GET /{id}` (chi tiết đơn + `orderItems`)<br>• `POST /` (đặt hàng, tính voucher & trừ kho) \| `PUT /{id}/status?status=...` |
| **5. `CustomerApiController`**<br>`/api/v1/customers` (5 APIs) | • `GET /` \| `GET /{id}` \| `POST /` \| `PUT /{id}` \| `DELETE /{id}` |
| **6. `PromotionApiController`**<br>`/api/v1/promotions` (5 APIs) | • `GET /` \| `GET /{id}` \| `POST /` \| `PUT /{id}` \| `DELETE /{id}` |

---

## [TRANG 15 – 16] KẾT QUẢ TRIỂN KHAI & MINH CHỨNG GIAO DIỆN (`:8088`)

*(Khi xuất bản in ấn, chèn 4 ảnh chụp màn hình thực tế chạy trên `http://localhost:8088`):*
1. **Ảnh 1 — Trang chủ & Bộ lọc sản phẩm đa tiêu chí (`/`):** Hiển thị danh mục Máy giặt, Tủ lạnh, Tivi và bộ lọc giá tức thì.
2. **Ảnh 2 — Chi tiết sản phẩm & Tồn kho theo chi nhánh (`/product/[sku]`):** Kiểm tra số lượng hàng thực tế tại ĐMX Lê Văn Việt (Q.9) và ĐMX Đỗ Xuân Hợp (Thủ Đức).
3. **Ảnh 3 — Giỏ hàng áp mã `MWG5` & Thanh toán trừ kho (`/cart`, `/checkout`):** Minh chứng tổng tiền sau chiết khấu và tồn kho giảm tự động.
4. **Ảnh 4 — Trang Quản trị Dashboard CRUD 6 phân hệ (`/dashboard`) & Kết quả test Postman.**

---

## [TRANG 17] KẾT LUẬN, KẾ HOẠCH THỰC HIỆN & HƯỚNG PHÁT TRIỂN

### 1. Đánh Giá Mức Độ Hoàn Thành
* Đáp ứng trọn vẹn yêu cầu học phần: Kiến trúc phân tầng Spring Boot 3, ORM Code-First 10 bảng quan hệ chặt chẽ, 29 REST APIs chuẩn JSON không dính lỗi vòng lặp tham chiếu, giao diện thực tế tốc độ cao trên cổng `8088`.
* Cả 3 thành viên tuân thủ nghiêm ngặt mô hình **Phân hoạch dọc**, nắm vững toàn bộ luồng dữ liệu và cơ sở dữ liệu của hệ thống.

### 2. Hướng Phát Triển Tiếp Theo
* Bổ sung phân quyền người dùng với Spring Security & JWT.
* Tích hợp cổng thanh toán trực tuyến (VNPay / MoMo) và xuất báo cáo thống kê doanh thu chi nhánh ra file Excel/PDF.
