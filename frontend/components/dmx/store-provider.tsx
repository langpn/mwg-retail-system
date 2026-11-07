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
import { api } from '@/lib/api'

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

const CATEGORY_CODE_MAP: Record<string, Exclude<CategoryId, 'all'>> = {
  MAYGIAT: 'washer',
  TULANH: 'fridge',
  TIVI: 'tv',
}

function mapBackendProduct(bp: any, inventories: any[]): Product {
  const categoryCode = bp.category?.code ?? ''
  const brandName = bp.brand?.name ?? 'Toshiba'

  const stock: Record<BranchId, number> = { q9: 0, td: 0 }
  for (const inv of inventories) {
    if (inv.product?.id === bp.id) {
      const key = BRANCH_KEY_MAP[inv.storeBranch?.id]
      if (key) stock[key] = inv.quantity ?? 0
    }
  }

  // Try to find matching hardcoded product for listPrice, specs, image
  const hardcoded = INITIAL_PRODUCTS.find((p) => p.sku === bp.sku)

  return {
    id: bp.id,
    sku: bp.sku,
    name: bp.name,
    category: CATEGORY_CODE_MAP[categoryCode] ?? 'small',
    brand: brandName as BrandId,
    price: bp.price,
    listPrice: hardcoded?.listPrice ?? Math.round(bp.price * 1.25),
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
