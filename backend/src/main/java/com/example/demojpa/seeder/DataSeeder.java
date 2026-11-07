package com.example.demojpa.seeder;

import com.example.demojpa.entity.*;
import com.example.demojpa.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * DataSeeder: Tự động nạp dữ liệu mẫu thực tế cho 10 bảng CSDL khi khởi động ứng dụng.
 * Giúp cả nhóm khi mang máy vào phòng thi vấn đáp thì CSDL luôn có sẵn dữ liệu chuẩn đẹp.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepo;
    private final BrandRepository brandRepo;
    private final ProductRepository productRepo;
    private final StoreBranchRepository branchRepo;
    private final InventoryRepository inventoryRepo;
    private final CustomerRepository customerRepo;
    private final PromotionRepository promoRepo;
    private final ProductReviewRepository reviewRepo;
    private final CustomerOrderRepository orderRepo;
    private final OrderItemRepository orderItemRepo;

    public DataSeeder(
            CategoryRepository categoryRepo,
            BrandRepository brandRepo,
            ProductRepository productRepo,
            StoreBranchRepository branchRepo,
            InventoryRepository inventoryRepo,
            CustomerRepository customerRepo,
            PromotionRepository promoRepo,
            ProductReviewRepository reviewRepo,
            CustomerOrderRepository orderRepo,
            OrderItemRepository orderItemRepo
    ) {
        this.categoryRepo = categoryRepo;
        this.brandRepo = brandRepo;
        this.productRepo = productRepo;
        this.branchRepo = branchRepo;
        this.inventoryRepo = inventoryRepo;
        this.customerRepo = customerRepo;
        this.promoRepo = promoRepo;
        this.reviewRepo = reviewRepo;
        this.orderRepo = orderRepo;
        this.orderItemRepo = orderItemRepo;
    }

    @Override
    public void run(String... args) throws Exception {
        // Chỉ nạp dữ liệu nếu bảng categories chưa có dữ liệu (Idempotent)
        if (categoryRepo.count() > 0) {
            return;
        }

        System.out.println(">>> [DataSeeder] Dang khoi tao du lieu mau cho 10 bang CSDL MWG...");

        // 1. Nạp 3 Danh mục
        Category catMayGiat = categoryRepo.save(new Category("Máy giặt", "MAYGIAT", "Máy giặt lồng ngang và lồng đứng Inverter tiết kiệm điện"));
        Category catTuLanh = categoryRepo.save(new Category("Tủ lạnh", "TULANH", "Tủ lạnh ngăn đông dưới và side-by-side khử mùi kháng khuẩn"));
        Category catTivi = categoryRepo.save(new Category("Smart Tivi", "TIVI", "Smart Tivi 4K Ultra HD màn hình sắc nét"));

        // 2. Nạp 4 Thương hiệu
        Brand brandToshiba = brandRepo.save(new Brand("Toshiba", "Nhật Bản", "Thương hiệu điện tử gia dụng hàng đầu Nhật Bản"));
        Brand brandSamsung = brandRepo.save(new Brand("Samsung", "Hàn Quốc", "Tập đoàn công nghệ và thiết bị nghe nhìn số 1 Hàn Quốc"));
        Brand brandLG = brandRepo.save(new Brand("LG", "Hàn Quốc", "Chuyên gia màn hình OLED và động cơ truyền động trực tiếp"));
        Brand brandPanasonic = brandRepo.save(new Brand("Panasonic", "Nhật Bản", "Độ bền chuẩn Nhật và công nghệ diệt khuẩn Nanoe-X"));

        // 3. Nạp 2 Siêu thị Điện Máy Xanh
        StoreBranch branchQ9 = branchRepo.save(new StoreBranch("ĐMX Lê Văn Việt", "Quận 9", "123 Lê Văn Việt, P. Tăng Nhơn Phú B, TP. Thủ Đức", "028.3730.1234"));
        StoreBranch branchThuDuc = branchRepo.save(new StoreBranch("ĐMX Đỗ Xuân Hợp", "Thủ Đức", "456 Đỗ Xuân Hợp, P. Phước Long B, TP. Thủ Đức", "028.3730.5678"));

        // 4. Nạp 2 Khách hàng mẫu
        Customer cust1 = customerRepo.save(new Customer("Nguyễn Văn An", "0901234567", "an.nguyen@gmail.com", "Số 10 Võ Văn Ngân, Thủ Đức"));
        Customer cust2 = customerRepo.save(new Customer("Trần Thị Bích", "0918765432", "bich.tran@gmail.com", "Số 25 Lê Văn Việt, Quận 9"));

        // 5. Nạp 2 Chương trình Khuyến mãi
        Promotion promo5 = promoRepo.save(new Promotion("MWG5", 5.0, "Giảm ngay 5% cho khách hàng mua online hoặc trả góp 0%", true));
        Promotion promo10 = promoRepo.save(new Promotion("TET2027", 10.0, "Ưu đãi Tết 2027 tri ân khách hàng thân thiết", true));

        // 6. Nạp 6 Sản phẩm điện máy thực tế
        Product p1 = productRepo.save(new Product(
                "DMX-MG-001",
                "Máy giặt Toshiba Inverter 8.5 Kg TW-BL95A4V(SS)",
                7490000.0,
                "Cửa trước, Inverter, lồng ngang, giặt nước nóng, bảo hành 2 năm chính hãng",
                catMayGiat,
                brandToshiba
        ));

        Product p2 = productRepo.save(new Product(
                "DMX-MG-002",
                "Máy giặt LG Inverter 9 Kg FV1409S4W",
                8990000.0,
                "Cửa trước, công nghệ AI DD bảo vệ sợi vải, Inverter truyền động trực tiếp",
                catMayGiat,
                brandLG
        ));

        Product p3 = productRepo.save(new Product(
                "DMX-MG-003",
                "Máy giặt Panasonic Inverter 9.5 Kg NA-FD95V1BRV",
                9890000.0,
                "Cửa trên lồng đứng, công nghệ StainMaster giặt nước nóng chuyên sâu",
                catMayGiat,
                brandPanasonic
        ));

        Product p4 = productRepo.save(new Product(
                "DMX-TL-001",
                "Tủ lạnh Samsung Inverter 236 Lít RT22FARBDSA/SV",
                6290000.0,
                "Ngăn đá trên, công nghệ Digital Inverter, bộ lọc than hoạt tính Deodorizer",
                catTuLanh,
                brandSamsung
        ));

        Product p5 = productRepo.save(new Product(
                "DMX-TL-002",
                "Tủ lạnh Toshiba Inverter 311 Lít GR-RT395WE-PMV(06)-MG",
                8490000.0,
                "Công nghệ PureBio kháng khuẩn Ag+, luồng khí lạnh thác đổ Air Fall Cooling",
                catTuLanh,
                brandToshiba
        ));

        Product p6 = productRepo.save(new Product(
                "DMX-TV-001",
                "Smart Tivi LG 4K 55 inch 55UR7800PSB",
                10490000.0,
                "Màn hình 4K HDR10, bộ xử lý α5 Gen6 AI 4K, hệ điều hành webOS hiện đại",
                catTivi,
                brandLG
        ));

        // 7. Nạp Tồn kho khả dụng (Inventories)
        // Chi nhánh Quận 9: p1 còn 4 máy, p2 còn 2 máy, p3 HẾT HÀNG (0 máy để test out-of-stock)
        inventoryRepo.save(new Inventory(p1, branchQ9, 4));
        inventoryRepo.save(new Inventory(p2, branchQ9, 2));
        inventoryRepo.save(new Inventory(p3, branchQ9, 0)); // 0 máy
        inventoryRepo.save(new Inventory(p4, branchQ9, 5));
        inventoryRepo.save(new Inventory(p5, branchQ9, 3));
        inventoryRepo.save(new Inventory(p6, branchQ9, 2));

        // Chi nhánh Thủ Đức: p1 còn 3 máy, p3 còn 2 máy
        inventoryRepo.save(new Inventory(p1, branchThuDuc, 3));
        inventoryRepo.save(new Inventory(p2, branchThuDuc, 0));
        inventoryRepo.save(new Inventory(p3, branchThuDuc, 2));
        inventoryRepo.save(new Inventory(p4, branchThuDuc, 4));
        inventoryRepo.save(new Inventory(p5, branchThuDuc, 1));
        inventoryRepo.save(new Inventory(p6, branchThuDuc, 3));

        // 8. Nạp Đánh giá sản phẩm mẫu (ProductReviews)
        reviewRepo.save(new ProductReview(p1, cust1, 5, "Máy giặt chạy rất êm, vắt khô ráo, nhân viên ĐMX giao hàng và lắp đặt nhanh chóng!"));
        reviewRepo.save(new ProductReview(p4, cust2, 5, "Tủ lạnh làm lạnh đều, tiết kiệm điện năng rõ rệt, màu bạc sang trọng."));

        // 9. Nạp 1 Đơn hàng mẫu và Chi tiết đơn hàng (CustomerOrder & OrderItem) - Hoàn thiện 10/10 bảng
        CustomerOrder sampleOrder = new CustomerOrder(
                cust1.getFullName(),
                cust1.getPhone(),
                cust1.getAddress(),
                7115500.0,
                cust1,
                promo5
        );
        sampleOrder.setStatus("COMPLETED");
        sampleOrder = orderRepo.save(sampleOrder);

        OrderItem sampleItem = new OrderItem(sampleOrder, p1, 1, p1.getPrice());
        sampleItem = orderItemRepo.save(sampleItem);
        sampleOrder.getOrderItems().add(sampleItem);

        System.out.println(">>> [DataSeeder] Khoi tao du lieu 10 bang thanh cong 100%!");
    }
}
