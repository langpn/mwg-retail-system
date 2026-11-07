'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock, MapPin, Package, Phone, Search } from 'lucide-react'
import { formatVND } from '@/lib/dmx-data'
import { useStore } from '@/components/dmx/store-provider'
import { AppHeader } from '@/components/dmx/app-header'
import { SiteFooter } from '@/components/dmx/site-footer'
import { cn } from '@/lib/utils'

export default function OrdersPage() {
  const { customer, orders, reloadFromBackend } = useStore()
  const [phoneQuery, setPhoneQuery] = useState('')

  // Tự động tải lại đơn mới nhất từ MySQL khi mở trang
  useEffect(() => {
    reloadFromBackend()
  }, [reloadFromBackend])

  // Xác định số điện thoại tra cứu: nếu đã đăng nhập thì lấy của khách, nếu chưa thì lấy ô nhập
  const activePhone = (customer?.phone || phoneQuery).trim().replace(/\s/g, '')

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

        {/* Khung nhập SĐT nếu chưa đăng nhập */}
        {!customer && (
          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
            <label className="mb-1.5 block text-xs font-bold text-foreground">
              Nhập số điện thoại mua hàng để tra cứu:
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
          </div>
        )}

        {/* Danh sách đơn hàng */}
        {activePhone && matchedOrders.length > 0 ? (
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
                      o.status === 'CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800',
                    )}
                  >
                    {o.status === 'CONFIRMED' ? '🟢 Siêu thị đã duyệt đơn' : '🟠 Chờ siêu thị duyệt'}
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
                ? `Không tìm thấy đơn hàng nào với số điện thoại ${activePhone}.`
                : 'Các đơn hàng bạn đặt tại siêu thị sẽ hiển thị tại đây.'}
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
