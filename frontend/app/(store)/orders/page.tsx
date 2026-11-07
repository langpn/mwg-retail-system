'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Clock, Package, Phone } from 'lucide-react'
import { formatVND } from '@/lib/dmx-data'
import { useStore } from '@/components/dmx/store-provider'
import { AppHeader } from '@/components/dmx/app-header'
import { SiteFooter } from '@/components/dmx/site-footer'
import { cn } from '@/lib/utils'

const ORDER_STATUS_MAP: Record<string, { label: string; badgeClass: string }> = {
  PENDING: {
    label: '🟠 Chờ siêu thị duyệt',
    badgeClass: 'bg-amber-100 text-amber-800',
  },
  CONFIRMED: {
    label: '🔵 Đang chuẩn bị hàng',
    badgeClass: 'bg-blue-100 text-blue-800',
  },
  COMPLETED: {
    label: '🟢 Giao hàng thành công',
    badgeClass: 'bg-emerald-100 text-emerald-800',
  },
  CANCELLED: {
    label: '🔴 Đã hủy đơn hàng',
    badgeClass: 'bg-rose-100 text-rose-800',
  },
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={<div className="p-12 text-center text-sm text-muted-foreground">Đang tải đơn hàng...</div>}
    >
      <OrdersContent />
    </Suspense>
  )
}

function OrdersContent() {
  const { customer, orders, reloadFromBackend, lastOrderPhone, backendConnected } = useStore()
  const searchParams = useSearchParams()
  const phoneFromQuery = (searchParams.get('phone') || '').replace(/\s/g, '')
  const [phoneQuery, setPhoneQuery] = useState('')

  // Tự động tải lại đơn mới nhất từ MySQL khi mở trang
  useEffect(() => {
    reloadFromBackend()
  }, [reloadFromBackend])

  // Số điện thoại sẽ được điền sẵn vào ô tra cứu, theo thứ tự ưu tiên:
  //   1. Số trên URL (?phone=...) — vừa đặt hàng xong bấm "Xem đơn hàng vừa đặt"
  //   2. Số của tài khoản đang đăng nhập
  //   3. Số của đơn hàng gần nhất đã đặt trên máy này (khách mua không cần đăng nhập)
  const preferredPhone =
    phoneFromQuery || (customer?.phone || '').replace(/\s/g, '') || lastOrderPhone

  useEffect(() => {
    if (preferredPhone) setPhoneQuery(preferredPhone)
  }, [preferredPhone])

  // Ô nhập là nguồn sự thật duy nhất để tra cứu, đã được điền sẵn số phù hợp ở trên.
  // Nhờ vậy khách đăng nhập bằng SĐT A vẫn tra cứu được đơn đặt bằng SĐT B (mua giúp người thân).
  const activePhone = phoneQuery.trim().replace(/\s/g, '')

  const matchedOrders = useMemo(() => {
    if (!activePhone) return []
    return orders.filter((o) => o.phone && o.phone.replace(/\s/g, '') === activePhone)
  }, [orders, activePhone])

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-foreground">
      <AppHeader />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 md:px-8">
        {/* Tiêu đề trang */}
        <div className="border-b border-border pb-3">
          <h1 className="text-2xl font-black text-foreground">
            {customer ? 'Đơn Hàng Của Bạn' : 'Tra Cứu Đơn Hàng'}
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Theo dõi tiến độ giao hàng và trạng thái đơn đặt tại hệ thống siêu thị Điện Máy Xanh.
          </p>
        </div>

        {/* Khung nhập SĐT tra cứu — luôn hiển thị để khách sửa được, kể cả khi đã đăng nhập */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <label className="mb-1.5 block text-xs font-bold text-foreground">
            Số điện thoại dùng khi đặt hàng:
          </label>
          <div className="relative">
            <Phone className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="tel"
              value={phoneQuery}
              onChange={(e) => setPhoneQuery(e.target.value)}
              placeholder="VD: 0901 234 567"
              className="h-11 w-full rounded-xl border border-border bg-card pr-3 pl-9 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none"
            />
          </div>
          {!customer && (
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              Bạn không cần đăng nhập tài khoản. Chỉ cần nhập đúng số điện thoại đã dùng khi đặt hàng là xem được đơn.
            </p>
          )}
        </div>

        {/* Danh sách đơn hàng */}
        {activePhone && backendConnected === null ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <Clock className="size-10 animate-pulse text-muted-foreground/40" />
            <p className="text-xs font-semibold text-muted-foreground">
              Đang tải đơn hàng từ hệ thống...
            </p>
          </div>
        ) : activePhone && matchedOrders.length > 0 ? (
          <div className="flex flex-col gap-4">
            <p className="text-xs font-bold text-muted-foreground">
              Tìm thấy <span className="font-extrabold text-foreground">{matchedOrders.length}</span> đơn hàng cho số điện thoại: <span className="text-primary font-mono">{activePhone}</span>
            </p>

            {matchedOrders.map((o) => (
              <article
                key={o.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-primary">Đơn hàng #{o.id}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : 'Vừa đặt'}
                    </span>
                  </div>

                  <span
                    className={cn(
                      'rounded-md px-2.5 py-1 text-[11px] font-black',
                      (ORDER_STATUS_MAP[o.status] || ORDER_STATUS_MAP.PENDING).badgeClass,
                    )}
                  >
                    {(ORDER_STATUS_MAP[o.status] || { label: o.status }).label}
                  </span>
                </div>

                <div className="my-3.5 flex flex-col gap-2 text-xs">
                  <p className="text-sm font-bold text-foreground">{o.productName}</p>
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-foreground">Người nhận:</span> {o.customerName} ({o.phone})
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-foreground">Địa chỉ nhận hàng:</span> {o.address}
                  </p>
                </div>

                <div className="flex items-baseline justify-between border-t border-border pt-3 text-xs">
                  <span className="text-muted-foreground">Hình thức: Thanh toán tiền mặt (COD)</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-semibold text-muted-foreground">Tổng tiền:</span>
                    <span className="tabular text-base font-black text-price">{formatVND(o.total)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <Package className="mx-auto size-12 text-muted-foreground/40" />
            <h2 className="mt-3 text-base font-bold text-foreground">Chưa có đơn hàng nào</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {activePhone
                ? `Không tìm thấy đơn hàng nào với số điện thoại ${activePhone}. Bạn hãy kiểm tra lại số điện thoại đã dùng khi đặt hàng.`
                : 'Nhập số điện thoại đã dùng khi đặt hàng ở ô phía trên để tra cứu đơn. Bạn không cần đăng nhập tài khoản.'}
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-deep"
            >
              <ArrowLeft className="size-3.5" /> Khám phá sản phẩm
            </Link>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
