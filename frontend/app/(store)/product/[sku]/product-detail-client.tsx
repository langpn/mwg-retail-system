'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Star } from 'lucide-react'
import { BRANCHES, CATEGORIES, formatVND, getBranch, type BranchId, type Product } from '@/lib/dmx-data'
import { api, ApiError, type BackendReview } from '@/lib/api'
import { useStore } from '@/components/dmx/store-provider'
import { AppHeader } from '@/components/dmx/app-header'
import { SiteFooter } from '@/components/dmx/site-footer'

const fieldClass = 'mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

export default function ProductDetailClient({ sku }: { sku: string }) {
  const { products, backendConnected } = useStore()
  const product = products.find((item) => item.sku === sku)
  if (!product) return (
    <div className="flex min-h-screen flex-col bg-slate-50"><AppHeader /><main className="flex-1 p-12 text-center text-sm">
      {backendConnected === null ? 'Đang tải sản phẩm...' : backendConnected ? 'Không tìm thấy sản phẩm.' : 'Không thể kết nối máy chủ.'}
    </main><SiteFooter /></div>
  )
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
  const inCart = cart.find((item) => item.product.sku === product.sku)?.quantity ?? 0
  const available = Math.max(0, (product.stock[branchId] ?? 0) - inCart)
  const selectedQuantity = Math.min(quantity, Math.max(available, 1))
  const category = CATEGORIES.find((item) => item.id === product.category)

  useEffect(() => {
    if (!customer) return
    setFullName(customer.fullName)
    setPhone(customer.phone)
  }, [customer])

  /* Never leave the shopper on a branch where this product is out of stock. */
  useEffect(() => {
    if ((product.stock[branchId] ?? 0) > 0) return
    const stocked = BRANCHES.find((b) => (product.stock[b.id] ?? 0) > 0)
    if (stocked) {
      setBranchId(stocked.id)
      setQuantity(1)
      setNotice('')
    }
  }, [product, branchId, setBranchId])

  useEffect(() => {
    if (!product.id) { setReviewsLoading(false); return }
    let active = true
    setReviewsLoading(true)
    setReviewError('')
    api.reviews.byProduct(product.id)
      .then((data) => { if (active) setReviews(data) })
      .catch(() => { if (active) setReviewError('Không thể tải đánh giá. Vui lòng tải lại trang.') })
      .finally(() => { if (active) setReviewsLoading(false) })
    return () => { active = false }
  }, [product.id])

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!product.id || submitting) return
    const normalizedPhone = phone.replace(/\s/g, '')
    if (!fullName.trim() || !/^0\d{9}$/.test(normalizedPhone) || !comment.trim()) {
      setReviewMessage('Vui lòng nhập họ tên, nội dung và số điện thoại gồm 10 chữ số bắt đầu bằng 0.')
      return
    }
    setSubmitting(true)
    setReviewMessage('')
    try {
      await api.reviews.create({
        product: { id: product.id },
        customer: customer?.id ? { id: customer.id } : { fullName: fullName.trim(), phone: normalizedPhone },
        rating, comment: comment.trim(),
      })
      setComment('')
      try {
        setReviews(await api.reviews.byProduct(product.id))
        setReviewError('')
        setReviewMessage('Đã gửi đánh giá.')
      } catch {
        setReviewMessage('Đã gửi đánh giá, nhưng không thể tải lại danh sách. Vui lòng tải lại trang.')
      }
    } catch (error) {
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

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-foreground">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-8">
        <Link href="/" className="text-sm font-medium text-primary hover:underline">Cửa hàng</Link>
        <section className="mt-4 grid gap-8 rounded-xl border border-border bg-card p-5 lg:grid-cols-2 lg:p-8">
          <div className="relative flex min-h-72 items-center justify-center rounded-lg bg-secondary/40 p-8">
            <img src={product.image || '/placeholder.svg'} alt={product.name} className="max-h-96 w-full object-contain" />
            <span className="absolute right-4 top-4 rounded-full bg-card px-3 py-1 text-xs font-semibold">{product.brand}</span>
            {product.listPrice > product.price && <span className="tabular absolute left-4 top-4 rounded bg-price px-2 py-1 text-xs font-bold text-white">−{Math.round((1 - product.price / product.listPrice) * 100)}%</span>}
          </div>
          <div className="space-y-5">
            <div><h1 className="text-2xl font-bold leading-snug">{product.name}</h1><p className="mt-2 text-sm text-muted-foreground"><span className="tabular font-mono">{product.sku}</span> · {category?.label}</p></div>
            <p className="tabular flex flex-wrap items-baseline gap-3"><span className="text-2xl font-bold text-price">{formatVND(product.price)}</span>{product.listPrice > product.price && <span className="text-sm text-muted-foreground line-through">{formatVND(product.listPrice)}</span>}</p>
            {product.specs.length > 0 && <ul className="list-disc space-y-1 pl-5 text-sm">{product.specs.map((spec) => <li key={spec}>{spec}</li>)}</ul>}
            <label className="block text-sm font-semibold">Chi nhánh xuất kho
              <select className={fieldClass} value={branchId} onChange={(event) => { setBranchId(event.target.value as BranchId); setQuantity(1); setNotice('') }}>
                {BRANCHES.map((branch) => <option key={branch.id} value={branch.id}>{branch.name} — còn {product.stock[branch.id]} sản phẩm</option>)}
              </select>
            </label>
            <p className="tabular text-sm text-muted-foreground">Còn {product.stock[branchId] ?? 0} sản phẩm tại {getBranch(branchId).name}{inCart > 0 && ` · ${inCart} trong giỏ hàng`}</p>
            <label className="block text-sm font-semibold">Số lượng
              <input className={`${fieldClass} tabular max-w-28`} type="number" min="1" max={Math.max(available, 1)} step="1" value={selectedQuantity} disabled={!available} onChange={(event) => setQuantity(Math.max(1, Math.min(available, Math.floor(Number(event.target.value)) || 1)))} />
            </label>
            <div className="flex flex-wrap gap-3">
              <button type="button" disabled={!available} onClick={() => add(false)} className="rounded-lg border border-primary px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 disabled:opacity-50">Thêm vào giỏ</button>
              <button type="button" disabled={!available} onClick={() => add(true)} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-deep disabled:opacity-50">Mua ngay</button>
            </div>
            {!available && <p className="text-sm text-muted-foreground">Không còn sản phẩm để thêm tại chi nhánh này.</p>}
            {notice && <p role="status" className="text-sm text-success-ink">{notice} <Link className="font-semibold underline" href="/cart">Xem giỏ hàng</Link></p>}
          </div>
        </section>
        <section className="mt-6 rounded-xl border border-border bg-card p-5 lg:p-8">
          <h2 className="text-lg font-bold">Đánh giá sản phẩm <span className="tabular text-sm text-muted-foreground">({reviews.length})</span></h2>
          <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div aria-live="polite">
              {reviewsLoading ? <p className="text-sm text-muted-foreground">Đang tải đánh giá...</p> : reviewError ? <p className="text-sm text-danger-ink">{reviewError}</p> : reviews.length === 0 ? <p className="text-sm text-muted-foreground">Chưa có đánh giá cho sản phẩm này.</p> : (
                <ul className="divide-y divide-border">{reviews.map((review) => <li key={review.id} className="py-4 first:pt-0">
                  <div className="flex justify-between gap-4 text-sm"><strong>{review.customer.fullName}</strong><time className="tabular text-muted-foreground" dateTime={review.reviewDate}>{new Date(review.reviewDate).toLocaleDateString('vi-VN')}</time></div>
                  <div className="mt-1 flex text-amber-600" aria-label={`${review.rating} trên 5 sao`}>{[1, 2, 3, 4, 5].map((star) => <Star aria-hidden="true" key={star} className={`size-4 ${star <= review.rating ? 'fill-current' : ''}`} />)}</div>
                  {review.comment && <p className="mt-2 text-sm">{review.comment}</p>}
                </li>)}</ul>
              )}
            </div>
            <form onSubmit={submitReview} className="space-y-3 border-t border-border pt-5 lg:border-t-0 lg:pt-0">
              <h3 className="font-bold">Gửi đánh giá sản phẩm</h3>
              <fieldset><legend className="text-sm font-medium">Số sao</legend><div className="mt-1 flex gap-1">{[1, 2, 3, 4, 5].map((star) => <label key={star} className="cursor-pointer rounded p-1 focus-within:ring-2 focus-within:ring-primary"><input className="sr-only" type="radio" name="rating" value={star} checked={rating === star} onChange={() => setRating(star)} /><span className="sr-only">{star} sao</span><Star aria-hidden="true" className={`size-5 text-amber-600 ${star <= rating ? 'fill-current' : ''}`} /></label>)}</div></fieldset>
              <label className="block text-sm font-medium">Họ và tên<input className={fieldClass} required autoComplete="name" value={fullName} readOnly={!!customer?.id} onChange={(event) => setFullName(event.target.value)} /></label>
              <label className="block text-sm font-medium">Số điện thoại<input className={`${fieldClass} tabular`} type="tel" required autoComplete="tel" value={phone} readOnly={!!customer?.id} onChange={(event) => setPhone(event.target.value)} /></label>
              <label className="block text-sm font-medium">Nội dung đánh giá<textarea className={fieldClass} required rows={3} value={comment} onChange={(event) => setComment(event.target.value)} /></label>
              {reviewMessage && <p role="status" className="text-sm">{reviewMessage}</p>}
              <button type="submit" disabled={submitting || reviewsLoading || !product.id} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-deep disabled:opacity-50">{submitting ? 'Đang gửi...' : 'Gửi đánh giá'}</button>
            </form>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
