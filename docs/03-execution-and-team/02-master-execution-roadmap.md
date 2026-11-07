# 02. Kế Hoạch Thực Thi Tổng Thể (Master Execution Roadmap)

> **Chủ đề nguyên tử (Atomic Scope):** Bản kế hoạch hành động chi tiết từng giai đoạn (Phase-by-Phase Blueprint) để chuẩn hóa toàn bộ mã nguồn, giao diện, cơ sở dữ liệu và ấn phẩm báo cáo của `mwg-retail-system` trước khi bước vào thực thi code.
>
> **Căn cứ lập kế hoạch:** Dựa trực tiếp trên các phát hiện tại [`../01-course-audit/03-compliance-gap-audit.md`](../01-course-audit/03-compliance-gap-audit.md).

---

## Tổng Quan Lộ Trình 4 Giai Đoạn (Phases)

| Phase | Tên giai đoạn | Mục tiêu cốt lõi | Mức ưu tiên |
| :---: | :--- | :--- | :---: |
| **Phase 1** | **Dọn sạch & Chuẩn hóa Backend + JPA** | Xóa tồn dư `Student*`, chuẩn hóa `Cascade`, sửa response `OrderService`, tối ưu truy vấn JPA & biến môi trường DB | 🔴 **P0 (Bắt buộc ngay)** |
| **Phase 2** | **Giữ nguyên 100% React/Next.js — Chỉ sửa Relative URL & Build lại Static** | Sửa 2 dòng `BASE` URL trong React bỏ hardcode `localhost:8088`, xuất tĩnh lại sang `static/` *(+ tùy chọn thêm 1 route phụ `/mvc/catalog` làm lá chắn nếu thầy hỏi `@Controller`)* | 🔴 **P0 (Bắt buộc ngay)** |
| **Phase 3** | **Kiểm thử Toàn diện (E2E, Postman & MySQL Workbench)** | Xác minh 10 bảng sạch trên Workbench, test 29 APIs qua Postman/script, kiểm tra hiệu năng tải trang < 3 giây | 🟠 **P1 (Trước đóng gói)** |
| **Phase 4** | **Xuất bản Cuốn Báo Cáo ≤ 17 Trang & Diễn tập Vấn đáp** | Chụp ảnh màn hình thật (Workbench Physical Schema + UI `:8088` + Postman), xuất PDF/in đóng quyển & khảo bài chéo 3 người | 🟠 **P1 (Trước bảo vệ)** |

---

## Chi Tiết Công Việc Từng Phase & Tiêu Chí Nghiệm Thu (Definition of Done)

### Phase 1: Dọn Sạch & Chuẩn Hóa Backend + JPA (`backend/`)

1. **Task 1.1 — Xóa triệt để tồn dư bài mẫu `Student` & chú thích ngoài phạm vi môn học:**
   * Xóa 5 file: `entity/Student.java`, `repository/StudentRepository.java`, `service/StudentService.java`, `controller/StudentController.java`, `controller/ManagerStudent.java`.
   * Chuẩn hóa lại JavaDoc trong `InventoryApiController.java` cho thuần túy phạm vi môn học.
   * Xóa bảng `students` cũ trong MySQL (nếu đã từng chạy `ddl-auto=update`).
2. **Task 1.2 — Chuẩn hóa cấu hình `application.properties` an toàn cho cả nhóm:**
   * Giữ `server.port=8088`, dùng biến môi trường có giá trị mặc định cho mật khẩu DB: `spring.datasource.password=${MYSQL_PASSWORD:}` để máy Lang, Diễm, Toàn không bị đụng mật khẩu cá nhân.
   * Bật tùy chọn dễ bật/tắt `spring.jpa.show-sql=true` khi demo cho thầy xem câu lệnh SQL do Hibernate sinh ra ([PL1-B09 `38:56`](https://www.youtube.com/watch?v=tsVNKKGGZRA&t=38m56s)).
3. **Task 1.3 — Tinh chỉnh quan hệ JPA & Logic `Service` chống câu hỏi xoáy:**
   * Trên `Category.java` và `Brand.java`: Đổi `cascade = CascadeType.ALL` thành chỉ định an toàn (hoặc bỏ `CascadeType.REMOVE`) để không xóa dây chuyền toàn bộ sản phẩm khi thao tác danh mục ([PL1-B10 `32:48`](https://www.youtube.com/watch?v=puX0LDumypE&t=32m48s)).
   * Trên `OrderService.createOrder()`: Gắn danh sách `savedItems` vào `savedOrder.setOrderItems(...)` trước khi trả về để JSON của `POST /api/v1/orders` hiển thị đầy đủ chi tiết món hàng.
   * Trên `ProductRepository` & `ProductCatalogService`: Bổ sung câu truy vấn `@Query` JPQL lọc đa điều kiện (`category`, `brand`, `maxPrice`, `keyword`) ngay dưới MySQL thay vì `findAll()` rồi lọc bằng Stream trên RAM.

* **✅ Nghiệm thu Phase 1:** `./mvnw test` và `./mvnw compile` xanh 100%; mở MySQL Workbench chỉ xuất hiện **đúng 10 bảng nghiệp vụ MWG** có đầy đủ dây nối khóa ngoại.

---

### Phase 2: Giữ Nguyên 100% Giao Diện React/Next.js & Chuẩn Hóa Đường Dẫn API

> **Khẳng định quan trọng:** Toàn bộ 6 trang giao diện **React 19 + Next.js 16** hiện tại (`/`, `/product/[sku]`, `/cart`, `/checkout`, `/dashboard`, `/auth`) được **GIỮ NGUYÊN 100%** làm giao diện chính thức của đồ án — tuyệt đối không đập đi viết lại sang MVC!

1. **Task 2.1 (Bắt buộc — Chỉ sửa đúng 2 dòng trong React) — Bỏ Hardcode `localhost:8088` ([PL1-B08 `01:41:00`](https://www.youtube.com/watch?v=YxOeRIoG_dI&t=1h41m00s)):**
   * Trong `frontend/lib/api.ts` và `frontend/lib/dashboard-api.ts`, sửa:
     ```ts
     const BASE = process.env.NEXT_PUBLIC_API_BASE || '/api/v1'
     ```
   * Nhờ đó khi đóng gói tĩnh vào Spring Boot, mọi lời gọi `fetch('/api/v1/...')` tự động ăn theo bất kỳ cổng/host nào của server mà không bao giờ lỗi CORS hay lệch cổng!
2. **Task 2.2 (Tùy chọn — "Lá chắn vấn đáp", không đụng tới React) — Thêm 1 route phụ `/mvc/catalog` bằng `@Controller` ([PL1-B03 `01:03:39`](https://www.youtube.com/watch?v=bu4zCN4I1nA&t=1h03m39s), [PL1-B11 `47:41`](https://www.youtube.com/watch?v=_0lFUb8cU4I&t=47m41s)):**
   * Tạo thêm 1 file độc lập `MvcShowcaseController.java` (`@Controller`) ở đường dẫn phụ `/mvc/catalog` + 1 file `templates/mvc-catalog.html` (toàn bộ các route chính `/`, `/cart`, `/dashboard`... vẫn chạy React 100%).
   * *Lý do có tùy chọn này:* Hiện tại cả 6 Controller trong `backend/` đều là `@RestController`. Nếu khi vấn đáp thầy hỏi *"Mở `@Controller` và `@RestController` ngay trong project của nhóm ra chỉ sự khác nhau cho thầy xem"*, có sẵn 1 file `@Controller` thật giúp nhóm ăn điểm tuyệt đối. *(Nếu bạn muốn thuần khiết 100% React SPA và chỉ giải thích lý thuyết khi thầy hỏi `@Controller`, có thể bỏ qua Task 2.2 này).*
3. **Task 2.3 (Bắt buộc) — Build lại Static Bundle React & Đồng bộ sang Spring Boot:**
   * Chạy `pnpm build` trong `frontend/`, đồng bộ sạch `frontend/out/*` vào `backend/src/main/resources/static/`.

* **✅ Nghiệm thu Phase 2:** Chạy duy nhất `./mvnw spring-boot:run`, mở `http://localhost:8088` (Next.js Storefront), `http://localhost:8088/dashboard` (Admin CRUD), và `http://localhost:8088/mvc/catalog` (Thymeleaf MVC + Fetch Table) đều tải dưới 500ms và thao tác CRUD mượt mà.

---

### Phase 3: Kiểm Thử Toàn Diện & Tạo Postman Collection

1. **Task 3.1 — Kiểm thử kịch bản End-to-End (E2E):**
   * Lọc sản phẩm theo Danh mục + Thương hiệu + Giá trần → Kiểm tra tồn kho tại ĐMX Lê Văn Việt (Quận 9) → Thêm giỏ hàng, áp mã `MWG5` (giảm 5%) → Đặt hàng (`POST /api/v1/orders`) → Xác nhận số lượng tồn kho giảm ngay lập tức trên cả UI và MySQL Workbench.
2. **Task 3.2 — Đóng gói file `postman/MWG-Retail-System.postman_collection.json`:**
   * Lưu sẵn các request mẫu đại diện đủ 4 HTTP Verbs (`GET`, `POST`, `PUT`, `DELETE`) để mở sẵn Postman trong phòng thi theo đúng bộ công cụ chuẩn của thầy ([PL1-B09 `47:32`](https://www.youtube.com/watch?v=tsVNKKGGZRA&t=47m32s)).

* **✅ Nghiệm thu Phase 3:** Cả 29 endpoints trả đúng HTTP Status Code, không có bất kỳ lỗi `500` hay `StackOverflowError` JSON nào.

---

### Phase 4: Hoàn Thiện Ấn Phẩm Báo Cáo ≤ 17 Trang & Tổng Duyệt Vấn Đáp

1. **Task 4.1 — Chụp bộ ảnh minh chứng thực tế:**
   * Sơ đồ Physical Schema (Reverse Engineer trên MySQL Workbench thấy rõ 10 bảng + dây nối PK/FK — [PL1-B10 `14:00`](https://www.youtube.com/watch?v=puX0LDumypE&t=14m00s)).
   * Ảnh giao diện Trang chủ, Chi tiết sản phẩm, Ma trận tồn kho, Thanh toán và Dashboard CRUD.
2. **Task 4.2 — Xuất PDF/Word từ [`../04-deliverables-and-defense/01-report-17-pages-draft.md`](../04-deliverables-and-defense/01-report-17-pages-draft.md) & In đóng quyển:**
   * Đảm bảo tổng số trang **≤ 17 trang** ([PL1-B01 `01:25:06`](https://www.youtube.com/watch?v=4W27ZZ8sKfc&t=1h25m06s)), đánh số trang và có bảng phân công dọc rõ ràng.
3. **Task 4.3 — Khảo bài vấn đáp chéo bằng [`02-oral-defense-playbook.md`](../04-deliverables-and-defense/02-oral-defense-playbook.md).**
