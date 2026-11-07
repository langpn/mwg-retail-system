import { AppHeader } from '@/components/dmx/app-header'
import { FilterRibbon } from '@/components/dmx/filter-ribbon'
import { ViewTabs } from '@/components/dmx/view-tabs'
import { MainPanels } from '@/components/dmx/main-panels'
import { SiteFooter } from '@/components/dmx/site-footer'

export default function Page() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto flex max-w-[1440px] flex-col gap-5 px-4 pt-5 md:px-8">
        <h1 className="sr-only">Điện Máy Xanh — Hệ Thống Bán Lẻ Đa Chi Nhánh</h1>
        <FilterRibbon />
        <ViewTabs />
        <MainPanels />
      </main>
      <SiteFooter />
    </>
  )
}
