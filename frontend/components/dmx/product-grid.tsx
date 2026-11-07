'use client'

import { useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, ChevronLeft, ChevronRight, Loader2, PackageSearch } from 'lucide-react'
import { BRANCHES, formatVND, type Product } from '@/lib/dmx-data'
import { useStore, type SortOption } from './store-provider'
import { cn } from '@/lib/utils'

const PAGE_SIZES = [4, 8, 12, 16]

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'default', label: 'Nổi bật nhất' },
  { id: 'price-asc', label: 'Giá thấp → cao' },
  { id: 'price-desc', label: 'Giá cao → thấp' },
  { id: 'discount', label: 'Giảm nhiều nhất' },
]

export function ProductGrid() {
  const {
    pagedProducts,
    totalProducts,
    totalPages,
    page,
    pageSize,
    pageLoading,
    setPage,
    setPageSize,
    resetFilters,
    sort,
    setSort,
  } = useStore()
  const gridRef = useRef<HTMLDivElement>(null)

  function scrollToGrid() {
    if (typeof window === 'undefined') return
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function goTo(next: number) {
    if (next === page) return
    setPage(next)
    scrollToGrid()
  }

  const toolbar = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-semibold text-body">
        Hiển thị <span className="tabular font-extrabold text-foreground">{totalProducts}</span> sản phẩm
      </p>
      <div
        role="group"
        aria-label="Sắp xếp sản phẩm"
        className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-card p-1"
      >
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            aria-pressed={sort === opt.id}
            onClick={() => {
              setSort(opt.id)
              scrollToGrid()
            }}
            className={cn(
              'rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors',
              sort === opt.id
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-body hover:bg-secondary hover:text-foreground',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )

  if (totalProducts === 0) {
    return (
      <div className="flex flex-col gap-4">
        {toolbar}
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-20 text-center">
          <PackageSearch className="size-10 text-muted-foreground" aria-hidden="true" />
          <p className="text-base font-bold text-foreground">Không tìm thấy sản phẩm phù hợp</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Vui lòng thử chọn danh mục, thương hiệu khác hoặc mức giá phù hợp hơn.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-deep"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      </div>
    )
  }

  const firstItem = page * pageSize + 1
  const lastItem = Math.min((page + 1) * pageSize, totalProducts)

  return (
    <div ref={gridRef} className="scroll-mt-24">
      {toolbar}

      <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {pagedProducts.map((p) => (
          <li key={p.sku} className="h-full">
            <ProductCard product={p} />
          </li>
        ))}
      </ul>

      <PaginationBar
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        firstItem={firstItem}
        lastItem={lastItem}
        totalProducts={totalProducts}
        loading={pageLoading}
        onPageChange={goTo}
        onPageSizeChange={(size) => {
          setPageSize(size)
          scrollToGrid()
        }}
      />
    </div>
  )
}

function PaginationBar({
  page,
  totalPages,
  pageSize,
  firstItem,
  lastItem,
  totalProducts,
  loading,
  onPageChange,
  onPageSizeChange,
}: {
  page: number
  totalPages: number
  pageSize: number
  firstItem: number
  lastItem: number
  totalProducts: number
  loading: boolean
  onPageChange: (p: number) => void
  onPageSizeChange: (size: number) => void
}) {
  const pages = useMemo(() => buildPageList(page, totalPages), [page, totalPages])

  return (
    <div className="mt-5 flex flex-col gap-4 rounded-xl border border-border bg-card px-4 py-3 shadow-2xs md:flex-row md:items-center md:justify-between">
      {/* Left: range summary + page size picker */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-sm font-medium text-body">
          Hiển thị{' '}
          <strong className="tabular font-extrabold text-foreground">
            {firstItem} – {lastItem}
          </strong>{' '}
          trên tổng{' '}
          <strong className="tabular font-extrabold text-foreground">{totalProducts}</strong>{' '}
          sản phẩm
        </p>

        <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          Số SP / trang
          <span className="relative inline-flex items-center">
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Số sản phẩm mỗi trang"
              className="h-8 cursor-pointer appearance-none rounded-lg border border-border bg-card pr-7 pl-2.5 text-xs font-bold text-foreground transition-colors hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size} / trang
                </option>
              ))}
            </select>
            <ChevronRight
              className="pointer-events-none absolute right-2 size-3.5 rotate-90 text-muted-foreground"
              aria-hidden="true"
            />
          </span>
        </label>

        {loading && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            Đang tải từ server…
          </span>
        )}
      </div>

      {/* Right: page buttons */}
      <nav aria-label="Chuyển trang sản phẩm" className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 0}
          aria-label="Trang trước"
          className="flex h-8 items-center gap-1 rounded-lg border border-border px-2.5 text-xs font-bold text-body transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-body"
        >
          <ChevronLeft className="size-3.5" aria-hidden="true" />
          Trước
        </button>

        {pages.map((entry, i) =>
          entry === 'ellipsis' ? (
            <span
              key={`gap-${i}`}
              className="flex size-8 items-center justify-center text-xs font-bold text-muted-foreground"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              onClick={() => onPageChange(entry)}
              aria-label={`Trang ${entry + 1}`}
              aria-current={entry === page ? 'page' : undefined}
              className={cn(
                'tabular flex size-8 items-center justify-center rounded-lg text-xs font-extrabold transition-colors',
                entry === page
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'border border-border text-body hover:border-primary hover:text-primary',
              )}
            >
              {entry + 1}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          aria-label="Trang sau"
          className="flex h-8 items-center gap-1 rounded-lg border border-border px-2.5 text-xs font-bold text-body transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-body"
        >
          Sau
          <ChevronRight className="size-3.5" aria-hidden="true" />
        </button>
      </nav>
    </div>
  )
}

/** Page list with ellipsis, e.g. 0 … 3 4 5 … 11 (0-based indices). */
function buildPageList(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i)

  const items: (number | 'ellipsis')[] = [0]
  const start = Math.max(1, current - 1)
  const end = Math.min(total - 2, current + 1)

  if (start > 1) items.push('ellipsis')
  for (let i = start; i <= end; i++) items.push(i)
  if (end < total - 2) items.push('ellipsis')

  items.push(total - 1)
  return items
}

function ProductCard({ product }: { product: Product }) {
  const router = useRouter()
  const { addToCart } = useStore()
  const totalStock = BRANCHES.reduce((sum, b) => sum + (product.stock[b.id] ?? 0), 0)
  const inStock = totalStock > 0
  const discountPct = Math.round((1 - product.price / product.listPrice) * 100)
  const href = `/product/${product.sku}`

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
      <Link href={href} className="relative aspect-[4/3] bg-gradient-to-b from-secondary/70 to-card block overflow-hidden">
        <img
          src={product.image || '/placeholder.svg'}
          alt={product.name}
          className="absolute inset-0 size-full object-contain p-6 mix-blend-multiply transition-transform duration-300 group-hover:scale-[1.05]"
        />
        {discountPct > 0 && (
          <div className="absolute top-3 left-3 flex flex-col items-start">
            <span className="tabular rounded-md bg-price px-2 py-0.5 text-xs font-extrabold text-white shadow-sm">
              -{discountPct}%
            </span>
          </div>
        )}
        <span className="absolute top-3 right-3 rounded-full border border-border bg-card/90 px-2.5 py-0.5 text-[11px] font-bold text-foreground shadow-xs backdrop-blur">
          {product.brand}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <span className="tabular font-mono text-[11px] font-semibold text-muted-foreground">{product.sku}</span>
          <Link href={href}>
            <h3 className="line-clamp-2 min-h-[2.75rem] text-[15px] leading-snug font-bold text-foreground text-pretty hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        <ul className="flex flex-wrap gap-1.5" aria-label="Thông số nổi bật">
          {product.specs.map((s) => (
            <li
              key={s}
              className="rounded-md border border-primary/15 bg-primary/5 px-2 py-0.5 text-[11px] font-semibold text-primary-deep"
            >
              {s}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span className="tabular text-xl font-extrabold tracking-tight text-price">{formatVND(product.price)}</span>
            <span className="tabular text-xs font-medium text-muted-foreground line-through">
              {formatVND(product.listPrice)}
            </span>
          </div>
          <span className="w-fit rounded-md bg-accent/15 px-2 py-0.5 text-[11px] font-bold text-amber-800">
            Trả góp 0%
          </span>
        </div>

        <p className="flex items-center gap-2 text-xs font-semibold">
          <span
            className={cn('size-2 shrink-0 rounded-full', inStock ? 'bg-success' : 'bg-danger')}
            aria-hidden="true"
          />
          {inStock ? (
            <span className="text-success-ink">
              Còn hàng <span className="tabular">({totalStock} sản phẩm)</span>
            </span>
          ) : (
            <span className="text-danger-ink">Tạm hết hàng</span>
          )}
        </p>

        <button
          type="button"
          disabled={!inStock}
          onClick={() => {
            addToCart(product, 1)
            router.push('/cart')
          }}
          className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-deep focus-visible:ring-4 focus-visible:ring-primary/25 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground"
        >
          {inStock ? 'Thêm vào giỏ' : 'Tạm hết hàng'}
          {inStock && <ArrowRight className="size-4" aria-hidden="true" />}
        </button>
      </div>
    </article>
  )
}
