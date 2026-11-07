package com.example.demojpa.seeder;

import com.example.demojpa.entity.*;
import com.example.demojpa.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * DataSeeder: Tự động nạp dữ liệu mẫu thực tế cho 10 bảng CSDL khi khởi động ứng dụng.
 * Giúp cả nhóm khi mang máy vào phòng thi vấn đáp thì CSDL luôn có sẵn dữ liệu chuẩn đẹp.
 *
 * Quy mô dữ liệu danh mục (đủ để minh chứng Server-Side Pagination):
 *  - 4 Danh mục: Máy giặt, Tủ lạnh, Smart Tivi, Gia dụng.
 *  - 16 Sản phẩm với mã SKU thực tế của Điện Máy Xanh (mỗi danh mục 4 SKU).
 *    => Với pageSize = 6, giao diện chia thành 3 trang rõ ràng (6 + 6 + 4).
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

        // ============================================================
        // 1. Nạp 4 Danh mục ngành hàng
        // ============================================================
        Category catMayGiat = categoryRepo.save(new Category("Máy giặt", "MAYGIAT", "Máy giặt lồng ngang và lồng đứng Inverter tiết kiệm điện"));
        Category catTuLanh = categoryRepo.save(new Category("Tủ lạnh", "TULANH", "Tủ lạnh ngăn đông dưới và side-by-side khử mùi kháng khuẩn"));
        Category catTivi = categoryRepo.save(new Category("Smart Tivi", "TIVI", "Smart Tivi 4K Ultra HD màn hình sắc nét"));
        Category catGiaDung = categoryRepo.save(new Category("Gia dụng", "GIADUNG", "Thiết bị gia dụng nhà bếp thông minh tiết kiệm điện"));

        // ============================================================
        // 2. Nạp 4 Thương hiệu chính hãng
        // ============================================================
        Brand brandToshiba = brandRepo.save(new Brand("Toshiba", "Nhật Bản", "Thương hiệu điện tử gia dụng hàng đầu Nhật Bản"));
        Brand brandSamsung = brandRepo.save(new Brand("Samsung", "Hàn Quốc", "Tập đoàn công nghệ và thiết bị nghe nhìn số 1 Hàn Quốc"));
        Brand brandLG = brandRepo.save(new Brand("LG", "Hàn Quốc", "Chuyên gia màn hình OLED và động cơ truyền động trực tiếp"));
        Brand brandPanasonic = brandRepo.save(new Brand("Panasonic", "Nhật Bản", "Độ bền chuẩn Nhật và công nghệ diệt khuẩn Nanoe-X"));

        // ============================================================
        // 3. Nạp 2 Siêu thị Điện Máy Xanh
        // ============================================================
        StoreBranch branchQ9 = branchRepo.save(new StoreBranch("ĐMX Lê Văn Việt", "Quận 9", "123 Lê Văn Việt, P. Tăng Nhơn Phú B, TP. Thủ Đức", "028.3730.1234"));
        StoreBranch branchThuDuc = branchRepo.save(new StoreBranch("ĐMX Đỗ Xuân Hợp", "Thủ Đức", "456 Đỗ Xuân Hợp, P. Phước Long B, TP. Thủ Đức", "028.3730.5678"));

        // ============================================================
        // 4. Nạp 2 Khách hàng mẫu
        // ============================================================
        Customer cust1 = customerRepo.save(new Customer("Nguyễn Văn An", "0901234567", "an.nguyen@gmail.com", "Số 10 Võ Văn Ngân, Thủ Đức"));
        Customer cust2 = customerRepo.save(new Customer("Trần Thị Bích", "0918765432", "bich.tran@gmail.com", "Số 25 Lê Văn Việt, Quận 9"));

        // ============================================================
        // 5. Nạp 2 Chương trình Khuyến mãi
        // ============================================================
        Promotion promo5 = promoRepo.save(new Promotion("MWG5", 5.0, "Giảm ngay 5% cho khách hàng mua online hoặc trả góp 0%", true));
        Promotion promo10 = promoRepo.save(new Promotion("TET2027", 10.0, "Ưu đãi Tết 2027 tri ân khách hàng thân thiết", true));

        // ============================================================
        // 6. Nạp 16 Sản phẩm điện máy thực tế (4 SKU / danh mục)
        // ============================================================

        // ---------- 6.1 Nhóm MÁY GIẶT ----------
        Product mg001 = productRepo.save(new Product(
                "DMX-MG-001",
                "Máy giặt Toshiba Inverter 8.5 Kg TW-BL95A4V(SS)",
                7490000.0,
                "Cửa trước, Inverter, lồng ngang, giặt nước nóng, bảo hành 2 năm chính hãng",
                catMayGiat,
                brandToshiba
        ));
        Product mg002 = productRepo.save(new Product(
                "DMX-MG-002",
                "Máy giặt Samsung AI Ecobubble Inverter 10 Kg WW10TP44DSB/SV",
                11990000.0,
                "Công nghệ AI Ecobubble tạo bọt tuyết, giặt hơi nước Hygiene Steam diệt khuẩn",
                catMayGiat,
                brandSamsung
        ));
        Product mg003 = productRepo.save(new Product(
                "DMX-MG-003",
                "Máy giặt Panasonic Inverter 9.5 Kg NA-FD95V1BRV",
                9890000.0,
                "Cửa trên lồng đứng, công nghệ StainMaster giặt nước nóng chuyên sâu",
                catMayGiat,
                brandPanasonic
        ));
        Product mg004 = productRepo.save(new Product(
                "DMX-MG-004",
                "Máy giặt LG Inverter 9 Kg FV1409S4W",
                8990000.0,
                "Cửa trước, công nghệ AI DD bảo vệ sợi vải, Inverter truyền động trực tiếp",
                catMayGiat,
                brandLG
        ));

        // ---------- 6.2 Nhóm TỦ LẠNH ----------
        Product tl001 = productRepo.save(new Product(
                "DMX-TL-001",
                "Tủ lạnh Samsung Inverter 236 Lít RT22FARBDSA/SV",
                6290000.0,
                "Ngăn đá trên, công nghệ Digital Inverter, bộ lọc than hoạt tính Deodorizer",
                catTuLanh,
                brandSamsung
        ));
        Product tl002 = productRepo.save(new Product(
                "DMX-TL-002",
                "Tủ lạnh Toshiba Inverter 311 Lít GR-RT395WE-PMV(06)-MG",
                8490000.0,
                "Công nghệ PureBio kháng khuẩn Ag+, luồng khí lạnh thác đổ Air Fall Cooling",
                catTuLanh,
                brandToshiba
        ));
        Product tl003 = productRepo.save(new Product(
                "DMX-TL-003",
                "Tủ lạnh Panasonic Inverter 495 Lít Multi Door NR-CW530XMMV",
                24990000.0,
                "Multi Door 4 cánh, công nghệ Prime Fresh++ giữ thịt cá tươi ngon, Nanoe-X",
                catTuLanh,
                brandPanasonic
        ));
        Product tl004 = productRepo.save(new Product(
                "DMX-TL-004",
                "Tủ lạnh LG Inverter 635 Lít Side By Side InstaView GR-X257BG",
                32490000.0,
                "Side By Side, InstaView kính trong suốt gõ 2 lần sáng đèn, Linear Inverter",
                catTuLanh,
                brandLG
        ));

        // ---------- 6.3 Nhóm SMART TIVI ----------
        Product tv001 = productRepo.save(new Product(
                "DMX-TV-001",
                "Smart Tivi LG 4K 55 inch 55UR7800PSB",
                10490000.0,
                "Màn hình 4K HDR10, bộ xử lý α5 Gen6 AI 4K, hệ điều hành webOS hiện đại",
                catTivi,
                brandLG
        ));
        Product tv002 = productRepo.save(new Product(
                "DMX-TV-002",
                "Smart Tivi QLED Samsung 4K 65 inch QA65Q70D",
                17490000.0,
                "Công nghệ QLED 100% thể tích màu, chip Quantum Processor 4K, Tizen OS",
                catTivi,
                brandSamsung
        ));
        Product tv003 = productRepo.save(new Product(
                "DMX-TV-003",
                "Google Tivi Toshiba 4K 55 inch 55C350NP",
                9490000.0,
                "Google TV tích hợp giọng nói tiếng Việt, Dolby Vision HDR, Regza Engine",
                catTivi,
                brandToshiba
        ));
        Product tv004 = productRepo.save(new Product(
                "DMX-TV-004",
                "Smart Tivi Panasonic 4K 50 inch TH-50MX700V",
                10990000.0,
                "4K Hexa Chroma Drive, Google TV, âm thanh vòm Dolby Atmos sống động",
                catTivi,
                brandPanasonic
        ));

        // ---------- 6.4 Nhóm GIA DỤNG ----------
        Product gd001 = productRepo.save(new Product(
                "DMX-GD-001",
                "Nồi chiên không dầu Toshiba 5.5 Lít MM-AF55PVN",
                1990000.0,
                "Dung tích 5.5 lít, 8 chế độ nấu tự động, công nghệ giảm 90% chất béo",
                catGiaDung,
                brandToshiba
        ));
        Product gd002 = productRepo.save(new Product(
                "DMX-GD-002",
                "Nồi cơm điện cao tần Panasonic 1.5 Lít SR-HL151KRA",
                4290000.0,
                "Công nghệ gia nhiệt cao tần IH, lòng nồi Diamond Fluorine 7 lớp, giữ ấm 24h",
                catGiaDung,
                brandPanasonic
        ));
        Product gd003 = productRepo.save(new Product(
                "DMX-GD-003",
                "Nồi cơm điện tử Samsung 1.8 Lít Fuzzy Logic",
                2490000.0,
                "Điều khiển Fuzzy Logic thông minh, lòng nồi chống dính, 12 chương trình nấu",
                catGiaDung,
                brandSamsung
        ));
        Product gd004 = productRepo.save(new Product(
                "DMX-GD-004",
                "Nồi chiên không dầu LG 6 Lít Smart Inverter",
                3190000.0,
                "Dung tích 6 lít cho gia đình 5-6 người, Inverter tiết kiệm điện, lòng nồi chống dính",
                catGiaDung,
                brandLG
        ));

        // ============================================================
        // 7. Nạp Tồn kho khả dụng (Inventories) — 16 sản phẩm x 2 chi nhánh
        //    Ghi chú: các SKU tồn Quận 9 = 0 được giữ nguyên để test nghiệp vụ HẾT HÀNG.
        // ============================================================
        // --- Chi nhánh Quận 9 ---
        inventoryRepo.save(new Inventory(mg001, branchQ9, 4));
        inventoryRepo.save(new Inventory(mg002, branchQ9, 2));
        inventoryRepo.save(new Inventory(mg003, branchQ9, 0)); // 0 máy: test out-of-stock
        inventoryRepo.save(new Inventory(mg004, branchQ9, 5));

        inventoryRepo.save(new Inventory(tl001, branchQ9, 5));
        inventoryRepo.save(new Inventory(tl002, branchQ9, 3));
        inventoryRepo.save(new Inventory(tl003, branchQ9, 1));
        inventoryRepo.save(new Inventory(tl004, branchQ9, 0)); // 0 máy: test out-of-stock

        inventoryRepo.save(new Inventory(tv001, branchQ9, 2));
        inventoryRepo.save(new Inventory(tv002, branchQ9, 6));
        inventoryRepo.save(new Inventory(tv003, branchQ9, 8));
        inventoryRepo.save(new Inventory(tv004, branchQ9, 0)); // 0 máy: test out-of-stock

        inventoryRepo.save(new Inventory(gd001, branchQ9, 12));
        inventoryRepo.save(new Inventory(gd002, branchQ9, 3));
        inventoryRepo.save(new Inventory(gd003, branchQ9, 0)); // 0 máy: test out-of-stock
        inventoryRepo.save(new Inventory(gd004, branchQ9, 5));

        // --- Chi nhánh Thủ Đức ---
        inventoryRepo.save(new Inventory(mg001, branchThuDuc, 3));
        inventoryRepo.save(new Inventory(mg002, branchThuDuc, 5));
        inventoryRepo.save(new Inventory(mg003, branchThuDuc, 2));
        inventoryRepo.save(new Inventory(mg004, branchThuDuc, 0)); // 0 máy

        inventoryRepo.save(new Inventory(tl001, branchThuDuc, 4));
        inventoryRepo.save(new Inventory(tl002, branchThuDuc, 1));
        inventoryRepo.save(new Inventory(tl003, branchThuDuc, 4));
        inventoryRepo.save(new Inventory(tl004, branchThuDuc, 2));

        inventoryRepo.save(new Inventory(tv001, branchThuDuc, 3));
        inventoryRepo.save(new Inventory(tv002, branchThuDuc, 0)); // 0 máy
        inventoryRepo.save(new Inventory(tv003, branchThuDuc, 6));
        inventoryRepo.save(new Inventory(tv004, branchThuDuc, 2));

        inventoryRepo.save(new Inventory(gd001, branchThuDuc, 9));
        inventoryRepo.save(new Inventory(gd002, branchThuDuc, 0)); // 0 máy
        inventoryRepo.save(new Inventory(gd003, branchThuDuc, 7));
        inventoryRepo.save(new Inventory(gd004, branchThuDuc, 4));

        // ============================================================
        // 8. Nạp Đánh giá sản phẩm mẫu (ProductReviews)
        // ============================================================
        reviewRepo.save(new ProductReview(mg001, cust1, 5, "Máy giặt chạy rất êm, vắt khô ráo, nhân viên ĐMX giao hàng và lắp đặt nhanh chóng!"));
        reviewRepo.save(new ProductReview(tl001, cust2, 5, "Tủ lạnh làm lạnh đều, tiết kiệm điện năng rõ rệt, màu bạc sang trọng."));

        // ============================================================
        // 9. Nạp 1 Đơn hàng mẫu và Chi tiết đơn hàng - Hoàn thiện 10/10 bảng
        // ============================================================
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

        OrderItem sampleItem = new OrderItem(sampleOrder, mg001, 1, mg001.getPrice());
        sampleItem = orderItemRepo.save(sampleItem);
        sampleOrder.getOrderItems().add(sampleItem);

        System.out.println(">>> [DataSeeder] Khoi tao du lieu 10 bang thanh cong 100%!");
        System.out.println(">>> [DataSeeder] 4 Danh muc / 4 Thuong hieu / 16 San pham / 32 dong Ton kho.");
    }
}
