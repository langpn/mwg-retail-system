'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  BRANCHES,
  matchesBudget,
  type BranchId,
  type BrandId,
  type BudgetId,
  type CategoryId,
  type Order,
  type Product,
} from '@/lib/dmx-data'
import { api, type ProductPageParams } from '@/lib/api'
import {
  mapBackendProduct,
  mapBackendOrder,
  applyStockMatrix,
  catalogAdapter,
  CATEGORY_ID_TO_CODE,
} from '@/lib/catalog'
import { submitOrder, type OrderItemInput } from '@/lib/order-service'
import { CUSTOMER_STORAGE_KEY } from '@/lib/auth-config'

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
  role?: 'CUSTOMER' | 'ADMIN'
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
  sort: SortOption
  setSort: (s: SortOption) => void
  page: number
  pageSize: number
  pagedProducts: Product[]
  totalProducts: number
  totalPages: number
  pageLoading: boolean
  setPage: (p: number) => void
  setPageSize: (s: number) => void
  backendConnected: boolean | null
  reloadFromBackend: () => void
  refreshOrders: () => Promise<void>
  cart: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  updateCartQty: (sku: string, quantity: number) => void
  removeFromCart: (sku: string) => void
  clearCart: () => void
  cartCount: number
  cartSubtotal: number
  placeCartOrder: (input: CartCheckoutInput) => Promise<Order | { error: string }>
  customer: CustomerProfile | null
  loginCustomer: (profile: CustomerProfile) => void
  logoutCustomer: () => void
}

const StoreContext = createContext<StoreValue | null>(null)

const BUDGET_PRICE_RANGE: Record<BudgetId, { minPrice?: number; maxPrice?: number }> = {
  any: {},
  lt8: { maxPrice: 8_000_000 },
  lt10: { maxPrice: 10_000_000 },
  lt15: { maxPrice: 15_000_000 },
  premium: { minPrice: 15_000_000 },
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [branchId, setBranchId] = useState<BranchId>('q9')
  const [category, setCategory] = useState<CategoryId>('all')
  const [brands, setBrands] = useState<BrandId[]>([])
  const [budget, setBudget] = useState<BudgetId>('any')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortOption>('default')
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null)

  const [pageSize, setPageSizeState] = useState(8)
  const [serverPage, setServerPage] = useState<{
    key: string
    products: Product[]
    totalElements: number
    totalPages: number
  } | null>(null)
  const [pageLoading, setPageLoading] = useState(false)

  /* ── Customer persistence ── */
  const [customer, setCustomer] = useState<CustomerProfile | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CUSTOMER_STORAGE_KEY)
      if (saved) setCustomer(JSON.parse(saved))
    } catch {}
  }, [])

  const loginCustomer = useCallback((profile: CustomerProfile) => {
    setCustomer(profile)
    try { localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(profile)) } catch {}
  }, [])

  const logoutCustomer = useCallback(() => {
    setCustomer(null)
    try { localStorage.removeItem(CUSTOMER_STORAGE_KEY) } catch {}
  }, [])

  /* ── Cart persistence ── */
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mwg_cart_v1')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) setCart(parsed)
      }
    } catch {}
  }, [])

  const persistCart = useCallback((next: CartItem[]) => {
    try { localStorage.setItem('mwg_cart_v1', JSON.stringify(next)) } catch {}
  }, [])

  useEffect(() => {
    if (!products.length) return
    setCart((previous) => {
      const next = previous.map((item) => {
        const product = products.find((entry) => entry.sku === item.product.sku)
        return product && product !== item.product ? { ...item, product } : item
      })
      if (next.every((item, index) => item === previous[index])) return previous
      persistCart(next)
      return next
    })
  }, [products, persistCart])

  const addToCart = useCallback((product: Product, quantity = 1) => {
    // Chi nhánh hiện tại phải đủ hàng, nếu không thì chuyển sang chi nhánh còn hàng.
    const currentBranchStock = product.stock[branchId] ?? 0
    let targetBranch = branchId
    if (currentBranchStock < quantity) {
      const availableBranch =
        BRANCHES.find((b) => (product.stock[b.id] ?? 0) >= quantity) ??
        BRANCHES.find((b) => (product.stock[b.id] ?? 0) > 0)
      if (!availableBranch) return // Hết hàng toàn hệ thống
      targetBranch = availableBranch.id
      setBranchId(targetBranch)
    }
    const maxStock = product.stock[targetBranch] ?? 0
    if (maxStock <= 0) return

    setCart((prev) => {
      const existing = prev.find((item) => item.product.sku === product.sku)
      const updated = existing
        ? prev.map((item) =>
            item.product.sku === product.sku
              ? { ...item, quantity: Math.min(maxStock, item.quantity + quantity) }
              : item,
          )
        : [...prev, { product, quantity: Math.min(maxStock, quantity) }]
      persistCart(updated)
      return updated
    })
  }, [persistCart, branchId])

  /* Giữ giỏ hàng luôn khả thi: nếu chi nhánh đang chọn không đủ hàng cho mọi món,
     tự chuyển sang chi nhánh đáp ứng được toàn bộ giỏ. */
  useEffect(() => {
    if (cart.length === 0) return
    const shortAtCurrent = cart.some((item) => (item.product.stock[branchId] ?? 0) < item.quantity)
    if (!shortAtCurrent) return
    const betterBranch = BRANCHES.find((b) =>
      cart.every((item) => (item.product.stock[b.id] ?? 0) >= item.quantity),
    )
    if (betterBranch) setBranchId(betterBranch.id)
  }, [cart, branchId, products])

  const updateCartQty = useCallback((sku: string, quantity: number) => {
    const inCart = cart.find((item) => item.product.sku === sku)
    const stock = inCart?.product.stock[branchId] ?? 1
    const qty = Math.max(1, Math.min(Math.max(1, stock), Math.floor(quantity)))
    setCart((prev) => {
      const updated = prev.map((item) => item.product.sku === sku ? { ...item, quantity: qty } : item)
      persistCart(updated)
      return updated
    })
  }, [persistCart, cart, branchId])

  const removeFromCart = useCallback((sku: string) => {
    setCart((prev) => {
      const updated = prev.filter((item) => item.product.sku !== sku)
      persistCart(updated)
      return updated
    })
  }, [persistCart])

  const clearCart = useCallback(() => {
    setCart([])
    persistCart([])
  }, [persistCart])

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
      case 'price-asc': return [...list].sort((a, b) => a.price - b.price)
      case 'price-desc': return [...list].sort((a, b) => b.price - a.price)
      case 'discount':
        return [...list].sort((a, b) => {
          const dA = a.listPrice > 0 ? (a.listPrice - a.price) / a.listPrice : 0
          const dB = b.listPrice > 0 ? (b.listPrice - b.price) / b.listPrice : 0
          return dB - dA
        })
      default: return list
    }
  }, [products, category, brands, budget, query, sort])

  /* ── Pagination ── */
  const filtersKey = `${category}|${brands.join(',')}|${budget}|${query.trim()}|${sort}|${pageSize}`
  const [pager, setPager] = useState<{ key: string; page: number }>({ key: filtersKey, page: 0 })
  const page = pager.key === filtersKey ? pager.page : 0

  useEffect(() => {
    setPager((prev) => (prev.key === filtersKey && prev.page === 0 ? prev : { key: filtersKey, page: 0 }))
  }, [filtersKey])

  const setPage = useCallback(
    (p: number) => { setPager({ key: filtersKey, page: Math.max(0, Math.floor(p)) }) },
    [filtersKey],
  )

  const setPageSize = useCallback((s: number) => {
    setPageSizeState(Math.max(1, Math.floor(s)))
  }, [])

  const serverSort = useMemo(() => {
    switch (sort) {
      case 'price-asc': return { sortBy: 'price', sortDir: 'asc' }
      case 'price-desc': return { sortBy: 'price', sortDir: 'desc' }
      default: return { sortBy: 'id', sortDir: 'asc' }
    }
  }, [sort])

  const useServerPaging = backendConnected === true && sort !== 'discount'

  const stockBySku = useMemo(() => {
    const map = new Map<string, Record<BranchId, number>>()
    for (const p of products) map.set(p.sku, p.stock)
    return map
  }, [products])

  const stockBySkuRef = useRef(stockBySku)
  useEffect(() => { stockBySkuRef.current = stockBySku }, [stockBySku])

  const pageKey = `${filtersKey}|${page}`

  /* ── Server-side page fetch ── */
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
    api.products
      .page(params)
      .then((res) => {
        if (cancelled) return
        const content = Array.isArray(res?.content) ? res.content : []
        const mapped = content.map((bp) => mapBackendProduct(bp, [], stockBySkuRef.current.get(bp.sku)))
        const total = res.totalElements ?? mapped.length
        const pages = Math.max(1, res.totalPages ?? 1)
        if (res.totalPages > 0 && page >= res.totalPages) {
          setPager({ key: filtersKey, page: Math.max(0, res.totalPages - 1) })
          return
        }
        setServerPage({ key: pageKey, products: mapped, totalElements: total, totalPages: pages })
      })
      .catch(() => { if (!cancelled) setServerPage(null) })
      .finally(() => { if (!cancelled) setPageLoading(false) })
    return () => { cancelled = true }
  }, [useServerPaging, page, pageSize, category, brands, budget, query, serverSort, pageKey, filtersKey])

  const liveServerPage = useServerPaging && serverPage?.key === pageKey ? serverPage : null

  const pagedProducts = useMemo(() => {
    if (liveServerPage) {
      return liveServerPage.products.map((p) => {
        const stock = stockBySku.get(p.sku)
        return stock ? { ...p, stock } : p
      })
    }
    return filteredProducts.slice(page * pageSize, (page + 1) * pageSize)
  }, [liveServerPage, filteredProducts, page, pageSize, stockBySku])

  const totalProducts = liveServerPage ? liveServerPage.totalElements : filteredProducts.length
  const totalPages = liveServerPage
    ? Math.max(1, liveServerPage.totalPages)
    : Math.max(1, Math.ceil(filteredProducts.length / pageSize))

  const reloadFromBackend = useCallback(async () => {
    const connected = await api.ping()
    setBackendConnected(null)
    try {
      const catalog = await catalogAdapter(connected).load()
      setProducts(catalog.products)
      setOrders(catalog.orders)
    } catch {
      setProducts([])
      setOrders([])
    }
    setBackendConnected(connected)
  }, [])

  const didLoad = useRef(false)
  useEffect(() => {
    if (didLoad.current) return
    didLoad.current = true
    reloadFromBackend()
  }, [reloadFromBackend])

  /* ── Orders refresh (does not reset connection state or reload the catalog) ── */
  const refreshOrders = useCallback(async () => {
    try {
      const list = await api.orders.list()
      setOrders(list.map((order) => mapBackendOrder(order)))
    } catch {}
  }, [])

  /* ── Refresh stock from stock-matrix after a successful order ── */
  const refreshStockMatrix = useCallback(async () => {
    try {
      const matrix = await api.inventory.stockMatrix()
      setProducts((prev) => applyStockMatrix(prev, matrix))
    } catch {}
  }, [])

  const submit = useCallback(async (items: OrderItemInput[], input: CartCheckoutInput) => {
    const result = await submitOrder(backendConnected, items, products, input, Math.max(...orders.map((o) => o.id), 10250) + 1)
    if ('error' in result) return result
    setOrders((prev) => [...prev, result])
    if (backendConnected === false) {
      setProducts((prev) => prev.map((product) => {
        const item = items.find((entry) => entry.product.sku === product.sku)
        return item ? { ...product, stock: { ...product.stock, [input.branchId]: product.stock[input.branchId] - item.quantity } } : product
      }))
    } else {
      await refreshStockMatrix()
    }
    return result
  }, [backendConnected, products, orders, refreshStockMatrix])

  const placeCartOrder = useCallback(async (input: CartCheckoutInput) => {
    const result = await submit(cart, input)
    if (!('error' in result)) clearCart()
    return result
  }, [cart, submit, clearCart])

  const value = useMemo<StoreValue>(
    () => ({
      products,
      filteredProducts,
      orders,
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
      backendConnected,
      reloadFromBackend,
      refreshOrders,
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
    }),
    [
      products, filteredProducts, orders, branchId, category, brands, budget, query,
      sort, page, pageSize, pagedProducts, totalProducts, totalPages, pageLoading,
      backendConnected, cart, cartCount, cartSubtotal, customer,
      setBranchId, setCategory, toggleBrand, setBudget, setQuery, resetFilters,
      setSort, setPage, setPageSize,
      reloadFromBackend, refreshOrders, addToCart, updateCartQty,
      removeFromCart, clearCart, placeCartOrder, loginCustomer, logoutCustomer,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
