const BASE = process.env.NEXT_PUBLIC_API_BASE || '/api/v1'

/* ── helpers ── */
function get<T>(path: string): Promise<T> {
  return fetch(`${BASE}${path}`).then((r) => {
    if (!r.ok) throw new Error(`${r.status}`)
    return r.json()
  })
}

function post<T>(path: string, body: unknown): Promise<T> {
  return fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((r) => {
    if (!r.ok) throw new Error(`${r.status}`)
    return r.json()
  })
}

function put<T>(path: string, body?: unknown): Promise<T> {
  return fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  }).then((r) => {
    if (!r.ok) throw new Error(`${r.status}`)
    return r.json()
  })
}

function del(path: string): Promise<void> {
  return fetch(`${BASE}${path}`, { method: 'DELETE' }).then((r) => {
    if (!r.ok) throw new Error(`${r.status}`)
  })
}

/* ── Products ── */
export const productsApi = {
  list: () => get<any[]>('/products'),
  create: (p: any) => post<any>('/products', p),
  update: (id: number, p: any) => put<any>(`/products/${id}`, p),
  remove: (id: number) => del(`/products/${id}`),
  categories: () => get<any[]>('/products/categories'),
  brands: () => get<any[]>('/products/brands'),
}

/* ── Orders ── */
export const ordersApi = {
  list: () => get<any[]>('/orders'),
  updateStatus: (id: number, status: string) => put<any>(`/orders/${id}/status?status=${status}`),
}

/* ── Inventory ── */
export const inventoryApi = {
  branches: () => get<any[]>('/inventory/branches'),
  byBranch: (id: number) => get<any[]>(`/inventory/branch/${id}`),
  update: (body: { productId: number; branchId: number; quantity: number }) =>
    put<any>('/inventory/update', body),
}

/* ── Customers ── */
export const customersApi = {
  list: () => get<any[]>('/customers'),
  create: (c: any) => post<any>('/customers', c),
  update: (id: number, c: any) => put<any>(`/customers/${id}`, c),
  remove: (id: number) => del(`/customers/${id}`),
}

/* ── Promotions ── */
export const promotionsApi = {
  list: () => get<any[]>('/promotions'),
  create: (p: any) => post<any>('/promotions', p),
  update: (id: number, p: any) => put<any>(`/promotions/${id}`, p),
  remove: (id: number) => del(`/promotions/${id}`),
}

/* ── Reviews ── */
export const reviewsApi = {
  list: () => get<any[]>('/reviews'),
  create: (r: any) => post<any>('/reviews', r),
  remove: (id: number) => del(`/reviews/${id}`),
}

/* ── Health check ── */
export const ping = () =>
  fetch(`${BASE}/products`, { signal: AbortSignal.timeout(3000) })
    .then((r) => r.ok)
    .catch(() => false)
