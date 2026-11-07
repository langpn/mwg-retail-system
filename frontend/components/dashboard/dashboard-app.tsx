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
  Search,
  ChevronLeft,
  ChevronRight,
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
  type BackendOrder,
  type BackendProduct,
  type BackendCategory,
  type BackendBrand,
  type BackendCustomer,
  type BackendPromotion,
  type BackendReview,
  type ProductInput,
  type ReviewInput,
} from '@/lib/api'

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

  const didCheck = useRef(false)
  useEffect(() => {
    if (didCheck.current) return
    didCheck.current = true
    ping().then(setConnected)
  }, [])

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
  const [recentOrders, setRecentOrders] = useState<BackendOrder[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [products, orders, inventory, customers, reviews] = await Promise.all([
        productsApi.list(),
        ordersApi.list(),
        inventoryApi.stockMatrix(),
        customersApi.list(),
        reviewsApi.list(),
      ])
      const revenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
      const lowStock = inventory.filter((item) => item.quantity <= 2).length
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
            {recentOrders.map((o) => (
              <tr key={o.id} className="border-b last:border-0">
                <td className="px-4 py-2 font-mono text-xs">#{o.id}</td>
                <td className="px-4 py-2">{o.customerName}</td>
                <td className="px-4 py-2 max-w-[200px] truncate">{o.orderItems?.map((item) => `${item.quantity}× ${item.product.name}`).join(' · ') || '—'}</td>
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
   PRODUCTS CRUD (server-side pagination)
   ══════════════════════════════════════════ */
const ADMIN_PAGE_SIZES = [5, 8, 15]

function ProductsSection() {
  const [items, setItems] = useState<BackendProduct[]>([])
  const [categories, setCategories] = useState<BackendCategory[]>([])
  const [brands, setBrands] = useState<BackendBrand[]>([])
  const [editing, setEditing] = useState<Partial<BackendProduct> | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)

  // Server-side pagination state
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(8)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  // Quick search + price sort (both executed on the server)
  const [keywordDraft, setKeywordDraft] = useState('')
  const [keyword, setKeyword] = useState('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  // Debounce the search box so typing does not fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setKeyword(keywordDraft.trim())
      setPage(0)
    }, 350)
    return () => clearTimeout(t)
  }, [keywordDraft])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await productsApi.page({
        page,
        size: pageSize,
        sortBy: 'price',
        sortDir,
        keyword: keyword || undefined,
      })
      const content = Array.isArray(res?.content) ? res.content : []
      const pages = Math.max(1, res?.totalPages ?? 1)

      // Deleting the last row of the last page: clamp back one page.
      if (res && res.totalPages > 0 && page >= res.totalPages) {
        setPage(res.totalPages - 1)
        return
      }

      setItems(content)
      setTotalElements(res?.totalElements ?? content.length)
      setTotalPages(pages)
    } catch {
      /* offline */
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, sortDir, keyword])

  const loadOptions = useCallback(async () => {
    try {
      const [c, b] = await Promise.all([productsApi.categories(), productsApi.brands()])
      setCategories(c)
      setBrands(b)
    } catch {
      /* offline */
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const didLoadOptions = useRef(false)
  useEffect(() => {
    if (didLoadOptions.current) return
    didLoadOptions.current = true
    loadOptions()
  }, [loadOptions])

  async function handleSave(data: ProductInput) {
    try {
      if (data.id) {
        await productsApi.update(data.id, data)
      } else {
        await productsApi.create(data)
      }
      setEditing(null)
      load()
    } catch {
      alert('Lỗi lưu sản phẩm')
    }
  }

  async function handleDelete(id: number) {
    try {
      await productsApi.remove(id)
      setDeleting(null)
      load()
    } catch {
      alert('Lỗi xóa sản phẩm')
    }
  }

  const firstItem = totalElements === 0 ? 0 : page * pageSize + 1
  const lastItem = Math.min((page + 1) * pageSize, totalElements)
  const pageList = buildAdminPageList(page, totalPages)

  return (
    <div>
      <SectionHeader
        title="Quản lý sản phẩm"
        count={totalElements}
        onRefresh={load}
        onAdd={() => setEditing({})}
      />

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
        <Confirm
          message="Bạn chắc chắn muốn xóa sản phẩm này?"
          onYes={() => handleDelete(deleting)}
          onNo={() => setDeleting(null)}
        />
      )}

      {/* Toolbar: quick search · price sort · page size · range · pager */}
      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border bg-card px-3 py-2.5">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={keywordDraft}
            onChange={(e) => setKeywordDraft(e.target.value)}
            placeholder="Tìm theo tên, SKU…"
            aria-label="Tìm kiếm sản phẩm"
            className="h-8 w-56 rounded-lg border border-border bg-background pr-2 pl-8 text-xs focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
            setPage(0)
          }}
          className="flex h-8 items-center gap-1 rounded-lg border border-border px-2.5 text-xs font-semibold hover:border-primary hover:text-primary"
          title="Đảo chiều sắp xếp theo cột Giá"
        >
          Giá {sortDir === 'asc' ? '↑' : '↓'}
        </button>

        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-semibold">Hiển thị</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setPage(0)
            }}
            aria-label="Số dòng mỗi trang"
            className="h-8 cursor-pointer rounded-lg border border-border bg-background px-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
          >
            {ADMIN_PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s} dòng/trang
              </option>
            ))}
          </select>
        </label>

        <span className="text-xs text-muted-foreground">
          Hiển thị{' '}
          <strong className="tabular font-bold text-foreground">
            {firstItem} – {lastItem}
          </strong>{' '}
          / Tổng <strong className="tabular font-bold text-foreground">{totalElements}</strong> sản phẩm
        </span>

        {loading && <RefreshCw className="size-3.5 animate-spin text-primary" aria-label="Đang tải" />}

        <nav aria-label="Chuyển trang sản phẩm" className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page <= 0}
            className="flex h-8 items-center gap-0.5 rounded-lg border px-2 text-xs font-semibold hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="size-3.5" />
            Trước
          </button>
          {pageList.map((entry, i) =>
            entry === 'ellipsis' ? (
              <span key={`gap-${i}`} className="px-1 text-xs text-muted-foreground" aria-hidden="true">
                …
              </span>
            ) : (
              <button
                key={entry}
                type="button"
                onClick={() => setPage(entry)}
                aria-current={entry === page ? 'page' : undefined}
                className={`tabular size-8 rounded-lg text-xs font-bold ${
                  entry === page
                    ? 'bg-primary text-primary-foreground'
                    : 'border hover:bg-muted'
                }`}
              >
                {entry + 1}
              </button>
            ),
          )}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="flex h-8 items-center gap-0.5 rounded-lg border px-2 text-xs font-semibold hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            Sau
            <ChevronRight className="size-3.5" />
          </button>
        </nav>
      </div>

      <div className="overflow-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-xs text-muted-foreground">
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">SKU</th>
              <th className="px-3 py-2 text-left">Tên sản phẩm</th>
              <th className="px-3 py-2 text-left">Danh mục</th>
              <th className="px-3 py-2 text-left">Thương hiệu</th>
              <th className="px-3 py-2 text-right">Giá {sortDir === 'asc' ? '↑' : '↓'}</th>
              <th className="px-3 py-2 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
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
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                  {loading ? 'Đang tải…' : 'Không tìm thấy sản phẩm phù hợp'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** Compact page list for the admin table (0-based indices). */
function buildAdminPageList(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i)

  const items: (number | 'ellipsis')[] = [0]
  const start = Math.max(1, current - 1)
  const end = Math.min(total - 2, current + 1)

  if (start > 1) items.push('ellipsis')
  for (let i = start; i <= end; i++) items.push(i)
  if (end < total - 2) items.push('ellipsis')

  items.push(total - 1)
  return items
}

function ProductForm({
  initial,
  categories,
  brands,
  onSave,
  onCancel,
}: {
  initial: Partial<BackendProduct>
  categories: BackendCategory[]
  brands: BackendBrand[]
  onSave: (d: ProductInput) => void
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
          <select value={catId} onChange={(e) => setCatId(Number(e.target.value))} className="w-full rounded-lg border px-3 py-2 text-sm">
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={brandId} onChange={(e) => setBrandId(Number(e.target.value))} className="w-full rounded-lg border px-3 py-2 text-sm">
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
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
  const [items, setItems] = useState<BackendOrder[]>([])
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

  const filtered = filter === 'ALL' ? items : items.filter((o) => o.status === filter)

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
            {filtered.map((o) => (
              <tr key={o.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-3 py-2 font-mono text-xs">#{o.id}</td>
                <td className="px-3 py-2">{o.customerName}</td>
                <td className="px-3 py-2 text-xs">{o.phone}</td>
                <td className="px-3 py-2 max-w-[200px] truncate text-xs">{o.orderItems?.map((item) => `${item.quantity}× ${item.product.name}`).join(' · ') || '—'}</td>
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
type CustomerInput = Omit<BackendCustomer, 'id'> & { id?: number }

function CustomersSection() {
  const [items, setItems] = useState<BackendCustomer[]>([])
  const [editing, setEditing] = useState<Partial<BackendCustomer> | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)

  const load = useCallback(async () => {
    try { setItems(await customersApi.list()) } catch { /* offline */ }
  }, [])

  const didLoad = useRef(false)
  useEffect(() => { if (!didLoad.current) { didLoad.current = true; load() } }, [load])

  async function handleSave(data: CustomerInput) {
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
            {items.map((c) => (
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

function CustomerForm({ initial, onSave, onCancel }: { initial: Partial<BackendCustomer>; onSave: (d: CustomerInput) => void; onCancel: () => void }) {
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
  const [items, setItems] = useState<BackendPromotion[]>([])
  const [editing, setEditing] = useState<Partial<BackendPromotion> | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)

  const load = useCallback(async () => {
    try { setItems(await promotionsApi.list()) } catch { /* offline */ }
  }, [])

  const didLoad = useRef(false)
  useEffect(() => { if (!didLoad.current) { didLoad.current = true; load() } }, [load])

  async function handleSave(data: Partial<BackendPromotion>) {
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
            {items.map((p) => (
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

function PromotionForm({ initial, onSave, onCancel }: { initial: Partial<BackendPromotion>; onSave: (d: Partial<BackendPromotion>) => void; onCancel: () => void }) {
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
  const [items, setItems] = useState<BackendReview[]>([])
  const [products, setProducts] = useState<BackendProduct[]>([])
  const [customers, setCustomers] = useState<BackendCustomer[]>([])
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

  async function handleCreate(data: ReviewInput) {
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
            {items.map((r) => (
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
  products: BackendProduct[]
  customers: BackendCustomer[]
  onSave: (d: ReviewInput) => void
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
          <select value={productId} onChange={(e) => setProductId(Number(e.target.value))} className="w-full rounded-lg border px-3 py-2 text-sm">
            {products.map((p) => <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>)}
          </select>
          <select value={customerId} onChange={(e) => setCustomerId(Number(e.target.value))} className="w-full rounded-lg border px-3 py-2 text-sm">
            {customers.map((c) => <option key={c.id} value={c.id}>{c.fullName} ({c.phone})</option>)}
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
