package com.example.demojpa.seeder;

import com.example.demojpa.entity.*;
import com.example.demojpa.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * DataSeeder: Tự động nạp và đồng bộ dữ liệu mẫu thực tế cho 10 bảng CSDL khi khởi động.
 *
 * Cơ chế Upsert theo mã (Code / SKU):
 *  - Nếu chạy trên máy mới (CSDL trống): tự tạo đủ 4 Danh mục, 4 Thương hiệu, 2 Chi nhánh,
 *    32 Sản phẩm (8 SKU / danh mục), 64 dòng Tồn kho, Khách hàng, Khuyến mãi, Đánh giá, Đơn hàng.
 *  - Nếu chạy trên máy thành viên nhóm đã có CSDL cũ (6 hoặc 16 sản phẩm): tự động chèn bổ sung
 *    các SKU còn thiếu lên đủ 32 sản phẩm mà không làm mất đơn hàng hay khách hàng sẵn có.
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
    public void run(String... args) {
        boolean initialSeed = categoryRepo.count() == 0;

        // 1. Đảm bảo đủ 4 Danh mục ngành hàng
        Category catMayGiat = ensureCategory("Máy giặt", "MAYGIAT", "Máy giặt lồng ngang và lồng đứng Inverter tiết kiệm điện");
        Category catTuLanh = ensureCategory("Tủ lạnh", "TULANH", "Tủ lạnh ngăn đông dưới và side-by-side khử mùi kháng khuẩn");
        Category catTivi = ensureCategory("Smart Tivi", "TIVI", "Smart Tivi 4K Ultra HD màn hình sắc nét");
        Category catGiaDung = ensureCategory("Gia dụng", "GIADUNG", "Thiết bị gia dụng nhà bếp thông minh tiết kiệm điện");

        // 2. Đảm bảo đủ 4 Thương hiệu chính hãng
        Brand brandToshiba = ensureBrand("Toshiba", "Nhật Bản", "Thương hiệu điện tử gia dụng hàng đầu Nhật Bản");
        Brand brandSamsung = ensureBrand("Samsung", "Hàn Quốc", "Tập đoàn công nghệ và thiết bị nghe nhìn số 1 Hàn Quốc");
        Brand brandLG = ensureBrand("LG", "Hàn Quốc", "Chuyên gia màn hình OLED và động cơ truyền động trực tiếp");
        Brand brandPanasonic = ensureBrand("Panasonic", "Nhật Bản", "Độ bền chuẩn Nhật và công nghệ diệt khuẩn Nanoe-X");

        // 3. Đảm bảo 2 Siêu thị chi nhánh
        StoreBranch branchQ9 = ensureBranch("ĐMX Lê Văn Việt", "Quận 9", "123 Lê Văn Việt, P. Tăng Nhơn Phú B, TP. Thủ Đức", "028.3730.1234");
        StoreBranch branchTD = ensureBranch("ĐMX Đỗ Xuân Hợp", "Thủ Đức", "456 Đỗ Xuân Hợp, P. Phước Long B, TP. Thủ Đức", "028.3730.5678");

        // 4. Đảm bảo 2 Khách hàng mẫu
        Customer cust1 = customerRepo.findByPhone("0901234567").orElseGet(() ->
                customerRepo.save(new Customer("Nguyễn Văn An", "0901234567", "an.nguyen@gmail.com", "Số 10 Võ Văn Ngân, Thủ Đức")));
        Customer cust2 = customerRepo.findByPhone("0918765432").orElseGet(() ->
                customerRepo.save(new Customer("Trần Thị Bích", "0918765432", "bich.tran@gmail.com", "Số 25 Lê Văn Việt, Quận 9")));

        // 5. Đảm bảo 2 Chương trình Khuyến mãi
        Promotion promo5 = promoRepo.findByPromoCode("MWG5").orElseGet(() ->
                promoRepo.save(new Promotion("MWG5", 5.0, "Giảm ngay 5% cho khách hàng mua online hoặc trả góp 0%", true)));
        promoRepo.findByPromoCode("TET2027").map(p -> {
            if (p.getMaxDiscountAmount() == null) {
                p.setMaxDiscountAmount(1500000.0);
                return promoRepo.save(p);
            }
            return p;
        }).orElseGet(() ->
                promoRepo.save(new Promotion("TET2027", 10.0, "Ưu đãi Tết 2027 tri ân khách hàng thân thiết", true, 1500000.0)));

        // 6. Đảm bảo 32 Sản phẩm điện máy (8 SKU / danh mục) + 64 dòng Tồn kho
        // --- 6.1 MÁY GIẶT (8 SKU) ---
        Product mg001 = ensureProduct("DMX-MG-001", "Máy giặt Toshiba Inverter 8.5 Kg TW-BL95A4V(SS)", 7490000.0,
                "Cửa trước, Inverter, lồng ngang, giặt nước nóng, bảo hành 2 năm chính hãng", catMayGiat, brandToshiba, branchQ9, 4, branchTD, 3);
        ensureProduct("DMX-MG-002", "Máy giặt Samsung AI Ecobubble Inverter 10 Kg WW10TP44DSB/SV", 11990000.0,
                "Công nghệ AI Ecobubble tạo bọt tuyết, giặt hơi nước Hygiene Steam diệt khuẩn", catMayGiat, brandSamsung, branchQ9, 2, branchTD, 5);
        ensureProduct("DMX-MG-003", "Máy giặt Panasonic Inverter 9.5 Kg NA-FD95V1BRV", 9890000.0,
                "Cửa trên lồng đứng, công nghệ StainMaster giặt nước nóng chuyên sâu", catMayGiat, brandPanasonic, branchQ9, 0, branchTD, 2);
        ensureProduct("DMX-MG-004", "Máy giặt LG Inverter 9 Kg FV1409S4W", 8990000.0,
                "Cửa trước, công nghệ AI DD bảo vệ sợi vải, Inverter truyền động trực tiếp", catMayGiat, brandLG, branchQ9, 5, branchTD, 0);
        ensureProduct("DMX-MG-005", "Máy giặt Toshiba cửa trên 8.2 Kg AW-M905BV(MK)", 5490000.0,
                "Lồng đứng 8.2 kg, mâm giặt Mega Power Wash, lồng giặt ngôi sao pha lê", catMayGiat, brandToshiba, branchQ9, 6, branchTD, 4);
        ensureProduct("DMX-MG-006", "Máy giặt sấy Samsung AI Inverter 11 Kg WD11T734DBX/SV", 14490000.0,
                "Giặt 11 kg sấy 7 kg, ngăn nước giặt xả tự động AI Dispenser, QuickDrive", catMayGiat, brandSamsung, branchQ9, 3, branchTD, 2);
        ensureProduct("DMX-MG-007", "Máy giặt Panasonic Inverter 10.5 Kg NA-V105FC1LV", 10990000.0,
                "Cửa trước 10.5 kg, sấy tiện ích Hygiene Dry, diệt khuẩn nước lạnh Blue Ag+", catMayGiat, brandPanasonic, branchQ9, 4, branchTD, 3);
        ensureProduct("DMX-MG-008", "Máy giặt LG TurboDrum Inverter 11.5 Kg T2551VSAB", 7890000.0,
                "Cửa trên 11.5 kg, Smart Inverter tiết kiệm điện, đấm nước Punch+3", catMayGiat, brandLG, branchQ9, 5, branchTD, 3);

        // --- 6.2 TỦ LẠNH (8 SKU) ---
        Product tl001 = ensureProduct("DMX-TL-001", "Tủ lạnh Samsung Inverter 236 Lít RT22FARBDSA/SV", 6290000.0,
                "Ngăn đá trên, công nghệ Digital Inverter, bộ lọc than hoạt tính Deodorizer", catTuLanh, brandSamsung, branchQ9, 5, branchTD, 4);
        ensureProduct("DMX-TL-002", "Tủ lạnh Toshiba Inverter 311 Lít GR-RT395WE-PMV(06)-MG", 8490000.0,
                "Công nghệ PureBio kháng khuẩn Ag+, luồng khí lạnh thác đổ Air Fall Cooling", catTuLanh, brandToshiba, branchQ9, 3, branchTD, 1);
        ensureProduct("DMX-TL-003", "Tủ lạnh Panasonic Inverter 495 Lít Multi Door NR-CW530XMMV", 24990000.0,
                "Multi Door 4 cánh, công nghệ Prime Fresh++ giữ thịt cá tươi ngon, Nanoe-X", catTuLanh, brandPanasonic, branchQ9, 1, branchTD, 4);
        ensureProduct("DMX-TL-004", "Tủ lạnh LG Inverter 635 Lít Side By Side InstaView GR-X257BG", 32490000.0,
                "Side By Side, InstaView kính trong suốt gõ 2 lần sáng đèn, Linear Inverter", catTuLanh, brandLG, branchQ9, 0, branchTD, 2);
        ensureProduct("DMX-TL-005", "Tủ lạnh Toshiba Origin Inverter 194 Lít GR-RT252WE-PMV(52)", 5790000.0,
                "Dung tích 194 lít nhỏ gọn, Origin Inverter êm ái, khử mùi Ag+ Bio", catTuLanh, brandToshiba, branchQ9, 7, branchTD, 5);
        ensureProduct("DMX-TL-006", "Tủ lạnh Samsung Inverter 655 Lít Side By Side RS62R5001B4/SV", 18990000.0,
                "Side By Side 655 lít, công nghệ SpaceMax viền siêu mỏng, làm lạnh vòm", catTuLanh, brandSamsung, branchQ9, 2, branchTD, 3);
        ensureProduct("DMX-TL-007", "Tủ lạnh Panasonic Inverter 325 Lít NR-BC360QKVN", 11490000.0,
                "Ngăn đông dưới, ngăn đông mềm chuẩn -3 độ C Prime Fresh+, cảm biến Econavi", catTuLanh, brandPanasonic, branchQ9, 4, branchTD, 2);
        ensureProduct("DMX-TL-008", "Tủ lạnh LG Inverter 374 Lít GN-D372BLA", 10490000.0,
                "Lấy nước ngoài tiện lợi, làm lạnh từ cánh tủ DoorCooling+, Smart Inverter", catTuLanh, brandLG, branchQ9, 3, branchTD, 4);

        // --- 6.3 SMART TIVI (8 SKU) ---
        ensureProduct("DMX-TV-001", "Smart Tivi LG 4K 55 inch 55UR7800PSB", 10490000.0,
                "Màn hình 4K HDR10, bộ xử lý α5 Gen6 AI 4K, hệ điều hành webOS hiện đại", catTivi, brandLG, branchQ9, 2, branchTD, 3);
        ensureProduct("DMX-TV-002", "Smart Tivi QLED Samsung 4K 65 inch QA65Q70D", 17490000.0,
                "Công nghệ QLED 100% thể tích màu, chip Quantum Processor 4K, Tizen OS", catTivi, brandSamsung, branchQ9, 6, branchTD, 0);
        ensureProduct("DMX-TV-003", "Google Tivi Toshiba 4K 55 inch 55C350NP", 9490000.0,
                "Google TV tích hợp giọng nói tiếng Việt, Dolby Vision HDR, Regza Engine", catTivi, brandToshiba, branchQ9, 8, branchTD, 6);
        ensureProduct("DMX-TV-004", "Smart Tivi Panasonic 4K 50 inch TH-50MX700V", 10990000.0,
                "4K Hexa Chroma Drive, Google TV, âm thanh vòm Dolby Atmos sống động", catTivi, brandPanasonic, branchQ9, 0, branchTD, 2);
        ensureProduct("DMX-TV-005", "Smart Tivi OLED LG 4K 55 inch OLED55C4PSA", 27990000.0,
                "Màn hình OLED evo tự phát sáng, tần số quét 120Hz, chip α9 AI Processor 4K", catTivi, brandLG, branchQ9, 2, branchTD, 2);
        ensureProduct("DMX-TV-006", "Smart Tivi Crystal UHD Samsung 4K 50 inch UA50DU8000", 11490000.0,
                "Thiết kế AirSlim thanh mảnh, Dynamic Crystal Color 1 tỷ sắc màu, Tizen OS", catTivi, brandSamsung, branchQ9, 5, branchTD, 4);
        ensureProduct("DMX-TV-007", "Google Tivi QLED Toshiba 4K 65 inch 65M550LP", 13990000.0,
                "Màn hình Quantum Dot QLED 65 inch, làm mờ cục bộ Full Array Local Dimming", catTivi, brandToshiba, branchQ9, 3, branchTD, 3);
        ensureProduct("DMX-TV-008", "Google Tivi Panasonic 4K 65 inch TH-65MX800V", 15490000.0,
                "Màn hình lớn 65 inch tràn viền, công nghệ HDR Cinema Display, tìm kiếm giọng nói", catTivi, brandPanasonic, branchQ9, 2, branchTD, 3);

        // --- 6.4 GIA DỤNG (8 SKU) ---
        ensureProduct("DMX-GD-001", "Nồi chiên không dầu Toshiba 5.5 Lít MM-AF55PVN", 1990000.0,
                "Dung tích 5.5 lít, 8 chế độ nấu tự động, công nghệ giảm 90% chất béo", catGiaDung, brandToshiba, branchQ9, 12, branchTD, 9);
        ensureProduct("DMX-GD-002", "Nồi cơm điện cao tần Panasonic 1.5 Lít SR-HL151KRA", 4290000.0,
                "Công nghệ gia nhiệt cao tần IH, lòng nồi Diamond Fluorine 7 lớp, giữ ấm 24h", catGiaDung, brandPanasonic, branchQ9, 3, branchTD, 0);
        ensureProduct("DMX-GD-003", "Nồi cơm điện tử Samsung 1.8 Lít Fuzzy Logic", 2490000.0,
                "Điều khiển Fuzzy Logic thông minh, lòng nồi chống dính, 12 chương trình nấu", catGiaDung, brandSamsung, branchQ9, 0, branchTD, 7);
        ensureProduct("DMX-GD-004", "Nồi chiên không dầu LG 6 Lít Smart Inverter", 3190000.0,
                "Dung tích 6 lít cho gia đình 5-6 người, Inverter tiết kiệm điện, lòng nồi chống dính", catGiaDung, brandLG, branchQ9, 5, branchTD, 4);
        ensureProduct("DMX-GD-005", "Nồi cơm điện cao tần Toshiba 1.8 Lít RC-18IX1PV", 3490000.0,
                "Công nghệ cao tần IH 1300W, lòng nồi dày 3mm phủ Carbon Binchotan Nhật Bản", catGiaDung, brandToshiba, branchQ9, 6, branchTD, 5);
        ensureProduct("DMX-GD-006", "Nồi chiên không dầu Panasonic 6 Lít NF-CC600A", 2890000.0,
                "Cửa sổ kính quan sát thực phẩm, nướng đối lưu 360 độ kèm khay châm nước tạo ẩm", catGiaDung, brandPanasonic, branchQ9, 8, branchTD, 6);
        ensureProduct("DMX-GD-007", "Lò vi sóng có nướng Samsung 23 Lít MG23K3575AS/SV", 2790000.0,
                "Khoang lò tráng men Ceramic chống trầy, chế độ nướng kết hợp vi sóng nhanh", catGiaDung, brandSamsung, branchQ9, 5, branchTD, 4);
        ensureProduct("DMX-GD-008", "Lò vi sóng LG Smart Inverter 25 Lít MH6565DIS", 3690000.0,
                "Công nghệ Smart Inverter rã đông đều, nướng thạch anh tốc độ cao, kháng khuẩn", catGiaDung, brandLG, branchQ9, 4, branchTD, 5);

        // 7. Chỉ nạp Đánh giá & Đơn hàng mẫu ở lần khởi tạo đầu tiên
        if (initialSeed) {
            reviewRepo.save(new ProductReview(mg001, cust1, 5, "Máy giặt chạy rất êm, vắt khô ráo, nhân viên ĐMX giao hàng và lắp đặt nhanh chóng!"));
            reviewRepo.save(new ProductReview(tl001, cust2, 5, "Tủ lạnh làm lạnh đều, tiết kiệm điện năng rõ rệt, màu bạc sang trọng."));

            CustomerOrder sampleOrder = new CustomerOrder(
                    cust1.getFullName(), cust1.getPhone(), cust1.getAddress(), 7115500.0, cust1, promo5);
            sampleOrder.setStatus("COMPLETED");
            sampleOrder = orderRepo.save(sampleOrder);

            OrderItem sampleItem = orderItemRepo.save(new OrderItem(sampleOrder, mg001, 1, mg001.getPrice()));
            sampleOrder.getOrderItems().add(sampleItem);
        }

        System.out.println(">>> [DataSeeder] Dong bo CSDL hoan tat: " + productRepo.count() + " San pham / " + inventoryRepo.count() + " dong Ton kho.");
    }

    private Category ensureCategory(String name, String code, String desc) {
        return categoryRepo.findByCode(code).orElseGet(() -> categoryRepo.save(new Category(name, code, desc)));
    }

    private Brand ensureBrand(String name, String country, String desc) {
        return brandRepo.findByName(name).orElseGet(() -> brandRepo.save(new Brand(name, country, desc)));
    }

    private StoreBranch ensureBranch(String name, String district, String address, String phone) {
        return branchRepo.findByDistrict(district).stream().findFirst()
                .orElseGet(() -> branchRepo.save(new StoreBranch(name, district, address, phone)));
    }

    private Product ensureProduct(String sku, String name, Double price, String desc,
                                  Category cat, Brand brand,
                                  StoreBranch bQ9, int qtyQ9, StoreBranch bTD, int qtyTD) {
        Product p = productRepo.findBySku(sku).orElseGet(() ->
                productRepo.save(new Product(sku, name, price, desc, cat, brand)));
        if (inventoryRepo.findByProduct_IdAndStoreBranch_Id(p.getId(), bQ9.getId()).isEmpty()) {
            inventoryRepo.save(new Inventory(p, bQ9, qtyQ9));
        }
        if (inventoryRepo.findByProduct_IdAndStoreBranch_Id(p.getId(), bTD.getId()).isEmpty()) {
            inventoryRepo.save(new Inventory(p, bTD, qtyTD));
        }
        return p;
    }
}
