import { StoreProvider } from '@/components/dmx/store-provider'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <StoreProvider>{children}</StoreProvider>
}
