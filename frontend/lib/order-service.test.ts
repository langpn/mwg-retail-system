import { afterEach, describe, expect, it, vi } from 'vitest'
import { syncBranchTable } from './catalog'
import { submitOrder } from './order-service'
import type { Product } from './dmx-data'

const product: Product = { id: 42, sku: 'SKU', name: 'Máy giặt', category: 'washer', brand: 'LG', price: 1000, listPrice: 1200, specs: [], image: '', stock: { q9: 3, td: 0 } }
const input = { customerName: 'An', phone: '0900000000', address: '', branchId: 'q9' as const, promoCode: 'MWG5' }

syncBranchTable([{ id: 17, branchName: 'Quận 9', district: 'Quận 9', address: 'a' }])
afterEach(() => vi.unstubAllGlobals())

describe('submitOrder', () => {
  it('returns the backend error without making a local order', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: 'Hết hàng' }), { status: 400 })))
    const result = await submitOrder(true, [{ product, quantity: 1 }], [product], input, 1)
    expect(result).toEqual({ error: 'Hết hàng' })
  })
  it('returns a connection error instead of a local order after network failure', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('network') }))
    const result = await submitOrder(true, [{ product, quantity: 1 }], [product], input, 1)
    expect(result).toHaveProperty('error')
  })
  it('does not submit an unresolved product', async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    const result = await submitOrder(true, [{ product: { ...product, sku: 'MISSING' }, quantity: 1 }], [product], input, 1)
    expect(result).toHaveProperty('error')
    expect(fetchSpy).not.toHaveBeenCalled()
  })
  it('maps the server total and sends the resolved product and branch IDs', async () => {
    const fetchSpy = vi.fn(async (_url: string, _options: RequestInit) => new Response(JSON.stringify({
      id: 90, customerName: 'An', phone: '0900000000', shippingAddress: 'Nhận tại cửa hàng',
      totalAmount: 1900, status: 'PENDING', orderDate: '2026-01-01', promotion: { id: 1, promoCode: 'MWG5' },
      orderItems: [{ id: 2, quantity: 2, unitPrice: 1000, product: { id: 42, sku: 'SKU', name: 'Máy giặt', price: 1000, category: { code: 'MAYGIAT' }, brand: { name: 'LG' } } }],
    }), { status: 201 }))
    vi.stubGlobal('fetch', fetchSpy)
    const result = await submitOrder(true, [{ product: { ...product, id: undefined }, quantity: 2 }], [product], input, 1)
    expect(result).toMatchObject({ id: 90, subtotal: 2000, discount: 100, total: 1900, items: [{ sku: 'SKU', quantity: 2 }] })
    const [url, options] = fetchSpy.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('/api/v1/orders')
    expect(JSON.parse(options.body as string)).toMatchObject({ branchId: 17, items: [{ productId: 42, quantity: 2 }] })
  })
  it('does not create an order while connection status is unknown', async () => {
    const result = await submitOrder(null, [{ product, quantity: 1 }], [product], input, 1)
    expect(result).toHaveProperty('error')
  })
  it('only creates local orders in offline mode', async () => {
    const result = await submitOrder(false, [{ product, quantity: 2 }], [product], input, 55)
    expect(result).toMatchObject({ id: 55, subtotal: 2000, discount: 100, total: 1900, items: [{ sku: 'SKU', quantity: 2 }] })
  })
})
