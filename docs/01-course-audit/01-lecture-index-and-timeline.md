# 01. Bản Đồ Đối Chiếu 2 Playlist Bài Giảng & Dòng Thời Gian Kiến Thức

> **Chủ đề nguyên tử (Atomic Scope):** Tra cứu danh mục toàn bộ **20 video bài giảng** trên 2 Playlist YouTube của môn *"Công cụ Web và Website hướng dữ liệu"* (IUH), mối tương quan bản gốc – bản cắt gọn giữa 2 Playlist, và mục lục mốc thời gian (`[HH:MM:SS]`) của từng học phần kỹ thuật.
>
> **Không chứa:** Quy chế chấm đồ án chi tiết (xem [`02-instructor-requirements.md`](./02-instructor-requirements.md)) hoặc kiểm toán lỗi source code hiện tại (xem [`03-compliance-gap-audit.md`](./03-compliance-gap-audit.md)).

---

## 1. Kết Luận Quan Trọng Về Bản Chất 2 Playlist

Qua trích xuất phụ đề gốc tiếng Việt (`vi-orig`) của toàn bộ 20 video, 2 Playlist thực chất ghi lại **cùng một khóa giảng dạy của thầy** nhưng bổ khuyết hoàn hảo cho nhau:

| Tiêu chí | Playlist 1 (`PLfl0z8bX2Dno`) | Playlist 2 (`PLe9xCK-qad2o`) |
| :--- | :--- | :--- |
| **Đường dẫn gốc** | [YouTube Playlist 1](https://www.youtube.com/playlist?list=PLfl0z8bX2Dno) | [YouTube Playlist 2](https://www.youtube.com/playlist?list=PLe9xCK-qad2o) |
| **Số lượng video** | **10 video** (Buổi 1, 2, 3, 5, 6, 7, 8, 9, 10, 11) | **10 video khả dụng** (Buổi 1–5, Session 6–10; ẩn 2 video riêng tư) |
| **Đặc điểm bản ghi** | Bản ghi màn hình **nguyên gốc (raw)** trọn ca học (1h20p – 2h30p/video), giữ lại cả phần hỏi đáp cuối giờ | Bản **cắt gọn (trimmed)** loại bỏ thời gian tự làm lab trống, giúp tra cứu lý thuyết nhanh |
| **Giá trị độc quyền** | Giữ được đoạn cuối **Buổi 10 `[02:23:32]`** (thầy phân biệt giao diện Đồ án thực tế vs Giữa kỳ) và trọn vẹn ca vấn đáp **Buổi 11** | Có **Session 4 (`xMQSY7vEis4`)** dạy Thymeleaf & trần điểm 8/10 vs 10/10 (bị khuyết ở Playlist 1) và phụ đề đầy đủ cho **Buổi 5 (`acNPtD44jWU`)** |

> **Quy ước trích dẫn chuẩn trong toàn bộ hệ thống tài liệu:**
> - `[PL1-Bxx HH:MM:SS]` — Mốc thời gian trên **Playlist 1** (bấm vào link để nhảy đúng giây).
> - `[PL2-Syy HH:MM:SS]` — Mốc thời gian tương ứng trên **Playlist 2**.

---

## 2. Ma Trận Ánh Xạ Song Song 20 Video (PL1 ↔ PL2)

| Chủ đề buổi học | Playlist 1 (`PLfl0z8bX2Dno`) | Thời lượng | Playlist 2 (`PLe9xCK-qad2o`) | Thời lượng | Ghi chú đối chiếu |
| :--- | :--- | :---: | :--- | :---: | :--- |
| **1. Tổng quan Web, MVC vs REST, DOM, JSON, Logic `null`, Quy chế BTL** | [PL1-B01 (`4W27ZZ8sKfc`)](https://www.youtube.com/watch?v=4W27ZZ8sKfc&list=PLfl0z8bX2Dno) | `02:19:34` | [PL2-B01 (`1edL45bgl2g`)](https://www.youtube.com/watch?v=1edL45bgl2g&list=PLe9xCK-qad2o) | `02:24:02` | Cùng buổi học (PL2 dài hơn ~4p30s phần đầu giờ) |
| **2. OOP Java Server: Abstract Class, Interface, Encapsulation, Downcasting** | [PL1-B02 (`52z3OYV0Tn8`)](https://www.youtube.com/watch?v=52z3OYV0Tn8&list=PLfl0z8bX2Dno) | `02:29:20` | [PL2-B02 (`aUrPVaKcCBs`)](https://www.youtube.com/watch?v=aUrPVaKcCBs&list=PLe9xCK-qad2o) | `01:35:17` | PL2 đã cắt bỏ khoảng trống sinh viên tự code |
| **3. Khởi tạo Spring Boot (`start.spring.io`), Maven `pom.xml`, MVC đầu tiên** | [PL1-B03 (`bu4zCN4I1nA`)](https://www.youtube.com/watch?v=bu4zCN4I1nA&list=PLfl0z8bX2Dno) | `02:16:55` | [PL2-S03 (`vKwPAa3xagE`)](https://www.youtube.com/watch?v=vKwPAa3xagE&list=PLe9xCK-qad2o) | `01:10:08` | PL2 cắt gọn còn 70 phút giảng cốt lõi |
| **4. Thymeleaf Template Engine, `Model`, `th:each`, Master-Detail 2 cấp vs Đa cấp** | *(Khuyết trên PL1)* | — | [PL2-S04 (`xMQSY7vEis4`)](https://www.youtube.com/watch?v=xMQSY7vEis4&list=PLe9xCK-qad2o) | `00:34:23` | **Chỉ có ở PL2** — Chứa quy tắc trần điểm 8/10 vs 10/10 |
| **5. Tự viết RESTful API nội bộ, `@Service`, `@RestController`, Jackson JSON** | [PL1-B05 (`90WH3MXTyc4`)](https://www.youtube.com/watch?v=90WH3MXTyc4&list=PLfl0z8bX2Dno)<br>[PL1-B06 (`SMDSzotHLF0`)](https://www.youtube.com/watch?v=SMDSzotHLF0&list=PLfl0z8bX2Dno) | `02:19:38`<br>`02:03:18` | [PL2-B05 (`acNPtD44jWU`)](https://www.youtube.com/watch?v=acNPtD44jWU&list=PLe9xCK-qad2o) | `02:12:40` | `PL1-B05` không có auto-sub; dùng `PL2-B05` & `PL1-B06` đối chiếu đầy đủ 100% |
| **6. Quy trình 5 bước SPA + MVC, Sửa lỗi chia sai Package Spring Boot** | [PL1-B07 (`XpgBaeJS1JI`)](https://www.youtube.com/watch?v=XpgBaeJS1JI&list=PLfl0z8bX2Dno) | `02:09:10` | [PL2-S06 (`EoHY6QTINhU`)](https://www.youtube.com/watch?v=EoHY6QTINhU&list=PLe9xCK-qad2o) | `00:08:48` | `PL2-S06` giữ đúng 8p48s phần thầy giảng đầu & cuối buổi |
| **7. Thu hẹp Scope đề tài, Refactor IDE, Bẫy tải trang > 3s, Relative URL `/api/...`** | [PL1-B08 (`YxOeRIoG_dI`)](https://www.youtube.com/watch?v=YxOeRIoG_dI&list=PLfl0z8bX2Dno) | `01:41:29` | [PL2-S07 (`64I1w6eXR4g`)](https://www.youtube.com/watch?v=64I1w6eXR4g&list=PLe9xCK-qad2o) | `00:26:57` | `PL2-S07` cô đọng toàn bộ phần sửa kiến trúc đồ án |
| **8. Cài đặt MySQL + Workbench, Spring Data JPA Code-First, `JpaRepository`** | [PL1-B09 (`tsVNKKGGZRA`)](https://www.youtube.com/watch?v=tsVNKKGGZRA&list=PLfl0z8bX2Dno) | `02:15:25` | [PL2-S08 (`GLNPlwPn_bg`)](https://www.youtube.com/watch?v=GLNPlwPn_bg&list=PLe9xCK-qad2o) | `00:51:55` | Thầy demo `DROP TABLE` và để Hibernate tự sinh lại bảng |
| **9. ERD → Physical Schema, JPA Relationships, Circular Loop, Cascade, Bonus +2đ** | [PL1-B10 (`puX0LDumypE`)](https://www.youtube.com/watch?v=puX0LDumypE&list=PLfl0z8bX2Dno) | `02:24:20` | [PL2-S09 (`Ac686eKMcd4`)](https://www.youtube.com/watch?v=Ac686eKMcd4&list=PLe9xCK-qad2o) | `00:40:53` | **Lưu ý:** Phút cuối `PL1-B10 [02:23:32]` có dặn dò giao diện đồ án bị cắt ở PL2 |
| **10. Chốt lịch vấn đáp 01/11, Rà soát câu hỏi thi, 10 Công cụ Web, Chốt 6–10 bảng** | [PL1-B11 (`_0lFUb8cU4I`)](https://www.youtube.com/watch?v=_0lFUb8cU4I&list=PLfl0z8bX2Dno) | `01:19:52` | [PL2-S10 (`kuJZxQC4n_4`)](https://www.youtube.com/watch?v=kuJZxQC4n_4&list=PLe9xCK-qad2o) | `01:00:11` | Buổi tổng kết quan trọng nhất của toàn học phần |

---

## 3. Dòng Thời Gian Kiến Thức Chi Tiết Theo Từng Chuyên Đề

### Chuyên đề 1: Kiến trúc Client–Server, MVC vs RESTful API, JSON & Logic `null`
* **Luồng Request–Response & Mô hình MVC truyền thống:**
  * [PL1-B01 `18:02`–`20:03`](https://www.youtube.com/watch?v=4W27ZZ8sKfc&t=18m02s) | [PL2-B01 `22:05`–`25:10`](https://www.youtube.com/watch?v=1edL45bgl2g&t=22m05s): Controller nhận Request → gọi Model lấy dữ liệu DB → gắn vào View trả về trang HTML hoàn chỉnh.
* **Sự tiến hóa từ SQL thuần sang ORM (JPA/Hibernate):**
  * [PL1-B01 `21:04`–`22:06`](https://www.youtube.com/watch?v=4W27ZZ8sKfc&t=21m04s) | [PL2-B01 `26:15`–`27:30`](https://www.youtube.com/watch?v=1edL45bgl2g&t=26m15s): Chuyển bảng (Table) thành lớp (Class/Entity), thao tác bằng phương thức OOP thay vì viết SQL thủ công.
* **Bản chất Web Service (RESTful API) & 4 HTTP Verbs:**
  * [PL1-B01 `23:41`–`24:56`](https://www.youtube.com/watch?v=4W27ZZ8sKfc&t=23m41s) | [PL2-B01 `28:50`–`30:23`](https://www.youtube.com/watch?v=1edL45bgl2g&t=28m50s): Web Service **thuộc phía Backend**, không có View, chỉ trả dữ liệu thô JSON qua 4 động từ HTTP: `GET` (đọc), `POST` (thêm mới xuống DB), `PUT` (cập nhật), `DELETE` (xóa).
  * [PL1-B11 `08:58`–`15:00`](https://www.youtube.com/watch?v=_0lFUb8cU4I&t=8m58s) | [PL2-S10 `10:57`–`17:17`](https://www.youtube.com/watch?v=kuJZxQC4n_4&t=10m57s): Phân biệt RESTful API (JSON, học kỳ này) với SOAP (XML, học ở môn Hệ phân tán).
* **Lập trình DOM, tính bất đồng bộ của JavaScript & Cú pháp JSON:**
  * [PL1-B01 `37:27`–`46:01`](https://www.youtube.com/watch?v=4W27ZZ8sKfc&t=37m27s) | [PL2-B01 `42:10`–`51:40`](https://www.youtube.com/watch?v=1edL45bgl2g&t=42m10s): JS chạy bất đồng bộ mặc định; cây DOM truy xuất qua `document.getElementById` (cấm trùng ID trên 1 trang) và `innerHTML`.
  * [PL1-B01 `50:00`–`55:04`](https://www.youtube.com/watch?v=4W27ZZ8sKfc&t=50m00s) | [PL2-B01 `54:23`–`01:03:11`](https://www.youtube.com/watch?v=1edL45bgl2g&t=54m23s): JSON thay XML giảm tải băng thông; `JSON.parse()` (chuỗi → Object) và `JSON.stringify()` (Object → chuỗi).
* **Bản chất giá trị `null` & Logic 3 trạng thái (Three-Valued Logic):**
  * [PL1-B01 `58:30`–`01:07:58`](https://www.youtube.com/watch?v=4W27ZZ8sKfc&t=58m30s) | [PL2-B01 `01:03:11`–`01:18:24`](https://www.youtube.com/watch?v=1edL45bgl2g&t=1h03m11s): `null` là *"chưa xác định"* (`true && null = null`, `true || null = true`, `false || null = null`). *(Tại `PL1-B01 [01:04:57]`, thầy gọi trực tiếp thành viên nhóm Bùi Dương Diễm trả lời câu này).*

### Chuyên đề 2: Nền tảng OOP Java cho Kiến trúc Backend
* **Abstract Class & Abstract Method:**
  * [PL1-B02 `20:55`–`28:13`](https://www.youtube.com/watch?v=52z3OYV0Tn8&t=20m55s) | [PL2-B02 `10:44`–`25:30`](https://www.youtube.com/watch?v=aUrPVaKcCBs&t=10m44s): Phương thức `abstract` chỉ có chữ ký (signature), **không có thân hàm `{}`**; lớp chứa phương thức `abstract` bắt buộc khai báo `abstract class` và cấm `new` trực tiếp; lớp con phải `@Override` viết thân hàm `{}`.
* **Encapsulation, Constructor & Interface chuẩn hóa dự án nhóm:**
  * [PL1-B02 `31:26`–`48:45`](https://www.youtube.com/watch?v=52z3OYV0Tn8&t=31m26s) | [PL2-B02 `30:12`–`46:13`](https://www.youtube.com/watch?v=aUrPVaKcCBs&t=30m12s): Thuộc tính `private` + Getter/Setter; Tech Lead định nghĩa `interface` làm hợp đồng chung để các thành viên `implements` đồng bộ.
* **Kiểm tra kiểu `instanceof` & Ép kiểu Downcasting:**
  * [PL1-B02 `02:08:38`–`02:28:10`](https://www.youtube.com/watch?v=52z3OYV0Tn8&t=2h08m38s) | [PL2-B02 `01:25:19`–`01:35:17`](https://www.youtube.com/watch?v=aUrPVaKcCBs&t=1h25m19s): Kiểm tra `if (p instanceof Student)` trước khi ép kiểu `Student s = (Student) p;`.

### Chuyên đề 3: Dựng Server Spring Boot, Maven, Thymeleaf & Kiến trúc Hybrid SPA
* **Spring Initializr (`start.spring.io`) & Quản lý `pom.xml`:**
  * [PL1-B03 `07:40`–`13:38`](https://www.youtube.com/watch?v=bu4zCN4I1nA&t=7m40s) | [PL2-S03 `07:26`–`15:06`](https://www.youtube.com/watch?v=vKwPAa3xagE&t=7m26s): Chọn Maven, Java 17/21, Packaging `Jar`, `Spring Web`, `Thymeleaf`, `MySQL Driver`. **Quy tắc sống còn:** `start.spring.io` chỉ dùng đúng **1 lần duy nhất** lúc khởi tạo; về sau thêm/bớt thư viện phải sửa trực tiếp trong `pom.xml` và chạy `Maven -> Update Project` ([PL1-B03 `55:42`–`58:20`](https://www.youtube.com/watch?v=bu4zCN4I1nA&t=55m42s)).
* **Embedded Tomcat & Quy chuẩn thư mục MVC:**
  * [PL1-B03 `59:19`–`01:05:18`](https://www.youtube.com/watch?v=bu4zCN4I1nA&t=59m19s) | [PL2-S03 `58:00`–`01:07:18`](https://www.youtube.com/watch?v=vKwPAa3xagE&t=58m00s): Chạy hàm `main` (`@SpringBootApplication`), kích hoạt Tomcat nhúng; file HTML của Thymeleaf đặt trong `src/main/resources/templates/`, tài nguyên tĩnh đặt trong `src/main/resources/static/`.
* **Thymeleaf Engine & Quan hệ Master–Detail:**
  * [PL2-S04 `06:29`–`29:02`](https://www.youtube.com/watch?v=xMQSY7vEis4&t=6m29s): Controller nạp dữ liệu qua `model.addAttribute("list", ...)`, View lặp bằng `th:each` và hiển thị bằng `th:text`.
* **Xây dựng `@Service`, `@RestController`, Jackson & Truyền tham số API:**
  * [PL2-B05 `31:16`–`47:10`](https://www.youtube.com/watch?v=acNPtD44jWU&t=31m16s) | [PL1-B06 `22:06`–`35:16`](https://www.youtube.com/watch?v=SMDSzotHLF0&t=22m06s): Cấm dùng MockAPI; Jackson tự động serialize Object/List sang JSON; phân biệt `@PathVariable` (`/api/faculty/{id}/students` — định danh tài nguyên) và `@RequestParam` (`?facultyId=2` — lọc/tìm kiếm).
* **Quy tắc phân chia Package, Bẫy tải trang > 3 giây & Relative URL:**
  * [PL1-B07 `02:02:26`–`02:05:42`](https://www.youtube.com/watch?v=XpgBaeJS1JI&t=2h02m26s) | [PL2-S06 `04:04`–`05:54`](https://www.youtube.com/watch?v=EoHY6QTINhU&t=4m04s): Bắt buộc tách subpackage `.controller`, `.service`, `.repository`, `.entity` dưới root package để Spring Component Scan nhận diện.
  * [PL1-B08 `06:35`–`14:28`](https://www.youtube.com/watch?v=YxOeRIoG_dI&t=6m35s) | [PL2-S07 `16:24`–`23:46`](https://www.youtube.com/watch?v=64I1w6eXR4g&t=16m24s): Danh mục ít phần tử phải có sẵn ngay từ server (< 3 giây), cấm đợi `window.onload` mới gọi API nạp combobox; tương tác động (lọc, bảng chi tiết, CRUD) dùng JS Fetch/AJAX.
  * [PL1-B08 `01:41:00`](https://www.youtube.com/watch?v=YxOeRIoG_dI&t=1h41m00s) | [PL2-S07 `23:46`–`26:57`](https://www.youtube.com/watch?v=64I1w6eXR4g&t=23m46s): Gọi API cùng server bắt buộc dùng đường dẫn tương đối `/api/...`, cấm hardcode `http://localhost:8080`.

### Chuyên đề 4: Cơ Sở Dữ Liệu MySQL, Spring Data JPA & Quan Hệ Thực Thể
* **Cài đặt MySQL + Workbench & Nguyên lý JPA Code-First:**
  * [PL1-B09 `04:39`–`08:26`](https://www.youtube.com/watch?v=tsVNKKGGZRA&t=4m39s) | [PL2-S08 `04:16`–`15:00`](https://www.youtube.com/watch?v=GLNPlwPn_bg&t=4m16s): Cài MySQL Server Core + MySQL Workbench, quản trị bằng tài khoản `root`.
  * [PL1-B09 `37:42`–`47:32`](https://www.youtube.com/watch?v=tsVNKKGGZRA&t=37m42s) | [PL2-S08 `35:54`–`47:32`](https://www.youtube.com/watch?v=GLNPlwPn_bg&t=35m54s): Annotations `@Entity`, `@Table(name=...)`, `@Id`, `@Column(length, nullable, unique)` tự động sinh bảng trong MySQL; `JpaRepository<Entity, ID>` đóng vai trò *"tàng thư / cái kho dữ liệu"*.
* **ERD vs Physical Schema, JPA Relationships, Circular Reference & Cascade:**
  * [PL1-B10 `12:00`–`20:43`](https://www.youtube.com/watch?v=puX0LDumypE&t=12m00s) | [PL2-S09 `07:49`–`16:40`](https://www.youtube.com/watch?v=Ac686eKMcd4&t=7m49s): Phân biệt Lược đồ phân tích (ERD) và Lược đồ vật lý trên Workbench; cảnh báo sửa ERD giữa chừng sẽ làm gãy toàn bộ tầng code phía trên.
  * [PL1-B10 `28:53`–`33:40`](https://www.youtube.com/watch?v=puX0LDumypE&t=28m53s) | [PL2-S09 `26:16`–`35:07`](https://www.youtube.com/watch?v=Ac686eKMcd4&t=26m16s): Cấu hình `@ManyToOne` + `@JoinColumn` ở bên Nhiều và `@OneToMany(mappedBy = "...")` ở bên Một; xử lý bẫy **Circular Reference** (lặp vô tận khi xuất JSON) và chiến lược **Cascade vs Dữ liệu mồ côi (Orphan Data)**.
