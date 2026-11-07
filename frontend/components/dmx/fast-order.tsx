'use client'

import { useMemo, useState } from 'react'
import { CheckCircle2, Clock, MapPin, Minus, Phone, Plus, Tag, Truck, Store, User } from 'lucide-react'
import { BRANCHES, formatTime, formatVND, getBranch, type BranchId, type Order } from '@/lib/dmx-data'
import { usePriceQuote } from '@/lib/pricing'
import { useStore } from './store-provider'
import { cn } from '@/lib/utils'

export function FastOrder() {
  const { products } = useStore()
  if (!products.length) return <p className="p-5 text-sm text-muted-foreground">Đang tải sản phẩm...</p>
  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <CheckoutForm />
      <OrdersFeed />
    </div>
  )
}

const inputClass =
  'h-10 w-full rounded-lg border border-border bg-card px-3 text-sm font-medium text-body placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/15 focus:outline-none aria-[invalid=true]:border-danger'

function Field({
  id,
  label,
  icon: Icon,
  error,
  children,
}: {
  id: string
  label: string
  icon?: typeof User
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex items-center gap-1.5 text-xs font-bold text-foreground">
        {Icon && <Icon className="size-3.5 text-muted-foreground" aria-hidden="true" />}
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-xs font-semibold text-danger-ink">
          {error}
        </p>
      )}
    </div>
  )
}

function CheckoutForm() {
  const { products, orderSku, setOrderSku, branchId: headerBranch, placeOrder, backendConnected } = useStore()
  const product = products.find((p) => p.sku === orderSku) ?? products[0]
  const initialBranch: BranchId =
    product.stock[headerBranch] > 0 ? headerBranch : (BRANCHES.find((b) => product.stock[b.id] > 0)?.id ?? headerBranch)

  const [quantity, setQuantity] = useState(1)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [promo, setPromo] = useState('')
  const [fulfillment, setFulfillment] = useState<'pickup' | 'delivery'>('pickup')
  const [branch, setBranch] = useState<BranchId>(initialBranch)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState<Order | null>(null)

  const available = product.stock[branch]
  const maxQty = Math.max(1, Math.min(5, available))
  const promoKey = promo.trim().toUpperCase()
  const quote = usePriceQuote([{ product, quantity }], promoKey, branch, products, backendConnected)
  const { subtotal, discount, total } = quote

  function validate() {
    const next: Record<string, string> = {}
    if (name.trim().length < 2) next.name = 'Vui lòng nhập họ tên khách hàng.'
    if (!/^0\d{9}$/.test(phone.replace(/\s/g, ''))) next.phone = 'Số điện thoại gồm 10 chữ số, bắt đầu bằng 0.'
    if (fulfillment === 'delivery' && address.trim().length < 6) next.address = 'Vui lòng nhập địa chỉ giao hàng.'
    if (promoKey && !quote.promoApplied) next.promo = quote.promoMessage || 'Mã khuyến mãi không hợp lệ.'
    if (quote.error) next.form = quote.error
    if (available < quantity) next.form = `Chi nhánh chỉ còn ${available} sản phẩm.`
    return next
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (quote.loading) return
    const v = validate()
    setErrors(v)
    if (Object.keys(v).length > 0) return
    const result = await placeOrder({
      sku: product.sku,
      quantity,
      customerName: name,
      phone,
      address: fulfillment === 'delivery' ? address : '',
      branchId: branch,
      promoCode: promoKey,
    })
    if ('error' in result) {
      setErrors({ form: result.error })
      return
    }
    setSuccess(result)
    setName('')
    setPhone('')
    setAddress('')
    setPromo('')
    setQuantity(1)
  }

  return (
    <section aria-labelledby="checkout-title" className="flex flex-col rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h2 id="checkout-title" className="text-base font-extrabold text-foreground">
          Tạo Đơn Hàng Nhanh
        </h2>
        <p className="text-xs text-muted-foreground">Tạo đơn trực tiếp tại quầy siêu thị hoặc giao tận nhà</p>
      </div>

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4 p-5">
        <Field id="order-product" label="Sản phẩm chọn mua">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/40 p-2">
            <img src={product.image || '/placeholder.svg'} alt="" className="size-12 shrink-0 rounded-md bg-card object-contain" />
            <select
              id="order-product"
              value={product.sku}
              onChange={(e) => {
                const next = products.find((p) => p.sku === e.target.value)
                setOrderSku(e.target.value)
                setQuantity(1)
                setSuccess(null)
                if (next && next.stock[branch] === 0) {
                  const fallback = BRANCHES.find((b) => next.stock[b.id] > 0)
                  if (fallback) setBranch(fallback.id)
                }
              }}
              className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-card px-2 text-sm font-semibold text-foreground focus:border-primary focus:ring-4 focus:ring-primary/15 focus:outline-none"
            >
              {products.map((p) => (
                <option key={p.sku} value={p.sku}>
                  {p.sku} — {p.name}
                </option>
              ))}
            </select>
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
          <div className="flex flex-col gap-1.5">
            <span id="qty-label" className="text-xs font-bold text-foreground">
              Số lượng
            </span>
            <div role="group" aria-labelledby="qty-label" className="flex h-10 items-center rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="flex h-full w-10 items-center justify-center text-body hover:text-primary disabled:text-muted-foreground/50"
                aria-label="Giảm số lượng"
              >
                <Minus className="size-4" aria-hidden="true" />
              </button>
              <output aria-live="polite" className="tabular w-10 border-x border-border text-center text-sm font-extrabold text-foreground">
                {quantity}
              </output>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                disabled={quantity >= maxQty}
                className="flex h-full w-10 items-center justify-center text-body hover:text-primary disabled:text-muted-foreground/50"
                aria-label="Tăng số lượng"
              >
                <Plus className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-foreground">Đơn giá</span>
            <div className="flex h-10 items-center gap-2">
              <span className="tabular text-lg font-extrabold text-price">{formatVND(product.price)}</span>
              <span className="rounded-md bg-accent/15 px-2 py-0.5 text-[11px] font-bold text-amber-800">Trả góp 0%</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="order-name" label="Họ và tên khách hàng" icon={User} error={errors.name}>
            <input
              id="order-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              autoComplete="name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'order-name-error' : undefined}
              className={inputClass}
            />
          </Field>
          <Field id="order-phone" label="Số điện thoại" icon={Phone} error={errors.phone}>
            <input
              id="order-phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0903 123 456"
              autoComplete="tel"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'order-phone-error' : undefined}
              className={cn(inputClass, 'tabular')}
            />
          </Field>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-xs font-bold text-foreground">Hình thức nhận hàng</legend>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: 'pickup', label: 'Nhận tại siêu thị', icon: Store },
                { id: 'delivery', label: 'Giao hàng tận nơi', icon: Truck },
              ] as const
            ).map((f) => (
              <label
                key={f.id}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-primary/20',
                  fulfillment === f.id ? 'border-primary bg-primary/5 text-primary-deep' : 'border-border text-body hover:border-primary/40',
                )}
              >
                <input
                  type="radio"
                  name="fulfillment"
                  value={f.id}
                  checked={fulfillment === f.id}
                  onChange={() => setFulfillment(f.id)}
                  className="sr-only"
                />
                <f.icon className="size-4" aria-hidden="true" />
                {f.label}
              </label>
            ))}
          </div>
        </fieldset>

        {fulfillment === 'delivery' && (
          <Field id="order-address" label="Địa chỉ giao hàng" icon={MapPin} error={errors.address}>
            <input
              id="order-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Số nhà, đường, phường, TP. Thủ Đức"
              autoComplete="street-address"
              aria-invalid={!!errors.address}
              aria-describedby={errors.address ? 'order-address-error' : undefined}
              className={inputClass}
            />
          </Field>
        )}

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-xs font-bold text-foreground">
            {fulfillment === 'pickup' ? 'Siêu thị nhận hàng' : 'Xuất kho từ siêu thị'}
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {BRANCHES.map((b) => {
              const stock = product.stock[b.id]
              const active = branch === b.id
              return (
                <label
                  key={b.id}
                  className={cn(
                    'flex cursor-pointer flex-col gap-1 rounded-lg border px-3 py-2.5 transition-colors has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-55 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-primary/20',
                    active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40',
                  )}
                >
                  <input
                    type="radio"
                    name="branch"
                    value={b.id}
                    checked={active}
                    disabled={stock === 0}
                    onChange={() => {
                      setBranch(b.id)
                      setQuantity((q) => Math.min(q, Math.max(1, Math.min(5, stock))))
                    }}
                    className="sr-only"
                  />
                  <span className="text-sm font-bold text-foreground">{b.name}</span>
                  <span className="text-[11px] text-muted-foreground">{b.district}</span>
                  <span
                    className={cn(
                      'tabular mt-0.5 w-fit rounded-full px-2 py-0.5 text-[11px] font-bold',
                      stock > 0 ? 'bg-success-soft text-success-ink' : 'bg-danger-soft text-danger-ink',
                    )}
                  >
                    {stock > 0 ? `Còn ${stock} máy` : 'Tạm hết hàng'}
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <Field id="order-promo" label="Mã khuyến mãi" icon={Tag} error={errors.promo}>
          <input
            id="order-promo"
            value={promo}
            onChange={(e) => setPromo(e.target.value)}
            placeholder="MWG5 hoặc TET2027"
            autoCapitalize="characters"
            aria-invalid={!!errors.promo}
            aria-describedby="order-promo-hint"
            className={cn(inputClass, 'font-mono uppercase placeholder:normal-case')}
          />
          <p id="order-promo-hint" aria-live="polite" className="text-[11px] font-semibold">
            {quote.promoApplied ? (
              <span className="text-success-ink">Áp dụng thành công: {quote.promoLabel || promoKey}</span>
            ) : promoKey ? (
              <span className="text-muted-foreground">{quote.loading ? `Đang kiểm tra mã “${promoKey}”…` : quote.promoMessage}</span>
            ) : (
              <span className="text-muted-foreground">Nhập MWG5 (-5%) hoặc TET2027 (-10%, tối đa 1.5 triệu)</span>
            )}
          </p>
        </Field>

        <dl className="flex flex-col gap-1.5 rounded-lg border border-border bg-secondary/40 p-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">
              Tạm tính (<span className="tabular">{quantity}</span> sản phẩm)
            </dt>
            <dd className="tabular font-semibold text-body">{formatVND(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Chiết khấu giảm giá {quote.promoApplied && <span className="font-mono">({promoKey})</span>}</dt>
            <dd className={cn('tabular font-semibold', discount > 0 ? 'text-success-ink' : 'text-body')}>
              {discount > 0 ? `− ${formatVND(discount)}` : formatVND(0)}
            </dd>
          </div>
          <div className="mt-1 flex items-baseline justify-between border-t border-border pt-2">
            <dt className="font-bold text-foreground">Tổng thanh toán</dt>
            <dd className="tabular text-2xl font-extrabold text-price">{formatVND(total)}</dd>
          </div>
        </dl>

        {(errors.form || quote.error) && (
          <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm font-semibold text-danger-ink">
            {errors.form || quote.error}
          </p>
        )}
        {success && (
          <p role="status" className="flex items-center gap-2 rounded-lg bg-success-soft px-3 py-2 text-sm font-semibold text-success-ink">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            Đơn hàng #{success.id} đặt thành công · Tổng tiền: {formatVND(success.total)}
          </p>
        )}

        <button
          type="submit"
          disabled={available === 0 || quote.loading || !!quote.error}
          className="h-12 rounded-lg bg-accent text-base font-extrabold text-foreground shadow-sm transition-colors hover:bg-amber-400 focus-visible:ring-4 focus-visible:ring-accent/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground"
        >
          {available === 0 ? 'Tạm hết hàng tại chi nhánh đã chọn' : 'Xác Nhận Đặt Hàng'}
        </button>
      </form>
    </section>
  )
}

function OrdersFeed() {
  const { orders, confirmOrder } = useStore()
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED'>('ALL')
  const sorted = useMemo(
    () =>
      [...orders]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id)
        .filter((o) => filter === 'ALL' || o.status === filter),
    [orders, filter],
  )
  const revenue = orders.reduce((s, o) => s + o.total, 0)

  return (
    <section aria-labelledby="feed-title" className="flex flex-col rounded-xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="feed-title" className="flex items-center gap-2 text-base font-extrabold text-foreground">
            Hàng Đợi Đơn Hàng Trực Tiếp
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-success" />
            </span>
          </h2>
          <p className="text-xs text-muted-foreground">
            <span className="tabular">{orders.length}</span> đơn hàng hôm nay · Doanh thu{' '}
            <span className="tabular font-bold text-body">{formatVND(revenue)}</span>
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-border bg-secondary/60 p-1">
          {(
            [
              { id: 'ALL', label: 'TẤT CẢ' },
              { id: 'PENDING', label: 'CHỜ DUYỆT' },
              { id: 'CONFIRMED', label: 'ĐÃ XÁC NHẬN' },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wide transition-colors',
                filter === f.id ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <ol aria-live="polite" className="flex flex-col gap-3 p-5">
        {sorted.length === 0 && (
          <li className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            Chưa có đơn hàng nào ở trạng thái này.
          </li>
        )}
        {sorted.map((o) => (
          <OrderCard key={o.id} order={o} onConfirm={() => confirmOrder(o.id)} />
        ))}
      </ol>
    </section>
  )
}

function OrderCard({ order, onConfirm }: { order: Order; onConfirm: () => void }) {
  const pending = order.status === 'PENDING'
  return (
    <li
      className={cn(
        'rounded-xl border bg-card p-4 transition-shadow hover:shadow-sm',
        pending ? 'border-accent/50 border-l-4 border-l-accent' : 'border-border border-l-4 border-l-success',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="tabular font-mono text-sm font-bold text-foreground">#{order.id}</span>
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider',
              pending ? 'bg-accent/15 text-amber-800' : 'bg-success-soft text-success-ink',
            )}
          >
            {pending ? 'CHỜ XỬ LÝ' : 'ĐÃ XÁC NHẬN'}
          </span>
        </div>
        <span className="tabular flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <Clock className="size-3.5" aria-hidden="true" />
          <time dateTime={order.createdAt}>{formatTime(order.createdAt)}</time>
        </span>
      </div>

      <p className="mt-2 line-clamp-1 text-sm font-semibold text-body">
        {order.items.map((item) => `${item.quantity}× ${item.name}`).join(' · ')}
      </p>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-0.5 text-xs">
          <span className="font-bold text-foreground">{order.customerName}</span>
          <span className="tabular text-muted-foreground">{order.phone}</span>
          <span className="text-muted-foreground">
            {getBranch(order.branchId).name} · {order.address || 'Nhận tại quầy'}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1">
          {order.discount > 0 && (
            <span className="tabular text-[11px] font-semibold text-success-ink">
              {order.promoCode} −{formatVND(order.discount)}
            </span>
          )}
          <span className="tabular text-lg font-extrabold text-price">{formatVND(order.total)}</span>
        </div>
      </div>

      {pending && (
        <button
          type="button"
          onClick={onConfirm}
          className="mt-3 flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-primary/30 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          <CheckCircle2 className="size-3.5" aria-hidden="true" />
          Xác nhận đơn hàng
        </button>
      )}
    </li>
  )
}
