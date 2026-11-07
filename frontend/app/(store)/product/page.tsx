'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductDetailClient from './[sku]/product-detail-client'

function ProductContent() {
  return <ProductDetailClient sku={useSearchParams().get('sku') ?? ''} />
}

export default function ProductPage() {
  return <Suspense fallback={<p className="p-12 text-center">Đang tải sản phẩm...</p>}><ProductContent /></Suspense>
}
