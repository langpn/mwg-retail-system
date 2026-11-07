# 03. Cẩm Nang Ôn Thi Viết Cuối Kỳ (Thi Giấy — Đóng Tài Liệu 100%)

> **Chủ đề nguyên tử (Atomic Scope):** Tài liệu ôn tập cô đọng phục vụ riêng cho **kỳ thi tự luận trên giấy cuối kỳ (cấm sử dụng tài liệu)**, bám sát 100% cấu trúc đề thi thầy đã công bố tại Buổi 11 ([PL1-B11 `42:41`–`52:38`](https://www.youtube.com/watch?v=_0lFUb8cU4I&t=42m41s) | [PL2-S10 `44:02`–`54:37`](https://www.youtube.com/watch?v=kuJZxQC4n_4&t=44m02s)).
>
> **Không chứa:** Câu hỏi vấn đáp đồ án riêng của nhóm (xem [`02-oral-defense-playbook.md`](./02-oral-defense-playbook.md)).

---

## 1. Cấu Trúc Đề Thi Cuối Kỳ Thầy Đã Chốt

* **Hình thức:** Thi viết trên giấy, **KHÔNG ĐƯỢC MANG TÀI LIỆU** (áp dụng cho cả lớp liên thông và đại trà — [PL1-B11 `50:33`–`52:38`](https://www.youtube.com/watch?v=_0lFUb8cU4I&t=50m33s)).
* **Phạm vi loại trừ:** **Không ra câu hỏi viết code Frontend** (HTML/CSS/DOM đã thi ở giữa kỳ — [PL1-B11 `43:22`–`43:45`](https://www.youtube.com/watch?v=_0lFUb8cU4I&t=43m22s)).
* **3 Phần chắc chắn có trong đề:**
  1. **Câu hỏi liệt kê & nêu công dụng 10 Công cụ Web** ([PL1-B11 `43:45`–`46:27`](https://www.youtube.com/watch?v=_0lFUb8cU4I&t=43m45s)).
  2. **Lý thuyết kiến trúc & nguyên lý nền tảng** (MVC, RESTful API & 4 HTTP Verbs, ORM/JPA, Repository, Dependency Injection, OOP `abstract`/`interface`, logic `null` — [PL1-B11 `46:27`–`47:05`](https://www.youtube.com/watch?v=_0lFUb8cU4I&t=46m27s)).
  3. **Viết đoạn code Backend ngắn khoảng 1 – 1.5 trang giấy** (Entity JPA + Relationship, Repository, Service hoặc REST Controller — [PL1-B11 `47:05`–`50:08`](https://www.youtube.com/watch?v=_0lFUb8cU4I&t=47m05s), [PL1-B06 `02:01:58`](https://www.youtube.com/watch?v=SMDSzotHLF0&t=2h01m58s)).

---

## 2. Câu Chắc Chắn Có Điểm: 10 Công Cụ Web (Và Bẫy Điểm 0 Tuyệt Đối Tránh!)

> 🚨 **CẢNH BÁO BẪY 0 ĐIỂM ([PL1-B11 `45:44`–`46:06`](https://www.youtube.com/watch?v=_0lFUb8cU4I&t=45m44s) | [PL2-S10 `47:41`–`48:05`](https://www.youtube.com/watch?v=kuJZxQC4n_4&t=47m41s)):**
> **TUYỆT ĐỐI KHÔNG GHI `Bootstrap`, `jQuery`, `React`, `Thymeleaf` hay `Hibernate` vào câu hỏi Công cụ Web!** Thầy tuyên bố rõ: đó là các **thư viện / framework**, ai ghi vào câu công cụ sẽ bị **chấm 0 ĐIỂM toàn bộ câu đó ngay lập tức**! *(Nếu chỉ kể được 5 công cụ thì chỉ được nửa số điểm — `PL1-B11 [45:26]`).*

### Học thuộc lòng đúng 10 Công cụ (Tools) chuẩn của thầy:
1. **Eclipse IDE (Enterprise Edition - JEE):** Môi trường lập trình tích hợp phát triển Backend Java & Spring Boot.
2. **Visual Studio Code (VS Code):** Công cụ soạn thảo mã nguồn phát triển giao diện Frontend (HTML/CSS/JS).
3. **Spring Initializr (`start.spring.io`):** Công cụ trực tuyến khởi tạo khung dự án Spring Boot ban đầu.
4. **Apache Maven:** Công cụ quản lý thư viện phụ thuộc (`pom.xml`) và đóng gói/build dự án tự động.
5. **MySQL Community Server:** Hệ quản trị cơ sở dữ liệu quan hệ chạy dịch vụ lưu trữ dữ liệu.
6. **MySQL Workbench:** Công cụ giao diện đồ họa (GUI) thiết kế lược đồ CSDL, quản trị bảng và chạy truy vấn SQL.
7. **Postman:** Công cụ kiểm thử độc lập các RESTful Web Service API (`GET`, `POST`, `PUT`, `DELETE`).
8. **Git / GitHub:** Công cụ quản lý phiên bản phân tán và lưu trữ, phối hợp mã nguồn nhóm.
9. **Web Browser & DevTools (Chrome DevTools):** Công cụ chạy ứng dụng web, kiểm tra cây DOM, Console và gói tin Network JSON.
10. **Command Prompt / Terminal:** Công cụ dòng lệnh hệ thống để thực thi môi trường, chạy server và lệnh Git/Maven.

---

## 3. Tóm Tắt Lý Thuyết Cốt Lõi (Ngắn Gọn Để Viết Giấy)

### 3.1. Kiến trúc MVC vs RESTful Web Service ([PL1-B01 `18:44`–`24:56`](https://www.youtube.com/watch?v=4W27ZZ8sKfc&t=18m44s))
* **MVC (`Model - View - Controller`):**
  * **Controller:** Tiếp nhận HTTP Request từ Client, điều phối luồng xử lý.
  * **Model:** Quản lý cấu trúc dữ liệu, nghiệp vụ và tương tác với CSDL.
  * **View:** Tầng hiển thị giao diện HTML trả về cho người dùng.
* **RESTful Web Service:** Nằm ở **Backend**, **không có View**, trao đổi dữ liệu thô dạng **JSON** qua 4 HTTP Verbs:
  * `GET`: Đọc / lấy dữ liệu từ Server.
  * `POST`: Gửi dữ liệu mới lên Server để lưu vào CSDL.
  * `PUT`: Cập nhật / sửa dữ liệu đã tồn tại trong CSDL.
  * `DELETE`: Xóa dữ liệu khỏi CSDL.

### 3.2. ORM, Spring Data JPA (Code-First) & Dependency Injection ([PL1-B09 `38:56`](https://www.youtube.com/watch?v=tsVNKKGGZRA&t=38m56s), [PL1-B11 `28:00`–`41:56`](https://www.youtube.com/watch?v=_0lFUb8cU4I&t=28m00s))
* **ORM (Object-Relational Mapping):** Kỹ thuật ánh xạ bảng CSDL thành Class Java, dòng thành Object, cột thành thuộc tính. Trong môn học dùng phương pháp **Code-First** (viết Java Entity trước, Hibernate tự sinh bảng MySQL).
* **Repository (`JpaRepository<Entity, ID>`):** Đóng vai trò *"tàng thư / kho dữ liệu"*, sử dụng cú pháp Generic `<...>` để tự động cung cấp các hàm truy vấn CSDL mà không cần viết SQL thủ công.
* **Dependency Injection (IoC):** Thay vì khởi tạo tường minh (*explicit* `new`), lập trình viên gắn các **Annotation `@`** (*implicit*) để Spring Boot tự động quản lý và tiêm phụ thuộc khi cần.

### 3.3. Ôn nhanh OOP & Logic `null` 3 trạng thái ([PL1-B01 `01:03:53`](https://www.youtube.com/watch?v=4W27ZZ8sKfc&t=1h03m53s), [PL1-B02 `20:55`](https://www.youtube.com/watch?v=52z3OYV0Tn8&t=20m55s))
* **Abstract Method vs Concrete Method:** Phương thức `abstract` chỉ có chữ ký (*signature*), **không có thân hàm `{}`**. Class có ít nhất 1 phương thức `abstract` bắt buộc khai báo `abstract class` và không thể `new` trực tiếp; lớp con `extends` phải `@Override` viết thân hàm `{}`.
* **Ép kiểu an toàn đa hình:** Dùng `if (p instanceof Student) { Student s = (Student) p; }`.
* **Bảng chân trị với `null` (*giá trị chưa xác định*):**
  * `true AND null` = **`null`** | `false AND null` = **`false`**
  * `true OR null` = **`true`** | `false OR null` = **`null`**

---

## 4. Khung Code Mẫu Viết Giấy (1 – 1.5 Trang, Thuộc Lòng Là Ăn Trọn Điểm!)

Nếu đề thi yêu cầu thiết kế quan hệ **1 – Nhiều** (ví dụ `Category` 1 – N `Product` hoặc `Faculty` 1 – N `Student`) kèm Repository, Service và REST API CRUD:

```java
// 1. ENTITY BÊN MỘT (Category.java)
@Entity
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @OneToMany(mappedBy = "category")
    @JsonIgnore // Chặn vòng lặp vô tận khi xuất JSON
    private List<Product> products = new ArrayList<>();

    public Category() {}
    // Getters & Setters...
}

// 2. ENTITY BÊN NHIỀU - GIỮ KHÓA NGOẠI (Product.java)
@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    private Double price;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    public Product() {}
    // Getters & Setters...
}

// 3. REPOSITORY INTERFACE (ProductRepository.java)
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategoryId(Long categoryId);
}

// 4. SERVICE LAYER (ProductService.java)
@Service
public class ProductService {
    private final ProductRepository productRepo;

    public ProductService(ProductRepository productRepo) {
        this.productRepo = productRepo;
    }

    public List<Product> getByCategory(Long categoryId) {
        return productRepo.findByCategoryId(categoryId);
    }
    public Product save(Product p) { return productRepo.save(p); }
    public void delete(Long id) { productRepo.deleteById(id); }
}

// 5. REST CONTROLLER ĐỦ 4 HTTP VERBS (ProductRestController.java)
@RestController
@RequestMapping("/api/products")
public class ProductRestController {
    private final ProductService productService;

    public ProductRestController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/category/{categoryId}")
    public List<Product> getByCategory(@PathVariable Long categoryId) {
        return productService.getByCategory(categoryId);
    }

    @PostMapping
    public Product create(@RequestBody Product product) {
        return productService.save(product);
    }

    @PutMapping("/{id}")
    public Product update(@PathVariable Long id, @RequestBody Product product) {
        product.setId(id);
        return productService.save(product);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        productService.delete(id);
    }
}
```
