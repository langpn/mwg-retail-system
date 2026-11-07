export type CategoryId = 'all' | 'washer' | 'fridge' | 'tv' | 'small'
export type BrandId = 'Toshiba' | 'Samsung' | 'LG' | 'Panasonic'
export type BranchId = 'q9' | 'td'
export type BudgetId = 'any' | 'lt8' | 'lt10' | 'lt15' | 'premium'
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'

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
