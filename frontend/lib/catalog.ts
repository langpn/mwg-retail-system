import {
  BRANCHES,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  type BranchId,
  type BrandId,
  type CategoryId,
  type Order,
  type Product,
} from './dmx-data'
import { api, type BackendBranch, type BackendOrder, type BackendProduct, type StockEntry } from './api'

export const CATEGORY_ID_TO_CODE: Record<Exclude<CategoryId, 'all'>, string> = {
  washer: 'MAYGIAT', fridge: 'TULANH', tv: 'TIVI', small: 'GIADUNG',
}

const CATEGORY_CODE_MAP: Record<string, Exclude<CategoryId, 'all'>> = {
  MAYGIAT: 'washer', TULANH: 'fridge', TIVI: 'tv', GIADUNG: 'small',
}

let branchTable: Partial<Record<BranchId, number>> = {}

export function syncBranchTable(branches: BackendBranch[]) {
  const next: Partial<Record<BranchId, number>> = {}
  for (const branch of branches) {
    const local = BRANCHES.find((item) => item.district.trim().toLocaleLowerCase('vi') === branch.district.trim().toLocaleLowerCase('vi'))
    if (local) next[local.id] = branch.id
  }
  branchTable = next
}

export function keyToNumericId(key: BranchId): number | undefined {
  return branchTable[key]
}

export function numericIdToKey(id: number): BranchId | undefined {
  return BRANCHES.find((branch) => branchTable[branch.id] === id)?.id
}

export function applyStockMatrix(products: Product[], matrix: StockEntry[]): Product[] {
  const stock = new Map<number, Record<BranchId, number>>()
  for (const entry of matrix) {
    const branch = numericIdToKey(entry.branchId)
    if (!branch) continue
    const quantities = stock.get(entry.productId) ?? { q9: 0, td: 0 }
    quantities[branch] = entry.quantity
    stock.set(entry.productId, quantities)
  }
  return products.map((product) => ({
    ...product,
    stock: (product.id !== undefined && stock.get(product.id)) || { q9: 0, td: 0 },
  }))
}

export function mapBackendProduct(
  product: BackendProduct,
  matrix: StockEntry[],
  existingStock?: Record<BranchId, number>,
): Product {
  const display = INITIAL_PRODUCTS.find((item) => item.sku === product.sku)
  // Giá niêm yết chỉ dùng từ dữ liệu mẫu nếu mức giảm còn thực tế (tối đa ~40%).
  // Tránh hiển thị "giá gạch" ảo không có trong CSDL.
  const mockList = display?.listPrice ?? 0
  const listPrice =
    mockList > product.price && mockList <= product.price * 1.4
      ? mockList
      : Math.max(product.price + 1, Math.round((product.price * 1.15) / 10_000) * 10_000)
  const mapped: Product = {
    id: product.id,
    sku: product.sku,
    name: product.name,
    category: CATEGORY_CODE_MAP[product.category?.code] ?? 'small',
    brand: (product.brand?.name ?? 'Toshiba') as BrandId,
    price: product.price,
    listPrice,
    specs: display?.specs ?? (product.description ? [product.description] : []),
    image: display?.image ?? '/products/washer-front.webp',
    stock: existingStock ?? { q9: 0, td: 0 },
  }
  return existingStock ? mapped : applyStockMatrix([mapped], matrix)[0]
}

export function mapBackendOrder(order: BackendOrder, branchId: BranchId = 'q9'): Order {
  const items = (order.orderItems ?? []).map((item) => ({
    sku: item.product?.sku ?? '',
    name: item.product?.name ?? '',
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  }))
  const subtotal = items.length ? items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) : order.totalAmount
  return {
    id: order.id,
    sku: items[0]?.sku ?? '',
    productName: items.length > 1 ? `${items[0].name} và ${items.length - 1} sản phẩm khác` : items[0]?.name ?? '',
    quantity: items.reduce((sum, item) => sum + item.quantity, 0),
    items,
    customerName: order.customerName,
    phone: order.phone,
    address: order.shippingAddress,
    branchId,
    promoCode: order.promotion?.promoCode ?? null,
    subtotal,
    discount: Math.max(0, subtotal - order.totalAmount),
    total: order.totalAmount,
    status: order.status as Order['status'],
    createdAt: order.orderDate,
  }
}

export function computeOfflineDiscount(subtotal: number, promoCode: string): number {
  switch (promoCode.trim().toUpperCase()) {
    case 'MWG5': return Math.round(subtotal * 0.05)
    case 'TET2027': return Math.min(Math.round(subtotal * 0.1), 1_500_000)
    default: return 0
  }
}

const onlineCatalog = {
  async load() {
    const [products, branches, matrix, orders] = await Promise.all([
      api.products.list(), api.inventory.branches(), api.inventory.stockMatrix(), api.orders.list(),
    ])
    syncBranchTable(branches)
    return {
      products: products.map((product) => mapBackendProduct(product, matrix)),
      orders: orders.map((order) => mapBackendOrder(order)),
    }
  },
}

const offlineCatalog = {
  async load() {
    return { products: INITIAL_PRODUCTS, orders: INITIAL_ORDERS }
  },
}

export function catalogAdapter(connected: boolean) {
  return connected ? onlineCatalog : offlineCatalog
}
