const BASE = 'http://localhost:8088/api/v1'

export const api = {
  /* ── Products ── */
  getProducts: () => fetch(`${BASE}/products`).then((r) => r.json()),
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
