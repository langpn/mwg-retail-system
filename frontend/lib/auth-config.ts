/**
 * Cấu hình xác thực dùng chung cho toàn bộ ứng dụng.
 * Một nguồn sự thật duy nhất: đổi SĐT/PIN quản trị chỉ cần sửa ở đây.
 */

/** Khóa localStorage lưu phiên khách hàng / quản trị viên. */
export const CUSTOMER_STORAGE_KEY = 'mwg_customer_v1'

/**
 * Khóa localStorage lưu số điện thoại của đơn hàng vừa đặt gần nhất.
 * Mục đích: khách mua hàng không cần đăng nhập (guest checkout) vẫn xem lại được
 * đơn của mình ở trang /orders mà không phải gõ lại số điện thoại.
 */
export const LAST_ORDER_PHONE_STORAGE_KEY = 'mwg_last_order_phone_v1'

/** Số điện thoại (hoặc định danh) được cấp quyền Quản trị viên. */
export const ADMIN_PHONES = ['0900000000', '0987654321', 'admin']

/** Mã PIN dùng để mở khóa trực tiếp cổng /dashboard. */
export const ADMIN_PIN = '172004'

/** Hồ sơ hiển thị của Quản trị viên. */
export const ADMIN_PROFILE = {
  id: 999,
  fullName: 'Quản trị viên',
  phone: '0900000000',
  email: 'admin@dmx.mwg.vn',
  role: 'ADMIN' as const,
}

/** Kiểm tra một chuỗi nhập vào có phải định danh quản trị hay không. */
export function isAdminIdentifier(value: string): boolean {
  const normalized = value.trim().toLowerCase()
  return ADMIN_PHONES.some((phone) => phone.toLowerCase() === normalized)
}

/** Kiểm tra mã PIN mở khóa Dashboard (chấp nhận cả PIN lẫn định danh admin). */
export function isValidAdminPin(value: string): boolean {
  return value.trim() === ADMIN_PIN || isAdminIdentifier(value)
}
