import { INITIAL_PRODUCTS } from '@/lib/dmx-data'
import ProductDetailClient from './product-detail-client'

export function generateStaticParams() {
  return INITIAL_PRODUCTS.map((p) => ({
    sku: p.sku,
  }))
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ sku: string }>
}) {
  const resolvedParams = await params
  return <ProductDetailClient sku={resolvedParams.sku} />
}
