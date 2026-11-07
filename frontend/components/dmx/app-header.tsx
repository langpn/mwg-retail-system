'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  Check,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  LogIn,
  LogOut,
  MapPin,
  Package,
  Search,
  Shield,
  ShoppingBag,
  User,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BRANCHES, CATEGORIES, formatVND, getBranch, type CategoryId } from '@/lib/dmx-data'
import { useStore } from './store-provider'
import { cn } from '@/lib/utils'

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 md:px-8 lg:flex-nowrap">
        <Logo />
        <div className="order-3 w-full lg:order-none lg:flex-1">
          <GlobalSearch />
        </div>
        <div className="ml-auto flex items-center gap-2.5 lg:ml-0">
          <BranchSelector />
          <CartButton />
          <AccountDropdown />
        </div>
      </div>
    </header>
  )
}

function Logo() {
  return (
    <Link
      href="/"
      className="flex shrink-0 items-center gap-3 transition-opacity hover:opacity-90"
      aria-label="Điện Máy Xanh — trang chủ"
    >
      <span className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-deep shadow-sm ring-1 ring-primary-deep/20">
        <ShoppingBag className="size-5 text-white" strokeWidth={2.25} aria-hidden="true" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[19px] font-extrabold tracking-tight text-foreground">
          Điện Máy <span className="text-primary">Xanh</span>
        </span>
      </span>
    </Link>
  )
}

function GlobalSearch() {
  const router = useRouter()
  const { products, query, setQuery, setCategory, setTab } = useStore()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(query)
  const wrapRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  useEffect(() => setDraft(query), [query])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const suggestions = useMemo(() => {
    const q = draft.trim().toLowerCase()
    if (!q) return products.slice(0, 4)
    return products
      .filter((p) => `${p.name} ${p.sku} ${p.brand}`.toLowerCase().includes(q))
      .slice(0, 6)
  }, [draft, products])

  function commit(value: string) {
    setQuery(value)
    setTab('catalog')
    setOpen(false)
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      router.push('/')
    }
  }

  function pickCategory(id: CategoryId) {
    setCategory(id)
    setQuery('')
    setDraft('')
    setTab('catalog')
    setOpen(false)
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      router.push('/')
    }
  }

  return (
    <div ref={wrapRef} className="relative mx-auto w-full max-w-2xl">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          commit(draft)
        }}
      >
        <label htmlFor="global-search" className="sr-only">
          Tìm kiếm sản phẩm
        </label>
        <Search
          className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          id="global-search"
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false)
          }}
          placeholder="Tìm kiếm máy giặt, tủ lạnh, tivi, đồ gia dụng..."
          className="h-11 w-full rounded-lg border border-border bg-muted/60 pr-24 pl-10 text-sm font-medium text-body placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/15 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center gap-1">
          {draft && (
            <button
              type="button"
              onClick={() => {
                setDraft('')
                commit('')
              }}
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="Xoá tìm kiếm"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
          <button
            type="submit"
            className="h-8 rounded-md bg-primary px-3 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary-deep"
          >
            Tìm kiếm
          </button>
        </div>
      </form>

      {open && (
        <div
          id={listId}
          className="absolute inset-x-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
        >
          <div className="flex flex-wrap items-center gap-1.5 border-b border-border px-3 py-2.5">
            <span className="mr-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              Danh mục
            </span>
            {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => pickCategory(c.id)}
                className="rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-body transition-colors hover:border-primary hover:text-primary"
              >
                {c.vi}
              </button>
            ))}
          </div>
          <ul role="listbox" aria-label="Gợi ý sản phẩm" className="max-h-80 overflow-y-auto py-1">
            {suggestions.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                Không tìm thấy sản phẩm cho “{draft}”
              </li>
            )}
            {suggestions.map((p) => (
              <li key={p.sku} role="option" aria-selected={false}>
                <button
                  type="button"
                  onClick={() => {
                    setDraft(p.sku)
                    commit(p.sku)
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-secondary"
                >
                  <img src={p.image || '/placeholder.svg'} alt="" className="size-10 rounded-md bg-muted object-contain" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground">{p.name}</span>
                    <span className="font-mono text-[11px] text-muted-foreground">{p.sku}</span>
                  </span>
                  <span className="tabular shrink-0 text-sm font-extrabold text-price">{formatVND(p.price)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function BranchSelector() {
  const { branchId, setBranchId } = useStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const branch = getBranch(branchId)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        className="flex h-10 items-center gap-2 rounded-full border border-primary/25 bg-primary/5 pr-3 pl-2 text-left transition-colors hover:border-primary/50 hover:bg-primary/10"
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-primary text-white">
          <MapPin className="size-3.5" aria-hidden="true" />
        </span>
        <span className="hidden flex-col leading-tight sm:flex">
          <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Chi nhánh siêu thị</span>
          <span className="text-xs font-bold whitespace-nowrap text-foreground">
            {branch.name} <span className="font-medium text-muted-foreground">({branch.district})</span>
          </span>
        </span>
        <ChevronDown
          className={cn('size-4 text-muted-foreground transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="Chọn chi nhánh"
          className="absolute right-0 top-[calc(100%+6px)] z-50 w-80 overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-lg"
        >
          {BRANCHES.map((b) => {
            const active = b.id === branchId
            return (
              <li key={b.id} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    setBranchId(b.id)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                    active ? 'bg-primary/8' : 'hover:bg-secondary',
                  )}
                >
                  <MapPin
                    className={cn('mt-0.5 size-4 shrink-0', active ? 'text-primary' : 'text-muted-foreground')}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-foreground">
                      {b.name} · {b.district}
                    </span>
                    <span className="block text-xs text-muted-foreground">{b.address}</span>
                  </span>
                  {active && <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function CartButton() {
  const { cartCount, customer } = useStore()
  if (customer?.role === 'ADMIN') return null

  return (
    <Link
      href="/cart"
      className="relative flex size-10 items-center justify-center rounded-full border border-border bg-card text-body transition-colors hover:border-primary hover:text-primary"
      aria-label={`Giỏ hàng: ${cartCount} sản phẩm`}
      title="Xem giỏ hàng của bạn"
    >
      <ShoppingBag className="size-[18px]" aria-hidden="true" />
      {cartCount > 0 && (
        <span className="tabular absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-extrabold text-foreground ring-2 ring-card shadow-xs">
          {cartCount}
        </span>
      )}
    </Link>
  )
}

function AccountDropdown() {
  const { customer, logoutCustomer, orders, reloadFromBackend } = useStore()
  const [open, setOpen] = useState(false)
  const [showOrdersModal, setShowOrdersModal] = useState(false)
  const [searchPhone, setSearchPhone] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const isAdmin = customer?.role === 'ADMIN'

  // Lọc đơn hàng theo số điện thoại của người dùng
  const targetPhone = customer?.phone || searchPhone.trim()
  const userOrders = useMemo(() => {
    if (!targetPhone) return []
    const clean = targetPhone.replace(/\s/g, '')
    return orders.filter((o) => o.phone && o.phone.replace(/\s/g, '') === clean)
  }, [orders, targetPhone])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex h-10 items-center gap-2 rounded-full border px-3 text-xs font-bold transition-all',
          open
            ? 'border-primary bg-primary/10 text-primary'
            : isAdmin
              ? 'border-amber-500/50 bg-amber-50 text-amber-900 hover:border-amber-500'
              : customer
                ? 'border-emerald-500/40 bg-emerald-50/60 text-emerald-900 hover:border-emerald-500'
                : 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-secondary',
        )}
      >
        <span
          className={cn(
            'flex size-7 items-center justify-center rounded-full text-xs font-bold',
            isAdmin
              ? 'bg-amber-600 text-white'
              : customer
                ? 'bg-emerald-600 text-white'
                : 'bg-primary/10 text-primary',
          )}
        >
          {isAdmin ? (
            <Shield className="size-4" aria-hidden="true" />
          ) : customer ? (
            customer.fullName.charAt(0).toUpperCase()
          ) : (
            <User className="size-4" aria-hidden="true" />
          )}
        </span>
        <span className="hidden max-w-[120px] truncate sm:inline">
          {isAdmin ? 'Quản trị viên' : customer ? customer.fullName : 'Tài khoản'}
        </span>
        <ChevronDown className={cn('size-3.5 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-72 overflow-hidden rounded-xl border border-border bg-card p-2 shadow-xl animate-in fade-in zoom-in-95"
        >
          {customer ? (
            <>
              {isAdmin ? (
                /* Giao diện dành riêng cho Admin */
                <>
                  <div className="mb-1 rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2.5">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-xs font-extrabold text-amber-950">Ban Quản Trị Hệ Thống</p>
                      <span className="rounded-md bg-amber-200 px-1.5 py-0.5 text-[10px] font-black text-amber-900">
                        ADMIN
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-amber-800">admin@dmx.mwg.vn</p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className="flex w-full items-center gap-2.5 rounded-lg bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-900 transition-colors hover:bg-amber-500/20"
                    >
                      <Shield className="size-4 text-amber-600" />
                      Bảng điều khiển Quản trị (Admin)
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        logoutCustomer()
                        setOpen(false)
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                    >
                      <LogOut className="size-4 text-rose-500" />
                      Đăng xuất quản trị
                    </button>
                  </div>
                </>
              ) : (
                /* Giao diện dành cho Khách hàng thông thường */
                <>
                  <div className="mb-1 rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-xs font-extrabold text-foreground">{customer.fullName}</p>
                      <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                        Khách hàng thân thiết
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-muted-foreground">SĐT: {customer.phone}</p>
                    {customer.email && <p className="truncate text-[11px] text-muted-foreground">{customer.email}</p>}
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowOrdersModal(true)
                        setOpen(false)
                        reloadFromBackend()
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
                    >
                      <Package className="size-4 text-primary" />
                      Đơn hàng của tôi
                    </button>

                    <Link
                      href="/cart"
                      onClick={() => setOpen(false)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
                    >
                      <ShoppingBag className="size-4 text-muted-foreground" />
                      Giỏ hàng của tôi
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        logoutCustomer()
                        setOpen(false)
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                    >
                      <LogOut className="size-4 text-rose-500" />
                      Đăng xuất tài khoản
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            /* Giao diện khi chưa đăng nhập */
            <>
              <div className="border-b border-border px-3 py-2.5">
                <p className="text-xs font-bold text-foreground">Chào mừng quý khách</p>
                <p className="text-[11px] text-muted-foreground">Thành viên Điện Máy Xanh</p>
              </div>

              <div className="py-1.5">
                <Link
                  href="/auth"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  <LogIn className="size-4 text-primary" />
                  Đăng nhập / Đăng ký
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setShowOrdersModal(true)
                    setOpen(false)
                    reloadFromBackend()
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
                >
                  <Package className="size-4 text-muted-foreground" />
                  Tra cứu đơn hàng
                </button>

                <Link
                  href="/cart"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
                >
                  <ShoppingBag className="size-4 text-muted-foreground" />
                  Giỏ hàng của tôi
                </Link>
              </div>
            </>
          )}
        </div>
      )}

      {/* Modal Đơn hàng của tôi (Gọn gàng, dễ hiểu, basic) */}
      {showOrdersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <Package className="size-5 text-primary" />
                <h3 className="text-base font-extrabold text-foreground">
                  {customer ? 'Đơn hàng của tôi' : 'Tra cứu đơn hàng'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOrdersModal(false)}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {!customer && (
                <div className="mb-4 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground">Nhập số điện thoại đã đặt hàng:</label>
                  <input
                    type="tel"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    placeholder="VD: 0901 234 567"
                    className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-medium focus:border-primary focus:outline-none"
                  />
                </div>
              )}

              {userOrders.length === 0 ? (
                <div className="py-12 text-center">
                  <Package className="mx-auto size-12 text-muted-foreground/40" />
                  <p className="mt-2 text-xs font-bold text-foreground">Chưa có đơn hàng nào</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {targetPhone
                      ? `Không tìm thấy đơn hàng nào với số điện thoại ${targetPhone}.`
                      : 'Các đơn hàng bạn đặt sẽ xuất hiện tại đây.'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {userOrders.map((o) => (
                    <div
                      key={o.id}
                      className="rounded-xl border border-border bg-secondary/30 p-4 transition-all"
                    >
                      <div className="flex items-center justify-between border-b border-border pb-2.5 text-xs">
                        <span className="font-mono font-bold text-primary">Đơn hàng #{o.id}</span>
                        <span
                          className={cn(
                            'rounded-md px-2 py-0.5 text-[10px] font-extrabold',
                            o.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800',
                          )}
                        >
                          {o.status === 'CONFIRMED' ? '🟢 Đã duyệt giao hàng' : '🟠 Chờ siêu thị duyệt'}
                        </span>
                      </div>

                      <div className="mt-2.5 flex flex-col gap-1 text-xs">
                        <p className="font-bold text-foreground line-clamp-1">{o.productName}</p>
                        <p className="text-[11px] text-muted-foreground">Người nhận: {o.customerName} · {o.phone}</p>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">Địa chỉ: {o.address}</p>
                      </div>

                      <div className="mt-3 flex items-baseline justify-between border-t border-border pt-2 text-xs">
                        <span className="text-[11px] text-muted-foreground">
                          {o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : 'Vừa đặt'}
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-[11px] text-muted-foreground">Tổng tiền:</span>
                          <span className="tabular font-extrabold text-price">{formatVND(o.total)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-border bg-secondary/20 p-3 text-right">
              <button
                type="button"
                onClick={() => setShowOrdersModal(false)}
                className="rounded-xl bg-secondary px-4 py-2 text-xs font-bold text-foreground hover:bg-secondary/80"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
