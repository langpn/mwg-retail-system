# Hệ Thống Tài Liệu Nguyên Tử (Atomic Documentation Hub)

Chào mừng đến với trung tâm tài liệu kỹ thuật & học thuật của dự án **`mwg-retail-system`**.

Toàn bộ tài liệu được thiết kế theo nguyên lý **Atomic Design & Single Source of Truth (SSOT)**:
1. **Tính nguyên tử (Atomicity):** Mỗi file chỉ giải quyết **đúng 1 chủ đề duy nhất**, không trộn lẫn nội dung và không nhân bản thông tin gây mâu thuẫn.
2. **Truy xuất nguồn gốc 100% (Evidence-Based Traceability):** Mọi quy chế, tiêu chuẩn kiến trúc, bẫy trừ điểm và câu hỏi thi đều được trích dẫn trực tiếp tới **video và mốc thời gian `[HH:MM:SS]`** trên cả 2 Playlist bài giảng của thầy.

---

## 1. Cấu Trúc 4 Phân Khu & 12 Tài Liệu Nguyên Tử

### Phân khu `01-course-audit/` — Chuẩn Mực Của Thầy & Kiểm Toán Đối Chiếu
| Mã file | Tài liệu | Phạm vi nguyên tử |
| :---: | :--- | :--- |
| `01.1` | [`01-lecture-index-and-timeline.md`](./01-course-audit/01-lecture-index-and-timeline.md) | Bản đồ ánh xạ 20 video giữa Playlist 1 & Playlist 2 + dòng thời gian kiến thức từng buổi kèm link mở đúng giây. |
| `01.2` | [`02-instructor-requirements.md`](./01-course-audit/02-instructor-requirements.md) | Toàn bộ quy chế Đồ án, Phân hoạch dọc, Báo cáo ≤ 17 trang, Thang điểm & 8 bẫy 0 điểm theo đúng lời thầy. |
| `01.3` | [`03-compliance-gap-audit.md`](./01-course-audit/03-compliance-gap-audit.md) | Kiểm toán đối chiếu 3 chiều: **[Lời thầy]** ↔ **[Docs cũ]** ↔ **[Code thực tế]** & chiến lược `Thymeleaf` + Next.js. |

### Phân khu `02-architecture-and-specs/` — Đặc Tả Kỹ Thuật Chuẩn Thực Tế
| Mã file | Tài liệu | Phạm vi nguyên tử |
| :---: | :--- | :--- |
| `02.1` | [`01-system-architecture.md`](./02-architecture-and-specs/01-system-architecture.md) | Kiến trúc 4 tầng Spring Boot + Next.js 16 Static SPA cổng `:8088`, Component Scan, DI, quy tắc < 3s & Relative URL. |
| `02.2` | [`02-database-erd-10-tables.md`](./02-architecture-and-specs/02-database-erd-10-tables.md) | Sơ đồ ERD, đặc tả vật lý 10 bảng MySQL, JPA Annotations, chống lặp `Circular Reference` & chiến lược `Cascade`. |
| `02.3` | [`03-rest-api-specification.md`](./02-architecture-and-specs/03-rest-api-specification.md) | Danh mục đầy đủ **29+ RESTful API routes** trên 6 Controller (`GET`, `POST`, `PUT`, `DELETE`) & mẫu JSON payload. |
| `02.4` | [`mwg-retail-system.drawio`](./02-architecture-and-specs/mwg-retail-system.drawio) | **File nguồn Draw.io gốc (4 Tabs Vector):** `Use Case UML`, `Kiến trúc 4 Tầng`, `Conceptual ERD`, `Physical Schema 10 Bảng` — kéo thả trực tiếp lên `app.diagrams.net`. |
| `02.5` | [`schema-10-tables.sql`](./02-architecture-and-specs/schema-10-tables.sql) | Script SQL DDL khởi tạo 10 bảng MySQL (dùng cho MySQL Workbench hoặc `Insert -> Advanced -> SQL` trên draw.io). |

### Phân khu `03-execution-and-team/` — Kế Hoạch Thực Thi & Phối Hợp Nhóm
| Mã file | Tài liệu | Phạm vi nguyên tử |
| :---: | :--- | :--- |
| `03.1` | [`01-vertical-slicing-matrix.md`](./03-execution-and-team/01-vertical-slicing-matrix.md) | Ma trận Phân hoạch dọc cho 3 thành viên (Diễm – Lang – Toàn) từ Entity đến Giao diện & Báo cáo. |
| `03.2` | [`02-master-execution-roadmap.md`](./03-execution-and-team/02-master-execution-roadmap.md) | **Kế hoạch thực thi 4 giai đoạn (Master Plan)** để dọn sạch tồn dư, chuẩn hóa code và nghiệm thu trước khi bảo vệ. |
| `03.3` | [`03-local-setup-and-runbook.md`](./03-execution-and-team/03-local-setup-and-runbook.md) | Cẩm nang cài đặt môi trường, chạy 1 lệnh `:8088`, build tĩnh giao diện và Checklist 10 phút trước giờ G. |

### Phân khu `04-deliverables-and-defense/` — Ấn Phẩm Nộp Bài & Cẩm Nang Thi Cử
| Mã file | Tài liệu | Phạm vi nguyên tử |
| :---: | :--- | :--- |
| `04.1` | [`01-report-17-pages-draft.md`](./04-deliverables-and-defense/01-report-17-pages-draft.md) | Bản thảo Cuốn Báo Cáo ≤ 17 trang (kèm file Word in ấn sẵn [`BAO_CAO_DO_AN_MWG_RETAIL_SYSTEM.docx`](./04-deliverables-and-defense/BAO_CAO_DO_AN_MWG_RETAIL_SYSTEM.docx) theo đúng biểu mẫu IUH). |
| `04.2` | [`02-oral-defense-playbook.md`](./04-deliverables-and-defense/02-oral-defense-playbook.md) | Bộ câu hỏi & đáp án vấn đáp đồ án (bao gồm các câu thầy đã hỏi trực tiếp thành viên nhóm trên lớp!). |
| `04.3` | [`03-final-exam-study-guide.md`](./04-deliverables-and-defense/03-final-exam-study-guide.md) | Cẩm nang ôn thi viết cuối kỳ đóng tài liệu (10 Công cụ Web, lý thuyết cốt lõi & khung code giấy 1–1.5 trang). |

---

## 2. Lộ Trình Đọc Nhanh Theo Mục Đích

* **Chuẩn bị lập kế hoạch & bắt tay sửa code:** Đọc `01.3` (Kiểm toán lỗi lệch) → `03.2` (Master Plan 4 Phases) → `02.1` & `02.2`.
* **Thành viên nhóm mới kéo repo về chạy máy:** Đọc `03.3` (Runbook cài đặt) → `03.1` (Phân hoạch dọc của mình).
* **Hoàn thiện in ấn Cuốn báo cáo:** Đọc `01.2` (Mục 4: Quy chuẩn 17 trang) → Xuất file từ `04.1`.
* **Ôn tập trước ngày bảo vệ & thi cuối kỳ:** Học kỹ `04.2` (Vấn đáp đồ án) → `04.3` (Thi giấy đóng tài liệu).
