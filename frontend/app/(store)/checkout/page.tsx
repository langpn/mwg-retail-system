'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tag,
  Truck,
  User,
  Wallet,
} from 'lucide-react'
import { BRANCHES, formatVND, type BranchId, type Order } from '@/lib/dmx-data'
import { useStore } from '@/components/dmx/store-provider'
import { usePriceQuote } from '@/lib/pricing'
import { AppHeader } from '@/components/dmx/app-header'
import { SiteFooter } from '@/components/dmx/site-footer'
import { cn } from '@/lib/utils'

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-muted-foreground">Đang tải trang thanh toán...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialPromo = searchParams.get('promo') || ''

  const { cart, cartCount, placeCartOrder, customer, products, backendConnected, branchId: storeBranchId } = useStore()

  // 1. Thông tin người nhận
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  // 2. Hình thức nhận hàng: 'delivery' (giao tận nơi) hoặc 'pickup' (nhận tại siêu thị)
  const [fulfillment, setFulfillment] = useState<'delivery' | 'pickup'>('delivery')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [selectedBranch, setSelectedBranch] = useState<BranchId>(storeBranchId || 'q9')

  // 3. Khuyến mãi & Submit
  const [promo, setPromo] = useState(initialPromo)
  const [promoInput, setPromoInput] = useState(initialPromo)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [successOrder, setSuccessOrder] = useState<Order | null>(null)

  // Tự động điền nếu đã đăng nhập thành viên
  useEffect(() => {
    if (customer) {
      setName((prev) => prev || customer.fullName || '')
      setPhone((prev) => prev || customer.phone || '')
      if (customer.address) setDeliveryAddress((prev) => prev || customer.address || '')
    }
  }, [customer])

  // Nếu là Quản trị viên, không cho phép đặt hàng
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
              Tài khoản Quản trị viên chỉ phục vụ vận hành và theo dõi đơn hàng, không thực hiện đặt hàng trực tiếp.
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

  const promoKey = promo.trim().toUpperCase()
  const quote = usePriceQuote(cart, promoKey, selectedBranch, products, backendConnected)
  const { subtotal, discount, total } = quote

  function validate() {
    const next: Record<string, string> = {}
    if (name.trim().length < 2) next.name = 'Vui lòng nhập họ và tên người nhận.'
    if (!/^0\d{9}$/.test(phone.replace(/\s/g, ''))) {
      next.phone = 'Số điện thoại hợp lệ gồm 10 chữ số (bắt đầu bằng 0).'
    }
    if (fulfillment === 'delivery' && deliveryAddress.trim().length < 5) {
      next.address = 'Vui lòng nhập địa chỉ giao hàng chi tiết.'
    }
    return next
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const v = validate()
    setErrors(v)
    if (Object.keys(v).length > 0) return

    setLoading(true)

    // Xác định địa chỉ giao nhận lưu xuống CSDL
    let computedAddress = ''
    if (fulfillment === 'delivery') {
      computedAddress = deliveryAddress.trim()
    } else {
      const b = BRANCHES.find((item) => item.id === selectedBranch) || BRANCHES[0]
      computedAddress = `Nhận tại siêu thị ${b.name} (${b.address})`
    }

    const result = await placeCartOrder({
      customerName: name.trim(),
      phone: phone.trim(),
      address: computedAddress,
      branchId: selectedBranch,
      promoCode: promoKey,
    })

    setLoading(false)

    if ('error' in result) {
      setErrors({ form: result.error })
      return
    }

    setSuccessOrder(result)
  }

  // Màn hình khi đặt hàng thành công
  if (successOrder) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 text-foreground">
        <AppHeader />

        <main className="flex flex-1 items-center justify-center p-4 py-12">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 text-center shadow-xl sm:p-8 animate-in fade-in zoom-in-95">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50">
              <CheckCircle2 className="size-8" />
            </div>
            <h1 className="mt-4 text-2xl font-black text-foreground">Đặt Hàng Thành Công!</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Nhân viên siêu thị Điện Máy Xanh sẽ sớm liên hệ số <strong className="text-foreground">{successOrder.phone}</strong> để xác nhận giao hàng.
            </p>

            <div className="my-5 divide-y divide-border rounded-2xl border border-border bg-secondary/30 p-4 text-left text-xs">
              <div className="flex justify-between pb-2.5">
                <span className="text-muted-foreground">Mã đơn hàng:</span>
                <span className="font-mono text-sm font-extrabold text-primary">#{successOrder.id}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-muted-foreground">Người nhận:</span>
                <span className="font-bold text-foreground">{successOrder.customerName}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-muted-foreground">Hình thức nhận hàng:</span>
                <span className="font-semibold text-foreground max-w-xs text-right truncate">
                  {successOrder.address}
                </span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-muted-foreground">Phương thức thanh toán:</span>
                <span className="font-bold text-foreground">Tiền mặt khi nhận hàng (COD)</span>
              </div>
              <div className="flex items-baseline justify-between pt-2.5 text-sm">
                <span className="font-bold text-foreground">Tổng tiền thanh toán:</span>
                <span className="tabular text-lg font-extrabold text-price">{formatVND(successOrder.total)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row">
              <Link
                href={`/orders?phone=${encodeURIComponent(successOrder.phone)}`}
                className="flex flex-1 h-11 items-center justify-center gap-1.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground transition-all hover:bg-secondary"
              >
                <Package className="size-3.5 text-primary" />
                <span>Xem đơn hàng vừa đặt</span>
              </Link>
              <Link
                href="/"
                className="flex flex-1 h-11 items-center justify-center rounded-xl bg-primary text-xs font-bold text-white shadow-sm transition-all hover:bg-primary-deep"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-foreground">
      <AppHeader />

      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-4 py-8 md:px-8">
        <div className="border-b border-border pb-3">
          <h1 className="text-2xl font-black text-foreground">Thanh Toán & Đặt Hàng</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Phương thức thanh toán tiền mặt (COD) an toàn — Nhận hàng, kiểm tra máy ưng ý mới thanh toán.
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <ShoppingBag className="mx-auto size-12 text-muted-foreground" />
            <h2 className="mt-3 text-base font-bold text-foreground">Giỏ hàng đang trống</h2>
            <p className="mt-1 text-xs text-muted-foreground">Vui lòng chọn sản phẩm vào giỏ trước khi thanh toán.</p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-deep"
            >
              <ArrowLeft className="size-3.5" /> Quay về xem sản phẩm
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            {/* CỘT TRÁI: THÔNG TIN GIAO NHẬN & THANH TOÁN */}
            <div className="flex flex-col gap-5">
              {/* 1. THÔNG TIN NGƯỜI NHẬN */}
              <section className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                <h2 className="flex items-center gap-2 border-b border-border pb-3 text-sm font-extrabold text-foreground">
                  <User className="size-4 text-primary" />
                  1. Thông tin người nhận hàng
                </h2>

                <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-foreground">Họ và tên *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nguyễn Văn An"
                      className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none"
                    />
                    {errors.name && <p className="text-[11px] font-semibold text-rose-600">{errors.name}</p>}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-foreground">Số điện thoại nhận hàng *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0901 234 567"
                      className="tabular h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none"
                    />
                    {errors.phone && <p className="text-[11px] font-semibold text-rose-600">{errors.phone}</p>}
                  </div>
                </div>
              </section>

              {/* 2. HÌNH THỨC NHẬN HÀNG */}
              <section className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                <h2 className="flex items-center gap-2 border-b border-border pb-3 text-sm font-extrabold text-foreground">
                  <Truck className="size-4 text-primary" />
                  2. Hình thức nhận hàng
                </h2>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFulfillment('delivery')}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all',
                      fulfillment === 'delivery'
                        ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                        : 'border-border bg-card text-muted-foreground hover:bg-secondary/50',
                    )}
                  >
                    <Truck className="size-4" />
                    <span>Giao hàng tận nơi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfillment('pickup')}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all',
                      fulfillment === 'pickup'
                        ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                        : 'border-border bg-card text-muted-foreground hover:bg-secondary/50',
                    )}
                  >
                    <Store className="size-4" />
                    <span>Nhận tại siêu thị</span>
                  </button>
                </div>

                {fulfillment === 'delivery' ? (
                  <div className="mt-4 flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">Địa chỉ giao hàng chi tiết *</label>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                        className="h-10 w-full rounded-xl border border-border bg-card pr-3 pl-9 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none"
                      />
                    </div>
                    {errors.address && <p className="text-[11px] font-semibold text-rose-600">{errors.address}</p>}
                  </div>
                ) : (
                  <div className="mt-4 flex flex-col gap-2">
                    <label className="text-xs font-bold text-foreground">Chọn siêu thị ĐMX nhận hàng:</label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {BRANCHES.map((b) => {
                        const active = selectedBranch === b.id
                        return (
                          <label
                            key={b.id}
                            className={cn(
                              'flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition-colors',
                              active ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-card hover:bg-secondary/30',
                            )}
                          >
                            <input
                              type="radio"
                              name="branchOption"
                              checked={active}
                              onChange={() => setSelectedBranch(b.id)}
                              className="mt-0.5 size-4 text-primary"
                            />
                            <div className="text-xs">
                              <span className="block font-bold text-foreground">{b.name} ({b.district})</span>
                              <span className="mt-0.5 block text-[11px] text-muted-foreground">{b.address}</span>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}
              </section>

              {/* 3. PHƯƠNG THỨC THANH TOÁN (DUY NHẤT COD) */}
              <section className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                <h2 className="flex items-center gap-2 border-b border-border pb-3 text-sm font-extrabold text-foreground">
                  <Wallet className="size-4 text-primary" />
                  3. Phương thức thanh toán
                </h2>

                <div className="mt-4 rounded-xl border-2 border-primary/40 bg-primary/5 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
                        <Wallet className="size-4" />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-foreground">
                          Thanh toán tiền mặt khi nhận hàng (COD)
                        </span>
                        <span className="ml-2 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                          Phổ biến & An toàn
                        </span>
                      </div>
                    </div>
                    <Check className="size-5 text-primary" />
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    Quý khách nhận thiết bị, kiểm tra hàng mới chính hãng 100% và chạy thử ưng ý mới thanh toán tiền mặt cho nhân viên giao hàng.
                  </p>
                </div>
              </section>
            </div>

            {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG & NÚT BẤM */}
            <aside className="flex flex-col gap-4">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                <h2 className="border-b border-border pb-3 text-sm font-extrabold text-foreground">
                  Đơn hàng ({cartCount} món)
                </h2>

                {/* Danh sách món hàng tóm tắt */}
                <div className="my-3.5 max-h-56 divide-y divide-border overflow-y-auto">
                  {cart.map(({ product, quantity }) => (
                    <div key={product.sku} className="flex items-center justify-between py-2 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <img
                          src={product.image || '/placeholder.svg'}
                          alt=""
                          className="size-9 rounded-md bg-secondary object-contain shrink-0"
                        />
                        <div className="truncate">
                          <span className="block truncate font-semibold text-foreground">{product.name}</span>
                          <span className="text-[11px] text-muted-foreground">Số lượng: {quantity}</span>
                        </div>
                      </div>
                      <span className="font-bold text-foreground tabular shrink-0">
                        {formatVND(product.price * quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Mã giảm giá */}
                <div className="border-t border-border pt-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Mã giảm giá (MWG5, TET2027)"
                        className="h-9 w-full rounded-lg border border-border bg-card pr-3 pl-8 text-xs font-medium uppercase focus:border-primary focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setPromo(promoInput.trim().toUpperCase())}
                      className="rounded-lg bg-secondary px-3 text-xs font-bold text-foreground hover:bg-secondary/80"
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>

                {/* Chi tiết tiền */}
                <div className="mt-4 space-y-2 border-t border-border pt-3 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tạm tính:</span>
                    <span className="tabular font-medium text-foreground">{formatVND(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between font-semibold text-emerald-600">
                      <span>Giảm giá khuyến mãi:</span>
                      <span className="tabular">-{formatVND(discount)}</span>
                    </div>
                  )}
                  <div className="flex items-baseline justify-between border-t border-border pt-3 text-sm">
                    <span className="font-extrabold text-foreground">Tổng thanh toán:</span>
                    <span className="tabular text-xl font-black text-price">{formatVND(total)}</span>
                  </div>
                </div>

                {errors.form && (
                  <p className="mt-3 rounded-lg bg-rose-50 p-2 text-center text-xs font-semibold text-rose-600">
                    {errors.form}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || quote.loading}
                  className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-black text-foreground shadow-sm transition-all hover:bg-amber-400 active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? 'Đang gửi đơn hàng xuống MySQL...' : 'ĐẶT HÀNG (TIỀN MẶT COD)'}
                </button>

                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  Bằng việc bấm Đặt hàng, quý khách đồng ý với điều khoản mua sắm của Điện Máy Xanh.
                </p>
              </div>

              <Link
                href="/cart"
                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" /> Quay lại chỉnh sửa giỏ hàng
              </Link>
            </aside>
          </form>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
