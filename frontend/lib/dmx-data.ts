export type CategoryId = 'all' | 'washer' | 'fridge' | 'tv' | 'small'
export type BrandId = 'Toshiba' | 'Samsung' | 'LG' | 'Panasonic'
export type BranchId = 'q9' | 'td'
export type BudgetId = 'any' | 'lt8' | 'lt10' | 'lt15' | 'premium'
export type OrderStatus = 'PENDING' | 'CONFIRMED'

export interface Branch {
  id: BranchId
  name: string
  district: string
  address: string
}

export interface Product {
  id?: number
  sku: string
  name: string
  category: Exclude<CategoryId, 'all'>
  brand: BrandId
  price: number
  listPrice: number
  specs: string[]
  image: string
  stock: Record<BranchId, number>
}

export interface Order {
  id: number
  sku: string
  productName: string
  quantity: number
  customerName: string
  phone: string
  address: string
  branchId: BranchId
  promoCode: string | null
  subtotal: number
  discount: number
  total: number
  status: OrderStatus
  createdAt: string
  items: { sku: string; name: string; quantity: number; unitPrice: number }[]
}

export const BRANCHES: Branch[] = [
  {
    id: 'q9',
    name: 'ĐMX Lê Văn Việt',
    district: 'Quận 9',
    address: '123 Lê Văn Việt, P. Tăng Nhơn Phú B, TP. Thủ Đức',
  },
  {
    id: 'td',
    name: 'ĐMX Đỗ Xuân Hợp',
    district: 'Thủ Đức',
    address: '456 Đỗ Xuân Hợp, P. Phước Long B, TP. Thủ Đức',
  },
]

export const CATEGORIES: { id: CategoryId; label: string; vi: string }[] = [
  { id: 'all', label: 'Tất cả danh mục', vi: 'Tất cả' },
  { id: 'washer', label: 'Máy giặt', vi: 'Máy giặt' },
  { id: 'fridge', label: 'Tủ lạnh', vi: 'Tủ lạnh' },
  { id: 'tv', label: 'Smart Tivi', vi: 'Tivi' },
  { id: 'small', label: 'Gia dụng', vi: 'Gia dụng' },
]

export const BRANDS: { id: BrandId; origin: string }[] = [
  { id: 'Toshiba', origin: 'Nhật Bản' },
  { id: 'Samsung', origin: 'Hàn Quốc' },
  { id: 'LG', origin: 'Hàn Quốc' },
  { id: 'Panasonic', origin: 'Nhật Bản' },
]

export const BUDGETS: { id: BudgetId; label: string }[] = [
  { id: 'any', label: 'Tất cả mức giá' },
  { id: 'lt8', label: 'Dưới 8 triệu' },
  { id: 'lt10', label: 'Dưới 10 triệu' },
  { id: 'lt15', label: 'Dưới 15 triệu' },
  { id: 'premium', label: 'Dòng cao cấp' },
]

export function matchesBudget(price: number, budget: BudgetId) {
  switch (budget) {
    case 'lt8':
      return price < 8_000_000
    case 'lt10':
      return price < 10_000_000
    case 'lt15':
      return price < 15_000_000
    case 'premium':
      return price >= 15_000_000
    default:
      return true
  }
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    sku: 'DMX-MG-001',
    name: 'Máy giặt Toshiba Inverter 8.5 kg TW-BK95S3V lồng ngang',
    category: 'washer',
    brand: 'Toshiba',
    price: 7_490_000,
    listPrice: 9_190_000,
    specs: ['Inverter tiết kiệm điện', 'Lồng ngang 8.5 kg', 'Giặt hơi nước'],
    image: '/products/washer-front.webp',
    stock: { q9: 4, td: 2 },
  },
  {
    sku: 'DMX-MG-002',
    name: 'Máy giặt Samsung AI Ecobubble Inverter 10 kg WW10TP44DSB/SV',
    category: 'washer',
    brand: 'Samsung',
    price: 11_990_000,
    listPrice: 14_490_000,
    specs: ['Cảm biến AI Wash', 'Lồng ngang 10 kg', 'Bọt bong bóng Ecobubble'],
    image: '/products/washer-front.webp',
    stock: { q9: 0, td: 5 },
  },
  {
    sku: 'DMX-MG-003',
    name: 'Máy giặt LG Inverter 12 kg T2312VSAB lồng đứng',
    category: 'washer',
    brand: 'LG',
    price: 6_890_000,
    listPrice: 8_290_000,
    specs: ['Inverter tiết kiệm điện', 'Lồng đứng 12 kg', 'Xoay đảo chiều TurboDrum'],
    image: '/products/washer-top.webp',
    stock: { q9: 7, td: 3 },
  },
  {
    sku: 'DMX-MG-004',
    name: 'Máy giặt Panasonic 9 kg NA-FD90X1LRV lồng đứng',
    category: 'washer',
    brand: 'Panasonic',
    price: 8_290_000,
    listPrice: 9_690_000,
    specs: ['Tạo bọt Active Foam', 'Lồng đứng 9 kg', 'Đánh bay vết bẩn'],
    image: '/products/washer-top.webp',
    stock: { q9: 2, td: 0 },
  },
  {
    sku: 'DMX-TL-001',
    name: 'Tủ lạnh Samsung Inverter 655 lít Side By Side RS62R5001B4/SV',
    category: 'fridge',
    brand: 'Samsung',
    price: 14_990_000,
    listPrice: 19_990_000,
    specs: ['Digital Inverter', 'Side by Side 655 lít', 'Làm lạnh vòm'],
    image: '/products/fridge-sbs.webp',
    stock: { q9: 3, td: 1 },
  },
  {
    sku: 'DMX-TL-002',
    name: 'Tủ lạnh LG Inverter 635 lít Side By Side InstaView GR-X257BG',
    category: 'fridge',
    brand: 'LG',
    price: 32_490_000,
    listPrice: 38_900_000,
    specs: ['Gõ cửa sáng màn hình InstaView', 'Side by Side 635 lít', 'Kháng khuẩn UVnano'],
    image: '/products/fridge-sbs.webp',
    stock: { q9: 0, td: 0 },
  },
  {
    sku: 'DMX-TL-003',
    name: 'Tủ lạnh Panasonic Inverter 495 lít Multi Door NR-CW530XMMV',
    category: 'fridge',
    brand: 'Panasonic',
    price: 24_990_000,
    listPrice: 29_490_000,
    specs: ['Đông mềm Prime Fresh+', 'Multi Door 495 lít', 'Khử mùi Nanoe X'],
    image: '/products/fridge-multi.webp',
    stock: { q9: 1, td: 4 },
  },
  {
    sku: 'DMX-TL-004',
    name: 'Tủ lạnh Toshiba Inverter 515 lít Multi Door GR-RF610WE-PGV',
    category: 'fridge',
    brand: 'Toshiba',
    price: 18_490_000,
    listPrice: 22_990_000,
    specs: ['Origin Inverter', 'Multi Door 515 lít', 'Khử mùi Ag+ Bio'],
    image: '/products/fridge-multi.webp',
    stock: { q9: 5, td: 2 },
  },
  {
    sku: 'DMX-TV-001',
    name: 'Smart Tivi OLED LG 4K 55 inch OLED55C4PSA',
    category: 'tv',
    brand: 'LG',
    price: 29_900_000,
    listPrice: 39_900_000,
    specs: ['Màn hình OLED evo', 'Hình ảnh 4K 120Hz', 'Hệ điều hành webOS'],
    image: '/products/tv-oled.webp',
    stock: { q9: 2, td: 3 },
  },
  {
    sku: 'DMX-TV-002',
    name: 'Smart Tivi QLED Samsung 4K 65 inch QA65Q70D',
    category: 'tv',
    brand: 'Samsung',
    price: 17_490_000,
    listPrice: 23_900_000,
    specs: ['Chấm lượng tử Quantum Dot', 'Tần số quét 4K 120Hz', 'Hệ điều hành Tizen'],
    image: '/products/tv-qled.webp',
    stock: { q9: 6, td: 0 },
  },
  {
    sku: 'DMX-TV-003',
    name: 'Google Tivi Toshiba 4K 55 inch 55C350NP',
    category: 'tv',
    brand: 'Toshiba',
    price: 9_490_000,
    listPrice: 12_490_000,
    specs: ['Google TV', 'Hình ảnh 4K HDR10', 'Âm thanh vòm Dolby Atmos'],
    image: '/products/tv-qled.webp',
    stock: { q9: 8, td: 6 },
  },
  {
    sku: 'DMX-TV-004',
    name: 'Smart Tivi Panasonic 4K 50 inch TH-50MX700V',
    category: 'tv',
    brand: 'Panasonic',
    price: 10_990_000,
    listPrice: 13_990_000,
    specs: ['Rạp phim HDR Cinema', 'Màn hình 4K 50 inch', 'Google TV'],
    image: '/products/tv-oled.webp',
    stock: { q9: 0, td: 2 },
  },
  {
    sku: 'DMX-GD-001',
    name: 'Nồi chiên không dầu Toshiba 5.5 lít MM-AF55PVN',
    category: 'small',
    brand: 'Toshiba',
    price: 1_990_000,
    listPrice: 2_790_000,
    specs: ['Dung tích 5.5 lít', 'Bảng điều khiển cảm ứng', '8 chương trình tự động'],
    image: '/products/airfryer.webp',
    stock: { q9: 12, td: 9 },
  },
  {
    sku: 'DMX-GD-002',
    name: 'Nồi cơm điện cao tần Panasonic 1.5 lít SR-HL151KRA',
    category: 'small',
    brand: 'Panasonic',
    price: 4_290_000,
    listPrice: 5_190_000,
    specs: ['Nấu cao tần IH', 'Dung tích 1.5 lít', 'Lòng nồi phủ kim cương'],
    image: '/products/ricecooker.webp',
    stock: { q9: 3, td: 0 },
  },
  {
    sku: 'DMX-GD-003',
    name: 'Nồi cơm điện tử Samsung 1.8 lít Fuzzy Logic',
    category: 'small',
    brand: 'Samsung',
    price: 2_490_000,
    listPrice: 2_990_000,
    specs: ['Nhiệt thông minh Fuzzy Logic', 'Dung tích 1.8 lít', 'Giữ ấm 24 giờ'],
    image: '/products/ricecooker.webp',
    stock: { q9: 0, td: 7 },
  },
  {
    sku: 'DMX-GD-004',
    name: 'Nồi chiên không dầu LG 6 lít Smart Inverter',
    category: 'small',
    brand: 'LG',
    price: 3_190_000,
    listPrice: 3_990_000,
    specs: ['Dung tích lớn 6 lít', 'Tiết kiệm điện Smart Inverter', 'Điều khiển qua điện thoại'],
    image: '/products/airfryer.webp',
    stock: { q9: 5, td: 4 },
  },
]

export const INITIAL_ORDERS: Order[] = [
  {
    id: 10248,
    sku: 'DMX-TV-001',
    productName: 'Smart Tivi OLED LG 4K 55 inch OLED55C4PSA',
    quantity: 1,
    items: [{ sku: 'DMX-TV-001', name: 'Smart Tivi OLED LG 4K 55 inch OLED55C4PSA', quantity: 1, unitPrice: 29_900_000 }],
    customerName: 'Nguyễn Minh Khang',
    phone: '0903 412 886',
    address: '12 Đường số 6, P. Linh Chiểu, TP. Thủ Đức',
    branchId: 'td',
    promoCode: 'TET2027',
    subtotal: 29_900_000,
    discount: 1_500_000,
    total: 28_400_000,
    status: 'CONFIRMED',
    createdAt: '2026-10-25T08:42:00+07:00',
  },
  {
    id: 10249,
    sku: 'DMX-MG-001',
    productName: 'Máy giặt Toshiba Inverter 8.5 kg TW-BK95S3V lồng ngang',
    quantity: 1,
    items: [{ sku: 'DMX-MG-001', name: 'Máy giặt Toshiba Inverter 8.5 kg TW-BK95S3V lồng ngang', quantity: 1, unitPrice: 7_490_000 }],
    customerName: 'Trần Thị Bảo Ngọc',
    phone: '0938 220 517',
    address: '45 Man Thiện, P. Hiệp Phú, TP. Thủ Đức',
    branchId: 'q9',
    promoCode: 'MWG5',
    subtotal: 7_490_000,
    discount: 374_500,
    total: 7_115_500,
    status: 'PENDING',
    createdAt: '2026-10-25T09:15:00+07:00',
  },
  {
    id: 10250,
    sku: 'DMX-GD-001',
    productName: 'Nồi chiên không dầu Toshiba 5.5 lít MM-AF55PVN',
    quantity: 2,
    items: [{ sku: 'DMX-GD-001', name: 'Nồi chiên không dầu Toshiba 5.5 lít MM-AF55PVN', quantity: 2, unitPrice: 1_990_000 }],
    customerName: 'Lê Hoàng Phúc',
    phone: '0977 105 334',
    address: 'Nhận tại cửa hàng',
    branchId: 'q9',
    promoCode: null,
    subtotal: 3_980_000,
    discount: 0,
    total: 3_980_000,
    status: 'PENDING',
    createdAt: '2026-10-25T09:31:00+07:00',
  },
]

const vndFormatter = new Intl.NumberFormat('vi-VN')

export function formatVND(value: number) {
  return `${vndFormatter.format(value)} ₫`
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
}

export function getBranch(id: BranchId) {
  return BRANCHES.find((b) => b.id === id) ?? BRANCHES[0]
}

export function getBrandOrigin(brand: BrandId) {
  return BRANDS.find((b) => b.id === brand)?.origin ?? ''
}

export interface ProductDetailInfo {
  angles: { id: string; label: string; desc: string; image: string }[]
  highlights: { title: string; desc: string }[]
  techSpecs: { group: string; items: { name: string; value: string }[] }[]
  overview: string
  reviews: { id: number; author: string; rating: number; date: string; content: string }[]
}

export function getProductDetails(product: Product): ProductDetailInfo {
  const cat = product.category
  const img = product.image || '/placeholder.svg'

  // Default angles using the real images with specialized visual perspectives
  let angles = [
    { id: 'front', label: 'Chính diện', desc: 'Thiết kế nguyên khối mặt trước hiện đại', image: img },
    { id: 'angle', label: 'Góc nghiêng 45°', desc: 'Thấy rõ độ sâu và đường nét tinh tế', image: img },
    { id: 'inside', label: 'Khoang bên trong', desc: 'Không gian chứa rộng rãi, hoàn thiện cao cấp', image: img },
    { id: 'panel', label: 'Bảng điều khiển', desc: 'Phím bấm điện tử thông minh, dễ thao tác', image: img },
  ]

  let highlights = [
    { title: 'Công nghệ Inverter tiết kiệm điện', desc: 'Vận hành êm ái, bền bỉ và tiết kiệm đến 45% điện năng tiêu thụ hàng tháng.' },
    { title: 'Bảo hành chính hãng 24 tháng', desc: 'Chính sách bảo hành tận nhà bởi đội ngũ kỹ thuật viên chuyên nghiệp Điện Máy Xanh.' },
    { title: 'Thiết kế sang trọng, hiện đại', desc: 'Phù hợp hoàn hảo với mọi không gian nội thất gia đình Việt.' },
    { title: 'Trang bị cảm biến thông minh', desc: 'Tự động nhận diện và tối ưu hóa chu trình hoạt động cho hiệu quả cao nhất.' },
  ]

  let techSpecs = [
    {
      group: 'Thông tin chung',
      items: [
        { name: 'Mã sản phẩm (SKU)', value: product.sku },
        { name: 'Thương hiệu', value: `${product.brand} (${getBrandOrigin(product.brand)})` },
        { name: 'Năm ra mắt', value: '2026' },
        { name: 'Bảo hành chính hãng', value: '24 tháng tận nơi' },
      ],
    },
    {
      group: 'Khả năng hoạt động & Công suất',
      items: [
        { name: 'Công nghệ tiết kiệm', value: 'Smart Inverter thế hệ mới' },
        { name: 'Điện áp sử dụng', value: '220V / 50Hz' },
        { name: 'Tiện ích an toàn', value: 'Khóa an toàn trẻ em, tự ngắt khi quá nhiệt' },
      ],
    },
  ]

  let overview = `Sản phẩm ${product.name} là một trong những thiết bị gia dụng được ưa chuộng hàng đầu tại chuỗi siêu thị Điện Máy Xanh. Sở hữu thiết kế nguyên khối sang trọng cùng công nghệ tiên tiến từ ${product.brand}, sản phẩm không chỉ đáp ứng trọn vẹn nhu cầu sử dụng hàng ngày của gia đình mà còn mang đến trải nghiệm sống tiện nghi, tiết kiệm điện năng tối đa.`

  if (cat === 'washer') {
    highlights = [
      { title: 'Công nghệ Inverter truyền động êm', desc: 'Giảm thiểu rung lắc và tiếng ồn đến mức tối đa, duy trì độ bền vượt trội theo năm tháng.' },
      { title: 'Giặt hơi nước diệt khuẩn 99.9%', desc: 'Hơi nước nóng len lỏi vào từng sợi vải giúp diệt sạch vi khuẩn và tác nhân gây dị ứng da.' },
      { title: 'Lồng giặt kháng khuẩn bảo vệ sợi vải', desc: 'Bề mặt thép không gỉ dập nổi hình tổ ong giúp giặt sạch sâu mà không làm xơ xước quần áo.' },
      { title: 'Tự động vệ sinh lồng giặt thông minh', desc: 'Khử sạch cặn bột giặt và nấm mốc bám ở thành lồng giặt chỉ với một nút bấm.' },
    ]
    techSpecs = [
      {
        group: 'Đặc điểm thiết kế & Khối lượng',
        items: [
          { name: 'Mã SKU', value: product.sku },
          { name: 'Loại máy giặt', value: product.name.includes('lồng ngang') ? 'Cửa trước lồng ngang' : 'Cửa trên lồng đứng' },
          { name: 'Khối lượng giặt', value: product.specs.find((s) => s.includes('kg')) || '9.0 kg' },
          { name: 'Thích hợp cho', value: 'Gia đình từ 3 - 6 thành viên' },
          { name: 'Chất liệu lồng giặt', value: 'Thép không gỉ kháng khuẩn' },
        ],
      },
      {
        group: 'Công nghệ & Động cơ',
        items: [
          { name: 'Động cơ', value: 'Inverter tiết kiệm điện' },
          { name: 'Tốc độ vắt tối đa', value: '1200 vòng/phút' },
          { name: 'Công nghệ giặt', value: product.specs.join(' · ') },
          { name: 'Tiện ích', value: 'Hẹn giờ giặt, khóa trẻ em, giặt nước nóng' },
        ],
      },
    ]
    overview = `${product.name} đem lại giải pháp chăm sóc trang phục toàn diện cho gia đình bạn. Nhờ được trang bị động cơ Inverter tiên tiến, máy hoạt động cực kỳ êm ái kể cả khi vắt ở tốc độ cao. Kết hợp cùng chu trình giặt chuyên biệt, quần áo luôn được giữ nếp, mềm mại và sạch khuẩn sau mỗi lần giặt.`
  } else if (cat === 'fridge') {
    highlights = [
      { title: 'Hệ thống làm lạnh vòm đa chiều', desc: 'Luồng khí lạnh thổi đều khắp các ngăn giúp thực phẩm tươi ngon suốt cả tuần mà không đóng tuyết.' },
      { title: 'Ngăn đông mềm tiện lợi', desc: 'Bảo quản thịt cá tươi sống ở nhiệt độ lý tưởng, nấu ngay không cần rã đông tốn thời gian.' },
      { title: 'Khử mùi kháng khuẩn than hoạt tính', desc: 'Triệt tiêu 99% mùi hôi tanh khó chịu, giữ cho không gian tủ lạnh luôn thanh khiết.' },
      { title: 'Tiết kiệm điện Digital Inverter', desc: 'Tự động điều chỉnh 7 cấp độ làm lạnh tùy theo nhu cầu thực tế, giảm thiểu hóa đơn tiền điện.' },
    ]
    techSpecs = [
      {
        group: 'Dung tích & Kiểu dáng',
        items: [
          { name: 'Mã SKU', value: product.sku },
          { name: 'Kiểu tủ', value: product.name.includes('Side By Side') ? 'Side By Side cao cấp' : 'Multi Door 4 cánh' },
          { name: 'Dung tích sử dụng', value: product.specs.find((s) => s.includes('lít')) || '515 lít' },
          { name: 'Chất liệu cửa tủ', value: 'Mặt gương đen / Thép không gỉ sơn tĩnh điện' },
        ],
      },
      {
        group: 'Công nghệ bảo quản',
        items: [
          { name: 'Công nghệ làm lạnh', value: 'Làm lạnh vòm đa chiều All-Around Cooling' },
          { name: 'Kháng khuẩn & Khử mùi', value: 'Bộ lọc than hoạt tính Ag+ Bio khử mùi' },
          { name: 'Công nghệ tiết kiệm điện', value: 'Inverter biến tần kỹ thuật số' },
        ],
      },
    ]
  } else if (cat === 'tv') {
    highlights = [
      { title: 'Độ phân giải 4K Ultra HD sắc nét', desc: 'Hiển thị hơn 8.3 triệu điểm ảnh, cho hình ảnh chi tiết và sống động gấp 4 lần Full HD thông thường.' },
      { title: 'Màu sắc sống động cùng chuẩn HDR', desc: 'Tối ưu độ tương phản giữa vùng sáng và vùng tối, màu sắc rực rỡ chuẩn điện ảnh rạp chiếu.' },
      { title: 'Âm thanh vòm Dolby Atmos đỉnh cao', desc: 'Hiệu ứng âm thanh đa chiều lan tỏa khắp gian phòng, cho cảm giác như đang ngồi giữa khán đài.' },
      { title: 'Hệ điều hành thông minh thế hệ mới', desc: 'Giao diện mượt mà, kho ứng dụng phong phú (YouTube, Netflix, FPT Play), tìm kiếm giọng nói tiếng Việt.' },
    ]
    techSpecs = [
      {
        group: 'Màn hình & Hình ảnh',
        items: [
          { name: 'Mã SKU', value: product.sku },
          { name: 'Kích cỡ màn hình', value: product.specs.find((s) => s.includes('inch') || s.includes('"')) || '55 inch' },
          { name: 'Độ phân giải', value: '4K Ultra HD (3840 x 2160 pixels)' },
          { name: 'Tần số quét', value: '120Hz mượt mà' },
        ],
      },
      {
        group: 'Âm thanh & Kết nối',
        items: [
          { name: 'Tổng công suất loa', value: '20W - 40W âm thanh vòm' },
          { name: 'Công nghệ âm thanh', value: 'Dolby Atmos · AI Sound Pro' },
          { name: 'Cổng kết nối', value: '3 x HDMI, 2 x USB, Cổng quang Optical, Wi-Fi, Bluetooth' },
          { name: 'Hệ điều hành', value: product.specs.find((s) => s.includes('OS') || s.includes('TV')) || 'Smart TV OS' },
        ],
      },
    ]
  }

  const sampleReviews = [
    {
      id: 1,
      author: 'Nguyễn Văn Hùng',
      rating: 5,
      date: '28/10/2026',
      content: 'Máy dùng rất êm, giao hàng siêu nhanh chỉ trong 2 tiếng từ ĐMX Lê Văn Việt Quận 9. Nhân viên nhiệt tình lắp đặt và hướng dẫn chi tiết!',
    },
    {
      id: 2,
      author: 'Trần Thị Mai',
      rating: 5,
      date: '24/10/2026',
      content: 'Đúng như mô tả, mẫu mã sang trọng và tiết kiệm điện thấy rõ. Rất hài lòng với chính sách bảo hành của Điện Máy Xanh.',
    },
    {
      id: 3,
      author: 'Lê Hoàng Long',
      rating: 4,
      date: '20/10/2026',
      content: 'Sản phẩm hoạt động tốt, thiết kế đẹp, phím bấm nhạy. Giá mua đợt khuyến mãi rất hời!',
    },
  ]

  return {
    angles,
    highlights,
    techSpecs,
    overview,
    reviews: sampleReviews,
  }
}
