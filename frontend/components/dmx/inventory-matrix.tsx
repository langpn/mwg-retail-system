'use client'

import { useState } from 'react'
import { Minus, Plus, Save } from 'lucide-react'
import {
  BRANCHES,
  CATEGORIES,
  formatVND,
  getBranch,
  type BranchId,
  type Product,
} from '@/lib/dmx-data'
import { useStore } from './store-provider'
import { cn } from '@/lib/utils'

export function InventoryMatrix() {
  const { filteredProducts, branchId: headerBranch } = useStore()
  const [viewBranch, setViewBranch] = useState<BranchId>(headerBranch)
  const branch = getBranch(viewBranch)
  const other = BRANCHES.find((b) => b.id !== viewBranch)!
  const totalUnits = filteredProducts.reduce((s, p) => s + p.stock[viewBranch], 0)
  const outCount = filteredProducts.filter((p) => p.stock[viewBranch] === 0).length

  return (
    <div className="grid gap-4">
      <section aria-labelledby="matrix-title" className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 id="matrix-title" className="text-base font-extrabold text-foreground">
              Bảng Quản Lý Tồn Kho Đa Chi Nhánh Thời Gian Thực
            </h2>
            <p className="text-xs text-muted-foreground">
              {branch.name} · <span className="tabular">{filteredProducts.length}</span> mẫu sản phẩm ·{' '}
              <span className="tabular">{totalUnits}</span> máy sẵn sàng ·{' '}
              <span className="tabular text-danger-ink">{outCount}</span> mã tạm hết hàng
            </p>
          </div>
          <div role="radiogroup" aria-label="Chọn chi nhánh" className="inline-flex rounded-lg border border-border bg-secondary/60 p-1">
            {BRANCHES.map((b) => (
              <button
                key={b.id}
                type="button"
                role="radio"
                aria-checked={viewBranch === b.id}
                onClick={() => setViewBranch(b.id)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-bold transition-colors',
                  viewBranch === b.id ? 'bg-card text-primary shadow-sm' : 'text-body hover:text-foreground',
                )}
              >
                {b.district}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="bg-secondary/60 whitespace-nowrap text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              <tr>
                <th scope="col" className="px-3 py-2.5">Mã SKU</th>
                <th scope="col" className="px-3 py-2.5">Tên sản phẩm</th>
                <th scope="col" className="px-3 py-2.5">Danh mục</th>
                <th scope="col" className="px-3 py-2.5 text-right">Giá bán lẻ</th>
                <th scope="col" className="px-3 py-2.5 text-right">Tồn kho chi nhánh</th>
                <th scope="col" className="px-3 py-2.5 text-right">ĐMX {other.district}</th>
                <th scope="col" className="px-3 py-2.5">Trạng thái tồn kho</th>
                <th scope="col" className="px-3 py-2.5">Cập nhật nhanh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.map((p) => (
                <InventoryRow key={`${p.sku}-${viewBranch}`} product={p} branchId={viewBranch} otherId={other.id} />
              ))}
            </tbody>
          </table>
        </div>
        {filteredProducts.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">Không có sản phẩm nào phù hợp với bộ lọc hiện tại.</p>
        )}
      </section>
    </div>
  )
}

function InventoryRow({ product, branchId, otherId }: { product: Product; branchId: BranchId; otherId: BranchId }) {
  const { updateStock } = useStore()
  const qty = product.stock[branchId]
  const [draft, setDraft] = useState(qty)
  const [flash, setFlash] = useState(false)
  const dirty = draft !== qty
  const category = CATEGORIES.find((c) => c.id === product.category)

  function submit() {
    updateStock(product.sku, branchId, draft)
    setFlash(true)
    setTimeout(() => setFlash(false), 900)
  }

  return (
    <tr className={cn('transition-colors hover:bg-secondary/40', flash && 'bg-success-soft')}>
      <td className="px-3 py-2.5 font-mono text-xs font-semibold whitespace-nowrap text-foreground">{product.sku}</td>
      <td className="max-w-[240px] px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <img src={product.image || '/placeholder.svg'} alt="" className="size-8 shrink-0 rounded bg-secondary object-contain" />
          <span className="truncate font-semibold text-body" title={product.name}>
            {product.name}
          </span>
        </div>
      </td>
      <td className="px-3 py-2.5 text-xs whitespace-nowrap text-muted-foreground">{category?.label}</td>
      <td className="tabular px-3 py-2.5 text-right font-bold whitespace-nowrap text-foreground">
        {formatVND(product.price)}
      </td>
      <td className="tabular px-3 py-2.5 text-right text-base font-extrabold text-foreground">{qty}</td>
      <td className="tabular px-3 py-2.5 text-right text-xs font-semibold text-muted-foreground">
        {product.stock[otherId]}
      </td>
      <td className="px-3 py-2.5">
        {qty > 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-bold whitespace-nowrap text-success-ink">
            <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
            Còn hàng ({qty})
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-danger-soft px-2.5 py-1 text-[11px] font-bold whitespace-nowrap text-danger-ink">
            <span className="size-1.5 rounded-full bg-danger" aria-hidden="true" />
            Tạm hết hàng (0)
          </span>
        )}
      </td>
      <td className="px-3 py-2.5">
        <form
          className="flex items-center gap-1.5"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <div className="flex h-8 items-center rounded-lg border border-border bg-card">
            <button
              type="button"
              onClick={() => setDraft((d) => Math.max(0, d - 1))}
              className="flex h-full w-7 items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label={`Giảm tồn kho ${product.sku}`}
            >
              <Minus className="size-3.5" aria-hidden="true" />
            </button>
            <label htmlFor={`qty-${product.sku}`} className="sr-only">
              Số lượng mới cho {product.sku}
            </label>
            <input
              id={`qty-${product.sku}`}
              type="number"
              inputMode="numeric"
              min={0}
              max={999}
              value={draft}
              onChange={(e) => setDraft(Math.max(0, Math.min(999, Number(e.target.value) || 0)))}
              className="tabular h-full w-10 border-x border-border bg-transparent text-center text-sm font-bold text-foreground [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={() => setDraft((d) => Math.min(999, d + 1))}
              className="flex h-full w-7 items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label={`Tăng tồn kho ${product.sku}`}
            >
              <Plus className="size-3.5" aria-hidden="true" />
            </button>
          </div>
          <button
            type="submit"
            disabled={!dirty}
            aria-label={`Lưu tồn kho ${product.sku}`}
            className="flex h-8 items-center gap-1 rounded-lg bg-primary px-2.5 text-[11px] font-bold text-primary-foreground transition-colors hover:bg-primary-deep disabled:bg-secondary disabled:text-muted-foreground"
          >
            <Save className="size-3.5" aria-hidden="true" />
            Lưu
          </button>
        </form>
      </td>
    </tr>
  )
}

