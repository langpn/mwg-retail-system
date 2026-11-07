# MWG Retail Multi-Branch System (`mwg-retail-system`)

> **Hệ Thống Quản Lý Dữ Liệu & Bán Lẻ Đa Chi Nhánh Điện Máy Xanh**  
> **Học phần:** Công cụ Web và Website hướng dữ liệu — ĐH Công nghiệp TP.HCM (IUH) • **GVHD:** Trương Bá Phúc  
> **Nhóm thực hiện (`DHCNTT21BVL` — Phân hoạch dọc):** Bùi Dương Diễm (`25765281` — *Nhóm trưởng*) • Phạm Ngọc Lang (`25765251`) • Nguyễn Thanh Toàn (`25765051`)

---

## 1. Tổng Quan Dự Án

`mwg-retail-system` mô phỏng bài toán quản trị danh mục điện máy, tra cứu tồn kho theo từng siêu thị chi nhánh thời gian thực và tự động khấu trừ tồn kho khi đặt hàng:
* **Backend 4 tầng chuẩn mực:** Java 17 LTS + Spring Boot 3 + Spring Data JPA / Hibernate 6 (`Code-First`), cung cấp **29 RESTful API endpoints** chuẩn JSON qua 6 Controller.
* **Cơ sở dữ liệu quan hệ 10 bảng:** Thiết kế trên **MySQL 8.0** (kèm profile dự phòng **H2 In-Memory**), tự động khởi tạo dữ liệu mẫu qua `DataSeeder`.
* **Giao diện thương mại điện tử tốc độ cao:** **Next.js 16 (App Router) + React 19 + Tailwind CSS 4** xuất tĩnh (`output: 'export'`) trực tiếp vào `backend/src/main/resources/static/`, vận hành hợp nhất trên **một cổng duy nhất `http://localhost:8088`**.

---

## 2. Khởi Chạy Nhanh (Chỉ 1 Lệnh)

```bash
# Đảm bảo MySQL Server đang chạy ở cổng 3306, sau đó khởi chạy:
cd backend && ./mvnw spring-boot:run
# (Trên Windows: cd backend && mvnw.cmd spring-boot:run)
```

* **Giao diện Cửa hàng & Ma trận tồn kho:** `http://localhost:8088`
* **Giao diện Quản trị viên (Admin CRUD 6 phân hệ):** `http://localhost:8088/dashboard`
* **Kiểm tra JSON REST API:** `http://localhost:8088/api/v1/products`

*(Chi tiết cấu hình mật khẩu DB, chế độ offline H2 và cách build lại giao diện xem tại [`docs/03-execution-and-team/03-local-setup-and-runbook.md`](./docs/03-execution-and-team/03-local-setup-and-runbook.md)).*

---

## 3. Hệ Thống Tài Liệu Nguyên Tử (Atomic Documentation)

Toàn bộ tài liệu kế hoạch, đặc tả kỹ thuật và đối chiếu bài giảng (kèm trích dẫn **mốc phút:giây chính xác** từ 20 video trên 2 Playlist của giảng viên) được tổ chức tập trung tại **[`docs/README.md`](./docs/README.md)**:

| Nhóm chủ đề | Tài liệu nguyên tử | Nội dung chính |
| :--- | :--- | :--- |
| **01. Chuẩn Mực Của Thầy & Kiểm Toán** | [`01-lecture-index-and-timeline.md`](./docs/01-course-audit/01-lecture-index-and-timeline.md)<br>[`02-instructor-requirements.md`](./docs/01-course-audit/02-instructor-requirements.md)<br>[`03-compliance-gap-audit.md`](./docs/01-course-audit/03-compliance-gap-audit.md) | • Bản đồ đối chiếu 20 video (PL1 ↔ PL2) & timeline kiến thức.<br>• Quy chế Đồ án, Báo cáo ≤ 17 trang, Thang điểm & 8 bẫy 0 điểm.<br>• Kiểm toán 3 chiều: Lời thầy ↔ Docs cũ ↔ Source code hiện tại. |
| **02. Đặc Tả Kiến Trúc & Kỹ Thuật** | [`01-system-architecture.md`](./docs/02-architecture-and-specs/01-system-architecture.md)<br>[`02-database-erd-10-tables.md`](./docs/02-architecture-and-specs/02-database-erd-10-tables.md)<br>[`03-rest-api-specification.md`](./docs/02-architecture-and-specs/03-rest-api-specification.md) | • Kiến trúc 4 tầng Spring Boot + Next.js Static SPA cổng `:8088`.<br>• Sơ đồ ERD, 10 bảng vật lý, JPA Annotations, `@JsonIgnore` & `Cascade`.<br>• Đặc tả đầy đủ 29 RESTful API endpoints & mẫu JSON payload. |
| **03. Kế Hoạch Thực Thi & Nhóm** | [`01-vertical-slicing-matrix.md`](./docs/03-execution-and-team/01-vertical-slicing-matrix.md)<br>[`02-master-execution-roadmap.md`](./docs/03-execution-and-team/02-master-execution-roadmap.md)<br>[`03-local-setup-and-runbook.md`](./docs/03-execution-and-team/03-local-setup-and-runbook.md) | • Ma trận Phân hoạch dọc 3 thành viên (Diễm – Lang – Toàn).<br>• **Master Plan 4 Phases** chuẩn hóa toàn diện dự án trước khi code.<br>• Hướng dẫn cài đặt local, build UI và Checklist trước giờ vấn đáp. |
| **04. Báo Cáo & Cẩm Nang Thi Cử** | [`01-report-17-pages-draft.md`](./docs/04-deliverables-and-defense/01-report-17-pages-draft.md)<br>[`02-oral-defense-playbook.md`](./docs/04-deliverables-and-defense/02-oral-defense-playbook.md)<br>[`03-final-exam-study-guide.md`](./docs/04-deliverables-and-defense/03-final-exam-study-guide.md) | • Bản thảo in ấn Cuốn Báo Cáo ≤ 17 trang chuẩn thông số thật.<br>• Cẩm nang trả lời vấn đáp (gồm cả các câu thầy đã hỏi nhóm trên lớp).<br>• Đề cương ôn thi giấy cuối kỳ đóng tài liệu (10 công cụ + code mẫu). |
