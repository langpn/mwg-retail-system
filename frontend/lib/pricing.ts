'use client'

import { useEffect, useState } from 'react'
import { api, ApiError, type OrderQuote } from './api'
import { computeOfflineDiscount, keyToNumericId } from './catalog'
import type { BranchId, Product } from './dmx-data'

export { computeOfflineDiscount } from './catalog'

type PriceItem = { product: Product; quantity: number }
export type PriceQuote = Pick<OrderQuote, 'subtotal' | 'discount' | 'total' | 'promoApplied' | 'promoLabel' | 'promoMessage'> & {
  error: string | null
  loading: boolean
}

const emptyQuote: PriceQuote = {
  subtotal: 0, discount: 0, total: 0, promoApplied: false,
  promoLabel: null, promoMessage: null, error: null, loading: false,
}

export function usePriceQuote(
  cart: PriceItem[],
  promoCode: string,
  branch: BranchId,
  products: Product[],
  connected: boolean | null,
): PriceQuote {
  const code = promoCode.trim().toUpperCase()
  const branchId = keyToNumericId(branch)
  const items = cart.map(({ product, quantity }) => {
    const current = products.find((item) => item.sku === product.sku)
    return { sku: product.sku, productId: current?.id, quantity, price: current?.price ?? product.price }
  })
  const key = JSON.stringify({ connected, branchId, branch, code, items })
  const [result, setResult] = useState<{ key: string; quote: PriceQuote } | null>(null)

  useEffect(() => {
    const data: {
      connected: boolean | null
      branchId?: number
      code: string
      items: { sku: string; productId?: number; quantity: number; price: number }[]
    } = JSON.parse(key)
    if (!data.items.length) {
      setResult({ key, quote: emptyQuote })
      return
    }
    if (data.connected === false) {
      const subtotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const discount = computeOfflineDiscount(subtotal, data.code)
      const promoApplied = data.code === 'MWG5' || data.code === 'TET2027'
      setResult({ key, quote: {
        subtotal, discount, total: subtotal - discount, promoApplied,
        promoLabel: promoApplied ? (data.code === 'MWG5' ? 'Giảm 5% toàn đơn' : 'Tết 2027 · Giảm 10% (tối đa 1.500.000 ₫)') : null,
        promoMessage: data.code && !promoApplied ? 'Mã khuyến mãi không hợp lệ.' : null,
        error: null, loading: false,
      } })
      return
    }
    if (data.connected === null) return
    if (data.branchId === undefined || data.items.some((item) => item.productId === undefined)) {
      setResult({ key, quote: { ...emptyQuote, error: 'Không tìm thấy sản phẩm hoặc chi nhánh trong hệ thống. Vui lòng tải lại.' } })
      return
    }

    let cancelled = false
    const timer = setTimeout(() => {
      api.orders.quote({
        promoCode: data.code,
        branchId: data.branchId as number,
        items: data.items.map((item) => ({ productId: item.productId as number, quantity: item.quantity })),
      }).then((quote) => {
        if (!cancelled) setResult({ key, quote: { ...quote, error: null, loading: false } })
      }).catch((error: unknown) => {
        if (!cancelled) setResult({ key, quote: {
          ...emptyQuote,
          error: error instanceof ApiError ? error.message : 'Không thể tính giá. Vui lòng thử lại.',
        } })
      })
    }, 300)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [key])

  if (!cart.length) return emptyQuote
  return result?.key === key ? result.quote : { ...emptyQuote, loading: true }
}
