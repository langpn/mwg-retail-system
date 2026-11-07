'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  Tag,
  Star,
  ArrowLeft,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Lock,
} from 'lucide-react'
import Link from 'next/link'
import {
  productsApi,
  ordersApi,
  inventoryApi,
  customersApi,
  promotionsApi,
  reviewsApi,
  ping,
} from '@/lib/dashboard-api'

/* ── Types ── */
type Section = 'overview' | 'products' | 'orders' | 'customers' | 'promotions' | 'reviews'

const NAV: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Tổng quan', icon: <LayoutDashboard className="size-4" /> },
  { id: 'products', label: 'Sản phẩm', icon: <Package className="size-4" /> },
  { id: 'orders', label: 'Đơn hàng', icon: <ClipboardList className="size-4" /> },
  { id: 'customers', label: 'Khách hàng', icon: <Users className="size-4" /> },
  { id: 'promotions', label: 'Khuyến mãi', icon: <Tag className="size-4" /> },
  { id: 'reviews', label: 'Đánh giá', icon: <Star className="size-4" /> },
]

/* ══════════════════════════════════════════
   Main Dashboard App
   ══════════════════════════════════════════ */
export function DashboardApp() {
  const [section, setSection] = useState<Section>('overview')
  const [connected, setConnected] = useState<boolean | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [adminPin, setAdminPin] = useState('')
  const [pinError, setPinError] = useState<string | null>(null)

  const didCheck = useRef(false)
  useEffect(() => {
    if (didCheck.current) return
    didCheck.current = true
    ping().then(setConnected)

    try {
      const saved = localStorage.getItem('mwg_customer_v1')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.role === 'ADMIN') {
          setIsAdmin(true)
          return
        }
      }
    } catch {}
    setIsAdmin(false)
  }, [])

  if (isAdmin === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 mb-4">
            <Lock className="size-6" />
          </div>
          <h2 className="text-lg font-black text-foreground">Khu Vực Quản Trị Hệ Thống</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Trang này chỉ dành riêng cho Ban Quản Trị và Giảng viên chấm thi. Vui lòng xác thực quyền truy cập.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              const pin = adminPin.trim()
              if (
                pin === '172004' ||
                pin.toLowerCase() === 'admin' ||
                pin === '0900000000' ||
                pin === '0987654321'
              ) {
                try {
                  localStorage.setItem(
                    'mwg_customer_v1',
                    JSON.stringify({
                      id: 999,
                      fullName: 'Quản trị viên hệ thống',
                      phone: pin,
                      role: 'ADMIN',
                    }),
                  )
                } catch {}
                setIsAdmin(true)
              } else {
                setPinError('Mã PIN hoặc SĐT Quản trị không chính xác!')
              }
            }}
            className="mt-6 flex flex-col gap-3 text-left"
          >
            <div>
              <label className="mb-1.5 block text-xs font-bold text-foreground">
                Mã PIN hoặc SĐT Quản trị viên
              </label>
              <input
                type="password"
                required
                value={adminPin}
                onChange={(e) => {
                  setAdminPin(e.target.value)
                  setPinError(null)
                }}
                placeholder="Nhập mã PIN (VD: 172004) hoặc SĐT Admin"
                className="h-11 w-full rounded-xl border border-border bg-card px-3 text-center text-sm font-bold tracking-widest focus:border-primary focus:ring-4 focus:ring-primary/15 focus:outline-none"
              />
              {pinError && <p className="mt-1.5 text-center text-xs font-bold text-rose-600">{pinError}</p>}
            </div>

            <button
              type="submit"
              className="mt-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-600 text-sm font-extrabold text-white shadow-sm transition-all hover:bg-amber-700"
            >
              Mở khóa Dashboard
            </button>

            <Link
              href="/"
              className="mt-2 text-center text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              ← Quay về trang mua sắm
            </Link>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-border bg-card">
        <div className="border-b border-border px-4 py-4">
          <h1 className="text-sm font-bold text-primary">ĐMX Dashboard</h1>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Quản trị hệ thống</p>
        </div>
        <nav className="flex-1 space-y-0.5 p-2">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setSection(n.id)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                section === n.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {n.icon}
              {n.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Về trang chính
          </Link>
          <div className="mt-2 flex items-center gap-1.5 px-3 text-xs">
            <span className={`size-2 rounded-full ${connected === true ? 'bg-emerald-500' : connected === false ? 'bg-amber-500' : 'bg-slate-400'}`} />
            {connected === true ? 'API: Connected' : connected === false ? 'API: Offline' : 'API: Đang kiểm tra...'}
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto p-6">
        {section === 'overview' && <OverviewSection />}
        {section === 'products' && <ProductsSection />}
        {section === 'orders' && <OrdersSection />}
        {section === 'customers' && <CustomersSection />}
        {section === 'promotions' && <PromotionsSection />}
        {section === 'reviews' && <ReviewsSection />}
      </main>
    </div>
  )
}

/* ══════════════════════════════════════════
   Shared Components
   ══════════════════════════════════════════ */
function SectionHeader({
  title,
  count,
  onRefresh,
  onAdd,
}: {
  title: string
  count?: number
  onRefresh: () => void
  onAdd?: () => void
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-bold text-foreground">
        {title}
        {count !== undefined && (
          <span className="ml-2 text-sm font-normal text-muted-foreground">({count})</span>
        )}
      </h2>
      <div className="flex gap-2">
        <button onClick={onRefresh} className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted">
          <RefreshCw className="size-3.5" />
        </button>
        {onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-deep"
          >
            <Plus className="size-3.5" /> Thêm mới
          </button>
        )}
      </div>
    </div>
  )
}

function Confirm({ message, onYes, onNo }: { message: string; onYes: () => void; onNo: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-80 rounded-xl border bg-card p-5 shadow-lg">
        <p className="text-sm">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onNo} className="rounded-lg border px-3 py-1.5 text-xs hover:bg-muted">
            Hủy
          </button>
          <button
            onClick={onYes}
            className="rounded-lg bg-destructive px-3 py-1.5 text-xs text-white hover:bg-destructive/90"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  )
}

function fmtVND(v: number) {
  return new Intl.NumberFormat('vi-VN').format(v) + ' ₫'
}

function fmtDate(d: string) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

/* ══════════════════════════════════════════
   OVERVIEW
   ══════════════════════════════════════════ */
function OverviewSection() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, lowStock: 0, customers: 0, reviews: 0 })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [products, orders, inv1, inv2, customers, reviews] = await Promise.all([
        productsApi.list(),
        ordersApi.list(),
        inventoryApi.byBranch(1),
        inventoryApi.byBranch(2),
        customersApi.list(),
        reviewsApi.list(),
      ])
      const revenue = orders.reduce((s: number, o: any) => s + (o.totalAmount || 0), 0)
      const allInv = [...inv1, ...inv2]
      const lowStock = allInv.filter((i: any) => i.quantity <= 2).length
      setStats({
        products: products.length,
        orders: orders.length,
        revenue,
        lowStock,
        customers: customers.length,
        reviews: reviews.length,
      })
      setRecentOrders(orders.slice(-5).reverse())
    } catch { /* offline */ }
    setLoading(false)
  }, [])

  const didLoad = useRef(false)
  useEffect(() => {
    if (didLoad.current) return
    didLoad.current = true
    load()
  }, [load])

  if (loading) return <p className="text-sm text-muted-foreground">Đang tải...</p>

  const cards = [
    { label: 'Sản phẩm', value: stats.products, icon: <Package className="size-5" />, color: 'text-primary' },
    { label: 'Đơn hàng', value: stats.orders, icon: <ShoppingBag className="size-5" />, color: 'text-amber-600' },
    { label: 'Doanh thu', value: fmtVND(stats.revenue), icon: <DollarSign className="size-5" />, color: 'text-emerald-600' },
    { label: 'Tồn kho thấp', value: stats.lowStock, icon: <AlertTriangle className="size-5" />, color: 'text-red-500' },
    { label: 'Khách hàng', value: stats.customers, icon: <Users className="size-5" />, color: 'text-violet-600' },
    { label: 'Đánh giá', value: stats.reviews, icon: <Star className="size-5" />, color: 'text-yellow-500' },
  ]

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold">Tổng quan hệ thống</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{c.label}</span>
              <span className={c.color}>{c.icon}</span>
            </div>
            <p className="mt-1 text-xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <h3 className="mb-3 mt-8 flex items-center gap-2 text-sm font-bold">
        <TrendingUp className="size-4" /> Đơn hàng gần đây
      </h3>
      <div className="overflow-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-xs text-muted-foreground">
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Khách hàng</th>
              <th className="px-4 py-2 text-left">Sản phẩm</th>
              <th className="px-4 py-2 text-right">Tổng tiền</th>
              <th className="px-4 py-2 text-left">Trạng thái</th>
              <th className="px-4 py-2 text-left">Ngày</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((o: any) => (
              <tr key={o.id} className="border-b last:border-0">
                <td className="px-4 py-2 font-mono text-xs">#{o.id}</td>
                <td className="px-4 py-2">{o.customerName}</td>
                <td className="px-4 py-2 max-w-[200px] truncate">{o.orderItems?.[0]?.product?.name ?? '—'}</td>
                <td className="px-4 py-2 text-right font-medium text-price">{fmtVND(o.totalAmount)}</td>
                <td className="px-4 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusColors[o.status] ?? ''}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-xs text-muted-foreground">{fmtDate(o.orderDate)}</td>
              </tr>
            ))}
            {recentOrders.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">Chưa có đơn hàng</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   PRODUCTS CRUD
   ══════════════════════════════════════════ */
function ProductsSection() {
  const [items, setItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [editing, setEditing] = useState<any | null>(null) // null = closed, {} = new, {id} = edit
  const [deleting, setDeleting] = useState<number | null>(null)

  const load = useCallback(async () => {
    try {
      const [p, c, b] = await Promise.all([productsApi.list(), productsApi.categories(), productsApi.brands()])
      setItems(p)
      setCategories(c)
      setBrands(b)
    } catch { /* offline */ }
  }, [])

  const didLoad = useRef(false)
  useEffect(() => { if (!didLoad.current) { didLoad.current = true; load() } }, [load])

  async function handleSave(data: any) {
    try {
      if (data.id) {
        await productsApi.update(data.id, data)
      } else {
        await productsApi.create(data)
      }
      setEditing(null)
      load()
    } catch { alert('Lỗi lưu sản phẩm') }
  }

  async function handleDelete(id: number) {
    try {
      await productsApi.remove(id)
      setDeleting(null)
      load()
    } catch { alert('Lỗi xóa sản phẩm') }
  }

  return (
    <div>
      <SectionHeader title="Quản lý sản phẩm" count={items.length} onRefresh={load} onAdd={() => setEditing({})} />

      {/* Modal */}
      {editing !== null && (
        <ProductForm
          initial={editing}
          categories={categories}
          brands={brands}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}

      {deleting !== null && (
        <Confirm message="Bạn chắc chắn muốn xóa sản phẩm này?" onYes={() => handleDelete(deleting)} onNo={() => setDeleting(null)} />
      )}

      <div className="overflow-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-xs text-muted-foreground">
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">SKU</th>
              <th className="px-3 py-2 text-left">Tên sản phẩm</th>
              <th className="px-3 py-2 text-left">Danh mục</th>
              <th className="px-3 py-2 text-left">Thương hiệu</th>
              <th className="px-3 py-2 text-right">Giá</th>
              <th className="px-3 py-2 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p: any) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-3 py-2 text-xs text-muted-foreground">{p.id}</td>
                <td className="px-3 py-2 font-mono text-xs">{p.sku}</td>
                <td className="px-3 py-2 max-w-[250px] truncate">{p.name}</td>
                <td className="px-3 py-2 text-xs">{p.category?.name ?? '—'}</td>
                <td className="px-3 py-2 text-xs">{p.brand?.name ?? '—'}</td>
                <td className="px-3 py-2 text-right font-medium text-price">{fmtVND(p.price)}</td>
                <td className="px-3 py-2 text-center">
                  <div className="flex justify-center gap-1">
                    <button onClick={() => setEditing(p)} className="rounded p-1 hover:bg-muted" title="Sửa">
                      <Pencil className="size-3.5 text-primary" />
                    </button>
                    <button onClick={() => setDeleting(p.id)} className="rounded p-1 hover:bg-muted" title="Xóa">
                      <Trash2 className="size-3.5 text-destructive" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ProductForm({
  initial,
  categories,
  brands,
  onSave,
  onCancel,
}: {
  initial: any
  categories: any[]
  brands: any[]
  onSave: (d: any) => void
  onCancel: () => void
}) {
  const [sku, setSku] = useState(initial.sku ?? '')
  const [name, setName] = useState(initial.name ?? '')
  const [price, setPrice] = useState(initial.price ?? '')
  const [desc, setDesc] = useState(initial.description ?? '')
  const [catId, setCatId] = useState(initial.category?.id ?? categories[0]?.id ?? '')
  const [brandId, setBrandId] = useState(initial.brand?.id ?? brands[0]?.id ?? '')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      ...(initial.id && { id: initial.id }),
      sku,
      name,
      price: Number(price),
      description: desc,
      category: { id: Number(catId) },
      brand: { id: Number(brandId) },
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form onSubmit={submit} className="w-full max-w-md rounded-xl border bg-card p-5 shadow-lg">
        <h3 className="mb-4 font-bold">{initial.id ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h3>
        <div className="space-y-3">
          <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="SKU" required className="w-full rounded-lg border px-3 py-2 text-sm" />
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên sản phẩm" required className="w-full rounded-lg border px-3 py-2 text-sm" />
          <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Giá" type="number" required className="w-full rounded-lg border px-3 py-2 text-sm" />
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Mô tả" rows={2} className="w-full rounded-lg border px-3 py-2 text-sm" />
          <select value={catId} onChange={(e) => setCatId(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm">
            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={brandId} onChange={(e) => setBrandId(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm">
            {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-lg border px-4 py-1.5 text-sm hover:bg-muted">Hủy</button>
          <button type="submit" className="rounded-lg bg-primary px-4 py-1.5 text-sm text-primary-foreground hover:bg-primary-deep">
            {initial.id ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </div>
      </form>
    </div>
  )
}

/* ══════════════════════════════════════════
   ORDERS Management
   ══════════════════════════════════════════ */
function OrdersSection() {
  const [items, setItems] = useState<any[]>([])
  const [filter, setFilter] = useState('ALL')

  const load = useCallback(async () => {
    try { setItems(await ordersApi.list()) } catch { /* offline */ }
  }, [])

  const didLoad = useRef(false)
  useEffect(() => { if (!didLoad.current) { didLoad.current = true; load() } }, [load])

  async function changeStatus(id: number, status: string) {
    try {
      await ordersApi.updateStatus(id, status)
      load()
    } catch { alert('Lỗi cập nhật trạng thái') }
  }

  const filtered = filter === 'ALL' ? items : items.filter((o: any) => o.status === filter)

  return (
    <div>
      <SectionHeader title="Quản lý đơn hàng" count={items.length} onRefresh={load} />

      <div className="mb-4 flex gap-1">
        {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {s === 'ALL' ? 'Tất cả' : s}
          </button>
        ))}
      </div>

      <div className="overflow-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-xs text-muted-foreground">
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Khách hàng</th>
              <th className="px-3 py-2 text-left">SĐT</th>
              <th className="px-3 py-2 text-left">Sản phẩm</th>
              <th className="px-3 py-2 text-right">Tổng tiền</th>
              <th className="px-3 py-2 text-left">Trạng thái</th>
              <th className="px-3 py-2 text-left">Ngày</th>
              <th className="px-3 py-2 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o: any) => (
              <tr key={o.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-3 py-2 font-mono text-xs">#{o.id}</td>
                <td className="px-3 py-2">{o.customerName}</td>
                <td className="px-3 py-2 text-xs">{o.phone}</td>
                <td className="px-3 py-2 max-w-[200px] truncate text-xs">{o.orderItems?.[0]?.product?.name ?? '—'}</td>
                <td className="px-3 py-2 text-right font-medium text-price">{fmtVND(o.totalAmount)}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusColors[o.status] ?? ''}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{fmtDate(o.orderDate)}</td>
                <td className="px-3 py-2 text-center">
                  {o.status === 'PENDING' && (
                    <button
                      onClick={() => changeStatus(o.id, 'CONFIRMED')}
                      className="rounded bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-100"
                    >
                      Xác nhận
                    </button>
                  )}
                  {o.status === 'CONFIRMED' && (
                    <button
                      onClick={() => changeStatus(o.id, 'COMPLETED')}
                      className="rounded bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100"
                    >
                      Hoàn thành
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-6 text-center text-muted-foreground">Không có đơn hàng</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   CUSTOMERS CRUD
   ══════════════════════════════════════════ */
function CustomersSection() {
  const [items, setItems] = useState<any[]>([])
  const [editing, setEditing] = useState<any | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)

  const load = useCallback(async () => {
    try { setItems(await customersApi.list()) } catch { /* offline */ }
  }, [])

  const didLoad = useRef(false)
  useEffect(() => { if (!didLoad.current) { didLoad.current = true; load() } }, [load])

  async function handleSave(data: any) {
    try {
      if (data.id) await customersApi.update(data.id, data)
      else await customersApi.create(data)
      setEditing(null)
      load()
    } catch { alert('Lỗi lưu khách hàng') }
  }

  async function handleDelete(id: number) {
    try { await customersApi.remove(id); setDeleting(null); load() } catch { alert('Lỗi xóa') }
  }

  return (
    <div>
      <SectionHeader title="Quản lý khách hàng" count={items.length} onRefresh={load} onAdd={() => setEditing({})} />

      {editing !== null && (
        <CustomerForm initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
      )}
      {deleting !== null && (
        <Confirm message="Xóa khách hàng này?" onYes={() => handleDelete(deleting)} onNo={() => setDeleting(null)} />
      )}

      <div className="overflow-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-xs text-muted-foreground">
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Họ tên</th>
              <th className="px-3 py-2 text-left">SĐT</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Địa chỉ</th>
              <th className="px-3 py-2 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c: any) => (
              <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-3 py-2 text-xs text-muted-foreground">{c.id}</td>
                <td className="px-3 py-2 font-medium">{c.fullName}</td>
                <td className="px-3 py-2 text-xs">{c.phone}</td>
                <td className="px-3 py-2 text-xs">{c.email ?? '—'}</td>
                <td className="px-3 py-2 text-xs max-w-[200px] truncate">{c.address ?? '—'}</td>
                <td className="px-3 py-2 text-center">
                  <div className="flex justify-center gap-1">
                    <button onClick={() => setEditing(c)} className="rounded p-1 hover:bg-muted"><Pencil className="size-3.5 text-primary" /></button>
                    <button onClick={() => setDeleting(c.id)} className="rounded p-1 hover:bg-muted"><Trash2 className="size-3.5 text-destructive" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">Chưa có khách hàng</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CustomerForm({ initial, onSave, onCancel }: { initial: any; onSave: (d: any) => void; onCancel: () => void }) {
  const [fullName, setFullName] = useState(initial.fullName ?? '')
  const [phone, setPhone] = useState(initial.phone ?? '')
  const [email, setEmail] = useState(initial.email ?? '')
  const [address, setAddress] = useState(initial.address ?? '')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    onSave({ ...(initial.id && { id: initial.id }), fullName, phone, email, address })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form onSubmit={submit} className="w-full max-w-md rounded-xl border bg-card p-5 shadow-lg">
        <h3 className="mb-4 font-bold">{initial.id ? 'Sửa khách hàng' : 'Thêm khách hàng'}</h3>
        <div className="space-y-3">
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Họ tên" required className="w-full rounded-lg border px-3 py-2 text-sm" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="SĐT (0XXXXXXXXX)" required className="w-full rounded-lg border px-3 py-2 text-sm" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="w-full rounded-lg border px-3 py-2 text-sm" />
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Địa chỉ" className="w-full rounded-lg border px-3 py-2 text-sm" />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-lg border px-4 py-1.5 text-sm hover:bg-muted">Hủy</button>
          <button type="submit" className="rounded-lg bg-primary px-4 py-1.5 text-sm text-primary-foreground hover:bg-primary-deep">
            {initial.id ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </div>
      </form>
    </div>
  )
}

/* ══════════════════════════════════════════
   PROMOTIONS CRUD
   ══════════════════════════════════════════ */
function PromotionsSection() {
  const [items, setItems] = useState<any[]>([])
  const [editing, setEditing] = useState<any | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)

  const load = useCallback(async () => {
    try { setItems(await promotionsApi.list()) } catch { /* offline */ }
  }, [])

  const didLoad = useRef(false)
  useEffect(() => { if (!didLoad.current) { didLoad.current = true; load() } }, [load])

  async function handleSave(data: any) {
    try {
      if (data.id) await promotionsApi.update(data.id, data)
      else await promotionsApi.create(data)
      setEditing(null)
      load()
    } catch { alert('Lỗi lưu khuyến mãi') }
  }

  async function handleDelete(id: number) {
    try { await promotionsApi.remove(id); setDeleting(null); load() } catch { alert('Lỗi xóa') }
  }

  return (
    <div>
      <SectionHeader title="Quản lý khuyến mãi" count={items.length} onRefresh={load} onAdd={() => setEditing({})} />

      {editing !== null && (
        <PromotionForm initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
      )}
      {deleting !== null && (
        <Confirm message="Xóa mã khuyến mãi này?" onYes={() => handleDelete(deleting)} onNo={() => setDeleting(null)} />
      )}

      <div className="overflow-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-xs text-muted-foreground">
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Mã KM</th>
              <th className="px-3 py-2 text-right">% Giảm</th>
              <th className="px-3 py-2 text-left">Mô tả</th>
              <th className="px-3 py-2 text-center">Trạng thái</th>
              <th className="px-3 py-2 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p: any) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-3 py-2 text-xs text-muted-foreground">{p.id}</td>
                <td className="px-3 py-2 font-mono font-bold text-primary">{p.promoCode}</td>
                <td className="px-3 py-2 text-right font-medium">{p.discountPercent}%</td>
                <td className="px-3 py-2 text-xs max-w-[250px] truncate">{p.description ?? '—'}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {p.isActive ? 'Đang hoạt động' : 'Đã tắt'}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <div className="flex justify-center gap-1">
                    <button onClick={() => setEditing(p)} className="rounded p-1 hover:bg-muted"><Pencil className="size-3.5 text-primary" /></button>
                    <button onClick={() => setDeleting(p.id)} className="rounded p-1 hover:bg-muted"><Trash2 className="size-3.5 text-destructive" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">Chưa có khuyến mãi</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PromotionForm({ initial, onSave, onCancel }: { initial: any; onSave: (d: any) => void; onCancel: () => void }) {
  const [promoCode, setPromoCode] = useState(initial.promoCode ?? '')
  const [discountPercent, setDiscountPercent] = useState(initial.discountPercent ?? '')
  const [description, setDescription] = useState(initial.description ?? '')
  const [isActive, setIsActive] = useState(initial.isActive ?? true)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      ...(initial.id && { id: initial.id }),
      promoCode: promoCode.toUpperCase(),
      discountPercent: Number(discountPercent),
      description,
      isActive,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form onSubmit={submit} className="w-full max-w-md rounded-xl border bg-card p-5 shadow-lg">
        <h3 className="mb-4 font-bold">{initial.id ? 'Sửa khuyến mãi' : 'Thêm khuyến mãi'}</h3>
        <div className="space-y-3">
          <input value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="Mã KM (VD: SALE20)" required className="w-full rounded-lg border px-3 py-2 text-sm uppercase font-mono" />
          <input value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} placeholder="% Giảm giá" type="number" min="1" max="100" required className="w-full rounded-lg border px-3 py-2 text-sm" />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả" className="w-full rounded-lg border px-3 py-2 text-sm" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="size-4 rounded" />
            Đang hoạt động
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-lg border px-4 py-1.5 text-sm hover:bg-muted">Hủy</button>
          <button type="submit" className="rounded-lg bg-primary px-4 py-1.5 text-sm text-primary-foreground hover:bg-primary-deep">
            {initial.id ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </div>
      </form>
    </div>
  )
}

/* ══════════════════════════════════════════
   REVIEWS CRUD
   ══════════════════════════════════════════ */
function ReviewsSection() {
  const [items, setItems] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)

  const load = useCallback(async () => {
    try {
      const [r, p, c] = await Promise.all([reviewsApi.list(), productsApi.list(), customersApi.list()])
      setItems(r)
      setProducts(p)
      setCustomers(c)
    } catch { /* offline */ }
  }, [])

  const didLoad = useRef(false)
  useEffect(() => { if (!didLoad.current) { didLoad.current = true; load() } }, [load])

  async function handleCreate(data: any) {
    try { await reviewsApi.create(data); setAdding(false); load() } catch { alert('Lỗi tạo đánh giá') }
  }

  async function handleDelete(id: number) {
    try { await reviewsApi.remove(id); setDeleting(null); load() } catch { alert('Lỗi xóa') }
  }

  return (
    <div>
      <SectionHeader title="Đánh giá sản phẩm" count={items.length} onRefresh={load} onAdd={() => setAdding(true)} />

      {adding && (
        <ReviewForm products={products} customers={customers} onSave={handleCreate} onCancel={() => setAdding(false)} />
      )}
      {deleting !== null && (
        <Confirm message="Xóa đánh giá này?" onYes={() => handleDelete(deleting)} onNo={() => setDeleting(null)} />
      )}

      <div className="overflow-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-xs text-muted-foreground">
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Sản phẩm</th>
              <th className="px-3 py-2 text-left">Khách hàng</th>
              <th className="px-3 py-2 text-center">Đánh giá</th>
              <th className="px-3 py-2 text-left">Nhận xét</th>
              <th className="px-3 py-2 text-left">Ngày</th>
              <th className="px-3 py-2 text-center">Xóa</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r: any) => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-3 py-2 text-xs text-muted-foreground">{r.id}</td>
                <td className="px-3 py-2 text-xs max-w-[180px] truncate">{r.product?.name ?? `Product #${r.product?.id}`}</td>
                <td className="px-3 py-2 text-xs">{r.customer?.fullName ?? '—'}</td>
                <td className="px-3 py-2 text-center">
                  <span className="text-yellow-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                </td>
                <td className="px-3 py-2 text-xs max-w-[250px] truncate">{r.comment ?? '—'}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{fmtDate(r.reviewDate)}</td>
                <td className="px-3 py-2 text-center">
                  <button onClick={() => setDeleting(r.id)} className="rounded p-1 hover:bg-muted"><Trash2 className="size-3.5 text-destructive" /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">Chưa có đánh giá</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ReviewForm({
  products,
  customers,
  onSave,
  onCancel,
}: {
  products: any[]
  customers: any[]
  onSave: (d: any) => void
  onCancel: () => void
}) {
  const [productId, setProductId] = useState(products[0]?.id ?? '')
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? '')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      product: { id: Number(productId) },
      customer: { id: Number(customerId) },
      rating,
      comment,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form onSubmit={submit} className="w-full max-w-md rounded-xl border bg-card p-5 shadow-lg">
        <h3 className="mb-4 font-bold">Thêm đánh giá</h3>
        <div className="space-y-3">
          <select value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm">
            {products.map((p: any) => <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>)}
          </select>
          <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm">
            {customers.map((c: any) => <option key={c.id} value={c.id}>{c.fullName} ({c.phone})</option>)}
          </select>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Đánh giá</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`text-xl ${n <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Nhận xét..." rows={3} className="w-full rounded-lg border px-3 py-2 text-sm" />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-lg border px-4 py-1.5 text-sm hover:bg-muted">Hủy</button>
          <button type="submit" className="rounded-lg bg-primary px-4 py-1.5 text-sm text-primary-foreground hover:bg-primary-deep">Tạo mới</button>
        </div>
      </form>
    </div>
  )
}
