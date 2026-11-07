import { api, ApiError } from './api'
import { computeOfflineDiscount, keyToNumericId, mapBackendOrder } from './catalog'
import type { BranchId, Order, Product } from './dmx-data'

export interface CheckoutInput {
  customerName: string
  phone: string
  address: string
  branchId: BranchId
  promoCode: string
}

export interface OrderItemInput { product: Product; quantity: number }

export async function submitOrder(
  connected: boolean | null,
  items: OrderItemInput[],
  products: Product[],
  input: CheckoutInput,
  offlineId: number,
): Promise<Order | { error: string }> {
  if (connected === null) return { error: 'Đang kết nối máy chủ. Vui lòng thử lại.' }
  if (!items.length) return { error: 'Giỏ hàng đang trống.' }
  if (!input.customerName.trim() || !input.phone.trim()) return { error: 'Vui lòng nhập họ tên và số điện thoại.' }
  if (items.some((item) => !Number.isInteger(item.quantity) || item.quantity <= 0)) return { error: 'Số lượng không hợp lệ.' }

  const resolved: OrderItemInput[] = []
  for (const item of items) {
    const product = products.find((entry) => entry.sku === item.product.sku)
    if (!product || (connected && product.id === undefined)) return { error: `Không tìm thấy sản phẩm ${item.product.sku} trong hệ thống.` }
    resolved.push({ product, quantity: item.quantity })
  }

  const code = input.promoCode.trim().toUpperCase()
  if (connected) {
    const branchId = keyToNumericId(input.branchId)
    if (branchId === undefined) return { error: 'Không tìm thấy chi nhánh trong hệ thống.' }
    try {
      const created = await api.orders.create({
        customerName: input.customerName.trim(),
        phone: input.phone.trim(),
        shippingAddress: input.address.trim() || 'Nhận tại cửa hàng',
        promoCode: code,
        branchId,
        items: resolved.map(({ product, quantity }) => ({ productId: product.id as number, quantity })),
      })
      return mapBackendOrder(created, input.branchId)
    } catch (error) {
      return { error: error instanceof ApiError ? error.message : 'Không thể kết nối máy chủ. Vui lòng thử lại.' }
    }
  }

  const unavailable = resolved.find(({ product, quantity }) => product.stock[input.branchId] < quantity)
  if (unavailable) return { error: `Chi nhánh chỉ còn ${unavailable.product.stock[input.branchId]} sản phẩm.` }
  const orderItems = resolved.map(({ product, quantity }) => ({
    sku: product.sku, name: product.name, quantity, unitPrice: product.price,
  }))
  const subtotal = orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const discount = computeOfflineDiscount(subtotal, code)
  return {
    id: offlineId,
    sku: orderItems[0].sku,
    productName: orderItems.length > 1 ? `${orderItems[0].name} và ${orderItems.length - 1} sản phẩm khác` : orderItems[0].name,
    quantity: orderItems.reduce((sum, item) => sum + item.quantity, 0),
    items: orderItems,
    customerName: input.customerName.trim(),
    phone: input.phone.trim(),
    address: input.address.trim() || 'Nhận tại cửa hàng',
    branchId: input.branchId,
    promoCode: discount ? code : null,
    subtotal, discount, total: subtotal - discount, status: 'PENDING',
    createdAt: new Date().toISOString(),
  }
}
