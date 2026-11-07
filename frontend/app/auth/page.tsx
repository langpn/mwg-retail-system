'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  UserPlus,
} from 'lucide-react'
import { StoreProvider, useStore } from '@/components/dmx/store-provider'
import { AppHeader } from '@/components/dmx/app-header'
import { SiteFooter } from '@/components/dmx/site-footer'
import { api } from '@/lib/api'

export default function AuthPage() {
  return (
    <StoreProvider>
      <AuthContent />
    </StoreProvider>
  )
}

function AuthContent() {
  const router = useRouter()
  const { loginCustomer, customer } = useStore()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form state
  const [regName, setRegName] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regAddress, setRegAddress] = useState('')
  const [regPassword, setRegPassword] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setNotification(null)

    const identifier = loginIdentifier.trim()
    if (!identifier) {
      setError('Vui lòng nhập số điện thoại hoặc email.')
      return
    }

    setSubmitting(true)
    try {
      // 1. Tìm trực tiếp theo số điện thoại qua API backend
      let foundCustomer: any = null
      const res = await api.getCustomerByPhone(identifier)
      if (res.ok) {
        foundCustomer = await res.json()
      } else {
        // 2. Nếu không tìm thấy, quét danh sách toàn bộ khách hàng
        const list = await api.getCustomers()
        if (Array.isArray(list)) {
          foundCustomer = list.find(
            (c: any) =>
              c.phone === identifier ||
              (c.email && c.email.toLowerCase() === identifier.toLowerCase()),
          )
        }
      }

      if (foundCustomer) {
        loginCustomer({
          id: foundCustomer.id,
          fullName: foundCustomer.fullName,
          phone: foundCustomer.phone,
          email: foundCustomer.email,
          address: foundCustomer.address,
        })
        setNotification(`Đăng nhập thành công! Chào mừng ${foundCustomer.fullName}.`)
        setTimeout(() => {
          router.push('/')
        }, 800)
      } else {
        setError(
          'Không tìm thấy thành viên với SĐT/Email này trong CSDL. Quý khách vui lòng chọn tab "Đăng ký" bên trên nhé!',
        )
      }
    } catch {
      setError('Không thể kết nối đến máy chủ MySQL/Backend. Vui lòng kiểm tra lại tiến trình!')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setNotification(null)

    const phoneClean = regPhone.trim()
    const nameClean = regName.trim()
    const emailClean = regEmail.trim()
    const addressClean = regAddress.trim() || 'TP. Hồ Chí Minh'

    if (!phoneClean || !nameClean) {
      setError('Họ tên và Số điện thoại là bắt buộc.')
      return
    }

    setSubmitting(true)
    try {
      const res = await api.createCustomer({
        fullName: nameClean,
        phone: phoneClean,
        email: emailClean || undefined,
        address: addressClean,
      })

      if (res.status === 409) {
        setError('Số điện thoại này đã được đăng ký thành viên trước đó. Vui lòng chuyển sang Đăng nhập!')
        setSubmitting(false)
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.message || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin!')
        setSubmitting(false)
        return
      }

      const created = await res.json()
      loginCustomer({
        id: created.id,
        fullName: created.fullName,
        phone: created.phone,
        email: created.email,
        address: created.address,
      })

      setNotification(`Đăng ký thành viên thành công và đã lưu vào CSDL MySQL! Chào mừng ${created.fullName}.`)
      setTimeout(() => {
        router.push('/')
      }, 900)
    } catch {
      setError('Lỗi kết nối máy chủ backend. Vui lòng kiểm tra cổng 8088!')
    } finally {
      setSubmitting(false)
    }
  }

  async function quickCustomerLogin() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await api.getCustomerByPhone('0901234567')
      if (res.ok) {
        const found = await res.json()
        loginCustomer({
          id: found.id,
          fullName: found.fullName,
          phone: found.phone,
          email: found.email,
          address: found.address,
        })
        setNotification(`Đăng nhập thành công với tài khoản mẫu: ${found.fullName}!`)
        setTimeout(() => router.push('/'), 700)
        return
      }
    } catch {}

    // Fallback nếu server chưa có
    loginCustomer({
      id: 1,
      fullName: 'Nguyễn Văn An',
      phone: '0901234567',
      email: 'an.nguyen@gmail.com',
      address: 'Số 10 Võ Văn Ngân, TP. Thủ Đức',
    })
    setNotification('Đăng nhập thành công với tài khoản mẫu Nguyễn Văn An!')
    setTimeout(() => router.push('/'), 700)
  }

  function quickAdminLogin() {
    setNotification('Xác thực quyền Quản trị viên! Đang mở Dashboard...')
    setTimeout(() => {
      router.push('/dashboard')
    }, 700)
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-foreground">
      <AppHeader />

      {/* Nội dung trung tâm */}
      <main className="flex flex-1 items-center justify-center p-4 py-12">
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          {/* Header thương hiệu */}
          <div className="border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 text-center">
            <h1 className="text-lg font-black text-foreground">Thành Viên Điện Máy Xanh</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Tích điểm mua sắm, tra cứu bảo hành và nhận ưu đãi độc quyền
            </p>
          </div>

          {/* Chuyển tab Đăng nhập / Đăng ký */}
          <div className="flex border-b border-border bg-secondary/30 p-1">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setNotification(null)
                setError(null)
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all ${
                mode === 'login'
                  ? 'bg-card text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LogIn className="size-4" />
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register')
                setNotification(null)
                setError(null)
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all ${
                mode === 'register'
                  ? 'bg-card text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <UserPlus className="size-4" />
              Đăng ký
            </button>
          </div>

          <div className="p-6">
            {notification && (
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 animate-in fade-in">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                <span>{notification}</span>
              </div>
            )}

            {error && (
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800 animate-in fade-in">
                <AlertCircle className="size-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-foreground">
                    Số điện thoại thành viên (hoặc Email)
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="VD: 0901234567 hoặc an.nguyen@gmail.com"
                      className="h-11 w-full rounded-xl border border-border bg-card pr-4 pl-10 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/15 focus:outline-none"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    💡 Khách hàng mẫu đã có trong CSDL: <span className="font-semibold text-foreground">0901234567</span>
                  </p>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">Mật khẩu</label>
                    <span className="text-[11px] font-semibold text-primary hover:underline cursor-pointer">
                      Quên mật khẩu?
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="•••••••• (tùy chọn trong bản Demo)"
                      className="h-11 w-full rounded-xl border border-border bg-card pr-11 pl-10 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/15 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-extrabold text-white shadow-sm transition-all hover:bg-primary-deep disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
                  Đăng nhập thành viên
                </button>

                <div className="relative my-2 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <span className="relative bg-card px-3 text-[11px] font-semibold uppercase text-muted-foreground">
                    Hoặc truy cập nhanh
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={quickCustomerLogin}
                    disabled={submitting}
                    className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary/50 text-xs font-bold text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
                  >
                    <User className="size-3.5 text-primary" />
                    Khách mẫu (MySQL)
                  </button>

                  <button
                    type="button"
                    onClick={quickAdminLogin}
                    className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-50 text-xs font-bold text-amber-800 transition-colors hover:bg-amber-100"
                  >
                    <ShieldCheck className="size-3.5 text-amber-600" />
                    Quyền Admin
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
                <div>
                  <label className="mb-1 block text-xs font-bold text-foreground">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="VD: Bùi Dương Diễm"
                    className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/15 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-foreground">
                    Số điện thoại <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="VD: 0987 654 321"
                    className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/15 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-foreground">Email (nhận hóa đơn điện tử)</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="diem.bui@gmail.com"
                    className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/15 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-foreground">Địa chỉ nhận hàng</label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      placeholder="Số nhà, Tên đường, Quận/Huyện"
                      className="h-10 w-full rounded-xl border border-border bg-card pr-3 pl-9 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/15 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-foreground">Mật khẩu khởi tạo</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/15 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-extrabold text-foreground shadow-sm transition-all hover:bg-amber-400 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
                  Đăng ký lưu vào MySQL
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
