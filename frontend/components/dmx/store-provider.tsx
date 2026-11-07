'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  PROMO_CODES,
  matchesBudget,
  type BranchId,
  type BrandId,
  type BudgetId,
  type CategoryId,
  type Order,
  type Product,
} from '@/lib/dmx-data'
import { api, buildProductPageQuery, type ProductPageParams } from '@/lib/api'

export type ViewTab = 'catalog' | 'inventory'
export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'discount'

export interface CartItem {
  product: Product
  quantity: number
}

export interface CustomerProfile {
  id?: number
  fullName: string
  phone: string
  email?: string
  address?: string
}

export interface ApiLogEntry {
  id: number
  method: 'GET' | 'PUT' | 'POST' | 'PATCH'
  path: string
  status: number
  detail: string
  at: string
}

interface NewOrderInput {
  sku: string
  quantity: number
  customerName: string
  phone: string
  address: string
  branchId: BranchId
  promoCode: string
}

interface CartCheckoutInput {
  customerName: string
  phone: string
  address: string
  branchId: BranchId
  promoCode: string
}

interface StoreValue {
  products: Product[]
  filteredProducts: Product[]
  orders: Order[]
  apiLog: ApiLogEntry[]
  branchId: BranchId
  setBranchId: (id: BranchId) => void
  category: CategoryId
  setCategory: (id: CategoryId) => void
  brands: BrandId[]
  toggleBrand: (id: BrandId) => void
  budget: BudgetId
  setBudget: (id: BudgetId) => void
  query: string
  setQuery: (q: string) => void
  resetFilters: () => void
  tab: ViewTab
  setTab: (tab: ViewTab) => void
  sort: SortOption
  setSort: (s: SortOption) => void
  /* ── Server-side pagination for the home product grid ── */
  page: number
  pageSize: number
  pagedProducts: Product[]
  totalProducts: number
  totalPages: number
  pageLoading: boolean
  setPage: (p: number) => void
  setPageSize: (s: number) => void
  orderSku: string
  startOrder: (sku: string) => void
  setOrderSku: (sku: string) => void
  updateStock: (sku: string, branchId: BranchId, quantity: number) => void
  placeOrder: (input: NewOrderInput) => Promise<Order | { error: string }>
  confirmOrder: (id: number) => void
  backendConnected: boolean | null
  reloadFromBackend: () => void
  // Cart
  cart: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  updateCartQty: (sku: string, quantity: number) => void
  removeFromCart: (sku: string) => void
  clearCart: () => void
  cartCount: number
  cartSubtotal: number
  placeCartOrder: (input: CartCheckoutInput) => Promise<Order | { error: string }>
  // Customer Authentication
  customer: CustomerProfile | null
  loginCustomer: (profile: CustomerProfile) => void
  logoutCustomer: () => void
}

const StoreContext = createContext<StoreValue | null>(null)

let logCounter = 1

/* ── Mapping helpers ── */
const BRANCH_ID_MAP: Record<BranchId, number> = { q9: 1, td: 2 }
const BRANCH_KEY_MAP: Record<number, BranchId> = { 1: 'q9', 2: 'td' }

/* Backend category code → frontend CategoryId */
const CATEGORY_CODE_MAP: Record<string, Exclude<CategoryId, 'all'>> = {
  MAYGIAT: 'washer',
  TULANH: 'fridge',
  TIVI: 'tv',
  GIADUNG: 'small',
}

/* Frontend CategoryId → backend category code */
const CATEGORY_ID_TO_CODE: Record<Exclude<CategoryId, 'all'>, string> = {
  washer: 'MAYGIAT',
  fridge: 'TULANH',
  tv: 'TIVI',
  small: 'GIADUNG',
}

/* Budget filter → backend price range */
const BUDGET_PRICE_RANGE: Record<BudgetId, { minPrice?: number; maxPrice?: number }> = {
  any: {},
  lt8: { maxPrice: 8_000_000 },
  lt10: { maxPrice: 10_000_000 },
  lt15: { maxPrice: 15_000_000 },
  premium: { minPrice: 15_000_000 },
}

function mapBackendProduct(
  bp: any,
  inventories: any[],
  existingStock?: Record<BranchId, number>,
): Product {
  const categoryCode = bp.category?.code ?? ''
  const brandName = bp.brand?.name ?? 'Toshiba'

  const stock: Record<BranchId, number> = { q9: 0, td: 0 }
  if (existingStock) {
    stock.q9 = existingStock.q9
    stock.td = existingStock.td
  } else if (inventories.length > 0) {
    for (const inv of inventories) {
      if (inv.product?.id === bp.id) {
        const key = BRANCH_KEY_MAP[inv.storeBranch?.id]
        if (key) stock[key] = inv.quantity ?? 0
      }
    }
  }

  // Try to find matching hardcoded product for listPrice, specs, image
  const hardcoded = INITIAL_PRODUCTS.find((p) => p.sku === bp.sku)

  // Never show a page as "out of stock" just because inventory has not loaded yet.
  if (!existingStock && inventories.length === 0 && hardcoded) {
    stock.q9 = hardcoded.stock.q9
    stock.td = hardcoded.stock.td
  }

  const safeListPrice =
    hardcoded && hardcoded.listPrice > bp.price
      ? hardcoded.listPrice
      : Math.round((bp.price * 1.22) / 10_000) * 10_000

  return {
    id: bp.id,
    sku: bp.sku,
    name: bp.name,
    category: CATEGORY_CODE_MAP[categoryCode] ?? 'small',
    brand: brandName as BrandId,
    price: bp.price,
    listPrice: safeListPrice,
    specs: hardcoded?.specs ?? [bp.description ?? ''],
    image: hardcoded?.image ?? '/products/washer-front.png',
    stock,
  }
}

function mapBackendOrder(bo: any): Order {
  const item = bo.orderItems?.[0]
  return {
    id: bo.id,
    sku: item?.product?.sku ?? '',
    productName: item?.product?.name ?? '',
    quantity: item?.quantity ?? 1,
    customerName: bo.customerName,
    phone: bo.phone,
    address: bo.shippingAddress,
    branchId: 'q9',
    promoCode: bo.promotion?.promoCode ?? null,
    subtotal: item ? item.unitPrice * item.quantity : bo.totalAmount,
    discount: 0,
    total: bo.totalAmount,
    status: bo.status as Order['status'],
    createdAt: bo.orderDate,
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS)
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS)
  const [apiLog, setApiLog] = useState<ApiLogEntry[]>([])
  const [branchId, setBranchId] = useState<BranchId>('q9')
  const [category, setCategory] = useState<CategoryId>('all')
  const [brands, setBrands] = useState<BrandId[]>([])
  const [budget, setBudget] = useState<BudgetId>('any')
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<ViewTab>('catalog')
  const [sort, setSort] = useState<SortOption>('default')
  const [orderSku, setOrderSku] = useState(INITIAL_PRODUCTS[0].sku)
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null)

  /* ── Home grid pagination state (server-side + offline fallback) ── */
  const [pageSize, setPageSizeState] = useState(8)
  const [serverPage, setServerPage] = useState<{
    key: string
    products: Product[]
    totalElements: number
    totalPages: number
  } | null>(null)
  const [pageLoading, setPageLoading] = useState(false)

  // Customer state with persistence
  const [customer, setCustomer] = useState<CustomerProfile | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mwg_customer_v1')
      if (saved) {
        setCustomer(JSON.parse(saved))
      }
    } catch {}
  }, [])

  const loginCustomer = useCallback((profile: CustomerProfile) => {
    setCustomer(profile)
    try {
      localStorage.setItem('mwg_customer_v1', JSON.stringify(profile))
    } catch {}
  }, [])

  const logoutCustomer = useCallback(() => {
    setCustomer(null)
    try {
      localStorage.removeItem('mwg_customer_v1')
    } catch {}
  }, [])

  // Cart state with persistence
  const [cart, setCart] = useState<CartItem[]>([
    { product: INITIAL_PRODUCTS[0], quantity: 1 },
  ])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mwg_cart_v1')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCart(parsed)
        }
      }
    } catch {}
  }, [])

  const saveCart = useCallback((nextCart: CartItem[]) => {
    setCart(nextCart)
    try {
      localStorage.setItem('mwg_cart_v1', JSON.stringify(nextCart))
    } catch {}
  }, [])

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.sku === product.sku)
      let updated: CartItem[]
      if (existing) {
        updated = prev.map((item) =>
          item.product.sku === product.sku
            ? { ...item, quantity: Math.min(5, item.quantity + quantity) }
            : item,
        )
      } else {
        updated = [...prev, { product, quantity }]
      }
      try {
        localStorage.setItem('mwg_cart_v1', JSON.stringify(updated))
      } catch {}
      return updated
    })
  }, [])

  const updateCartQty = useCallback((sku: string, quantity: number) => {
    const qty = Math.max(1, Math.min(5, Math.floor(quantity)))
    setCart((prev) => {
      const updated = prev.map((item) =>
        item.product.sku === sku ? { ...item, quantity: qty } : item,
      )
      try {
        localStorage.setItem('mwg_cart_v1', JSON.stringify(updated))
      } catch {}
      return updated
    })
  }, [])

  const removeFromCart = useCallback((sku: string) => {
    setCart((prev) => {
      const updated = prev.filter((item) => item.product.sku !== sku)
      try {
        localStorage.setItem('mwg_cart_v1', JSON.stringify(updated))
      } catch {}
      return updated
    })
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
    try {
      localStorage.removeItem('mwg_cart_v1')
    } catch {}
  }, [])

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart])
  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart],
  )

  const toggleBrand = useCallback((id: BrandId) => {
    setBrands((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]))
  }, [])

  const resetFilters = useCallback(() => {
    setCategory('all')
    setBrands([])
    setBudget('any')
    setQuery('')
    setSort('default')
  }, [])

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = products.filter((p) => {
      if (category !== 'all' && p.category !== category) return false
      if (brands.length > 0 && !brands.includes(p.brand)) return false
      if (!matchesBudget(p.price, budget)) return false
      if (q && !`${p.name} ${p.sku} ${p.brand} ${p.specs.join(' ')}`.toLowerCase().includes(q)) return false
      return true
    })

    switch (sort) {
      case 'price-asc':
        return [...list].sort((a, b) => a.price - b.price)
      case 'price-desc':
        return [...list].sort((a, b) => b.price - a.price)
      case 'discount':
        return [...list].sort((a, b) => {
          const discA = a.listPrice > 0 ? (a.listPrice - a.price) / a.listPrice : 0
          const discB = b.listPrice > 0 ? (b.listPrice - b.price) / b.listPrice : 0
          return discB - discA
        })
      default:
        return list
    }
  }, [products, category, brands, budget, query, sort])

  const pushLog = useCallback((entry: Omit<ApiLogEntry, 'id' | 'at'>) => {
    setApiLog((prev) => [{ ...entry, id: logCounter++, at: new Date().toISOString() }, ...prev].slice(0, 6))
  }, [])

  /* ── Pagination controls ── */
  // A single key covering everything that invalidates the current page. When any
  // filter/sort/page-size changes, `page` resolves to 0 during render, so the
  // grid never requests a stale page and never flashes an empty one.
  const filtersKey = `${category}|${brands.join(',')}|${budget}|${query.trim()}|${sort}|${pageSize}`
  const [pager, setPager] = useState<{ key: string; page: number }>({ key: filtersKey, page: 0 })
  const page = pager.key === filtersKey ? pager.page : 0

  // Persist the reset so returning to an earlier filter set never restores a
  // stale page number (the derived `page` above already reads 0 this render).
  useEffect(() => {
    setPager((prev) => (prev.key === filtersKey && prev.page === 0 ? prev : { key: filtersKey, page: 0 }))
  }, [filtersKey])

  const setPage = useCallback(
    (p: number) => {
      setPager({ key: filtersKey, page: Math.max(0, Math.floor(p)) })
    },
    [filtersKey],
  )

  const setPageSize = useCallback((s: number) => {
    setPageSizeState(Math.max(1, Math.floor(s)))
  }, [])

  /* Sort option → backend sortBy/sortDir (discount is computed client-side). */
  const serverSort = useMemo(() => {
    switch (sort) {
      case 'price-asc':
        return { sortBy: 'price', sortDir: 'asc' }
      case 'price-desc':
        return { sortBy: 'price', sortDir: 'desc' }
      default:
        return { sortBy: 'id', sortDir: 'asc' }
    }
  }, [sort])

  /* 'discount' only exists in the client dataset (it needs listPrice). */
  const useServerPaging = backendConnected === true && sort !== 'discount'

  /* Latest stock map, kept in a ref so inventory edits never refetch a page. */
  const stockBySku = useMemo(() => {
    const map = new Map<string, Record<BranchId, number>>()
    for (const p of products) map.set(p.sku, p.stock)
    return map
  }, [products])

  const stockBySkuRef = useRef(stockBySku)
  useEffect(() => {
    stockBySkuRef.current = stockBySku
  }, [stockBySku])

  const pageKey = `${filtersKey}|${page}`

  /* ── Fetch one page from the real backend ── */
  useEffect(() => {
    if (!useServerPaging) {
      setServerPage(null)
      setPageLoading(false)
      return
    }

    let cancelled = false

    const params: ProductPageParams = {
      page,
      size: pageSize,
      sortBy: serverSort.sortBy,
      sortDir: serverSort.sortDir,
      ...(category !== 'all' ? { category: CATEGORY_ID_TO_CODE[category] } : {}),
      ...(brands.length > 0 ? { brand: brands.join(',') } : {}),
      ...BUDGET_PRICE_RANGE[budget],
      ...(query.trim() ? { keyword: query.trim() } : {}),
    }

    setPageLoading(true)

    api
      .getProductsPage(params)
      .then((res) => {
        if (cancelled) return
        const content = Array.isArray(res?.content) ? res.content : []
        const stockMap = stockBySkuRef.current
        const mapped = content.map((bp: any) => mapBackendProduct(bp, [], stockMap.get(bp.sku)))
        const total = res.totalElements ?? mapped.length
        const pages = Math.max(1, res.totalPages ?? 1)

        // The current page may no longer exist after a delete: clamp back.
        if (res.totalPages > 0 && page >= res.totalPages) {
          setPager({ key: filtersKey, page: Math.max(0, res.totalPages - 1) })
          return
        }

        setServerPage({ key: pageKey, products: mapped, totalElements: total, totalPages: pages })
        pushLog({
          method: 'GET',
          path: `/api/v1/products/page?${buildProductPageQuery(params)}`,
          status: 200,
          detail: `${mapped.length} SP · trang ${(res.page ?? page) + 1}/${pages} · ${total} tổng`,
        })
      })
      .catch(() => {
        if (cancelled) return
        // Graceful degradation: the grid falls back to the in-memory slice.
        setServerPage(null)
      })
      .finally(() => {
        if (!cancelled) setPageLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [
    useServerPaging,
    page,
    pageSize,
    category,
    brands,
    budget,
    query,
    serverSort,
    pageKey,
    filtersKey,
    pushLog,
  ])

  /* ── Grid data: server page when online, instant local slice otherwise ── */
  const liveServerPage = useServerPaging && serverPage?.key === pageKey ? serverPage : null

  const pagedProducts = useMemo(() => {
    if (liveServerPage) {
      // Re-attach the freshest stock so inventory edits show instantly.
      return liveServerPage.products.map((p) => {
        const stock = stockBySkuRef.current.get(p.sku)
        return stock ? { ...p, stock } : p
      })
    }
    return filteredProducts.slice(page * pageSize, (page + 1) * pageSize)
  }, [liveServerPage, filteredProducts, page, pageSize, products])

  const totalProducts = liveServerPage ? liveServerPage.totalElements : filteredProducts.length

  const totalPages = liveServerPage
    ? Math.max(1, liveServerPage.totalPages)
    : Math.max(1, Math.ceil(filteredProducts.length / pageSize))

  /* ── Load data from backend ── */
  const reloadFromBackend = useCallback(async () => {
    try {
      const [backendProducts, inv1, inv2, backendOrders] = await Promise.all([
        api.getProducts(),
        api.getBranchInventory(1),
        api.getBranchInventory(2),
        api.getOrders(),
      ])

      const allInventories = [...inv1, ...inv2]
      const mapped = (backendProducts as any[]).map((bp) => mapBackendProduct(bp, allInventories))

      pushLog({
        method: 'GET',
        path: '/api/v1/products',
        status: 200,
        detail: `Loaded ${mapped.length} products from backend`,
      })

      if (mapped.length > 0) setProducts(mapped)

      const mappedOrders = (backendOrders as any[]).map(mapBackendOrder)
      if (mappedOrders.length > 0) setOrders(mappedOrders)

      setBackendConnected(true)
    } catch {
      setBackendConnected(false)
    }
  }, [pushLog])

  const didLoad = useRef(false)
  useEffect(() => {
    if (didLoad.current) return
    didLoad.current = true
    reloadFromBackend()
  }, [reloadFromBackend])

  /* ── Update stock (real API) ── */
  const updateStock = useCallback(
    async (sku: string, target: BranchId, quantity: number) => {
      const safe = Math.max(0, Math.min(999, Math.floor(quantity)))
      const product = products.find((p) => p.sku === sku)

      setProducts((prev) =>
        prev.map((p) => (p.sku === sku ? { ...p, stock: { ...p.stock, [target]: safe } } : p)),
      )

      if (backendConnected && product?.id) {
        try {
          await api.updateStock(product.id, BRANCH_ID_MAP[target], safe)
          pushLog({
            method: 'PUT',
            path: `/api/v1/inventory/update`,
            status: 200,
            detail: `{ "productId": ${product.id}, "branchId": ${BRANCH_ID_MAP[target]}, "quantity": ${safe} }`,
          })
        } catch {
          pushLog({
            method: 'PUT',
            path: `/api/v1/inventory/update`,
            status: 500,
            detail: 'Backend error — updated locally only',
          })
        }
      } else {
        pushLog({
          method: 'PUT',
          path: `/api/v1/inventory/${sku}?branch=${target.toUpperCase()}`,
          status: 200,
          detail: `{ "quantity": ${safe} } (local)`,
        })
      }
    },
    [products, backendConnected, pushLog],
  )

  const startOrder = useCallback((sku: string) => {
    setOrderSku(sku)
    const product = products.find((p) => p.sku === sku)
    if (product) {
      addToCart(product, 1)
    }
  }, [products, addToCart])

  /* ── Place single order ── */
  const placeOrder = useCallback(
    async (input: NewOrderInput): Promise<Order | { error: string }> => {
      const product = products.find((p) => p.sku === input.sku)
      if (!product) return { error: 'Sản phẩm không tồn tại.' }
      const qty = Math.floor(input.quantity)
      if (!Number.isFinite(qty) || qty < 1 || qty > 5) return { error: 'Số lượng phải từ 1 đến 5.' }
      if (product.stock[input.branchId] < qty)
        return { error: `Chi nhánh chỉ còn ${product.stock[input.branchId]} sản phẩm.` }

      const subtotal = product.price * qty
      const code = input.promoCode.trim().toUpperCase()
      const promo = PROMO_CODES[code]
      const discount = promo ? promo.compute(subtotal) : 0

      if (backendConnected && product.id) {
        try {
          const res = await api.createOrder({
            customerName: input.customerName.trim(),
            phone: input.phone.trim(),
            shippingAddress: input.address.trim() || 'Nhận tại cửa hàng',
            promoCode: promo ? code : '',
            branchId: BRANCH_ID_MAP[input.branchId],
            items: [{ productId: product.id, quantity: qty }],
          })

          if (!res.ok) {
            const text = await res.text()
            pushLog({
              method: 'POST',
              path: '/api/v1/orders',
              status: res.status,
              detail: text || 'Bad Request',
            })
            return { error: 'Backend từ chối đơn hàng.' }
          }

          const created = await res.json()
          const order: Order = {
            id: created.id,
            sku: product.sku,
            productName: product.name,
            quantity: qty,
            customerName: input.customerName.trim(),
            phone: input.phone.trim(),
            address: input.address.trim() || 'Nhận tại cửa hàng',
            branchId: input.branchId,
            promoCode: promo ? code : null,
            subtotal,
            discount,
            total: created.totalAmount ?? subtotal - discount,
            status: created.status ?? 'PENDING',
            createdAt: created.orderDate ?? new Date().toISOString(),
          }

          setOrders((prev) => [...prev, order])
          setProducts((prev) =>
            prev.map((p) =>
              p.sku === product.sku
                ? { ...p, stock: { ...p.stock, [input.branchId]: p.stock[input.branchId] - qty } }
                : p,
            ),
          )
          return order
        } catch {
          // Fallback local
        }
      }

      // Local order
      const order: Order = {
        id: Math.max(...orders.map((o) => o.id), 10250) + 1,
        sku: product.sku,
        productName: product.name,
        quantity: qty,
        customerName: input.customerName.trim(),
        phone: input.phone.trim(),
        address: input.address.trim() || 'Nhận tại cửa hàng',
        branchId: input.branchId,
        promoCode: promo ? code : null,
        subtotal,
        discount,
        total: subtotal - discount,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      }
      setOrders((prev) => [...prev, order])
      setProducts((prev) =>
        prev.map((p) =>
          p.sku === product.sku
            ? { ...p, stock: { ...p.stock, [input.branchId]: p.stock[input.branchId] - qty } }
            : p,
        ),
      )
      return order
    },
    [products, orders, backendConnected, pushLog],
  )

  /* ── Place cart checkout order ── */
  const placeCartOrder = useCallback(
    async (input: CartCheckoutInput): Promise<Order | { error: string }> => {
      if (cart.length === 0) return { error: 'Giỏ hàng đang trống.' }

      const code = input.promoCode.trim().toUpperCase()
      const promo = PROMO_CODES[code]
      const discount = promo ? promo.compute(cartSubtotal) : 0
      const primaryProduct = cart[0].product

      if (backendConnected) {
        try {
          const itemsPayload = cart
            .filter((item) => item.product.id)
            .map((item) => ({ productId: item.product.id as number, quantity: item.quantity }))

          const res = await api.createOrder({
            customerName: input.customerName.trim(),
            phone: input.phone.trim(),
            shippingAddress: input.address.trim() || 'Nhận tại cửa hàng',
            promoCode: promo ? code : '',
            branchId: BRANCH_ID_MAP[input.branchId],
            items: itemsPayload.length > 0 ? itemsPayload : [{ productId: 1, quantity: 1 }],
          })

          if (res.ok) {
            const created = await res.json()
            const order: Order = {
              id: created.id,
              sku: primaryProduct.sku,
              productName:
                cart.length > 1
                  ? `${primaryProduct.name} và ${cart.length - 1} sản phẩm khác`
                  : primaryProduct.name,
              quantity: cartCount,
              customerName: input.customerName.trim(),
              phone: input.phone.trim(),
              address: input.address.trim() || 'Nhận tại cửa hàng',
              branchId: input.branchId,
              promoCode: promo ? code : null,
              subtotal: cartSubtotal,
              discount,
              total: created.totalAmount ?? cartSubtotal - discount,
              status: created.status ?? 'PENDING',
              createdAt: created.orderDate ?? new Date().toISOString(),
            }
            setOrders((prev) => [...prev, order])
            clearCart()
            return order
          }
        } catch {}
      }

      // Local order fallback
      const order: Order = {
        id: Math.max(...orders.map((o) => o.id), 10250) + 1,
        sku: primaryProduct.sku,
        productName:
          cart.length > 1
            ? `${primaryProduct.name} và ${cart.length - 1} sản phẩm khác`
            : primaryProduct.name,
        quantity: cartCount,
        customerName: input.customerName.trim(),
        phone: input.phone.trim(),
        address: input.address.trim() || 'Nhận tại cửa hàng',
        branchId: input.branchId,
        promoCode: promo ? code : null,
        subtotal: cartSubtotal,
        discount,
        total: cartSubtotal - discount,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      }
      setOrders((prev) => [...prev, order])
      clearCart()
      return order
    },
    [cart, cartCount, cartSubtotal, backendConnected, orders, clearCart],
  )

  /* ── Confirm order ── */
  const confirmOrder = useCallback(
    async (id: number) => {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'CONFIRMED' } : o)))
      if (backendConnected) {
        try {
          await api.updateOrderStatus(id, 'CONFIRMED')
        } catch {}
      }
    },
    [backendConnected],
  )

  const value: StoreValue = {
    products,
    filteredProducts,
    orders,
    apiLog,
    branchId,
    setBranchId,
    category,
    setCategory,
    brands,
    toggleBrand,
    budget,
    setBudget,
    query,
    setQuery,
    resetFilters,
    tab,
    setTab,
    sort,
    setSort,
    page,
    pageSize,
    pagedProducts,
    totalProducts,
    totalPages,
    pageLoading,
    setPage,
    setPageSize,
    orderSku,
    startOrder,
    setOrderSku,
    updateStock,
    placeOrder,
    confirmOrder,
    backendConnected,
    reloadFromBackend,
    cart,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    cartCount,
    cartSubtotal,
    placeCartOrder,
    customer,
    loginCustomer,
    logoutCustomer,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
