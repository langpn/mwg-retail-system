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
        // --- 6.1 MÁY GIẶT & MÁY SẤY (8 SKU đa dạng) ---
        Product mg001 = ensureProduct("DMX-MG-001", "Máy giặt Toshiba Inverter 8.5 Kg TW-BL95A4V(SS)", 7490000.0,
                "Cửa trước, Inverter, lồng ngang, giặt nước nóng, bảo hành 2 năm chính hãng", catMayGiat, brandToshiba, branchQ9, 4, branchTD, 3);
        ensureProduct("DMX-MG-002", "Máy giặt Samsung AI Ecobubble Inverter 10 Kg WW10TP44DSB/SV", 11990000.0,
                "Công nghệ AI Ecobubble tạo bọt tuyết, giặt hơi nước Hygiene Steam diệt khuẩn", catMayGiat, brandSamsung, branchQ9, 2, branchTD, 5);
        ensureProduct("DMX-MG-003", "Máy giặt Panasonic Inverter 9.5 Kg NA-FD95V1BRV", 9890000.0,
                "Cửa trên lồng đứng, công nghệ StainMaster giặt nước nóng chuyên sâu", catMayGiat, brandPanasonic, branchQ9, 0, branchTD, 2);
        ensureProduct("DMX-MG-004", "Máy giặt LG AI DD Inverter 9 Kg FV1409S4W", 8990000.0,
                "Cửa trước, công nghệ AI DD bảo vệ sợi vải, Inverter truyền động trực tiếp", catMayGiat, brandLG, branchQ9, 5, branchTD, 0);
        ensureProduct("DMX-MG-005", "Máy giặt Toshiba cửa trên 8.2 Kg AW-M905BV(MK)", 5490000.0,
                "Lồng đứng 8.2 kg, mâm giặt Mega Power Wash, lồng giặt ngôi sao pha lê", catMayGiat, brandToshiba, branchQ9, 6, branchTD, 4);
        ensureProduct("DMX-MG-006", "Máy sấy bơm nhiệt Samsung Bespoke AI 9 Kg DV90T7240BB/SV", 14490000.0,
                "Sấy bơm nhiệt Heatpump tiết kiệm 50% điện, cảm biến độ ẩm OptimalDry", catMayGiat, brandSamsung, branchQ9, 3, branchTD, 2);
        ensureProduct("DMX-MG-007", "Máy giặt sấy Panasonic Inverter 10.5 Kg NA-V105FC1LV", 10990000.0,
                "Cửa trước 10.5 kg kèm sấy tiện ích Hygiene Dry, diệt khuẩn nước lạnh Blue Ag+", catMayGiat, brandPanasonic, branchQ9, 4, branchTD, 3);
        ensureProduct("DMX-MG-008", "Máy giặt LG TurboDrum Inverter 11.5 Kg T2551VSAB", 7890000.0,
                "Cửa trên 11.5 kg, Smart Inverter tiết kiệm điện, đấm nước Punch+3", catMayGiat, brandLG, branchQ9, 5, branchTD, 3);

        // --- 6.2 TỦ LẠNH & TỦ ĐÔNG (8 SKU đa dạng) ---
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
        ensureProduct("DMX-TL-006", "Tủ đông mát Samsung Inverter 280 Lít RZ28H61507F", 18990000.0,
                "Tủ đông mát 2 ngăn độc lập, dàn lạnh đồng nguyên chất, giữ đông sâu -24 độ C", catTuLanh, brandSamsung, branchQ9, 2, branchTD, 3);
        ensureProduct("DMX-TL-007", "Tủ lạnh Panasonic ngăn đông dưới 325 Lít NR-BC360QKVN", 11490000.0,
                "Ngăn đông dưới, ngăn đông mềm chuẩn -3 độ C Prime Fresh+, cảm biến Econavi", catTuLanh, brandPanasonic, branchQ9, 4, branchTD, 2);
        ensureProduct("DMX-TL-008", "Tủ lạnh LG French Door 4 cánh 470 Lít GR-B50BL", 10490000.0,
                "French Door 4 cánh, làm lạnh từ cánh tủ DoorCooling+, Smart Inverter", catTuLanh, brandLG, branchQ9, 3, branchTD, 4);

        // --- 6.3 SMART TIVI (8 SKU đa dạng) ---
        ensureProduct("DMX-TV-001", "Smart Tivi LG 4K 55 inch 55UR7800PSB", 10490000.0,
                "Màn hình 4K HDR10, bộ xử lý α5 Gen6 AI 4K, hệ điều hành webOS hiện đại", catTivi, brandLG, branchQ9, 2, branchTD, 3);
        ensureProduct("DMX-TV-002", "Smart Tivi QLED Samsung 4K 65 inch QA65Q70D", 17490000.0,
                "Công nghệ QLED 100% thể tích màu, chip Quantum Processor 4K, Tizen OS", catTivi, brandSamsung, branchQ9, 6, branchTD, 0);
        ensureProduct("DMX-TV-003", "Google Tivi Toshiba 4K 55 inch 55C350NP", 9490000.0,
                "Google TV tích hợp giọng nói tiếng Việt, Dolby Vision HDR, Regza Engine", catTivi, brandToshiba, branchQ9, 8, branchTD, 6);
        ensureProduct("DMX-TV-004", "Smart Tivi Panasonic 4K 50 inch TH-50MX700V", 10990000.0,
                "4K Hexa Chroma Drive, Google TV, âm thanh vòm Dolby Atmos sống động", catTivi, brandPanasonic, branchQ9, 0, branchTD, 2);
        ensureProduct("DMX-TV-005", "Smart Tivi OLED Evo LG 4K 65 inch OLED65C4PSA", 27990000.0,
                "Màn hình OLED evo tự phát sáng, tần số quét 120Hz, chip α9 AI Processor 4K", catTivi, brandLG, branchQ9, 2, branchTD, 2);
        ensureProduct("DMX-TV-006", "Smart Tivi Khung Tranh The Frame Samsung 4K 55 inch QA55LS03D", 11490000.0,
                "Thiết kế khung tranh nghệ thuật Art Mode, tấm nền chống phản sáng Matte Display", catTivi, brandSamsung, branchQ9, 5, branchTD, 4);
        ensureProduct("DMX-TV-007", "Google Tivi MiniLED Toshiba 4K 75 inch 75Z870MP", 13990000.0,
                "Màn hình MiniLED 75 inch cỡ lớn, làm mờ cục bộ Full Array Local Dimming", catTivi, brandToshiba, branchQ9, 3, branchTD, 3);
        ensureProduct("DMX-TV-008", "Smart Tivi OLED Panasonic 4K 65 inch TH-65MZ1000V", 15490000.0,
                "Màn hình OLED Master HDR 65 inch tràn viền, âm thanh rạp hát Theater Surround", catTivi, brandPanasonic, branchQ9, 2, branchTD, 3);

        // --- 6.4 GIA DỤNG (8 loại thiết bị khác nhau hoàn toàn) ---
        ensureProduct("DMX-GD-001", "Nồi chiên không dầu Toshiba 5.5 Lít MM-AF55PVN", 1990000.0,
                "Dung tích 5.5 lít, 8 chế độ nấu tự động, công nghệ giảm 90% chất béo", catGiaDung, brandToshiba, branchQ9, 12, branchTD, 9);
        ensureProduct("DMX-GD-002", "Nồi cơm điện cao tần Panasonic 1.5 Lít SR-HL151KRA", 4290000.0,
                "Công nghệ gia nhiệt cao tần IH, lòng nồi Diamond Fluorine 7 lớp, giữ ấm 24h", catGiaDung, brandPanasonic, branchQ9, 3, branchTD, 0);
        ensureProduct("DMX-GD-003", "Máy hút bụi không dây Samsung Jet 65 VS15A6031R4/SV", 2490000.0,
                "Động cơ Digital Inverter lực hút 150W, bộ lọc HEPA 5 lớp, pin rời 40 phút", catGiaDung, brandSamsung, branchQ9, 0, branchTD, 7);
        ensureProduct("DMX-GD-004", "Máy lọc không khí kết hợp quạt LG PuriCare AeroTower", 3190000.0,
                "Lọc bụi mịn PM0.3 99.97%, khử khuẩn UVnano, luồng gió vòm êm ái 23dB", catGiaDung, brandLG, branchQ9, 5, branchTD, 4);
        ensureProduct("DMX-GD-005", "Máy lọc nước RO nóng lạnh Toshiba 10 lõi TWP-W2396SVN(M)", 3490000.0,
                "10 lõi lọc RO Mỹ, 3 chế độ nước Nóng - Nguội - Lạnh, đèn UV diệt khuẩn", catGiaDung, brandToshiba, branchQ9, 6, branchTD, 5);
        ensureProduct("DMX-GD-006", "Máy xay sinh tố đa năng Panasonic MX-MG53C1CRA", 2890000.0,
                "Công suất 700W xay đá mịn, cối thủy tinh dày 1.5 lít, lưỡi dao răng cưa Nhật Bản", catGiaDung, brandPanasonic, branchQ9, 8, branchTD, 6);
        ensureProduct("DMX-GD-007", "Lò vi sóng có nướng Samsung 23 Lít MG23K3575AS/SV", 2790000.0,
                "Khoang lò tráng men Ceramic chống trầy, chế độ nướng kết hợp vi sóng nhanh", catGiaDung, brandSamsung, branchQ9, 5, branchTD, 4);
        ensureProduct("DMX-GD-008", "Robot hút bụi lau nhà tự giặt giẻ LG CordZero R5-ULTIMATE", 3690000.0,
                "Điều hướng laser LiDAR 360 độ, trạm sạc tự động hút rác và giặt sấy khăn lau", catGiaDung, brandLG, branchQ9, 4, branchTD, 5);

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
        Product p = productRepo.findBySku(sku).map(existing -> {
            if (!name.equals(existing.getName()) || !desc.equals(existing.getDescription())) {
                existing.setName(name);
                existing.setDescription(desc);
                return productRepo.save(existing);
            }
            return existing;
        }).orElseGet(() ->
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
