import { Headphones, MapPin, Phone, ShieldCheck, ShoppingBag, Truck } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-border bg-card">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-8 md:grid-cols-3 md:px-8">
        {/* Cột 1: Thông tin thương hiệu */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-deep shadow-sm">
              <ShoppingBag className="size-4 text-white" aria-hidden="true" />
            </span>
            <p className="text-sm font-extrabold text-foreground">Điện Máy Xanh</p>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground text-pretty">
            Hệ thống siêu thị điện máy và thiết bị gia dụng chính hãng hàng đầu Việt Nam. Cam kết 100% hàng chính hãng, giao hàng và lắp đặt tận nhà nhanh chóng, hỗ trợ trả góp 0%.
          </p>
          <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-primary">
            <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
            <span>Bảo hành chính hãng 12 - 24 tháng</span>
          </div>
        </div>

        {/* Cột 2: Tổng đài hỗ trợ khách hàng */}
        <div className="flex flex-col gap-2.5">
          <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
            <Headphones className="size-3.5" aria-hidden="true" />
            Tổng đài hỗ trợ (Miễn phí cước gọi)
          </p>
          <ul className="flex flex-col gap-2 text-xs text-body">
            <li className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-3 py-2">
              <span className="text-muted-foreground">Gọi mua hàng:</span>
              <span className="font-extrabold text-primary">1800.1061 <span className="font-normal text-[11px] text-muted-foreground">(7:30 - 22:00)</span></span>
            </li>
            <li className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-3 py-2">
              <span className="text-muted-foreground">Khiếu nại, góp ý:</span>
              <span className="font-extrabold text-primary">1800.1063 <span className="font-normal text-[11px] text-muted-foreground">(8:00 - 21:30)</span></span>
            </li>
            <li className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-3 py-2">
              <span className="text-muted-foreground">Bảo hành kỹ thuật:</span>
              <span className="font-extrabold text-primary">1800.1065 <span className="font-normal text-[11px] text-muted-foreground">(8:00 - 21:00)</span></span>
            </li>
          </ul>
        </div>

        {/* Cột 3: Chi nhánh siêu thị & Tiện ích */}
        <div className="flex flex-col gap-2.5">
          <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
            <MapPin className="size-3.5" aria-hidden="true" />
            Chi nhánh siêu thị đang phục vụ
          </p>
          <ul className="flex flex-col gap-2 text-xs text-body">
            <li className="flex flex-col gap-0.5 rounded-lg border border-border bg-secondary/40 p-2.5">
              <span className="font-bold text-foreground">ĐMX Lê Văn Việt (Quận 9)</span>
              <span className="text-muted-foreground text-[11px]">123 Lê Văn Việt, P. Tăng Nhơn Phú B, TP. Thủ Đức</span>
            </li>
            <li className="flex flex-col gap-0.5 rounded-lg border border-border bg-secondary/40 p-2.5">
              <span className="font-bold text-foreground">ĐMX Đỗ Xuân Hợp (Thủ Đức)</span>
              <span className="text-muted-foreground text-[11px]">456 Đỗ Xuân Hợp, P. Phước Long B, TP. Thủ Đức</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border bg-secondary/20">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2 px-4 py-3 text-[11px] text-muted-foreground md:px-8">
          <p>© 2026 Hệ thống Bán lẻ Điện Máy Xanh — Đồ án môn học Công cụ Web (IUH)</p>
          <p className="font-medium">Nhóm sinh viên thực hiện: Diễm (Nhóm trưởng) · Lang · Toàn — Lớp DHCNTT21BVL</p>
        </div>
      </div>
    </footer>
  )
}
