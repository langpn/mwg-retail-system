const BASE = process.env.NEXT_PUBLIC_API_BASE || '/api/v1'
export const MVC_URL = `${BASE.replace(/\/api\/v1\/?$/, '')}/mvc/catalog`

/* ── Error type ── */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/* ── Core request helper ── */
async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  })
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try {
      const body = await res.json()
      if (body?.error) msg = body.error
      else if (body?.message) msg = body.message
    } catch {}
    throw new ApiError(res.status, msg)
  }
  const text = await res.text()
  return text ? JSON.parse(text) as T : undefined as T
}

/* ── Pagination types ── */
export interface PagedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface ProductPageParams {
  page?: number
  size?: number
  sortBy?: string
  sortDir?: string
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  keyword?: string
}

export function buildProductPageQuery(params: ProductPageParams = {}): string {
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    const text = String(value).trim()
    if (!text) continue
    qs.append(key, text)
  }
  return qs.toString()
}

/* ── Backend response types ── */
export interface BackendCategory {
  id: number
  code: string
  name: string
}

export interface BackendBrand {
  id: number
  name: string
  country?: string
}

export interface BackendProduct {
  id: number
  sku: string
  name: string
  price: number
  description?: string
  category: BackendCategory
  brand: BackendBrand
}

export type ProductInput = Omit<BackendProduct, 'id' | 'category' | 'brand'> & {
  id?: number
  category: { id: number }
  brand: { id: number }
}

export interface BackendOrderItem {
  id: number
  quantity: number
  unitPrice: number
  product: BackendProduct
}

export interface BackendCustomer {
  id: number
  fullName: string
  phone: string
  email?: string
  address?: string
}

export interface BackendPromotion {
  id: number
  promoCode: string
  discountPercent: number
  description?: string
  isActive: boolean
  maxDiscountAmount?: number | null
}

export interface BackendReview {
  id: number
  product: BackendProduct
  customer: BackendCustomer
  rating: number
  comment?: string
  reviewDate: string
}

export interface ReviewInput {
  product: { id: number }
  customer: { id: number } | { fullName: string; phone: string }
  rating: number
  comment: string
}

export interface BackendOrder {
  id: number
  customerName: string
  phone: string
  shippingAddress: string
  totalAmount: number
  status: string
  orderDate: string
  customer?: BackendCustomer
  promotion?: BackendPromotion
  orderItems?: BackendOrderItem[]
}

export interface BackendBranch {
  id: number
  branchName: string
  district: string
  address: string
  phone?: string
}

export interface BackendInventory {
  id: number
  product: BackendProduct
  storeBranch: BackendBranch
  quantity: number
}

export interface StockEntry {
  productId: number
  sku: string
  branchId: number
  quantity: number
}

export interface OrderQuoteItem {
  productId: number
  sku: string
  name: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

export interface OrderQuote {
  items: OrderQuoteItem[]
  subtotal: number
  promoCode: string | null
  promoApplied: boolean
  promoLabel: string | null
  promoMessage: string | null
  discount: number
  total: number
}

export interface CreateOrderBody {
  customerName?: string
  phone?: string
  shippingAddress?: string
  promoCode: string
  branchId: number
  items: { productId: number; quantity: number }[]
}

/* ── Unified api object ── */
export const api = {
  /* ── Health ── */
  ping: (): Promise<boolean> =>
    request<BackendProduct[]>('/products', { signal: AbortSignal.timeout(3000) })
      .then(() => true)
      .catch((error: unknown) =>
        !(error instanceof TypeError || (error instanceof DOMException && ['TimeoutError', 'AbortError'].includes(error.name)))),

  /* ── Products ── */
  products: {
    list: () => request<BackendProduct[]>('/products'),
    page: (params: ProductPageParams = {}): Promise<PagedResponse<BackendProduct>> => {
      const qs = buildProductPageQuery(params)
      return request<PagedResponse<BackendProduct>>(`/products/page${qs ? `?${qs}` : ''}`)
    },
    create: (p: ProductInput) => request<BackendProduct>('/products', { method: 'POST', body: JSON.stringify(p) }),
    update: (id: number, p: ProductInput) => request<BackendProduct>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(p) }),
    remove: (id: number) => request<void>(`/products/${id}`, { method: 'DELETE' }),
    categories: () => request<BackendCategory[]>('/products/categories'),
    brands: () => request<BackendBrand[]>('/products/brands'),
  },

  /* ── Inventory ── */
  inventory: {
    branches: () => request<BackendBranch[]>('/inventory/branches'),
    byBranch: (id: number) => request<BackendInventory[]>(`/inventory/branch/${id}`),
    stockMatrix: () => request<StockEntry[]>('/inventory/stock-matrix'),
    update: (body: { productId: number; branchId: number; quantity: number }) =>
      request<BackendInventory>('/inventory/update', { method: 'PUT', body: JSON.stringify(body) }),
  },

  /* ── Orders ── */
  orders: {
    list: () => request<BackendOrder[]>('/orders'),
    create: (body: CreateOrderBody) => request<BackendOrder>('/orders', { method: 'POST', body: JSON.stringify(body) }),
    quote: (body: CreateOrderBody) => request<OrderQuote>('/orders/quote', { method: 'POST', body: JSON.stringify(body) }),
    updateStatus: (id: number, status: string) =>
      request<BackendOrder>(`/orders/${id}/status?status=${encodeURIComponent(status)}`, { method: 'PUT' }),
  },

  /* ── Customers ── */
  customers: {
    list: () => request<BackendCustomer[]>('/customers'),
    byPhone: (phone: string) => request<BackendCustomer>(`/customers/phone/${encodeURIComponent(phone)}`),
    lookup: (identifier: string) =>
      request<BackendCustomer>(`/customers/lookup?identifier=${encodeURIComponent(identifier)}`),
    create: (body: { fullName: string; phone: string; email?: string; address?: string }) =>
      request<BackendCustomer>('/customers', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: number, body: Partial<BackendCustomer>) =>
      request<BackendCustomer>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    remove: (id: number) => request<void>(`/customers/${id}`, { method: 'DELETE' }),
  },

  /* ── Promotions ── */
  promotions: {
    list: () => request<BackendPromotion[]>('/promotions'),
    create: (p: Partial<BackendPromotion>) => request<BackendPromotion>('/promotions', { method: 'POST', body: JSON.stringify(p) }),
    update: (id: number, p: Partial<BackendPromotion>) =>
      request<BackendPromotion>(`/promotions/${id}`, { method: 'PUT', body: JSON.stringify(p) }),
    remove: (id: number) => request<void>(`/promotions/${id}`, { method: 'DELETE' }),
  },

  /* ── Reviews ── */
  reviews: {
    list: () => request<BackendReview[]>('/reviews'),
    byProduct: (productId: number) => request<BackendReview[]>(`/reviews/product/${productId}`),
    create: (r: ReviewInput) => request<BackendReview>('/reviews', { method: 'POST', body: JSON.stringify(r) }),
    remove: (id: number) => request<void>(`/reviews/${id}`, { method: 'DELETE' }),
  },
}

/* ── Resource aliases ── */
export const productsApi = api.products
export const ordersApi = api.orders
export const inventoryApi = api.inventory
export const customersApi = api.customers
export const promotionsApi = api.promotions
export const reviewsApi = api.reviews
export const ping = api.ping
