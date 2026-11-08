'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
} from 'lucide-react'
import { formatVND, BRANCHES, getBranch, type BranchId } from '@/lib/dmx-data'
import { usePriceQuote } from '@/lib/pricing'
import { useStore } from '@/components/dmx/store-provider'
import { AppHeader } from '@/components/dmx/app-header'
import { SiteFooter } from '@/components/dmx/site-footer'

export default function CartPage() {
  return <CartContent />
}

function CartContent() {
  const router = useRouter()
  const { cart, updateCartQty, removeFromCart, clearCart, cartCount, branchId, setBranchId, products, backendConnected, customer } = useStore()
  const [promoInput, setPromoInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState('')
  const quote = usePriceQuote(customer?.role === 'ADMIN' ? [] : cart, appliedPromo, branchId, products, backendConnected)

  // Nếu là Quản trị viên, không cho phép mua sắm
  if (customer?.role === 'ADMIN') {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 text-foreground">
        <AppHeader />
        <main className="mx-auto flex w-full max-w-md flex-1 items-center justify-center p-4 py-16">
          <div className="w-full rounded-2xl border border-border bg-card p-6 text-center shadow-lg">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
              <ShieldCheck className="size-7" />
            </div>
            <h1 className="text-lg font-black text-foreground">Tài Khoản Quản Trị Viên</h1>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Tài khoản Quản trị viên chỉ phục vụ vận hành, theo dõi tồn kho và duyệt đơn hàng. Quản trị viên không thực hiện đặt hàng mua sắm trực tiếp.
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <Link
                href="/dashboard"
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-extrabold text-white shadow-sm transition-all hover:bg-primary-deep"
              >
                Vào Bảng Quản Trị (Dashboard)
              </Link>
              <Link
                href="/"
                className="flex h-10 items-center justify-center rounded-xl border border-border bg-secondary/50 text-xs font-bold text-foreground transition-colors hover:bg-secondary"
              >
                Quay về trang chủ
              </Link>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  const { subtotal, discount, total } = quote
  const promoKey = quote.promoApplied ? appliedPromo : ''

  function handleApplyPromo(e: React.FormEvent) {
    e.preventDefault()
    setAppliedPromo(promoInput.trim().toUpperCase())
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-foreground">
      <AppHeader />

      {/* Nội dung Giỏ Hàng */}
      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 px-4 py-8 md:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Giỏ hàng của bạn</h1>
            <p className="text-xs text-muted-foreground">
              Hiện có <span className="font-bold text-foreground">{cartCount}</span> sản phẩm trong giỏ
            </p>
          </div>
          {cart.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-xs font-semibold text-danger hover:underline"
            >
              Xóa toàn bộ giỏ hàng
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <ShoppingBag className="size-8" />
            </div>
            <div className="max-w-sm">
              <h2 className="text-lg font-bold text-foreground">Giỏ hàng đang trống</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Bạn chưa thêm sản phẩm nào vào giỏ. Hãy dạo quanh siêu thị và chọn ngay thiết bị ưng ý nhé!
              </p>
            </div>
            <Link
              href="/"
              className="mt-2 flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-extrabold text-white shadow-sm transition-all hover:bg-primary-deep"
            >
              <ArrowLeft className="size-4" />
              <span>Khám phá sản phẩm Điện Máy Xanh</span>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            {/* Cột trái: Danh sách sản phẩm trong giỏ */}
            <div className="flex flex-col gap-3">
              {cart.map(({ product, quantity }) => (
                <article
                  key={product.sku}
                  className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/product/${product.sku}`}
                      className="size-20 shrink-0 overflow-hidden rounded-lg bg-secondary p-2 transition-transform hover:scale-105"
                      title="Bấm để xem chi tiết sản phẩm"
                    >
                      <img
                        src={product.image || '/placeholder.svg'}
                        alt={product.name}
                        className="size-full object-contain mix-blend-multiply"
                      />
                    </Link>
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-[11px] font-semibold text-muted-foreground">
                        {product.sku} · {product.brand}
                      </span>
                      <Link
                        href={`/product/${product.sku}`}
                        title="Bấm để xem chi tiết sản phẩm"
                        className="line-clamp-2 text-sm font-bold text-foreground transition-colors hover:text-primary"
                      >
                        {product.name}
                      </Link>
                      <div className="flex items-baseline gap-2">
                        <span className="tabular text-base font-extrabold text-price">{formatVND(product.price)}</span>
                        {product.listPrice > product.price && (
                          <span className="tabular text-xs text-muted-foreground line-through">
                            {formatVND(product.listPrice)}
                          </span>
                        )}
                      </div>
                      <p className="tabular text-[11px] font-medium text-muted-foreground">
                        Còn {product.stock[branchId] ?? 0} sản phẩm tại {getBranch(branchId).name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 border-t border-border pt-3 sm:border-t-0 sm:pt-0">
                    {/* Tăng giảm số lượng */}
                    <div className="flex h-9 items-center rounded-lg border border-border bg-secondary/30">
                      <button
                        type="button"
                        onClick={() => updateCartQty(product.sku, quantity - 1)}
                        disabled={quantity <= 1}
                        className="flex size-9 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                        aria-label="Giảm số lượng"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="tabular flex w-8 items-center justify-center text-xs font-bold text-foreground">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQty(product.sku, quantity + 1)}
                        disabled={quantity >= (product.stock[branchId] ?? 0)}
                        className="flex size-9 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                        aria-label="Tăng số lượng"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="tabular text-right text-base font-extrabold text-foreground sm:w-28">
                        {formatVND(product.price * quantity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(product.sku)}
                        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
                        title="Xóa sản phẩm này"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-xs font-bold text-foreground transition-all hover:border-primary hover:text-primary hover:shadow-xs"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Tiếp tục chọn thêm sản phẩm khác</span>
                </Link>
              </div>
            </div>

            {/* Cột phải: Bảng thanh toán tóm tắt */}
            <aside className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h2 className="text-base font-extrabold text-foreground">Tóm tắt đơn hàng</h2>

                {/* Chi nhánh xuất kho — đổi ngay trong giỏ để đủ hàng cho mọi món */}
                <label htmlFor="cart-branch" className="flex flex-col gap-1.5 text-xs font-bold text-foreground">
                  Siêu thị xuất kho
                  <select
                    id="cart-branch"
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value as BranchId)}
                    className="h-9 w-full cursor-pointer rounded-lg border border-border bg-card px-2.5 text-xs font-semibold text-foreground transition-colors hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  >
                    {BRANCHES.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} · {b.district}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Form mã giảm giá */}
                <form onSubmit={handleApplyPromo} className="flex flex-col gap-1.5">
                  <label htmlFor="cart-promo" className="text-xs font-bold text-foreground">
                    Mã khuyến mãi
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="cart-promo"
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="MWG5 hoặc TET2027"
                        className="h-9 w-full rounded-lg border border-border bg-card pr-3 pl-8 text-xs font-mono uppercase focus:border-primary focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="h-9 rounded-lg bg-secondary px-3 text-xs font-bold text-foreground hover:bg-secondary/80"
                    >
                      Áp dụng
                    </button>
                  </div>
                  {appliedPromo && quote.loading && <p className="text-[11px] text-muted-foreground">Đang kiểm tra mã...</p>}
                  {quote.promoApplied && <p className="text-[11px] font-semibold text-success-ink">Đã áp dụng: {quote.promoLabel || appliedPromo}</p>}
                  {appliedPromo && !quote.loading && !quote.promoApplied && !quote.error && <p className="text-[11px] font-semibold text-danger-ink">{quote.promoMessage || 'Mã khuyến mãi không hợp lệ.'}</p>}
                  {quote.error && <p className="text-[11px] font-semibold text-danger-ink">{quote.error}</p>}
                </form>

                <div className="h-px bg-border" />

                <dl className="flex flex-col gap-2 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Tạm tính ({cartCount} món)</dt>
                    <dd className="tabular font-bold text-foreground">{quote.loading ? 'Đang tính...' : formatVND(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Giảm giá</dt>
                    <dd className="tabular font-bold text-success-ink">
                      {discount > 0 ? `− ${formatVND(discount)}` : formatVND(0)}
                    </dd>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between border-t border-border pt-2 text-sm">
                    <dt className="font-extrabold text-foreground">Tổng thanh toán</dt>
                    <dd className="tabular text-xl font-extrabold text-price">{formatVND(total)}</dd>
                  </div>
                </dl>

                <button
                  type="button"
                  disabled={quote.loading || !!quote.error}
                  onClick={() => router.push(`/checkout${promoKey ? `?promo=${encodeURIComponent(promoKey)}` : ''}`)}
                  className="mt-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-extrabold text-foreground shadow-sm transition-all hover:bg-amber-400 disabled:opacity-50"
                >
                  <span>Tiến hành thanh toán</span>
                  <ArrowRight className="size-4" />
                </button>

                <div className="mt-1 flex flex-col gap-1.5 border-t border-border pt-3 text-[11px] text-muted-foreground">
                  <p className="flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-primary" />
                    Bảo hành chính hãng 100% tại Điện Máy Xanh
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Truck className="size-3.5 text-primary" />
                    Hỗ trợ giao hàng & lắp đặt tận nơi
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
