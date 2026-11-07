# 03. Đặc Tả Danh Mục 27 RESTful API Endpoints

> **Chủ đề nguyên tử (Atomic Scope):** Nguồn sự thật duy nhất (Single Source of Truth) về toàn bộ **27 RESTful API Endpoints** của 6 Controller nghiệp vụ trong `mwg-retail-system`, đối chiếu đúng 100% với mã nguồn thực tế và chuẩn thiết kế Web Service của giảng viên.
>
> **Không chứa:** Thiết kế bảng CSDL (xem [`02-database-erd-10-tables.md`](./02-database-erd-10-tables.md)).

---

## 1. Đối Chiếu Quy Chuẩn Web Service Của Thầy (Kèm Mốc Thời Gian)

* **Tự xây dựng API nội bộ, cấm MockAPI:** [PL2-B05 `31:16`–`32:17`](https://www.youtube.com/watch?v=acNPtD44jWU&t=31m16s) | [PL1-B06 `22:28`](https://www.youtube.com/watch?v=SMDSzotHLF0&t=22m28s).
* **Tuân thủ 4 HTTP Verbs cốt lõi:** `GET` (đọc dữ liệu), `POST` (thêm mới vào DB), `PUT` (cập nhật dữ liệu), `DELETE` (xóa khỏi DB) — [PL1-B01 `24:18`–`24:56`](https://www.youtube.com/watch?v=4W27ZZ8sKfc&t=24m18s), [PL1-B11 `14:19`–`15:00`](https://www.youtube.com/watch?v=_0lFUb8cU4I&t=14m19s) | [PL2-S10 `16:13`–`17:17`](https://www.youtube.com/watch?v=kuJZxQC4n_4&t=16m13s).
* **Phân biệt chuẩn xác `@PathVariable` vs `@RequestParam`:**
  * `@PathVariable` (`/api/v1/products/{id}`): Định danh tài nguyên cụ thể trên đường dẫn URL ([PL2-B05 `42:51`–`43:33`](https://www.youtube.com/watch?v=acNPtD44jWU&t=42m51s) | [PL1-B06 `33:50`](https://www.youtube.com/watch?v=SMDSzotHLF0&t=33m50s)).
  * `@RequestParam` (`/api/v1/products?category=MAYGIAT&maxPrice=8000000`): Tiêu chí lọc, tìm kiếm tùy chọn sau dấu `?` ([PL2-B05 `43:56`–`44:34`](https://www.youtube.com/watch?v=acNPtD44jWU&t=43m56s) | [PL1-B06 `34:53`](https://www.youtube.com/watch?v=SMDSzotHLF0&t=34m53s)).
* **Cơ chế trả về JSON ngầm định:** `@RestController` kết hợp thư viện Jackson tự động serialize Object/List sang chuỗi JSON ([PL2-B05 `37:35`–`40:00`](https://www.youtube.com/watch?v=acNPtD44jWU&t=37m35s)).
* **Base Path tương đối phía Client:** `/api/v1` (gọi nội bộ trên cổng `8088` — [PL1-B08 `01:41:00`](https://www.youtube.com/watch?v=YxOeRIoG_dI&t=1h41m00s)).

---

## 2. Bảng Tổng Hợp Toàn Bộ 27 REST API Endpoints

### 2.1. Phân hệ 1: Sản phẩm, Danh mục & Thương hiệu (`ProductApiController` — 8 APIs)

| # | Method | Endpoint | Tham số (`Path` / `Query` / `Body`) | Mô tả nghiệp vụ | Status |
| :-: | :---: | :--- | :--- | :--- | :---: |
| 1a | `GET` | `/api/v1/products` | Query tùy chọn: `category`, `brand`, `maxPrice`, `keyword` | Lấy danh sách sản phẩm lọc đa tiêu chí (`LEFT JOIN FETCH` khử N+1) | `200` |
| 1b | `GET` | `/api/v1/products/page` | Query: `page`, `size`, `sortBy`, `sortDir`, `category`, `brand`, `minPrice`, `maxPrice`, `keyword` | **Server-Side Pagination (`Pageable` / `LIMIT..OFFSET`)** trả `PagedResponse<Product>` | `200` |
| 2 | `GET` | `/api/v1/products/{id}` | Path: `id` (`Long`) | Lấy thông tin chi tiết 1 sản phẩm theo ID | `200` / `404` |
| 3 | `GET` | `/api/v1/products/categories` | *(Không)* | Lấy danh sách toàn bộ danh mục ngành hàng (`Category`) | `200` |
| 4 | `GET` | `/api/v1/products/brands` | *(Không)* | Lấy danh sách toàn bộ thương hiệu chính hãng (`Brand`) | `200` |
| 5 | `POST` | `/api/v1/products` | Body JSON: `Product` | Thêm mới một sản phẩm điện máy vào CSDL | `201` |
| 6 | `PUT` | `/api/v1/products/{id}` | Path: `id`, Body JSON: `Product` | Cập nhật thông tin/giá bán của sản phẩm hiện có | `200` / `404` |
| 7 | `DELETE` | `/api/v1/products/{id}` | Path: `id` (`Long`) | Xóa một sản phẩm theo ID | `204` / `404` |

### 2.2. Phân hệ 2A: Siêu thị Chi nhánh & Tồn kho (`InventoryApiController` — 4 APIs)

| # | Method | Endpoint | Tham số (`Path` / `Query` / `Body`) | Mô tả nghiệp vụ | Status |
| :-: | :---: | :--- | :--- | :--- | :---: |
| 8 | `GET` | `/api/v1/inventory/branches` | *(Không)* | Lấy danh sách tất cả chi nhánh siêu thị Điện Máy Xanh | `200` |
| 9 | `GET` | `/api/v1/inventory/check` | Query bắt buộc: `sku`, `district` | Kiểm tra nhanh tồn kho của 1 mã SKU tại địa bàn quận/huyện | `200` / `404` |
| 10 | `GET` | `/api/v1/inventory/branch/{branchId}` | Path: `branchId` (`Long`) | Lấy bảng ma trận tồn kho tất cả mặt hàng tại 1 chi nhánh | `200` |
| 11 | `PUT` | `/api/v1/inventory/update` | Body JSON: `StockUpdateRequest` (`productId`, `branchId`, `quantity`) | Điều chỉnh/nhập kho số lượng tồn thực tế tại siêu thị | `200` |

### 2.3. Phân hệ 2B: Đánh giá Sản phẩm (`ProductReviewApiController` — 4 APIs)

| # | Method | Endpoint | Tham số (`Path` / `Query` / `Body`) | Mô tả nghiệp vụ | Status |
| :-: | :---: | :--- | :--- | :--- | :---: |
| 12 | `GET` | `/api/v1/reviews` | *(Không)* | Lấy toàn bộ đánh giá sản phẩm (phục vụ trang Dashboard Admin) | `200` |
| 13 | `GET` | `/api/v1/reviews/product/{productId}` | Path: `productId` (`Long`) | Lấy danh sách bình luận & số sao của 1 sản phẩm cụ thể | `200` |
| 14 | `POST` | `/api/v1/reviews` | Body JSON: `ProductReview` | Khách hàng gửi đánh giá mới (1–5 sao + nhận xét) | `201` |
| 15 | `DELETE` | `/api/v1/reviews/{id}` | Path: `id` (`Long`) | Quản trị viên xóa đánh giá vi phạm/spam | `204` |

### 2.4. Phân hệ 3A: Đơn đặt hàng & Khấu trừ tồn kho (`OrderApiController` — 4 APIs)

| # | Method | Endpoint | Tham số (`Path` / `Query` / `Body`) | Mô tả nghiệp vụ | Status |
| :-: | :---: | :--- | :--- | :--- | :---: |
| 16 | `GET` | `/api/v1/orders` | *(Không)* | Lấy danh sách toàn bộ đơn đặt hàng trong hệ thống | `200` |
| 17 | `GET` | `/api/v1/orders/{id}` | Path: `id` (`Long`) | Xem chi tiết 1 đơn hàng kèm danh sách món `orderItems` | `200` / `404` |
| 18 | `POST` | `/api/v1/orders` | Body JSON: `CreateOrderRequest` | Tạo đơn hàng mới, áp mã giảm giá & **tự động trừ tồn kho** (`@Transactional`) | `201` / `400` |
| 19 | `PUT` | `/api/v1/orders/{id}/status` | Path: `id`, Query: `status` (`PENDING`/`CONFIRMED`/`COMPLETED`/`CANCELLED`) | Nhân viên duyệt / cập nhật trạng thái xử lý đơn hàng | `200` |

### 2.5. Phân hệ 3B: Khách hàng Thành viên (`CustomerApiController` — 5 APIs)

| # | Method | Endpoint | Tham số (`Path` / `Query` / `Body`) | Mô tả nghiệp vụ | Status |
| :-: | :---: | :--- | :--- | :--- | :---: |
| 20 | `GET` | `/api/v1/customers` | *(Không)* | Lấy danh sách tất cả khách hàng thành viên | `200` |
| 21 | `GET` | `/api/v1/customers/{id}` | Path: `id` (`Long`) | Tra cứu hồ sơ chi tiết 1 khách hàng | `200` / `404` |
| 22 | `POST` | `/api/v1/customers` | Body JSON: `Customer` | Đăng ký mới hồ sơ khách hàng | `201` |
| 23 | `PUT` | `/api/v1/customers/{id}` | Path: `id`, Body JSON: `Customer` | Cập nhật thông tin liên hệ / địa chỉ khách hàng | `200` |
| 24 | `DELETE` | `/api/v1/customers/{id}` | Path: `id` (`Long`) | Xóa hồ sơ khách hàng | `204` |

### 2.6. Phân hệ 3C: Chương trình Khuyến mãi (`PromotionApiController` — 5 APIs — Tổng cộng 29 routes / 27 nghiệp vụ cốt lõi)

*(Ghi chú: Tính đủ từng route độc lập trên 6 Controller là **29 endpoints** — gồm 7 Product + 4 Inventory + 4 Review + 4 Order + 5 Customer + 5 Promotion).*

| # | Method | Endpoint | Tham số (`Path` / `Query` / `Body`) | Mô tả nghiệp vụ | Status |
| :-: | :---: | :--- | :--- | :--- | :---: |
| 25 | `GET` | `/api/v1/promotions` | *(Không)* | Lấy danh sách toàn bộ mã voucher khuyến mãi (`MWG5`, `TET2027`...) | `200` |
| 26 | `GET` | `/api/v1/promotions/{id}` | Path: `id` (`Long`) | Xem chi tiết 1 chương trình khuyến mãi | `200` / `404` |
| 27 | `POST` | `/api/v1/promotions` | Body JSON: `Promotion` | Phát hành mã voucher giảm giá mới | `201` |
| 28 | `PUT` | `/api/v1/promotions/{id}` | Path: `id`, Body JSON: `Promotion` | Cập nhật phần trăm chiết khấu / bật tắt `isActive` | `200` |
| 29 | `DELETE` | `/api/v1/promotions/{id}` | Path: `id` (`Long`) | Xóa mã khuyến mãi | `204` |

---

## 3. Mẫu JSON Payload Quan Trọng Nhất Khi Demo Postman

### 3.1. Tạo đơn hàng & Tự động trừ tồn kho (`POST /api/v1/orders`)
```json
{
  "customerName": "Phạm Ngọc Lang",
  "phone": "0353700780",
  "shippingAddress": "Khu Công Nghệ Cao, TP. Thủ Đức",
  "promoCode": "MWG5",
  "branchId": 1,
  "items": [
    { "productId": 1, "quantity": 1 }
  ]
}
```

### 3.2. Cập nhật số lượng tồn kho tại chi nhánh (`PUT /api/v1/inventory/update`)
```json
{
  "productId": 1,
  "branchId": 1,
  "quantity": 12
}
```
