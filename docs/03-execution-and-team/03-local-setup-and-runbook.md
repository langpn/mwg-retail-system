# 03. Hướng Dẫn Cài Đặt Cục Bộ & Vận Hành Trước Giờ Vấn Đáp (Runbook)

> **Chủ đề nguyên tử (Atomic Scope):** Quy trình chuẩn bị môi trường máy tính cho các thành viên nhóm (Lang, Diễm, Toàn), khởi chạy ứng dụng một lệnh, quy trình build lại giao diện khi sửa Frontend, và Checklist 10 phút trước khi vào phòng chấm thi.
>
> **Không chứa:** Đặc tả kiến trúc (xem [`../02-architecture-and-specs/01-system-architecture.md`](../02-architecture-and-specs/01-system-architecture.md)).

---

## 1. Yêu Cầu Môi Trường Chuẩn (Đúng Bộ Công Cụ Của Môn Học)

Theo quy định công cụ của thầy ([PL1-B01 `25:20`–`27:26`](https://www.youtube.com/watch?v=4W27ZZ8sKfc&t=25m20s), [PL1-B11 `44:04`–`46:20`](https://www.youtube.com/watch?v=_0lFUb8cU4I&t=44m04s)):
1. **JDK 17 LTS** (hoặc JDK 21).
2. **MySQL Community Server 8.0** (chạy cổng `3306`) + **MySQL Workbench** (nhớ kỹ mật khẩu tài khoản `root` — [PL1-B09 `07:28`](https://www.youtube.com/watch?v=tsVNKKGGZRA&t=7m28s)).
3. **Eclipse IDE for Enterprise Java and Web Developers (Eclipse EE)** hoặc VS Code / IntelliJ IDEA.
4. **Postman** (kiểm thử REST API) & **Git** (đồng bộ mã nguồn nhóm).
5. *(Chỉ cần khi sửa code giao diện trong `frontend/`)*: **Node.js 20+** & **pnpm**. Nếu chỉ kéo code về chạy demo, **không cần cài Node.js** vì bundle tĩnh đã nằm sẵn trong `backend/src/main/resources/static/`.

---

## 2. Khởi Chạy Toàn Bộ Hệ Thống (Chỉ 1 Lệnh Duy Nhất)

### Bước 1: Kéo mã nguồn mới nhất
```bash
git clone https://github.com/langpn/mwg-retail-system.git
cd mwg-retail-system
```

### Bước 2: Kiểm tra kết nối MySQL
* Đảm bảo dịch vụ MySQL Server đang chạy ở cổng `3306`.
* Nhờ tham số `createDatabaseIfNotExist=true` trong `backend/src/main/resources/application.properties`, hệ thống sẽ **tự động tạo schema `mwg-retail-system`**, Hibernate (`ddl-auto=update`) tự động sinh 10 bảng, và `DataSeeder.java` tự động nạp sẵn dữ liệu mẫu ngay lần chạy đầu tiên!
* Nếu mật khẩu `root` trên máy cá nhân của bạn khác cấu hình mặc định, truyền qua biến môi trường hoặc sửa dòng `spring.datasource.password` trên máy local (không commit mật khẩu cá nhân lên Git).

### Bước 3: Chạy Spring Boot Server (Cổng `8088`)
```bash
# Trên macOS / Linux:
cd backend && ./mvnw spring-boot:run

# Trên Windows (CMD / PowerShell):
cd backend && mvnw.cmd spring-boot:run
```

### Bước 4: Kiểm tra các địa chỉ hoạt động
* **Trang chủ bán lẻ & Ma trận tồn kho:** `http://localhost:8088`
* **Trang Quản trị viên (Admin CRUD 100%):** `http://localhost:8088/dashboard`
* **Kiểm tra nhanh JSON từ REST API:** `http://localhost:8088/api/v1/products`

> **Phương án cứu hộ khẩn cấp (nếu MySQL trên laptop gặp sự cố sát giờ thi):**
> Chạy bằng profile `dev` (sử dụng H2 In-Memory Database đã cấu hình sẵn):
> ```bash
> cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
> ```

---

## 3. Quy Trình Build Lại Khi Chỉnh Sửa Giao Diện (`frontend/`)

Khi bất kỳ thành viên nào sửa code trong `frontend/app/` hoặc `frontend/components/`, thực hiện 2 lệnh sau để xuất tĩnh sang Spring Boot:

```bash
# 1. Build gói tĩnh Next.js ra thư mục frontend/out/
cd frontend
pnpm install
pnpm test          # 17 unit test cho module thuần (giá, map dữ liệu, ghép tồn kho)
npx tsc --noEmit   # kiểm tra kiểu nghiêm, phải ra 0 lỗi
pnpm build

# 2. Đồng bộ sạch sang thư mục static của Spring Boot
rsync -a --delete out/ ../backend/src/main/resources/static/
```

---

## 4. Checklist "10 Phút Vàng" Trước Khi Bước Vào Phòng Giáo Viên

- [ ] **1. Cuốn Báo Cáo giấy (≤ 17 trang):** Đã in đóng quyển sạch đẹp cầm sẵn trên tay ([PL1-B11 `00:00`](https://www.youtube.com/watch?v=_0lFUb8cU4I&t=0s)).
- [ ] **2. Tắt phụ thuộc Internet:** Thử ngắt Wi-Fi và F5 lại `http://localhost:8088` để chắc chắn 100% ứng dụng chạy mượt hoàn toàn offline.
- [ ] **3. Mở sẵn 4 cửa sổ làm việc trên màn hình Laptop:**
  1. **IDE (Eclipse EE / IntelliJ):** Mở sẵn cấu trúc package `entity`, `repository`, `service`, `controller` gọn gàng.
  2. **MySQL Workbench:** Mở sẵn schema `mwg-retail-system` (kiểm tra chắc chắn chỉ có 10 bảng MWG, không có bảng lạ) và tab sơ đồ **EER Diagram** có dây nối khóa ngoại.
  3. **Trình duyệt Web:** Tab 1 mở `http://localhost:8088`, Tab 2 mở `http://localhost:8088/dashboard`, Tab 3 mở kết quả JSON thô `http://localhost:8088/api/v1/products`.
  4. **Postman:** Mở sẵn bộ request `GET`, `POST`, `PUT`, `DELETE` đã chạy ra `200 OK` / `201 Created`.
