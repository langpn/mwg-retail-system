import { describe, expect, it } from 'vitest'
import { buildProductPageQuery, type BackendOrder, type BackendProduct } from './api'
import { applyStockMatrix, mapBackendOrder, mapBackendProduct, syncBranchTable } from './catalog'
import { computeOfflineDiscount } from './pricing'

describe('offline discount', () => {
  it('applies MWG5 with rounding', () => {
    expect(computeOfflineDiscount(7_490_010, ' mwg5 ')).toBe(374_501)
  })
  it('caps TET2027 at 1,500,000', () => {
    expect(computeOfflineDiscount(25_000_000, 'TET2027')).toBe(1_500_000)
  })
  it('ignores unknown codes', () => {
    expect(computeOfflineDiscount(25_000_000, 'UNKNOWN')).toBe(0)
  })
})

const product: BackendProduct = {
  id: 42, sku: 'NEW', name: 'Máy giặt', price: 1,
  category: { id: 1, code: 'MAYGIAT', name: 'Máy giặt' },
  brand: { id: 1, name: 'Samsung' },
}

describe('catalog mapping', () => {
  it('maps category and always derives a list price greater than the sale price', () => {
    const mapped = mapBackendProduct(product, [])
    expect(mapped.category).toBe('washer')
    expect(mapped.listPrice).toBeGreaterThan(mapped.price)
  })

  it('preserves every order item and derives the discount from the returned total', () => {
    const order: BackendOrder = {
      id: 99, customerName: 'An', phone: '0900000000', shippingAddress: 'HCM',
      totalAmount: 2_500, status: 'PENDING', orderDate: '2026-01-01',
      orderItems: [
        { id: 1, quantity: 2, unitPrice: 1_000, product },
        { id: 2, quantity: 1, unitPrice: 1_000, product: { ...product, id: 43, sku: 'OTHER', name: 'Tivi' } },
      ],
    }
    const mapped = mapBackendOrder(order)
    expect(mapped.items).toEqual([
      { sku: 'NEW', name: 'Máy giặt', quantity: 2, unitPrice: 1_000 },
      { sku: 'OTHER', name: 'Tivi', quantity: 1, unitPrice: 1_000 },
    ])
    expect(mapped.subtotal).toBe(3_000)
    expect(mapped.discount).toBe(500)
    expect(mapped.total).toBe(2_500)
  })

  it('matches branches from data and resets missing stock to zero', () => {
    syncBranchTable([
      { id: 27, branchName: 'Thủ Đức', district: 'Thủ Đức', address: 'b' },
      { id: 11, branchName: 'Quận 9', district: 'Quận 9', address: 'a' },
    ])
    const mapped = { ...mapBackendProduct(product, []), stock: { q9: 8, td: 8 } }
    const result = applyStockMatrix([mapped], [
      { productId: 42, sku: 'NEW', branchId: 11, quantity: 4 },
      { productId: 42, sku: 'NEW', branchId: 99, quantity: 10 },
    ])
    expect(result[0].stock).toEqual({ q9: 4, td: 0 })
    expect(applyStockMatrix(result, [])[0].stock).toEqual({ q9: 0, td: 0 })
  })
})

describe('product query builder', () => {
  it('omits empty values but keeps zero and encodes keywords', () => {
    expect(buildProductPageQuery({ page: 0, size: 8, keyword: ' Samsung TV ', brand: '', category: '  ' }))
      .toBe('page=0&size=8&keyword=Samsung+TV')
  })
})
