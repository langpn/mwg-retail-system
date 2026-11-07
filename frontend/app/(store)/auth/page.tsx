'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  LogIn,
  Phone,
  User,
  UserPlus,
} from 'lucide-react'
import { useStore } from '@/components/dmx/store-provider'
import { AppHeader } from '@/components/dmx/app-header'
import { SiteFooter } from '@/components/dmx/site-footer'
import { api, ApiError } from '@/lib/api'

// Định danh được cấp quyền Quản trị viên (Admin)
const ADMIN_IDENTIFIERS = ['0900000000', '0987654321', 'admin']

export default function AuthPage() {
  return <AuthContent />
}

function AuthContent() {
  const router = useRouter()
  const { loginCustomer } = useStore()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [notification, setNotification] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('')

  // Register form state
  const [regName, setRegName] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regEmail, setRegEmail] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setNotification(null)

    const identifier = loginIdentifier.trim()
    if (!identifier) {
      setError('Vui lòng nhập số điện thoại.')
      return
    }

    // 1. Quản trị viên: Chuyển thẳng vào Bảng điều khiển Quản trị (/dashboard)
    const lower = identifier.toLowerCase()
    if (ADMIN_IDENTIFIERS.includes(lower) || ADMIN_IDENTIFIERS.includes(identifier)) {
      loginCustomer({
        id: 999,
        fullName: 'Quản trị viên',
        phone: identifier,
        email: 'admin@dmx.mwg.vn',
        role: 'ADMIN',
      })
      setNotification('Đăng nhập Quản trị viên thành công! Đang mở trang Quản trị...')
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
      return
    }

    // 2. Khách hàng: Tra cứu thông tin trong hệ thống qua typed API
    setSubmitting(true)
    try {
      const foundCustomer = await api.customers.lookup(identifier)
      loginCustomer({
        id: foundCustomer.id,
        fullName: foundCustomer.fullName,
        phone: foundCustomer.phone,
        email: foundCustomer.email,
        address: foundCustomer.address,
        role: 'CUSTOMER',
      })
      setNotification(`Đăng nhập thành công! Chào mừng ${foundCustomer.fullName}.`)
      setTimeout(() => {
        router.push('/')
      }, 600)
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 404
          ? 'Số điện thoại chưa được đăng ký trong hệ thống. Vui lòng chuyển sang tab "Đăng ký".'
          : 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.',
      )
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

    if (!phoneClean || !nameClean) {
      setError('Vui lòng nhập đầy đủ Họ tên và Số điện thoại.')
      return
    }

    setSubmitting(true)
    try {
      const created = await api.customers.create({
        fullName: nameClean,
        phone: phoneClean,
        email: emailClean || undefined,
      })

      loginCustomer({
        id: created.id,
        fullName: created.fullName,
        phone: created.phone,
        email: created.email,
        role: 'CUSTOMER',
      })

      setNotification(`Đăng ký thành công! Chào mừng ${created.fullName}.`)
      setTimeout(() => {
        router.push('/')
      }, 700)
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 409
          ? 'Số điện thoại này đã được đăng ký. Vui lòng chuyển sang tab Đăng nhập.'
          : 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-foreground">
      <AppHeader />

      {/* Nội dung trung tâm */}
      <main className="flex flex-1 items-center justify-center p-4 py-12">
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          {/* Header thương hiệu */}
          <div className="border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 text-center">
            <h1 className="text-lg font-black text-foreground">Tài Khoản Điện Máy Xanh</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Tra cứu đơn hàng, tích điểm thành viên và nhận ưu đãi
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
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="Nhập số điện thoại"
                      className="h-11 w-full rounded-xl border border-border bg-card pr-4 pl-10 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/15 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-extrabold text-white shadow-sm transition-all hover:bg-primary-deep disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
                  Đăng nhập
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
                <div>
                  <label className="mb-1 block text-xs font-bold text-foreground">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Họ và tên"
                      className="h-10 w-full rounded-xl border border-border bg-card pr-4 pl-10 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/15 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-foreground">
                    Số điện thoại <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="Số điện thoại"
                      className="h-10 w-full rounded-xl border border-border bg-card pr-4 pl-10 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/15 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-foreground">Email (tùy chọn)</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/15 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-extrabold text-white shadow-sm transition-all hover:bg-primary-deep disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
                  Đăng ký
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
