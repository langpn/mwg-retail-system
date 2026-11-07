'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  FileText,
  MapPin,
  Phone,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  User,
  Wallet,
} from 'lucide-react'
import { BRANCHES, PROMO_CODES, formatVND, type BranchId, type Order } from '@/lib/dmx-data'
import { StoreProvider, useStore } from '@/components/dmx/store-provider'
import { AppHeader } from '@/components/dmx/app-header'
import { SiteFooter } from '@/components/dmx/site-footer'
import { cn } from '@/lib/utils'

export default function CheckoutPage() {
  return (
    <StoreProvider>
      <Suspense fallback={<div className="p-12 text-center text-sm text-muted-foreground">Đang tải trang thanh toán...</div>}>
        <CheckoutContent />
      </Suspense>
    </StoreProvider>
  )
}

const DISTRICT_LIST = ['Tất cả quận/huyện', 'Quận 9', 'Thủ Đức']

interface PaymentMethodItem {
  id: string
  title: string
  desc: string
  icon: typeof Wallet
  badge?: string
}

const PAYMENT_METHODS: PaymentMethodItem[] = [
  {
    id: 'cod',
    title: 'Thanh toán tiền mặt khi nhận hàng (COD)',
    desc: 'Khách hàng nhận máy, kiểm tra hàng chính hãng và vận hành ưng ý mới thanh toán.',
    icon: Wallet,
    badge: 'Phổ biến nhất',
  },
  {
    id: 'vietqr',
    title: 'Chuyển khoản quét mã QR (VietQR / Napas247)',
    desc: 'Hỗ trợ quét mã bằng tất cả ứng dụng Ngân hàng (VCB, TCB, MB, BIDV) và Ví điện tử.',
    icon: QrCode,
    badge: 'Nhanh chóng & Miễn phí',
  },
  {
    id: 'atm',
    title: 'Thẻ ATM nội địa / Internet Banking',
    desc: 'Thanh toán trực tuyến qua cổng bảo mật của hơn 30 ngân hàng thành viên Napas.',
    icon: CreditCard,
  },
  {
    id: 'visa',
    title: 'Thẻ tín dụng / Ghi nợ quốc tế (Visa, Mastercard, JCB)',
    desc: 'Xác thực bảo mật 3D-Secure quốc tế, bảo vệ thông tin chủ thẻ tuyệt đối.',
    icon: CreditCard,
  },
  {
    id: 'installment',
    title: 'Trả góp 0% lãi suất qua thẻ tín dụng',
    desc: 'Kỳ hạn 3 - 6 - 12 tháng, không mất phí hồ sơ, duyệt online trong 3 phút.',
    icon: Building2,
    badge: 'Ưu đãi 0%',
  },
]

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialPromo = searchParams.get('promo') || ''

  const { cart, cartSubtotal, cartCount, placeCartOrder, customer } = useStore()

  // 1. Thông tin người đặt
  const [salutation, setSalutation] = useState<'Anh' | 'Chị'>('Anh')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (customer) {
      setName((prev) => prev || customer.fullName)
      setPhone((prev) => prev || customer.phone)
      if (customer.email) setEmail((prev) => prev || customer.email || '')
      if (customer.address) setStreetAddress((prev) => prev || customer.address || '')
    }
  }, [customer])
  const [hasOtherRecipient, setHasOtherRecipient] = useState(false)
  const [otherName, setOtherName] = useState('')
  const [otherPhone, setOtherPhone] = useState('')

  // 2. Hình thức nhận hàng
  const [fulfillment, setFulfillment] = useState<'pickup' | 'delivery'>('pickup')
  // Nhận tại siêu thị
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Tất cả quận/huyện')
  const [branchId, setBranchId] = useState<BranchId>('q9')
  // Giao tận nơi
  const [province, setProvince] = useState('TP. Hồ Chí Minh')
  const [district, setDistrict] = useState('TP. Thủ Đức (Quận 9 cũ)')
  const [ward, setWard] = useState('Phường Tăng Nhơn Phú B')
  const [streetAddress, setStreetAddress] = useState('')
  const [deliveryNote, setDeliveryNote] = useState('')

  // 3. Phương thức thanh toán
  const [paymentMethod, setPaymentMethod] = useState<string>('cod')

  // 4. Hóa đơn VAT
  const [needInvoice, setNeedInvoice] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [companyTaxId, setCompanyTaxId] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')

  // Promo & Submit
  const [promo, setPromo] = useState(initialPromo)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [successOrder, setSuccessOrder] = useState<Order | null>(null)

  const promoKey = promo.trim().toUpperCase()
  const promoDef = PROMO_CODES[promoKey]
  const discount = promoDef ? promoDef.compute(cartSubtotal) : 0
  const total = Math.max(0, cartSubtotal - discount)

  // Danh sách chi nhánh hiển thị sau khi lọc
  const visibleBranches = useMemo(() => {
    if (selectedDistrict === 'Tất cả quận/huyện') return BRANCHES
    return BRANCHES.filter((b) => b.district.toLowerCase().includes(selectedDistrict.toLowerCase()))
  }, [selectedDistrict])

  function validate() {
    const next: Record<string, string> = {}
    if (name.trim().length < 2) next.name = 'Vui lòng nhập họ và tên người đặt hàng.'
    if (!/^0\d{9}$/.test(phone.replace(/\s/g, ''))) next.phone = 'Số điện thoại hợp lệ gồm 10 chữ số (bắt đầu bằng 0).'
    if (hasOtherRecipient) {
      if (otherName.trim().length < 2) next.otherName = 'Vui lòng nhập họ và tên người nhận thay.'
      if (!/^0\d{9}$/.test(otherPhone.replace(/\s/g, ''))) next.otherPhone = 'Số điện thoại người nhận thay không hợp lệ.'
    }
    if (fulfillment === 'delivery' && streetAddress.trim().length < 4) {
      next.streetAddress = 'Vui lòng nhập số nhà và tên đường cụ thể.'
    }
    if (needInvoice) {
      if (companyName.trim().length < 3) next.companyName = 'Vui lòng nhập tên công ty.'
      if (companyTaxId.trim().length < 8) next.companyTaxId = 'Mã số thuế không hợp lệ.'
    }
    return next
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const v = validate()
    setErrors(v)
    if (Object.keys(v).length > 0) {
      window.scrollTo({ top: 120, behavior: 'smooth' })
      return
    }

    setLoading(true)

    // Tạo địa chỉ đầy đủ
    let computedAddress = ''
    if (fulfillment === 'delivery') {
      computedAddress = `${streetAddress.trim()}, ${ward}, ${district}, ${province}`
      if (deliveryNote.trim()) computedAddress += ` (Ghi chú: ${deliveryNote.trim()})`
    } else {
      const selectedB = BRANCHES.find((b) => b.id === branchId) || BRANCHES[0]
      computedAddress = `Nhận tại siêu thị ${selectedB.name} (${selectedB.address})`
    }

    const recipientString = hasOtherRecipient
      ? `${salutation} ${name.trim()} (Người nhận thay: ${otherName.trim()} - ${otherPhone.trim()})`
      : `${salutation} ${name.trim()}`

    const result = await placeCartOrder({
      customerName: recipientString,
      phone: phone.trim(),
      address: computedAddress,
      branchId,
      promoCode: promoKey,
    })
    setLoading(false)

    if ('error' in result) {
      setErrors({ form: result.error })
      return
    }

    setSuccessOrder(result)
  }

  // Màn hình hoàn tất đặt hàng
  if (successOrder) {
    const selectedMethod = PAYMENT_METHODS.find((m) => m.id === paymentMethod)
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 text-foreground">
        <AppHeader />

        <main className="flex flex-1 items-center justify-center p-4 py-12">
          <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl text-center sm:p-10 animate-in fade-in zoom-in-95">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50">
              <CheckCircle2 className="size-10" />
            </div>
            <h1 className="mt-5 text-2xl font-extrabold text-foreground sm:text-3xl">Đặt hàng thành công!</h1>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Hệ thống đã gửi xác nhận đơn hàng vào số điện thoại <strong className="text-foreground">{successOrder.phone}</strong>
            </p>

            <div className="my-6 divide-y divide-border rounded-2xl border border-border bg-secondary/30 p-5 text-left text-xs">
              <div className="flex justify-between pb-3">
                <span className="text-muted-foreground">Mã đơn hàng:</span>
                <span className="font-mono text-base font-extrabold text-primary">#{successOrder.id}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-muted-foreground">Khách hàng đặt:</span>
                <span className="font-bold text-foreground">{successOrder.customerName}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-muted-foreground">Hình thức nhận hàng:</span>
                <span className="font-semibold text-foreground max-w-xs text-right truncate">
                  {successOrder.address}
                </span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-muted-foreground">Phương thức thanh toán:</span>
                <span className="font-bold text-foreground">{selectedMethod?.title || 'Tiền mặt khi nhận hàng (COD)'}</span>
              </div>
              {needInvoice && (
                <div className="flex justify-between py-3">
                  <span className="text-muted-foreground">Xuất hóa đơn VAT:</span>
                  <span className="font-semibold text-foreground">{companyName} (MST: {companyTaxId})</span>
                </div>
              )}
              <div className="flex items-baseline justify-between pt-3 text-sm">
                <span className="font-bold text-foreground">Tổng tiền thanh toán:</span>
                <span className="tabular text-xl font-extrabold text-price">{formatVND(successOrder.total)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="flex flex-1 h-12 items-center justify-center rounded-xl bg-primary text-xs font-bold text-white transition-all hover:bg-primary-deep shadow-sm"
              >
                Tiếp tục xem sản phẩm khác
              </Link>
              <Link
                href="/dashboard"
                className="flex flex-1 h-12 items-center justify-center rounded-xl border border-border bg-card text-xs font-bold text-foreground transition-all hover:bg-secondary"
              >
                Kiểm tra đơn trên Dashboard Admin
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

      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 px-4 py-8 md:px-8">
        {/* Thanh quy trình thanh toán (Progress Steps) */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Thanh toán & Đặt hàng</h1>
            <p className="text-xs text-muted-foreground">Kiểm tra thông tin giao nhận và lựa chọn phương thức thanh toán an toàn</p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <Link href="/cart" className="text-muted-foreground hover:text-primary">
              1. Giỏ hàng
            </Link>
            <span className="text-muted-foreground">→</span>
            <span className="rounded-full bg-primary/10 px-3 py-1 font-bold text-primary">
              2. Đặt hàng & Thanh toán
            </span>
            <span className="text-muted-foreground">→</span>
            <span className="text-muted-foreground">3. Hoàn tất</span>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-sm text-muted-foreground">Giỏ hàng của bạn đang trống.</p>
            <Link href="/" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline">
              <ArrowLeft className="size-4" /> Quay về mua sắm
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_440px]">
            {/* CỘT TRÁI: CÁC KHỐI THÔNG TIN GIAO DỊCH CHUẨN MỰC */}
            <div className="flex flex-col gap-6">
              {/* KHỐI 1: THÔNG TIN NGƯỜI ĐẶT & NHẬN HÀNG */}
              <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h2 className="flex items-center gap-2 text-sm font-extrabold text-foreground">
                    <User className="size-4 text-primary" />
                    1. Thông tin người đặt hàng
                  </h2>
                  <span className="text-[11px] text-muted-foreground">Bắt buộc (*)</span>
                </div>

                {/* Xưng hô */}
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-foreground">Danh xưng:</span>
                  <div className="flex gap-2">
                    {(['Anh', 'Chị'] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSalutation(s)}
                        className={cn(
                          'rounded-lg px-4 py-1.5 text-xs font-bold transition-all',
                          salutation === s
                            ? 'bg-primary text-white shadow-xs'
                            : 'border border-border bg-card text-muted-foreground hover:bg-secondary',
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Họ tên & Số điện thoại */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">Họ và tên *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nguyễn Văn An"
                      className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none"
                    />
                    {errors.name && <p className="text-[11px] font-semibold text-danger-ink">{errors.name}</p>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">Số điện thoại liên hệ *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0903 123 456"
                      className="tabular h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none"
                    />
                    {errors.phone && <p className="text-[11px] font-semibold text-danger-ink">{errors.phone}</p>}
                  </div>
                </div>

                {/* Email nhận hóa đơn */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Địa chỉ Email <span className="text-muted-foreground font-normal">(nhận hóa đơn điện tử VAT & thông tin bảo hành)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nguyenvanan@gmail.com"
                    className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none"
                  />
                </div>

                {/* Tùy chọn người nhận thay */}
                <div className="border-t border-border pt-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground">
                    <input
                      type="checkbox"
                      checked={hasOtherRecipient}
                      onChange={(e) => setHasOtherRecipient(e.target.checked)}
                      className="size-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span>Người nhận hàng là người khác (mua tặng người thân / đồng nghiệp)</span>
                  </label>

                  {hasOtherRecipient && (
                    <div className="mt-3 grid gap-3 rounded-xl border border-border bg-secondary/30 p-3 sm:grid-cols-2 animate-in fade-in">
                      <div>
                        <label className="mb-1 block text-xs font-bold text-foreground">Họ tên người nhận thay *</label>
                        <input
                          type="text"
                          value={otherName}
                          onChange={(e) => setOtherName(e.target.value)}
                          placeholder="Trần Thị Bích"
                          className="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs font-medium focus:border-primary focus:outline-none"
                        />
                        {errors.otherName && <p className="mt-1 text-[11px] text-danger-ink">{errors.otherName}</p>}
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold text-foreground">SĐT người nhận thay *</label>
                        <input
                          type="tel"
                          value={otherPhone}
                          onChange={(e) => setOtherPhone(e.target.value)}
                          placeholder="0918 999 888"
                          className="tabular h-9 w-full rounded-lg border border-border bg-card px-3 text-xs font-medium focus:border-primary focus:outline-none"
                        />
                        {errors.otherPhone && <p className="mt-1 text-[11px] text-danger-ink">{errors.otherPhone}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* KHỐI 2: HÌNH THỨC NHẬN HÀNG (HỖ TRỢ ĐA CHI NHÁNH & ĐỊA CHỈ PHÂN CẤP) */}
              <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h2 className="flex items-center gap-2 text-sm font-extrabold text-foreground">
                    <Store className="size-4 text-primary" />
                    2. Lựa chọn phương thức giao nhận
                  </h2>
                </div>

                {/* 2 Tab: Nhận tại siêu thị vs Giao tận nhà */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFulfillment('pickup')}
                    className={cn(
                      'flex items-center justify-center gap-2.5 rounded-xl border p-3.5 text-xs font-extrabold transition-all',
                      fulfillment === 'pickup'
                        ? 'border-primary bg-primary/10 text-primary-deep shadow-xs ring-2 ring-primary/20'
                        : 'border-border bg-card text-muted-foreground hover:border-primary/40',
                    )}
                  >
                    <Store className="size-4" />
                    <span>Nhận tại siêu thị ĐMX</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfillment('delivery')}
                    className={cn(
                      'flex items-center justify-center gap-2.5 rounded-xl border p-3.5 text-xs font-extrabold transition-all',
                      fulfillment === 'delivery'
                        ? 'border-primary bg-primary/10 text-primary-deep shadow-xs ring-2 ring-primary/20'
                        : 'border-border bg-card text-muted-foreground hover:border-primary/40',
                    )}
                  >
                    <Truck className="size-4" />
                    <span>Giao hàng tận nơi</span>
                  </button>
                </div>

                {/* Nội dung khi chọn "Nhận tại siêu thị" (Hỗ trợ lọc theo quận, cuộn mượt mà dù 2 hay 50 chi nhánh) */}
                {fulfillment === 'pickup' ? (
                  <div className="flex flex-col gap-3 rounded-xl border border-border bg-secondary/20 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-foreground">Chọn khu vực siêu thị gần bạn:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Lọc theo:</span>
                        <select
                          value={selectedDistrict}
                          onChange={(e) => setSelectedDistrict(e.target.value)}
                          className="h-8 rounded-lg border border-border bg-card px-2.5 text-xs font-bold text-foreground focus:border-primary focus:outline-none"
                        >
                          {DISTRICT_LIST.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Danh sách siêu thị có thanh cuộn (Scrollable) */}
                    <div className="max-h-60 overflow-y-auto divide-y divide-border rounded-xl border border-border bg-card">
                      {visibleBranches.map((b) => {
                        const isSelected = branchId === b.id
                        return (
                          <label
                            key={b.id}
                            className={cn(
                              'flex cursor-pointer items-start justify-between p-3.5 transition-colors',
                              isSelected ? 'bg-primary/8' : 'hover:bg-secondary/40',
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="radio"
                                name="branchChoice"
                                checked={isSelected}
                                onChange={() => setBranchId(b.id)}
                                className="mt-1 size-4 text-primary focus:ring-primary"
                              />
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-foreground">
                                  {b.name} <span className="font-semibold text-primary">({b.district})</span>
                                </span>
                                <span className="text-[11px] text-muted-foreground">{b.address}</span>
                                <span className="text-[10px] text-muted-foreground font-mono">Hotline: {(b as any).phone || '028.3730.1234'}</span>
                              </div>
                            </div>
                            <span className="mt-0.5 rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-bold text-success-ink shrink-0">
                              🟢 Sẵn hàng đón tiếp
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  /* Nội dung khi chọn "Giao tận nơi" (Chuẩn 4 cấp địa chỉ) */
                  <div className="flex flex-col gap-3 rounded-xl border border-border bg-secondary/20 p-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-xs font-bold text-foreground">Tỉnh / Thành phố *</label>
                        <select
                          value={province}
                          onChange={(e) => setProvince(e.target.value)}
                          className="h-9 w-full rounded-lg border border-border bg-card px-2 text-xs font-semibold focus:border-primary focus:outline-none"
                        >
                          <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                          <option value="Bình Dương">Bình Dương</option>
                          <option value="Đồng Nai">Đồng Nai</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-bold text-foreground">Quận / Huyện *</label>
                        <select
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="h-9 w-full rounded-lg border border-border bg-card px-2 text-xs font-semibold focus:border-primary focus:outline-none"
                        >
                          <option value="TP. Thủ Đức (Quận 9 cũ)">TP. Thủ Đức (Quận 9 cũ)</option>
                          <option value="TP. Thủ Đức (Thủ Đức cũ)">TP. Thủ Đức (Thủ Đức cũ)</option>
                          <option value="Quận Bình Thạnh">Quận Bình Thạnh</option>
                          <option value="Quận Gò Vấp">Quận Gò Vấp</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-bold text-foreground">Phường / Xã *</label>
                        <select
                          value={ward}
                          onChange={(e) => setWard(e.target.value)}
                          className="h-9 w-full rounded-lg border border-border bg-card px-2 text-xs font-semibold focus:border-primary focus:outline-none"
                        >
                          <option value="Phường Tăng Nhơn Phú B">Phường Tăng Nhơn Phú B</option>
                          <option value="Phường Phước Long B">Phường Phước Long B</option>
                          <option value="Phường Hiệp Phú">Phường Hiệp Phú</option>
                          <option value="Phường Linh Chiểu">Phường Linh Chiểu</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold text-foreground">Số nhà, tên đường cụ thể *</label>
                      <input
                        type="text"
                        required
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        placeholder="Ví dụ: 123/4 Lê Văn Việt"
                        className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm font-medium focus:border-primary focus:outline-none"
                      />
                      {errors.streetAddress && <p className="mt-1 text-[11px] text-danger-ink font-semibold">{errors.streetAddress}</p>}
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold text-foreground">Ghi chú giao hàng (tùy chọn)</label>
                      <input
                        type="text"
                        value={deliveryNote}
                        onChange={(e) => setDeliveryNote(e.target.value)}
                        placeholder="Ví dụ: Giao sau 17h, gọi trước khi đến 15 phút..."
                        className="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs font-medium focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </section>

              {/* KHỐI 3: PHƯƠNG THỨC THANH TOÁN (5 LỰA CHỌN THỰC TẾ) */}
              <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h2 className="flex items-center gap-2 text-sm font-extrabold text-foreground">
                    <CreditCard className="size-4 text-primary" />
                    3. Chọn phương thức thanh toán
                  </h2>
                </div>

                <div className="flex flex-col gap-2.5">
                  {PAYMENT_METHODS.map((pm) => {
                    const isSelected = paymentMethod === pm.id
                    const Icon = pm.icon
                    return (
                      <label
                        key={pm.id}
                        className={cn(
                          'flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition-all',
                          isSelected
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-2xs'
                            : 'border-border bg-card hover:border-primary/40',
                        )}
                      >
                        <input
                          type="radio"
                          name="paymentOption"
                          value={pm.id}
                          checked={isSelected}
                          onChange={() => setPaymentMethod(pm.id)}
                          className="mt-1 size-4 text-primary focus:ring-primary"
                        />
                        <div className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary shrink-0">
                          <Icon className="size-4" />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground">{pm.title}</span>
                            {pm.badge && (
                              <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-extrabold text-amber-800">
                                {pm.badge}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">{pm.desc}</p>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </section>

              {/* KHỐI 4: YÊU CẦU XUẤT HÓA ĐƠN ĐIỆN TỬ VAT (DOANH NGHIỆP) */}
              <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-xs">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-foreground">
                  <input
                    type="checkbox"
                    checked={needInvoice}
                    onChange={(e) => setNeedInvoice(e.target.checked)}
                    className="size-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <FileText className="size-4 text-primary" />
                  <span>Yêu cầu xuất hóa đơn điện tử VAT cho Công ty / Tổ chức</span>
                </label>

                {needInvoice && (
                  <div className="mt-2 grid gap-3 rounded-xl border border-border bg-secondary/30 p-4 animate-in fade-in">
                    <div>
                      <label className="mb-1 block text-xs font-bold text-foreground">Tên công ty / Đơn vị nhận hóa đơn *</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Công ty TNHH Giải Pháp Công Nghệ..."
                        className="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs font-medium focus:border-primary focus:outline-none"
                      />
                      {errors.companyName && <p className="mt-1 text-[11px] text-danger-ink">{errors.companyName}</p>}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-bold text-foreground">Mã số thuế (MST) *</label>
                        <input
                          type="text"
                          value={companyTaxId}
                          onChange={(e) => setCompanyTaxId(e.target.value)}
                          placeholder="0312345678"
                          className="tabular h-9 w-full rounded-lg border border-border bg-card px-3 text-xs font-medium font-mono focus:border-primary focus:outline-none"
                        />
                        {errors.companyTaxId && <p className="mt-1 text-[11px] text-danger-ink">{errors.companyTaxId}</p>}
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold text-foreground">Địa chỉ trụ sở công ty *</label>
                        <input
                          type="text"
                          value={companyAddress}
                          onChange={(e) => setCompanyAddress(e.target.value)}
                          placeholder="Số 123 Nguyễn Văn Cừ, Quận 5, TP.HCM"
                          className="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs font-medium focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* CỘT PHẢI: XEM LẠI SẢN PHẨM & TỔNG THANH TOÁN */}
            <aside className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm sticky top-20">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h2 className="text-sm font-extrabold text-foreground">Chi tiết đơn hàng ({cartCount} món)</h2>
                  <Link href="/cart" className="text-xs font-bold text-primary hover:underline">
                    Sửa giỏ hàng
                  </Link>
                </div>

                {/* Danh sách món hàng thu nhỏ */}
                <ul className="flex max-h-60 flex-col gap-3 overflow-y-auto divide-y divide-border pr-1">
                  {cart.map(({ product, quantity }) => (
                    <li key={product.sku} className="flex items-center gap-3 pt-2.5 first:pt-0">
                      <Link
                        href={`/product/${product.sku}`}
                        className="size-12 shrink-0 overflow-hidden rounded-lg bg-secondary p-1 hover:opacity-85 transition-opacity"
                        title="Bấm để xem chi tiết sản phẩm"
                      >
                        <img
                          src={product.image || '/placeholder.svg'}
                          alt=""
                          className="size-full object-contain"
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/product/${product.sku}`}
                          className="truncate block text-xs font-bold text-foreground hover:text-primary transition-colors"
                          title="Bấm để xem chi tiết sản phẩm"
                        >
                          {product.name}
                        </Link>
                        <p className="text-[11px] text-muted-foreground">
                          {quantity} × <span className="tabular text-price">{formatVND(product.price)}</span>
                        </p>
                      </div>
                      <span className="tabular text-xs font-extrabold text-foreground">
                        {formatVND(product.price * quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="h-px bg-border" />

                {/* Bảng tính chi phí */}
                <dl className="flex flex-col gap-2.5 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Tạm tính ({cartCount} sản phẩm)</dt>
                    <dd className="tabular font-bold text-foreground">{formatVND(cartSubtotal)}</dd>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-success-ink font-semibold">
                      <dt>Khuyến mãi áp dụng ({promoKey})</dt>
                      <dd className="tabular font-bold">− {formatVND(discount)}</dd>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Phí vận chuyển & Lắp đặt</dt>
                    <dd className="font-bold text-emerald-600">MIỄN PHÍ</dd>
                  </div>

                  <div className="flex justify-between border-t border-border pt-3 text-base">
                    <dt className="font-extrabold text-foreground">Tổng cần thanh toán</dt>
                    <dd className="tabular text-2xl font-extrabold text-price">{formatVND(total)}</dd>
                  </div>
                </dl>

                {errors.form && (
                  <p className="rounded-lg bg-danger-soft p-2.5 text-xs font-bold text-danger-ink">
                    {errors.form}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 items-center justify-center rounded-xl bg-accent text-sm font-extrabold text-foreground shadow-sm transition-all hover:bg-amber-400 active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? 'Đang gửi đơn hàng vào hệ thống...' : 'XÁC NHẬN ĐẶT HÀNG NGAY'}
                </button>

                <div className="flex flex-col gap-1.5 border-t border-border pt-3 text-[11px] text-muted-foreground">
                  <p className="flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-primary" />
                    Bảo mật giao dịch thông tin khách hàng tuyệt đối
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Check className="size-3.5 text-primary" />
                    Được kiểm tra máy và hóa đơn trước khi thanh toán
                  </p>
                </div>
              </div>
            </aside>
          </form>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
