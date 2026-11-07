'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ChevronRight, MapPin, Minus, Plus, ShieldCheck, ShoppingBag, Star, Truck } from 'lucide-react'
import { BRANCHES, BRANDS, CATEGORIES, formatVND, type BranchId, type Product } from '@/lib/dmx-data'
import { api, ApiError, type BackendReview } from '@/lib/api'
import { useStore } from '@/components/dmx/store-provider'
import { AppHeader } from '@/components/dmx/app-header'
import { SiteFooter } from '@/components/dmx/site-footer'
import { cn } from '@/lib/utils'

const fieldClass =
  'mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 read-only:bg-secondary/60 read-only:text-muted-foreground'

const RATING_LABELS: Record<number, string> = {
  1: 'Cần cải thiện',
  2: 'Tạm ổn',
  3: 'Bình thường',
  4: 'Hài lòng',
  5: 'Rất hài lòng',
}

export default function ProductDetailClient({ sku }: { sku: string }) {
  const { products, backendConnected } = useStore()
  const product = products.find((item) => item.sku === sku)
  if (!product) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <AppHeader />
        <main className="flex-1 p-12 text-center text-sm text-muted-foreground">
          {backendConnected === null
            ? 'Đang tải sản phẩm...'
            : backendConnected
              ? 'Không tìm thấy sản phẩm.'
              : 'Không thể kết nối máy chủ.'}
        </main>
        <SiteFooter />
      </div>
    )
  }
  return <ProductDetailBody product={product} />
}

function ProductDetailBody({ product }: { product: Product }) {
  const router = useRouter()
  const { branchId, setBranchId, addToCart, cart, customer } = useStore()
  const [quantity, setQuantity] = useState(1)
  const [notice, setNotice] = useState('')
  const [reviews, setReviews] = useState<BackendReview[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewError, setReviewError] = useState('')
  const [rating, setRating] = useState(5)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviewMessage, setReviewMessage] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState(false)

  const inCart = cart.find((item) => item.product.sku === product.sku)?.quantity ?? 0
  const branchStock = product.stock[branchId] ?? 0
  const available = Math.max(0, branchStock - inCart)
  const selectedQuantity = Math.min(quantity, Math.max(available, 1))
  const category = CATEGORIES.find((item) => item.id === product.category)
  const brandOrigin = BRANDS.find((item) => item.id === product.brand)?.origin
  const discountPct =
    product.listPrice > product.price ? Math.round((1 - product.price / product.listPrice) * 100) : 0
  const savedAmount = Math.max(0, product.listPrice - product.price)
  const avgRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

  useEffect(() => {
    if (!customer) return
    setFullName(customer.fullName)
    setPhone(customer.phone)
  }, [customer])

  useEffect(() => {
    if ((product.stock[branchId] ?? 0) > 0) return
    const inStockBranch = BRANCHES.find((b) => (product.stock[b.id] ?? 0) > 0)
    if (inStockBranch) {
      setBranchId(inStockBranch.id)
      setQuantity(1)
      setNotice('')
    }
  }, [product, branchId, setBranchId])

  useEffect(() => {
    if (!product.id) {
      setReviewsLoading(false)
      return
    }
    let active = true
    setReviewsLoading(true)
    setReviewError('')
    api.reviews
      .byProduct(product.id)
      .then((data) => {
        if (active) setReviews(data)
      })
      .catch(() => {
        if (active) setReviewError('Không thể tải đánh giá. Vui lòng tải lại trang.')
      })
      .finally(() => {
        if (active) setReviewsLoading(false)
      })
    return () => {
      active = false
    }
  }, [product.id])

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!product.id || submitting) return
    const normalizedPhone = phone.replace(/\s/g, '')
    if (!fullName.trim() || !/^0\d{9}$/.test(normalizedPhone) || !comment.trim()) {
      setReviewSuccess(false)
      setReviewMessage('Vui lòng nhập họ tên, nội dung và số điện thoại gồm 10 chữ số bắt đầu bằng 0.')
      return
    }
    setSubmitting(true)
    setReviewMessage('')
    setReviewSuccess(false)
    try {
      await api.reviews.create({
        product: { id: product.id },
        customer: customer?.id ? { id: customer.id } : { fullName: fullName.trim(), phone: normalizedPhone },
        rating,
        comment: comment.trim(),
      })
      setComment('')
      try {
        setReviews(await api.reviews.byProduct(product.id))
        setReviewError('')
        setReviewSuccess(true)
        setReviewMessage('Đã gửi đánh giá thành công.')
      } catch {
        setReviewSuccess(true)
        setReviewMessage('Đã gửi đánh giá, nhưng không thể tải lại danh sách.')
      }
    } catch (error) {
      setReviewSuccess(false)
      setReviewMessage(error instanceof ApiError ? error.message : 'Không thể gửi đánh giá. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  function add(buyNow: boolean) {
    if (available < 1) return
    addToCart(product, selectedQuantity)
    if (buyNow) router.push('/checkout')
    else setNotice(`Đã thêm ${selectedQuantity} sản phẩm vào giỏ hàng.`)
  }

  function selectBranch(nextBranch: BranchId) {
    setBranchId(nextBranch)
    setQuantity(1)
    setNotice('')
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-foreground">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-8">
        <nav aria-label="Đường dẫn trang" className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="font-semibold text-primary hover:underline">
            Trang chủ
          </Link>
          {category && (
            <>
              <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" aria-hidden="true" />
              <span>{category.label}</span>
            </>
          )}
          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" aria-hidden="true" />
          <span className="truncate font-medium text-foreground">{product.name}</span>
        </nav>

        <section className="mt-4 grid gap-8 rounded-2xl border border-border bg-card p-5 shadow-2xs lg:grid-cols-[minmax(0,1fr)_460px] lg:p-8">
          <div className="flex flex-col justify-between gap-5">
            <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-b from-secondary/60 via-secondary/25 to-card px-6 pt-12 pb-6 sm:p-10">
              <img
                src={product.image || '/placeholder.svg'}
                alt={product.name}
                className="max-h-80 w-full object-contain mix-blend-multiply transition-transform duration-300 hover:scale-[1.03]"
              />
              {discountPct > 0 && (
                <span className="tabular absolute top-3.5 left-3.5 rounded-lg bg-price px-2.5 py-1 text-xs font-extrabold text-white shadow-xs sm:top-4 sm:left-4">
                  −{discountPct}%
                </span>
              )}
              <span className="absolute top-3.5 right-3.5 rounded-full border border-border bg-card/95 px-3 py-1 text-xs font-bold text-foreground shadow-2xs backdrop-blur sm:top-4 sm:right-4">
                {product.brand}
                {brandOrigin ? ` · ${brandOrigin}` : ''}
              </span>
            </div>

            <ul className="grid grid-cols-1 gap-2.5 border-t border-border pt-4 sm:grid-cols-3" aria-label="Cam kết dịch vụ">
              <li className="flex items-center gap-2 text-xs font-semibold text-body">
                <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>Bảo hành chính hãng 2 năm</span>
              </li>
              <li className="flex items-center gap-2 text-xs font-semibold text-body">
                <Truck className="size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>Giao & lắp đặt tận nơi</span>
              </li>
              <li className="flex items-center gap-2 text-xs font-semibold text-body">
                <CheckCircle2 className="size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>Đổi trả lỗi trong 30 ngày</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <h1 className="text-xl leading-snug font-extrabold tracking-tight text-balance text-foreground sm:text-2xl">
                {product.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="tabular rounded bg-secondary px-2 py-0.5 font-mono font-semibold text-foreground">
                  {product.sku}
                </span>
                {category && <span className="font-medium text-body">· {category.label}</span>}
                {reviews.length > 0 && (
                  <a href="#reviews" className="inline-flex items-center gap-1 font-semibold text-amber-700 hover:underline">
                    · <Star className="size-3.5 fill-amber-500 text-amber-500" aria-hidden="true" />
                    <span className="tabular font-bold">{avgRating.toFixed(1)}</span>
                    <span className="tabular text-muted-foreground">({reviews.length} đánh giá)</span>
                  </a>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-primary/15 bg-gradient-to-r from-primary/[0.06] via-secondary/50 to-card p-4">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="tabular text-2xl font-extrabold tracking-tight text-price sm:text-3xl">
                  {formatVND(product.price)}
                </span>
                {product.listPrice > product.price && (
                  <span className="tabular text-sm font-medium text-muted-foreground line-through">
                    {formatVND(product.listPrice)}
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {savedAmount > 0 && (
                  <span className="tabular rounded-md bg-success-soft px-2 py-0.5 text-xs font-bold text-success-ink">
                    Tiết kiệm {formatVND(savedAmount)}
                  </span>
                )}
                <span className="rounded-md bg-accent/20 px-2 py-0.5 text-xs font-bold text-amber-800">Trả góp 0%</span>
              </div>
            </div>

            {product.specs.length > 0 && (
              <div>
                <p className="text-xs font-bold text-body">Thông số nổi bật</p>
                <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Thông số nổi bật">
                  {product.specs.map((spec) => (
                    <li
                      key={spec}
                      className="rounded-lg border border-primary/15 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary-deep"
                    >
                      {spec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <fieldset>
              <legend className="text-xs font-bold text-body">Siêu thị xuất kho</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {BRANCHES.map((b) => {
                  const stock = product.stock[b.id] ?? 0
                  const active = branchId === b.id
                  return (
                    <button
                      key={b.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => selectBranch(b.id)}
                      className={cn(
                        'flex flex-col items-start gap-1 rounded-xl border p-3 text-left text-xs transition-all',
                        active
                          ? 'border-primary bg-primary/[0.05] ring-2 ring-primary/15'
                          : 'border-border bg-card hover:border-primary/40 hover:bg-secondary/35',
                      )}
                    >
                      <span className="flex w-full items-center justify-between gap-2 font-bold text-foreground">
                        <span className="flex items-center gap-1.5 truncate">
                          <MapPin
                            className={cn('size-3.5 shrink-0', active ? 'text-primary' : 'text-muted-foreground')}
                            aria-hidden="true"
                          />
                          {b.name}
                        </span>
                        <span
                          className={cn(
                            'tabular shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold',
                            stock > 0 ? 'bg-success-soft text-success-ink' : 'bg-danger-soft text-danger-ink',
                          )}
                        >
                          {stock > 0 ? `Còn ${stock}` : 'Hết hàng'}
                        </span>
                      </span>
                      <span className="line-clamp-1 pl-5 text-[11px] text-muted-foreground">{b.address}</span>
                    </button>
                  )
                })}
              </div>
              {inCart > 0 && (
                <p className="tabular mt-1.5 text-xs text-muted-foreground">Đã có {inCart} sản phẩm trong giỏ hàng</p>
              )}
            </fieldset>

            <div className="mt-auto space-y-4 border-t border-border pt-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label htmlFor="product-qty" className="text-xs font-bold text-body">
                  Số lượng mua
                </label>
                <div className="flex h-10 items-center rounded-xl border border-border bg-card">
                  <button
                    type="button"
                    disabled={!available || selectedQuantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Giảm số lượng"
                    className="flex size-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                  >
                    <Minus className="size-4" aria-hidden="true" />
                  </button>
                  <input
                    id="product-qty"
                    type="number"
                    min="1"
                    max={Math.max(available, 1)}
                    step="1"
                    value={selectedQuantity}
                    disabled={!available}
                    onChange={(event) =>
                      setQuantity(
                        Math.max(1, Math.min(available, Math.floor(Number(event.target.value)) || 1)),
                      )
                    }
                    className="tabular w-12 bg-transparent text-center text-sm font-extrabold text-foreground [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    disabled={!available || selectedQuantity >= available}
                    onClick={() => setQuantity((q) => Math.min(available, q + 1))}
                    aria-label="Tăng số lượng"
                    className="flex size-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={!available}
                  onClick={() => add(false)}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-primary bg-card text-sm font-extrabold text-primary transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShoppingBag className="size-4" aria-hidden="true" />
                  Thêm vào giỏ
                </button>
                <button
                  type="button"
                  disabled={!available}
                  onClick={() => add(true)}
                  className="flex h-12 items-center justify-center rounded-xl bg-primary text-sm font-extrabold text-primary-foreground shadow-2xs transition-colors hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Mua ngay
                </button>
              </div>

              {!available && (
                <p className="rounded-lg bg-danger-soft px-3 py-2 text-xs font-semibold text-danger-ink">
                  Chi nhánh này tạm hết hàng hoặc bạn đã thêm tối đa vào giỏ.
                </p>
              )}
              {notice && (
                <p
                  role="status"
                  className="flex items-center justify-between gap-3 rounded-xl border border-success/25 bg-success-soft px-4 py-2.5 text-xs font-semibold text-success-ink"
                >
                  <span>{notice}</span>
                  <Link className="shrink-0 font-extrabold underline hover:no-underline" href="/cart">
                    Xem giỏ hàng →
                  </Link>
                </p>
              )}
            </div>
          </div>
        </section>

        <section id="reviews" className="mt-6 scroll-mt-20 rounded-2xl border border-border bg-card p-5 shadow-2xs lg:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-4">
            <h2 className="text-lg font-extrabold text-foreground">
              Đánh giá từ khách hàng <span className="tabular text-sm font-semibold text-muted-foreground">({reviews.length})</span>
            </h2>
            {reviews.length > 0 && (
              <p className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1 text-sm font-extrabold text-amber-700">
                <Star className="size-4 fill-amber-500 text-amber-500" aria-hidden="true" />
                <span className="tabular">{avgRating.toFixed(1)} / 5</span>
              </p>
            )}
          </div>

          <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div aria-live="polite">
              {reviewsLoading ? (
                <p className="text-sm text-muted-foreground">Đang tải đánh giá...</p>
              ) : reviewError ? (
                <p className="rounded-lg bg-danger-soft p-3 text-sm font-medium text-danger-ink">{reviewError}</p>
              ) : reviews.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-secondary/25 p-8 text-center">
                  <p className="text-sm font-bold text-foreground">Chưa có đánh giá cho sản phẩm này</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Hãy là người đầu tiên chia sẻ trải nghiệm sử dụng sản phẩm ở khung bên cạnh.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {reviews.map((review) => (
                    <li key={review.id} className="py-4 first:pt-0">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            aria-hidden="true"
                            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-extrabold text-primary"
                          >
                            {review.customer.fullName.trim().charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <span className="block text-sm font-bold text-foreground">{review.customer.fullName}</span>
                            <div className="mt-0.5 flex" aria-label={`${review.rating} trên 5 sao`}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  aria-hidden="true"
                                  key={star}
                                  className={cn(
                                    'size-3.5',
                                    star <= review.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-300',
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <time className="tabular text-xs font-medium text-muted-foreground" dateTime={review.reviewDate}>
                          {new Date(review.reviewDate).toLocaleDateString('vi-VN')}
                        </time>
                      </div>
                      {review.comment && <p className="mt-2.5 text-sm leading-relaxed text-body">{review.comment}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <form onSubmit={submitReview} className="space-y-3 rounded-xl border border-border bg-secondary/25 p-5">
              <h3 className="text-base font-extrabold text-foreground">Gửi đánh giá của bạn</h3>
              <fieldset>
                <legend className="text-xs font-semibold text-body">
                  Mức độ hài lòng: <span className="font-bold text-amber-700">{RATING_LABELS[rating]}</span>
                </legend>
                <div className="mt-1.5 flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <label
                      key={star}
                      className="cursor-pointer rounded p-1 transition-transform hover:scale-110 focus-within:ring-2 focus-within:ring-primary"
                    >
                      <input
                        className="sr-only"
                        type="radio"
                        name="rating"
                        value={star}
                        checked={rating === star}
                        onChange={() => setRating(star)}
                      />
                      <span className="sr-only">{star} sao</span>
                      <Star
                        aria-hidden="true"
                        className={cn('size-5', star <= rating ? 'fill-amber-500 text-amber-500' : 'text-slate-300')}
                      />
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="block text-xs font-semibold text-body">
                Họ và tên
                <input
                  className={fieldClass}
                  required
                  autoComplete="name"
                  placeholder="Nguyễn Văn An"
                  value={fullName}
                  readOnly={!!customer?.id}
                  onChange={(event) => setFullName(event.target.value)}
                />
              </label>
              <label className="block text-xs font-semibold text-body">
                Số điện thoại
                <input
                  className={cn(fieldClass, 'tabular')}
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="0901234567"
                  value={phone}
                  readOnly={!!customer?.id}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </label>
              <label className="block text-xs font-semibold text-body">
                Nhận xét thực tế
                <textarea
                  className={fieldClass}
                  required
                  rows={3}
                  placeholder="Chia sẻ trải nghiệm sử dụng sản phẩm..."
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                />
              </label>
              {reviewMessage && (
                <p role="status" className={cn('text-xs font-semibold', reviewSuccess ? 'text-success-ink' : 'text-danger-ink')}>
                  {reviewMessage}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting || reviewsLoading || !product.id}
                className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-deep disabled:opacity-50"
              >
                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </form>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
