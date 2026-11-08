'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { BRANCHES, formatVND, getBranch, type Order } from '@/lib/dmx-data'
import { usePriceQuote } from '@/lib/pricing'
import { useStore } from '@/components/dmx/store-provider'
import { AppHeader } from '@/components/dmx/app-header'
import { SiteFooter } from '@/components/dmx/site-footer'

export default function CheckoutPage() {
  return <Suspense fallback={<p className="p-12 text-center">Đang tải...</p>}><CheckoutContent /></Suspense>
}

const inputClass = 'mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const { cart, customer, products, backendConnected, branchId, setBranchId, placeCartOrder } = useStore()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [fulfillment, setFulfillment] = useState<'pickup' | 'delivery'>('pickup')
  const [address, setAddress] = useState('')
  const [promo, setPromo] = useState(searchParams.get('promo') || '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successOrder, setSuccessOrder] = useState<Order | null>(null)
  const promoCode = promo.trim().toUpperCase()
  const quote = usePriceQuote(cart, promoCode, branchId, products, backendConnected)

  useEffect(() => {
    if (!customer) return
    setName((value) => value || customer.fullName)
    setPhone((value) => value || customer.phone)
    setAddress((value) => value || customer.address || '')
  }, [customer])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedPhone = phone.replace(/\s/g, '')
    if (name.trim().length < 2) return setError('Vui lòng nhập họ và tên.')
    if (!/^0\d{9}$/.test(normalizedPhone)) return setError('Số điện thoại gồm 10 chữ số và bắt đầu bằng 0.')
    if (fulfillment === 'delivery' && !address.trim()) return setError('Vui lòng nhập địa chỉ nhận hàng.')
    if (submitting || quote.loading || quote.error) return
    const branch = getBranch(branchId)
    setError('')
    setSubmitting(true)
    try {
      const result = await placeCartOrder({
        customerName: name.trim(), phone: normalizedPhone,
        address: fulfillment === 'pickup' ? `Nhận tại ${branch.name} (${branch.address})` : address.trim(),
        branchId, promoCode,
      })
      if ('error' in result) setError(result.error)
      else setSuccessOrder(result)
    } catch {
      setError('Không thể gửi đơn hàng. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-foreground">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-8">
        {customer?.role === 'ADMIN' ? (
          <section className="mx-auto max-w-md rounded-xl border border-border bg-card p-6 text-center">
            <h1 className="text-lg font-bold">Tài khoản Quản trị viên</h1>
            <p className="mt-2 text-sm text-muted-foreground">Tài khoản Quản trị viên chỉ phục vụ vận hành hệ thống, không thực hiện đặt hàng trực tiếp.</p>
            <div className="mt-5 flex justify-center gap-4 text-sm font-semibold text-primary">
              <Link href="/dashboard">Quản trị CSDL</Link><Link href="/">Về cửa hàng</Link>
            </div>
          </section>
        ) : successOrder ? (
          <section className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-6">
            <h1 className="text-2xl font-bold">Đặt hàng thành công</h1>
            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between gap-4"><dt>Mã đơn hàng</dt><dd className="tabular font-mono font-semibold">#{successOrder.id}</dd></div>
              <div className="flex justify-between gap-4"><dt>Khách hàng</dt><dd>{successOrder.customerName}</dd></div>
              <div className="flex justify-between gap-4"><dt>Số điện thoại</dt><dd className="tabular">{successOrder.phone}</dd></div>
              <div className="flex justify-between gap-4"><dt>Chi nhánh xuất kho</dt><dd>{getBranch(successOrder.branchId).name}</dd></div>
              <div className="flex justify-between gap-4"><dt>Địa chỉ nhận hàng</dt><dd className="max-w-xs text-right">{successOrder.address}</dd></div>
            </dl>
            <ul className="mt-5 divide-y divide-border border-y border-border text-sm">
              {successOrder.items.map((item, index) => (
                <li key={`${item.sku}-${index}`} className="flex justify-between gap-4 py-3">
                  <span>{item.name} <span className="tabular text-muted-foreground">× {item.quantity}</span></span>
                  <span className="tabular whitespace-nowrap">{formatVND(item.quantity * item.unitPrice)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex justify-between font-bold">Tổng thanh toán <span className="tabular text-price">{formatVND(successOrder.total)}</span></p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold text-primary">
              <Link href="/orders">Tra cứu đơn hàng</Link><Link href="/">Về cửa hàng</Link>
            </div>
          </section>
        ) : (
          <>
            <h1 className="mb-6 text-2xl font-bold">Xác nhận đơn hàng</h1>
            {cart.length === 0 ? (
              <p className="text-sm">Giỏ hàng đang trống. <Link href="/" className="font-semibold text-primary">Chọn sản phẩm</Link></p>
            ) : (
              <form onSubmit={handleSubmit} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,400px)]">
                <div className="space-y-6">
                  <section className="rounded-xl border border-border bg-card p-5">
                    <h2 className="text-base font-bold">Thông tin khách hàng</h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <label className="text-sm font-medium">Họ và tên
                        <input className={inputClass} autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
                      </label>
                      <label className="text-sm font-medium">Số điện thoại
                        <input className={`${inputClass} tabular`} type="tel" autoComplete="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
                      </label>
                    </div>
                  </section>
                  <section className="rounded-xl border border-border bg-card p-5">
                    <h2 className="text-base font-bold">Chi nhánh và địa chỉ nhận hàng</h2>
                    <fieldset className="mt-4 flex flex-wrap gap-5 text-sm">
                      <legend className="sr-only">Hình thức nhận hàng</legend>
                      <label className="flex items-center gap-2"><input type="radio" name="fulfillment" checked={fulfillment === 'pickup'} onChange={() => setFulfillment('pickup')} /> Nhận tại siêu thị</label>
                      <label className="flex items-center gap-2"><input type="radio" name="fulfillment" checked={fulfillment === 'delivery'} onChange={() => setFulfillment('delivery')} /> Giao hàng tận nơi</label>
                    </fieldset>
                    <fieldset className="mt-5">
                      <legend className="text-sm font-semibold">Chọn chi nhánh xuất kho</legend>
                      <div className="mt-2 divide-y divide-border border-y border-border">
                        {BRANCHES.map((branch) => (
                          <label key={branch.id} className="flex cursor-pointer items-start gap-3 py-3 text-sm">
                            <input className="mt-1" type="radio" name="branch" checked={branchId === branch.id} onChange={() => setBranchId(branch.id)} />
                            <span className="min-w-0 flex-1"><span className="block font-semibold">{branch.name}</span><span className="block text-muted-foreground">{branch.address}</span>
                              {cart.map(({ product, quantity }) => (
                                <span key={product.sku} className="tabular block text-xs text-muted-foreground">{product.sku}: còn {product.stock[branch.id]} / cần {quantity}</span>
                              ))}
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    {fulfillment === 'delivery' && (
                      <label className="mt-4 block text-sm font-medium">Địa chỉ nhận hàng
                        <input className={inputClass} autoComplete="street-address" required value={address} onChange={(e) => setAddress(e.target.value)} />
                      </label>
                    )}
                  </section>
                </div>
                <section className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between gap-2"><h2 className="text-base font-bold">Tóm tắt đơn hàng</h2><Link href="/cart" className="text-sm font-semibold text-primary">Sửa giỏ hàng</Link></div>
                  <ul className="mt-3 divide-y divide-border">
                    {cart.map(({ product, quantity }) => (
                      <li key={product.sku} className="flex gap-3 py-3 text-sm">
                        <img src={product.image || '/placeholder.svg'} alt="" className="size-14 shrink-0 object-contain" />
                        <div className="min-w-0 flex-1"><p className="font-medium">{product.name}</p><p className="tabular font-mono text-xs text-muted-foreground">{product.sku}</p><p className="tabular text-muted-foreground">{quantity} × {formatVND(product.price)}</p></div>
                      </li>
                    ))}
                  </ul>
                  <label className="mt-3 block text-sm font-medium">Mã khuyến mãi
                    <input className={`${inputClass} uppercase`} value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="MWG5 hoặc TET2027" />
                  </label>
                  {promoCode && <p aria-live="polite" className="mt-1 text-xs text-muted-foreground">{quote.loading ? 'Đang kiểm tra...' : quote.promoLabel || quote.promoMessage}</p>}
                  <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                    <div className="flex justify-between"><dt>Tạm tính</dt><dd className="tabular">{quote.loading ? 'Đang tính...' : formatVND(quote.subtotal)}</dd></div>
                    <div className="flex justify-between"><dt>Giảm giá</dt><dd className="tabular">{formatVND(quote.discount)}</dd></div>
                    <div className="flex justify-between border-t border-border pt-3 font-bold"><dt>Tổng thanh toán</dt><dd className="tabular text-lg text-price">{formatVND(quote.total)}</dd></div>
                  </dl>
                  {(error || quote.error) && <p role="alert" className="mt-4 rounded-lg bg-danger-soft p-3 text-sm text-danger-ink">{error || quote.error}</p>}
                  <button type="submit" disabled={submitting || quote.loading || !!quote.error} className="mt-4 w-full rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-50">
                    {submitting ? 'Đang gửi đơn hàng...' : 'Xác nhận đặt hàng'}
                  </button>
                </section>
              </form>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
