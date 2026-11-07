const BASE = process.env.NEXT_PUBLIC_API_BASE || '/api/v1'

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

/**
 * Build a query string for GET /api/v1/products/page.
 * Only parameters that actually carry a value are appended, so the backend
 * never receives empty strings (which it would treat as a real filter).
 */
export function buildProductPageQuery(params: ProductPageParams = {}): string {
  const qs = new URLSearchParams()

  function append(key: string, value: string | number | undefined) {
    if (value === undefined || value === null) return
    const text = String(value).trim()
    if (!text) return
    qs.append(key, text)
  }

  append('page', params.page)
  append('size', params.size)
  append('sortBy', params.sortBy)
  append('sortDir', params.sortDir)
  append('category', params.category)
  append('brand', params.brand)
  append('minPrice', params.minPrice)
  append('maxPrice', params.maxPrice)
  append('keyword', params.keyword)

  return qs.toString()
}

export const api = {
  /* ── Products ── */
  getProducts: () => fetch(`${BASE}/products`).then((r) => r.json()),
  getProductsPage: (params: ProductPageParams = {}): Promise<PagedResponse<any>> => {
    const qs = buildProductPageQuery(params)
    return fetch(`${BASE}/products/page${qs ? `?${qs}` : ''}`).then((r) => {
      if (!r.ok) throw new Error(`${r.status}`)
      return r.json()
    })
  },
  getCategories: () => fetch(`${BASE}/products/categories`).then((r) => r.json()),
  getBrands: () => fetch(`${BASE}/products/brands`).then((r) => r.json()),

  /* ── Inventory ── */
  getBranches: () => fetch(`${BASE}/inventory/branches`).then((r) => r.json()),
  getBranchInventory: (branchId: number) =>
    fetch(`${BASE}/inventory/branch/${branchId}`).then((r) => r.json()),
  updateStock: (productId: number, branchId: number, quantity: number) =>
    fetch(`${BASE}/inventory/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, branchId, quantity }),
    }).then((r) => r.json()),

  /* ── Orders ── */
  getOrders: () => fetch(`${BASE}/orders`).then((r) => r.json()),
  createOrder: (body: {
    customerName: string
    phone: string
    shippingAddress: string
    promoCode: string
    branchId: number
    items: { productId: number; quantity: number }[]
  }) =>
    fetch(`${BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  updateOrderStatus: (id: number, status: string) =>
    fetch(`${BASE}/orders/${id}/status?status=${status}`, { method: 'PUT' }).then((r) => r.json()),

  /* ── Customers ── */
  getCustomers: (phone?: string) =>
    fetch(`${BASE}/customers${phone ? `?phone=${encodeURIComponent(phone)}` : ''}`).then((r) => {
      if (!r.ok) throw new Error(`${r.status}`)
      return r.json()
    }),
  getCustomerByPhone: (phone: string) =>
    fetch(`${BASE}/customers/phone/${encodeURIComponent(phone)}`),
  createCustomer: (body: { fullName: string; phone: string; email?: string; address?: string }) =>
    fetch(`${BASE}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  /* ── Health check ── */
  ping: () =>
    fetch(`${BASE}/products`, { signal: AbortSignal.timeout(3000) })
      .then((r) => r.ok)
      .catch(() => false),
}
