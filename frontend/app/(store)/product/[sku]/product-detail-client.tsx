'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Layers,
  MapPin,
  Maximize2,
  Minus,
  Plus,
  RotateCcw,
  Send,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Truck,
  Wrench,
  Zap,
} from 'lucide-react'
import {
  BRANCHES,
  CATEGORIES,
  formatVND,
  getBranch,
  getBrandOrigin,
  getProductDetails,
  type BranchId,
  type Product,
} from '@/lib/dmx-data'
import { useStore } from '@/components/dmx/store-provider'
import { AppHeader } from '@/components/dmx/app-header'
import { SiteFooter } from '@/components/dmx/site-footer'
import { cn } from '@/lib/utils'

export default function ProductDetailClient({ sku }: { sku: string }) {
  const { products, backendConnected } = useStore()
  const product = products.find((item) => item.sku === sku)
  if (!product) return <p className="p-12 text-center text-sm text-muted-foreground">{backendConnected === null ? 'Đang tải sản phẩm...' : 'Không tìm thấy sản phẩm.'}</p>
  return <ProductDetailBody product={product} />
}

function ProductDetailBody({ product }: { product: Product }) {
  const router = useRouter()
  const { branchId, setBranchId, addToCart } = useStore()

  const details = getProductDetails(product)
  const category = CATEGORIES.find((c) => c.id === product.category)
  const currentBranch = getBranch(branchId)

  // Local state
  const [selectedAngle, setSelectedAngle] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Reviews state (fixed at bottom of page)
  const [reviewsList, setReviewsList] = useState(details.reviews)
  const [reviewName, setReviewName] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState(false)

  const discountPct = Math.round((1 - product.price / product.listPrice) * 100)
  const savedAmount = product.listPrice - product.price
  const qtyInCurrentBranch = product.stock[branchId] || 0
  const maxAvailable = Math.max(1, qtyInCurrentBranch)

  // 4 visual angle perspectives with transforms so clicking thumbnails visibly shifts the image
  const ANGLE_TRANSFORMS = [
    { label: 'Chính diện', style: 'scale-100 rotate-0' },
    { label: 'Góc nghiêng 45°', style: 'scale-95 [transform:perspective(800px)_rotateY(-18deg)]' },
    { label: 'Khoang bên trong', style: 'scale-125 translate-y-[8%]' },
    { label: 'Bảng điều khiển', style: 'scale-135 -translate-y-[12%]' },
  ]

  function handleAddToCart() {
    addToCart(product, quantity)
    setToastMessage(`Đã thêm ${quantity} sản phẩm vào giỏ hàng thành công!`)
    setTimeout(() => {
      setToastMessage(null)
    }, 2800)
  }

  function handleBuyNow() {
    addToCart(product, quantity)
    router.push('/checkout')
  }

  function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault()
    if (!reviewName.trim() || !reviewComment.trim()) return
    const newRev = {
      id: Date.now(),
      author: reviewName.trim(),
      rating: reviewRating,
      date: 'Hôm nay',
      content: reviewComment.trim(),
    }
    setReviewsList([newRev, ...reviewsList])
    setReviewName('')
    setReviewComment('')
    setReviewSuccess(true)
    setTimeout(() => setReviewSuccess(false), 3000)
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-foreground">
      <AppHeader />

      {/* Toast thông báo thêm giỏ hàng thành công */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-300 bg-white p-4 shadow-2xl animate-in slide-in-from-bottom-5">
          <div className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">{toastMessage}</p>
            <Link href="/cart" className="text-[11px] font-bold text-primary hover:underline">
              Xem giỏ hàng & thanh toán →
            </Link>
          </div>
        </div>
      )}

      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 px-4 py-6 md:px-8">
        {/* Breadcrumbs */}
        <nav aria-label="Đường dẫn trang" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="size-3.5" />
          <span>{category?.label || 'Sản phẩm'}</span>
          <ChevronRight className="size-3.5" />
          <span className="font-semibold text-foreground truncate max-w-xs sm:max-w-md">{product.name}</span>
        </nav>

        {/* ============================================================== */}
        {/* PHẦN 1: HERO - BỘ ẢNH & THÔNG TIN ĐẶT MUA                    */}
        {/* ============================================================== */}
        <div className="grid gap-8 rounded-2xl border border-border bg-card p-5 shadow-xs lg:grid-cols-[minmax(0,1fr)_480px] xl:grid-cols-[minmax(0,1fr)_520px] lg:p-8">
          {/* CỘT TRÁI: BỘ ẢNH 4 GÓC CHỤP TƯƠNG TÁC */}
          <div className="flex flex-col gap-4">
            {/* Khung ảnh lớn chính */}
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-secondary/50 to-card p-8 flex items-center justify-center">
              <img
                src={product.image || '/placeholder.svg'}
                alt={product.name}
                className={cn(
                  'size-full object-contain mix-blend-multiply transition-all duration-300',
                  ANGLE_TRANSFORMS[selectedAngle]?.style,
                )}
              />

              {discountPct > 0 && (
                <div className="absolute top-4 left-4">
                  <span className="rounded-xl bg-price px-3 py-1 text-sm font-extrabold text-white shadow-sm">
                    -{discountPct}%
                  </span>
                </div>
              )}

              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className="rounded-full border border-border bg-card/90 px-3 py-1 text-xs font-extrabold text-foreground shadow-xs backdrop-blur">
                  {product.brand} · {getBrandOrigin(product.brand)}
                </span>
              </div>
            </div>

            {/* Băng chuyền 4 góc chụp hình ảnh */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Xem 4 góc chụp thực tế:
              </span>
              <div className="grid grid-cols-4 gap-3">
                {ANGLE_TRANSFORMS.map((ang, idx) => {
                  const isSelected = selectedAngle === idx
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedAngle(idx)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 rounded-xl border p-2 transition-all',
                        isSelected
                          ? 'border-primary bg-primary/8 ring-2 ring-primary/25 shadow-xs'
                          : 'border-border bg-card hover:border-primary/50 hover:bg-secondary/40',
                      )}
                    >
                      <div className="size-14 overflow-hidden rounded-md flex items-center justify-center">
                        <img
                          src={product.image || '/placeholder.svg'}
                          alt={ang.label}
                          className={cn('size-full object-contain transition-all', ang.style)}
                        />
                      </div>
                      <span className={cn('text-[11px] font-bold text-center leading-tight', isSelected ? 'text-primary' : 'text-body')}>
                        {ang.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 3 Cam kết mua sắm */}
            <div className="mt-2 grid grid-cols-3 gap-3 border-t border-border pt-4">
              <div className="flex items-center gap-2 text-xs">
                <ShieldCheck className="size-5 text-primary shrink-0" />
                <span className="text-[11px] font-semibold text-muted-foreground">Bảo hành chính hãng 2 năm</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Truck className="size-5 text-primary shrink-0" />
                <span className="text-[11px] font-semibold text-muted-foreground">Miễn phí giao hàng & lắp đặt</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <RotateCcw className="size-5 text-primary shrink-0" />
                <span className="text-[11px] font-semibold text-muted-foreground">1 đổi 1 trong 30 ngày lỗi</span>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: THÔNG TIN SẢN PHẨM & MUA HÀNG */}
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-muted-foreground">
                <span>Mã SKU: {product.sku}</span>
                <span>•</span>
                <span>Hãng: {product.brand}</span>
              </div>
              <h1 className="mt-1 text-xl font-extrabold text-foreground sm:text-2xl leading-snug">
                {product.name}
              </h1>

              {/* Đánh giá sao */}
              <div className="mt-2 flex items-center gap-2 text-xs">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-3.5 fill-current" />
                  ))}
                </div>
                <span className="font-extrabold text-foreground">4.8</span>
                <span className="text-muted-foreground">({reviewsList.length} đánh giá khách hàng)</span>
              </div>
            </div>

            {/* Khối Giá & Tiết kiệm */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex flex-col gap-1.5">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-price tracking-tight">
                  {formatVND(product.price)}
                </span>
                {product.listPrice > product.price && (
                  <span className="text-sm font-semibold text-muted-foreground line-through">
                    {formatVND(product.listPrice)}
                  </span>
                )}
              </div>
              {savedAmount > 0 && (
                <p className="text-xs font-bold text-success-ink">
                  🎉 Tiết kiệm ngay {formatVND(savedAmount)} khi mua online tại Điện Máy Xanh
                </p>
              )}
              <div className="mt-1 flex flex-wrap gap-2">
                <span className="rounded-md bg-accent/20 px-2 py-0.5 text-xs font-extrabold text-amber-800">
                  Trả góp 0% qua thẻ
                </span>
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-extrabold text-emerald-800">
                  Tặng thêm phiếu mua hàng 100.000 ₫
                </span>
              </div>
            </div>

            {/* KHỐI TỒN KHO CHI NHÁNH - THIẾT KẾ CO GIÃN HỖ TRỢ ĐA CHI NHÁNH */}
            <div className="rounded-2xl border border-border bg-secondary/30 p-4 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Store className="size-4 text-primary" />
                  Siêu thị nhận hàng:
                </span>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-[11px] font-bold',
                    qtyInCurrentBranch > 0 ? 'bg-success-soft text-success-ink' : 'bg-danger-soft text-danger-ink',
                  )}
                >
                  {qtyInCurrentBranch > 0 ? `🟢 Còn ${qtyInCurrentBranch} máy có sẵn` : '🔴 Tạm hết hàng'}
                </span>
              </div>

              {/* Menu chọn chi nhánh (Hỗ trợ tốt dù có 2 hay 20 chi nhánh) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setBranchDropdownOpen((o) => !o)}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-bold text-foreground transition-all hover:border-primary shadow-2xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="size-4 text-primary shrink-0" />
                    <span className="truncate">{currentBranch.name} ({currentBranch.district}) — {currentBranch.address}</span>
                  </div>
                  <ChevronDown className={cn('size-4 text-muted-foreground transition-transform shrink-0', branchDropdownOpen && 'rotate-180')} />
                </button>

                {branchDropdownOpen && (
                  <ul className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-56 overflow-y-auto rounded-xl border border-border bg-card p-1.5 shadow-xl animate-in fade-in zoom-in-95">
                    {BRANCHES.map((b) => {
                      const stock = product.stock[b.id] || 0
                      const isSelected = branchId === b.id
                      return (
                        <li key={b.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setBranchId(b.id)
                              setBranchDropdownOpen(false)
                            }}
                            className={cn(
                              'flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors',
                              isSelected ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-secondary text-foreground',
                            )}
                          >
                            <div className="flex flex-col text-left">
                              <span className="font-bold">{b.name} ({b.district})</span>
                              <span className="text-[10px] text-muted-foreground">{b.address}</span>
                            </div>
                            <span className={cn('tabular ml-2 shrink-0 font-bold text-[11px]', stock > 0 ? 'text-success-ink' : 'text-danger-ink')}>
                              {stock > 0 ? `Còn ${stock} máy` : 'Hết hàng'}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </div>

            {/* Bộ chọn số lượng (Không giới hạn 5 sản phẩm) */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-foreground">Số lượng mua:</span>
              <div className="flex h-10 items-center rounded-xl border border-border bg-card">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="flex size-10 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                >
                  <Minus className="size-4" />
                </button>
                <input
                  type="number"
                  min={1}
                  max={maxAvailable}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(maxAvailable, Number(e.target.value) || 1)))}
                  className="tabular w-12 text-center text-sm font-extrabold text-foreground bg-transparent [appearance:textfield] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(maxAvailable, q + 1))}
                  disabled={quantity >= maxAvailable}
                  className="flex size-10 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>

            {/* 2 Nút MUA NGAY và THÊM VÀO GIỎ HÀNG */}
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex flex-1 h-12 items-center justify-center gap-2 rounded-xl border-2 border-primary bg-card text-sm font-extrabold text-primary transition-all hover:bg-primary/5 active:scale-[0.99]"
              >
                <ShoppingBag className="size-4" />
                <span>Thêm vào giỏ hàng</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="flex flex-1 h-12 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-extrabold text-foreground shadow-sm transition-all hover:bg-amber-400 active:scale-[0.99]"
              >
                <Zap className="size-4" />
                <span>MUA NGAY</span>
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* PHẦN 2: BỐ CỤC 2 CỘT CÂN ĐỐI - THÔNG SỐ ĐẬP NGAY VÀO MẮT       */}
        {/* ============================================================== */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_440px] xl:grid-cols-[minmax(0,1fr)_480px]">
          {/* CỘT TRÁI (60%): BÀI VIẾT THÔNG TIN SẢN PHẨM & ĐẶC ĐIỂM NỔI BẬT */}
          <section className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-xs">
            {/* Đặc điểm nổi bật */}
            <div>
              <h2 className="flex items-center gap-2 text-base font-extrabold text-foreground">
                <Sparkles className="size-4 text-primary" />
                Đặc điểm nổi bật của {product.name}
              </h2>
              <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
                {details.highlights.map((h, i) => (
                  <div key={i} className="flex gap-3 rounded-xl border border-border bg-secondary/30 p-3.5">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                      <CheckCircle2 className="size-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-foreground">{h.title}</h3>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{h.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Bài viết thông tin sản phẩm */}
            <div>
              <h2 className="text-base font-extrabold text-foreground">
                Thông tin chi tiết sản phẩm
              </h2>
              <div className="mt-3 flex flex-col gap-3 text-xs leading-relaxed text-body">
                <p>{details.overview}</p>
                <p>
                  Được thiết kế nhằm tối ưu hóa tiện nghi cho gia đình hiện đại, sản phẩm sở hữu linh kiện bền bỉ,
                  tiết kiệm điện năng vượt trội và đạt các chứng chỉ an toàn nghiêm ngặt từ {product.brand}.
                </p>
                <div className="mt-2 rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs font-semibold text-primary flex items-start gap-2.5">
                  <Wrench className="size-4 shrink-0 mt-0.5 text-primary" />
                  <span>
                    Chính sách hậu mãi: Hỗ trợ lắp đặt trọn gói tại nhà, hướng dẫn vận hành chi tiết và bảo hành chu đáo bởi Điện Máy Xanh.
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* CỘT PHẢI (40%): BẢNG THÔNG SỐ KỸ THUẬT (ĐẬP VÀO MẮT NGAY KHI LƯỚT XUỐNG) */}
          <aside className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-xs h-fit sticky top-20">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-foreground">
              <Layers className="size-4 text-primary" />
              Thông số kỹ thuật chi tiết
            </h2>

            <div className="flex flex-col gap-4">
              {details.techSpecs.map((group, gi) => (
                <div key={gi} className="overflow-hidden rounded-xl border border-border">
                  <div className="bg-secondary/60 px-3.5 py-2 font-bold text-xs text-foreground uppercase tracking-wider">
                    {group.group}
                  </div>
                  <dl className="divide-y divide-border text-xs">
                    {group.items.map((item, ii) => (
                      <div key={ii} className="flex items-center justify-between px-3.5 py-2.5">
                        <dt className="text-muted-foreground font-medium">{item.name}</dt>
                        <dd className="font-semibold text-foreground text-right">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </aside>
        </div>

        {/* ============================================================== */}
        {/* PHẦN 3: ĐÁNH GIÁ & NHẬN XÉT CỐ ĐỊNH FULL-WIDTH CUỐI TRANG       */}
        {/* ============================================================== */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2 className="text-base font-extrabold text-foreground">
                Đánh giá & Nhận xét từ khách hàng ({reviewsList.length})
              </h2>
              <p className="text-xs text-muted-foreground">Khách hàng đã mua và trải nghiệm thực tế tại Điện Máy Xanh</p>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-2">
              <span className="text-2xl font-extrabold text-amber-500">4.8</span>
              <div className="flex flex-col">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-3 fill-current" />
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground">Điểm hài lòng 98%</span>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
            {/* Cột trái: Danh sách các nhận xét thực tế */}
            <div className="flex flex-col gap-3">
              {reviewsList.map((rev) => (
                <div key={rev.id} className="rounded-xl border border-border bg-secondary/20 p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{rev.author}</span>
                    <span className="text-[11px] text-muted-foreground">{rev.date}</span>
                  </div>
                  <div className="flex items-center text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="size-3 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-body leading-relaxed">{rev.content}</p>
                </div>
              ))}
            </div>

            {/* Cột phải: Form gửi đánh giá nhanh */}
            <form onSubmit={handleSubmitReview} className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 shadow-2xs h-fit">
              <h3 className="text-xs font-bold text-foreground">Gửi đánh giá của bạn</h3>
              {reviewSuccess && (
                <p className="text-xs font-bold text-success-ink bg-success-soft p-2.5 rounded-lg">
                  Cảm ơn bạn! Đánh giá đã được ghi nhận.
                </p>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Số sao:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={cn(
                          'size-4',
                          star <= reviewRating ? 'fill-amber-500 text-amber-500' : 'text-slate-300',
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                required
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                placeholder="Họ và tên của bạn"
                className="h-9 rounded-lg border border-border bg-card px-3 text-xs font-medium focus:border-primary focus:outline-none"
              />

              <textarea
                required
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm vận hành, độ êm, bảo hành..."
                className="rounded-lg border border-border bg-card p-3 text-xs font-medium focus:border-primary focus:outline-none resize-none"
              />

              <button
                type="submit"
                className="flex items-center justify-center gap-1.5 rounded-xl bg-primary h-9 text-xs font-bold text-white hover:bg-primary-deep transition-colors"
              >
                <Send className="size-3.5" />
                <span>Gửi đánh giá</span>
              </button>
            </form>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
