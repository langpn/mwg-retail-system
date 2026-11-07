# 01. Đặc Tả Kiến Trúc Kỹ Thuật Hệ Thống (`mwg-retail-system`)

> **Chủ đề nguyên tử (Atomic Scope):** Định nghĩa kiến trúc phân tầng, luồng Request–Response, cấu trúc Package, cơ chế Dependency Injection, chiến lược đóng gói giao diện tĩnh một cổng (`:8088`) và các quy tắc hiệu năng/định tuyến của hệ thống.
>
> **Không chứa:** Chi tiết 10 bảng CSDL (xem [`02-database-erd-10-tables.md`](./02-database-erd-10-tables.md)) hoặc danh sách 27 API Endpoints (xem [`03-rest-api-specification.md`](./03-rest-api-specification.md)).

---

## 1. Đối Chiếu Cơ Sở Học Thuật Của Thầy (Kèm Mốc Thời Gian)

| Nguyên lý kiến trúc áp dụng | Nội dung thầy giảng trên lớp | Mốc thời gian trích dẫn |
| :--- | :--- | :--- |
| **Tách biệt MVC & RESTful Web Service** | MVC trả về trang HTML hoàn chỉnh; Web Service nằm ở **Backend**, không có View, trả dữ liệu thô **JSON** qua 4 HTTP Verbs (`GET`, `POST`, `PUT`, `DELETE`). | [PL1-B01 `23:41`–`24:56`](https://www.youtube.com/watch?v=4W27ZZ8sKfc&t=23m41s), [PL1-B11 `08:58`–`15:00`](https://www.youtube.com/watch?v=_0lFUb8cU4I&t=8m58s) \| [PL2-S10 `10:57`–`17:17`](https://www.youtube.com/watch?v=kuJZxQC4n_4&t=10m57s) |
| **Luồng 4 tầng chuẩn Spring Boot** | `Controller` → gọi `Service` → gọi `Repository` (*"tàng thư / cái kho dữ liệu"*) → ánh xạ CSDL qua `Entity` (`Model`). Không bao giờ gọi ngược hoặc viết SQL trong Controller. | [PL1-B09 `46:56`–`47:32`](https://www.youtube.com/watch?v=tsVNKKGGZRA&t=46m56s), [PL1-B11 `21:21`–`23:20`](https://www.youtube.com/watch?v=_0lFUb8cU4I&t=21m21s) \| [PL2-S10 `21:00`–`25:01`](https://www.youtube.com/watch?v=kuJZxQC4n_4&t=21m00s) |
| **Phân chia Subpackage chuẩn Component Scan** | Bắt buộc tách `.controller`, `.service`, `.repository`, `.entity` dưới package gốc chứa `@SpringBootApplication`. Gom chung 1 cục sẽ bị từ chối chấm điểm. | [PL1-B07 `02:02:26`](https://www.youtube.com/watch?v=XpgBaeJS1JI&t=2h02m26s), [PL1-B08 `06:14`](https://www.youtube.com/watch?v=YxOeRIoG_dI&t=6m14s) \| [PL2-S06 `04:04`](https://www.youtube.com/watch?v=EoHY6QTINhU&t=4m04s) |
| **Dependency Injection (IoC) & Annotations** | Spring Boot quản lý vòng đời Bean và tiêm phụ thuộc ngầm định (*implicit*) thông qua các nhãn đánh dấu `@` (`@RestController`, `@Service`, `@Repository`, `@Entity`) thay vì khởi tạo thủ công `new`. | [PL2-B05 `37:54`](https://www.youtube.com/watch?v=acNPtD44jWU&t=37m54s), [PL1-B11 `28:00`–`34:22`](https://www.youtube.com/watch?v=_0lFUb8cU4I&t=28m00s) \| [PL2-S10 `29:55`–`36:03`](https://www.youtube.com/watch?v=kuJZxQC4n_4&t=29m55s) |
| **Quy tắc tải trang < 3 giây** | Giao diện ban đầu và danh mục ít phần tử phải hiển thị tức thì từ Server (< 3 giây), cấm để màn hình trắng chờ `window.onload` mới gọi API nạp combobox. | [PL1-B08 `08:05`](https://www.youtube.com/watch?v=YxOeRIoG_dI&t=8m05s) \| [PL2-S07 `16:24`–`18:43`](https://www.youtube.com/watch?v=64I1w6eXR4g&t=16m24s) |
| **Quy tắc đường dẫn API tương đối** | Khi giao diện phục vụ cùng cổng với Spring Boot, mã JavaScript gọi API bắt buộc dùng relative path `/api/v1/...`, tuyệt đối không hardcode `http://localhost:8088`. | [PL1-B08 `01:41:00`](https://www.youtube.com/watch?v=YxOeRIoG_dI&t=1h41m00s) \| [PL2-S07 `23:46`–`26:57`](https://www.youtube.com/watch?v=64I1w6eXR4g&t=23m46s) |

---

## 2. Sơ Đồ Kiến Trúc Tổng Thể (Single-Port Hybrid Architecture)

Hệ thống hợp nhất cả **Frontend thương mại điện tử hiện đại** và **Backend Spring Boot 4 tầng** trên một cổng duy nhất **`http://localhost:8088`**, giúp các thành viên và giảng viên chạy ứng dụng chỉ bằng **1 lệnh Maven duy nhất** mà không phụ thuộc môi trường Node.js lúc demo:

```text
                           TRÌNH DUYỆT WEB / POSTMAN (:8088)
                                           │
                      ┌────────────────────┴────────────────────┐
                      ▼ (GET /, /product/*, /dashboard...)      ▼ (GET/POST/PUT/DELETE /api/v1/*)
┌──────────────────────────────────────────┐   ┌───────────────────────────────────────────────┐
│   TẦNG GIAO DIỆN (STATIC SSG + MVC)      │   │     TẦNG ĐIỀU KHIỂN REST (6 CONTROLLERS)      │
│ • Next.js 16 (App Router) + React 19     │   │ • ProductApiController                        │
│   + Tailwind CSS 4 (output: 'export')    │──▶│ • InventoryApiController                      │
│ • Lưu tại src/main/resources/static/     │JS │ • OrderApiController                          │
│ • StaticPageRoutingFilter định tuyến URL │API│ • CustomerApiController                       │
│ • (Tùy chọn) MVC @Controller + Thymeleaf │   │ • PromotionApiController                      │
│   tại src/main/resources/templates/      │   │ • ProductReviewApiController                  │
└──────────────────────────────────────────┘   └───────────────────────┬───────────────────────┘
                                                                       │ Constructor DI
                                                                       ▼
                                               ┌───────────────────────────────────────────────┐
                                               │        TẦNG NGHIỆP VỤ (6 SERVICES)            │
                                               │ • ProductCatalogService, InventoryService     │
                                               │ • OrderService (@Transactional trừ tồn kho)   │
                                               │ • CustomerService, PromotionService           │
                                               │ • ProductReviewService                        │
                                               └───────────────────────┬───────────────────────┘
                                                                       │ Constructor DI
                                                                       ▼
                                               ┌───────────────────────────────────────────────┐
                                               │   TẦNG TÀNG THƯ DỮ LIỆU (10 REPOSITORIES)     │
                                               │ • 10 Interfaces extends JpaRepository<T, Long>│
                                               │ • Tự sinh CRUD + Derived Queries / JPQL       │
                                               └───────────────────────┬───────────────────────┘
                                                                       │ Hibernate 6 ORM (JDBC)
                                                                       ▼
                                               ┌───────────────────────────────────────────────┐
                                               │       HỆ QUẢN TRỊ CSDL MYSQL 8 (:3306)        │
                                               │ • Schema: mwg-retail-system (10 bảng quan hệ) │
                                               │ • Profile dự phòng offline: H2 In-Memory      │
                                               └───────────────────────────────────────────────┘
```

---

## 3. Chi Tiết Công Nghệ Sử Dụng (True Tech Stack)

| Phân tầng | Công nghệ thực tế trong Repo | Vai trò kỹ thuật |
| :--- | :--- | :--- |
| **Backend Runtime** | Java 17 LTS + Spring Boot 3.x (Embedded Tomcat, cổng `8088`) | Máy chủ ứng dụng trung tâm ([PL1-B03 `11:10`](https://www.youtube.com/watch?v=bu4zCN4I1nA&t=11m10s), [`01:00:01`](https://www.youtube.com/watch?v=bu4zCN4I1nA&t=1h00m01s)) |
| **ORM & Persistence** | Spring Data JPA + Hibernate 6 (`ddl-auto=update`) | Ánh xạ Code-First 10 Entity Java thành 10 bảng MySQL ([PL1-B09 `38:56`](https://www.youtube.com/watch?v=tsVNKKGGZRA&t=38m56s)) |
| **JSON Serialization** | Jackson (`spring-boot-starter-web`) | Tự động serialize Java Object/List ↔ chuỗi JSON ([PL2-B05 `37:35`](https://www.youtube.com/watch?v=acNPtD44jWU&t=37m35s)) |
| **Database** | MySQL 8.0 (`mwg-retail-system`) + H2 (`dev` profile) | Lưu trữ bền vững CSDL quan hệ + chế độ dự phòng offline |
| **Frontend UI** | Next.js 16.4 (App Router, Turbopack) + React 19 + TypeScript 5.7 + Tailwind CSS 4 | Xây dựng 6 phân trang thương mại điện tử & Dashboard quản trị ([PL1-B10 `02:23:49`](https://www.youtube.com/watch?v=puX0LDumypE&t=2h23m49s)) |
| **Static Routing** | `StaticPageRoutingFilter.java` (OncePerRequestFilter) | Ánh xạ clean URL (`/cart`, `/dashboard`, `/product/DMX-...`) sang file `.html` tĩnh tương ứng trong `static/`, tránh lỗi `404` khi F5 |
| **Build & Test Tools** | Maven (`mvnw`), pnpm (build UI), MySQL Workbench, Postman | Quản lý phụ thuộc, đóng gói và kiểm thử độc lập ([PL1-B11 `44:04`–`46:20`](https://www.youtube.com/watch?v=_0lFUb8cU4I&t=44m04s)) |

---

## 4. Cấu Trúc Thư Mục Chuẩn Hóa Của Dự Án

```text
mwg-retail-system/
├── backend/                                        # Ứng dụng Spring Boot Maven
│   ├── src/main/java/com/example/demojpa/
│   │   ├── DemojpaApplication.java                 # @SpringBootApplication entry point
│   │   ├── config/
│   │   │   └── StaticPageRoutingFilter.java        # Định tuyến URL sạch cho bundle tĩnh Next.js
│   │   ├── controller/                             # 6 @RestController (+ 1 MVC @Controller tùy chọn)
│   │   ├── service/                                # 6 @Service xử lý logic nghiệp vụ & @Transactional
│   │   ├── repository/                             # 10 JpaRepository<T, Long> interfaces
│   │   ├── entity/                                 # 10 @Entity POJO thuần (không dùng Lombok)
│   │   ├── dto/                                    # CreateOrderRequest, OrderItemRequest, StockUpdateRequest
│   │   └── seeder/
│   │       └── DataSeeder.java                     # CommandLineRunner tự nạp dữ liệu mẫu khi DB trống
│   ├── src/main/resources/
│   │   ├── application.properties                  # Cấu hình MySQL :3306 & Server :8088
│   │   ├── application-dev.properties              # Cấu hình H2 in-memory dự phòng
│   │   ├── templates/                              # Nơi đặt file HTML nếu dùng Thymeleaf MVC
│   │   └── static/                                 # Bundle HTML/CSS/JS xuất tĩnh từ frontend/out/
│   └── pom.xml
├── frontend/                                       # Mã nguồn giao diện Next.js 16 App Router
│   ├── app/                                        # 6 routes: /, /product/[sku], /cart, /checkout, /dashboard, /auth
│   ├── components/                                 # Các thành phần UI tái sử dụng
│   ├── lib/                                        # Client API wrappers (api.ts, dashboard-api.ts) & dữ liệu tĩnh
│   ├── next.config.mjs                             # Cấu hình output: 'export'
│   └── package.json
├── docs/                                           # Hệ thống tài liệu nguyên tử (Atomic Documentation)
└── README.md
```

---

## 5. Phong Cách Code Chuẩn Mực Theo Mẫu Của Thầy

Dựa trên kiểm toán project mẫu `basic_jpa-main/demojpa` của giảng viên:
1. **Không lạm dụng Lombok trên Entity:** Viết tường minh constructor không tham số (`public Product() {}`), getters và setters để dễ giải thích cơ chế Hibernate Reflection đọc/ghi dữ liệu khi vấn đáp.
2. **Ưu tiên Constructor Injection thay cho Field Injection:** Tiêm `Repository` vào `Service` và tiêm `Service` vào `Controller` thông qua hàm khởi tạo (`private final ...`), thể hiện sự hiểu sâu về Dependency Injection ([PL1-B11 `28:00`–`33:04`](https://www.youtube.com/watch?v=_0lFUb8cU4I&t=28m00s)).
3. **Trả về `ResponseEntity<T>` chuẩn HTTP Status:** Sử dụng mã trạng thái tường minh (`200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `404 Not Found`).
