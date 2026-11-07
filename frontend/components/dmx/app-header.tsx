'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  ChevronDown,
  LayoutDashboard,
  LogIn,
  LogOut,
  Package,
  Search,
  Shield,
  ShoppingBag,
  Store,
  User,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CATEGORIES, formatVND, type CategoryId } from '@/lib/dmx-data'
import { MVC_URL } from '@/lib/api'
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
          <OrdersLink />
          <CartLink />
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
  const { products, query, setQuery, setCategory } = useStore()
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
    setOpen(false)
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      router.push('/')
    }
  }

  function pickCategory(id: CategoryId) {
    setCategory(id)
    setQuery('')
    setDraft('')
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
                    <span className="tabular font-mono text-[11px] text-muted-foreground">{p.sku}</span>
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

function OrdersLink() {
  return (
    <Link
      href="/orders"
      className="flex h-10 items-center gap-2 rounded-full border border-border bg-card px-3 text-xs font-bold text-body transition-colors hover:border-primary hover:text-primary"
      aria-label="Đơn hàng"
    >
      <Package className="size-[18px]" aria-hidden="true" />
      <span className="hidden sm:inline">Đơn hàng</span>
    </Link>
  )
}

function CartLink() {
  const { cartCount } = useStore()

  return (
    <Link
      href="/cart"
      className="relative flex h-10 items-center gap-2 rounded-full border border-border bg-card px-3 text-xs font-bold text-body transition-colors hover:border-primary hover:text-primary"
      aria-label={`Giỏ hàng: ${cartCount} sản phẩm`}
    >
      <span className="relative">
        <ShoppingBag className="size-[18px]" aria-hidden="true" />
        {cartCount > 0 && (
          <span className="tabular absolute -top-2 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-extrabold text-foreground ring-2 ring-card">
            {cartCount}
          </span>
        )}
      </span>
      <span className="hidden sm:inline">Giỏ hàng</span>
    </Link>
  )
}

function AccountDropdown() {
  const { customer, logoutCustomer } = useStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const isAdmin = customer?.role === 'ADMIN'

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
          'flex h-10 items-center gap-2 rounded-full border px-3 text-xs font-bold transition-colors',
          open
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-secondary',
        )}
      >
        <span
          className={cn(
            'flex size-7 items-center justify-center rounded-full text-xs font-bold',
            isAdmin ? 'bg-amber-600 text-white' : customer ? 'bg-emerald-600 text-white' : 'bg-primary/10 text-primary',
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
        <ChevronDown className={cn('size-3.5 text-muted-foreground transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-72 overflow-hidden rounded-xl border border-border bg-card p-2 shadow-xl"
        >
          <div className="mb-1 border-b border-border px-3 py-2.5">
            <p className="truncate text-xs font-bold text-foreground">
              {isAdmin ? 'Ban Quản Trị Hệ Thống' : customer ? customer.fullName : 'Chào mừng quý khách'}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {isAdmin ? 'admin@dmx.mwg.vn' : customer ? `SĐT: ${customer.phone}` : 'Thành viên Điện Máy Xanh'}
            </p>
          </div>

          <div className="py-1">
            {!customer && (
              <MenuLink href="/auth" icon={<LogIn className="size-4 text-primary" />} label="Đăng nhập / Đăng ký" />
            )}
            <MenuLink href="/orders" icon={<Package className="size-4 text-muted-foreground" />} label="Đơn hàng" />
            <MenuLink href="/cart" icon={<ShoppingBag className="size-4 text-muted-foreground" />} label="Giỏ hàng" />
          </div>

          <div className="border-t border-border py-1">
            <MenuLink href="/dashboard" icon={<LayoutDashboard className="size-4 text-muted-foreground" />} label="Quản trị CSDL" />
            <a
              href={MVC_URL}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              <Store className="size-4 text-muted-foreground" aria-hidden="true" />
              Trang MVC
            </a>
          </div>

          {customer && (
            <div className="border-t border-border py-1">
              <button
                type="button"
                onClick={() => {
                  logoutCustomer()
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"
              >
                <LogOut className="size-4 text-rose-500" aria-hidden="true" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MenuLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
    >
      {icon}
      {label}
    </Link>
  )
}
