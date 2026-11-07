# 01. Ma Trận Phân Hoạch Dọc (Vertical Slicing) Cho Nhóm 3 Thành Viên

> **Chủ đề nguyên tử (Atomic Scope):** Quy định ranh giới sở hữu mã nguồn, giao diện và phần viết báo cáo của từng thành viên trong nhóm 3 người theo đúng nguyên tắc **Phân hoạch dọc** của giảng viên.
>
> **Không chứa:** Lộ trình sửa lỗi/nâng cấp code (xem [`02-master-execution-roadmap.md`](./02-master-execution-roadmap.md)) hoặc hướng dẫn cài máy (xem [`03-local-setup-and-runbook.md`](./03-local-setup-and-runbook.md)).

---

## 1. Căn Cứ Bắt Buộc Từ Giảng Viên (Kèm Mốc Thời Gian)

1. **Quy mô nhóm 3 sinh viên:** [PL1-B01 `01:16:30`](https://www.youtube.com/watch?v=4W27ZZ8sKfc&t=1h16m30s) | [PL2-B01 `01:21:05`](https://www.youtube.com/watch?v=1edL45bgl2g&t=1h21m05s).
2. **Cấm tuyệt đối phân hoạch ngang — Bắt buộc phân hoạch dọc:**
   * **Lời thầy:** Không được để 1 bạn chỉ chuyên viết báo cáo, 1 bạn chỉ chuyên code; tất cả thành viên đều phải vừa viết code vừa viết phần báo cáo tương ứng ([PL1-B01 `01:39:14`](https://www.youtube.com/watch?v=4W27ZZ8sKfc&t=1h39m14s) | [PL2-B01 `01:44:15`–`01:44:37`](https://www.youtube.com/watch?v=1edL45bgl2g&t=1h44m15s)).
3. **Trách nhiệm giải trình chéo 100% mã nguồn:**
   * **Lời thầy:** Khi vấn đáp, thầy chỉ vào dòng code bất kỳ, thành viên được hỏi **cấm nói *"Đoạn này bạn kia làm / AI làm em không biết"*** — vi phạm bị đánh rớt ngay tại chỗ ([PL1-B01 `01:43:18`](https://www.youtube.com/watch?v=4W27ZZ8sKfc&t=1h43m18s) | [PL2-B01 `01:48:23`](https://www.youtube.com/watch?v=1edL45bgl2g&t=1h48m23s)).

---

## 2. Bản Đồ Phân Hoạch Dọc Trọn Vẹn (`Entity` → `Repo` → `Service` → `API` → `UI` → `Báo cáo`)

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                    MÔ HÌNH PHÂN HOẠCH DỌC 3 NHÁNH NGHIỆP VỤ (10 BẢNG — 29 APIs)                 │
├────────────────────────────────┬────────────────────────────────┬───────────────────────────────┤
│ 🏷️ NHÁNH 1: SẢN PHẨM & DANH MỤC│ 🏬 NHÁNH 2: KHO CHI NHÁNH &    │ 🛒 NHÁNH 3: ĐƠN HÀNG, KHÁCH   │
│ Phụ trách: PHẠM NGỌC LANG      │    ĐÁNH GIÁ                    │    HÀNG & KHUYẾN MÃI          │
│ (Thành viên - MSSV: 25765251)  │ Phụ trách: BÙI DƯƠNG DIỄM      │ Phụ trách: NGUYỄN THANH TOÀN  │
│                                │ (Nhóm trưởng - MSSV: 25765281) │ (Thành viên - MSSV: 25765051) │
├────────────────────────────────┼────────────────────────────────┼───────────────────────────────┤
│ [1] Tầng Entity (3 bảng):      │ [1] Tầng Entity (3 bảng):      │ [1] Tầng Entity (4 bảng):     │
│ • Category.java                │ • StoreBranch.java             │ • Customer.java               │
│ • Brand.java                   │ • Inventory.java               │ • Promotion.java              │
│ • Product.java                 │ • ProductReview.java           │ • CustomerOrder.java          │
│                                │                                │ • OrderItem.java              │
├────────────────────────────────┼────────────────────────────────┼───────────────────────────────┤
│ [2] Tầng Repository (3 kho):   │ [2] Tầng Repository (3 kho):   │ [2] Tầng Repository (4 kho):  │
│ • CategoryRepository           │ • StoreBranchRepository        │ • CustomerRepository          │
│ • BrandRepository              │ • InventoryRepository          │ • PromotionRepository         │
│ • ProductRepository            │ • ProductReviewRepository      │ • CustomerOrderRepository     │
│                                │                                │ • OrderItemRepository         │
├────────────────────────────────┼────────────────────────────────┼───────────────────────────────┤
│ [3] Tầng Service & Hạ tầng:    │ [3] Tầng Service & DTO:        │ [3] Tầng Service & DTO:       │
│ • ProductCatalogService        │ • InventoryService             │ • OrderService (@Tx trừ kho)  │
│ • DataSeeder, RoutingFilter    │ • ProductReviewService         │ • CustomerService             │
│ • pom.xml, application.prop    │ • StockUpdateRequest (DTO)     │ • PromotionService            │
│                                │                                │ • CreateOrderRequest, ItemReq │
├────────────────────────────────┼────────────────────────────────┼───────────────────────────────┤
│ [4] Tầng Controller (7 APIs):  │ [4] Tầng Controller (8 APIs):  │ [4] Tầng Controller (14 APIs):│
│ • ProductApiController         │ • InventoryApiController (4)   │ • OrderApiController (4)      │
│   (/api/v1/products/**)        │ • ProductReviewApiController(4)│ • CustomerApiController (5)   │
│ • (+ MVC @Controller mồi)      │                                │ • PromotionApiController (5)  │
├────────────────────────────────┼────────────────────────────────┼───────────────────────────────┤
│ [5] Tầng Giao diện (Frontend): │ [5] Tầng Giao diện (Frontend): │ [5] Tầng Giao diện (Frontend):│
│ • Trang chủ (/) — Lưới SP & lọc│ • Tab Ma trận tồn kho chi nhánh│ • Giỏ hàng (/cart) & Voucher  │
│ • Chi tiết SP (/product/[sku]) │ • Khối tồn kho & Review trên SP│ • Thanh toán (/checkout)      │
│ • Dashboard Tab Sản phẩm       │ • Dashboard Tab Kho & Đánh giá │ • Dashboard Đơn, Khách, KM    │
├────────────────────────────────┼────────────────────────────────┼───────────────────────────────┤
│ [6] Phụ trách Cuốn Báo Cáo:    │ [6] Phụ trách Cuốn Báo Cáo:    │ [6] Phụ trách Cuốn Báo Cáo:   │
│ • Kiến trúc 3 tầng, Công nghệ  │ • Bối cảnh bài toán đa kho ĐMX │ • Luồng đặt hàng & trừ kho    │
│ • Đặc tả Bảng 1–3 & API 1–7    │ • Use Case, Bảng 4–6 & API 8–15│ • Bảng 7–10, API 16–29 & In ấn│
└────────────────────────────────┴────────────────────────────────┴───────────────────────────────┘
```

---

## 3. Quy Tắc Review Chéo Bắt Buộc Trước Ngày Bảo Vệ

Để đảm bảo không ai rơi vào bẫy 0 điểm ([PL1-B01 `01:43:18`](https://www.youtube.com/watch?v=4W27ZZ8sKfc&t=1h43m18s)), cả 3 thành viên bắt buộc thực hiện buổi **Code Walkthrough 60 phút** theo kịch bản:
1. **Lang giải thích cho Diễm & Toàn:** Cách `Product` nối khóa ngoại sang `Category` & `Brand`, cách `StaticPageRoutingFilter` phục vụ giao diện tĩnh và cách lọc đa tiêu chí hoạt động.
2. **Diễm giải thích cho Lang & Toàn:** Ràng buộc `@UniqueConstraint(product_id, branch_id)` trên bảng `Inventory` và luồng `PUT /api/v1/inventory/update` cập nhật số lượng kho trực tiếp.
3. **Toàn giải thích cho Lang & Diễm:** Luồng `@Transactional` trong `OrderService.createOrder()` — kiểm tra tồn kho đủ hay thiếu → áp mã giảm giá `Promotion` → lưu `CustomerOrder` & `OrderItem` (lưu cứng `unitPrice`) → trừ `inventory.quantity`.
