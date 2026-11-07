# GLOSSARY — MWG Retail System

> Từ vựng miền (domain) dùng thống nhất trong code, tài liệu và báo cáo. Khi đặt tên class, hàm, hay viết tài liệu mới, dùng đúng các từ dưới đây.

## Nghiệp vụ

| Thuật ngữ | Định nghĩa | Nằm ở đâu trong code |
| :--- | :--- | :--- |
| **Product** | Một mặt hàng điện máy, định danh bằng `sku` (ví dụ `DMX-MG-001`). Có giá bán, danh mục, thương hiệu. | `entity/Product.java`, `Product` trong `frontend/lib/dmx-data.ts` |
| **Category** | Nhóm mặt hàng. Backend dùng mã chữ hoa (`MAYGIAT`, `TULANH`, `TIVI`, `GIADUNG`); frontend dùng khoá ngắn (`washer`, `fridge`, `tv`, `small`). Việc dịch mã chỉ nằm trong `frontend/lib/catalog.ts`. | `entity/Category.java`, `lib/catalog.ts` |
| **Brand** | Thương hiệu (Toshiba, Samsung, LG, Panasonic). | `entity/Brand.java` |
| **Branch** | Siêu thị chi nhánh. Backend định danh bằng số (`id`); frontend dùng khoá (`q9`, `td`). Bảng dịch nằm trong `lib/catalog.ts`, khớp theo `district`. | `entity/StoreBranch.java`, `BRANCHES` trong `lib/dmx-data.ts` |
| **Inventory** | Số lượng tồn của một Product tại một Branch. Một cặp (Product, Branch) chỉ có một dòng. | `entity/Inventory.java`, `GET /api/v1/inventory/stock-matrix` |
| **Stock matrix** | Toàn bộ Inventory của mọi chi nhánh, dạng phẳng, lấy trong một request. | `dto/StockEntry.java` |
| **Customer** | Khách hàng thành viên, định danh bằng số điện thoại. | `entity/Customer.java` |
| **Order** | Đơn đặt hàng, gồm nhiều dòng hàng (`OrderItem`), thuộc một Customer, tuỳ chọn gắn một Promotion. | `entity/CustomerOrder.java`, `entity/OrderItem.java` |
| **Order quote** | Báo giá chỉ đọc cho một Order dự kiến: dòng hàng, tạm tính, giảm giá, tổng tiền. Không ghi CSDL. | `service/OrderPricingService.java`, `dto/OrderQuote.java` |
| **Order pricing** | Module duy nhất quyết định tiền: đơn giá, tạm tính, giảm giá, tổng. Màn hình và đơn đã lưu dùng chung kết quả này. | `service/OrderPricingService.java` |
| **Cart** | Giỏ hàng phía trình duyệt. Chỉ tồn tại ở frontend, lưu trong `localStorage`. | `components/dmx/store-provider.tsx` |
| **Promotion** | Mã khuyến mãi, gồm phần trăm giảm và mức giảm tối đa tuỳ chọn (`maxDiscountAmount`). | `entity/Promotion.java` |
| **Discount** | Số tiền giảm, tính bằng `min(round(subtotal × percent / 100), maxDiscountAmount)`, làm tròn tới đồng. | `OrderPricingService.quote()` |

## Kiến trúc

| Thuật ngữ | Định nghĩa |
| :--- | :--- |
| **Module** | Bất cứ thứ gì có interface và implementation: một hàm, một class, một package, hay một lát cắt xuyên tầng. |
| **Interface** | Mọi điều caller phải biết để dùng module đúng: kiểu dữ liệu, ràng buộc, thứ tự gọi, kiểu lỗi. |
| **Depth** | Lượng hành vi mà caller hoặc test chạm tới được trên mỗi đơn vị interface phải học. Interface nhỏ, implementation lớn là **deep**. |
| **Seam** | Chỗ có thể đổi hành vi mà không sửa tại chỗ đó. Online/offline của Catalog là một seam thật vì có hai adapter. |
| **Adapter** | Thứ cụ thể lấp vào seam: `onlineCatalog` (gọi HTTP) và `offlineCatalog` (dữ liệu mẫu). |
| **Locality** | Lợi ích cho người bảo trì: thay đổi và lỗi tập trung ở một chỗ. |
| **Leverage** | Lợi ích cho caller: một implementation phục vụ nhiều chỗ gọi và nhiều test. |

## Quy ước đặt tên

- Backend: `XxxApiController` → `XxxService` → `XxxRepository`. Module có quy tắc nghiệp vụ thật thì đặt tên theo nghiệp vụ (`OrderPricingService`), không đặt theo tầng.
- Frontend: `lib/<domain>.ts` cho module thuần (dễ test), `components/<khu vực>/` cho giao diện. Không đặt tên file theo framework.
