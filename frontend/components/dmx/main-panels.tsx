'use client'

import { useStore } from './store-provider'
import { ProductGrid } from './product-grid'
import { InventoryMatrix } from './inventory-matrix'

export function MainPanels() {
  const { tab } = useStore()
  return (
    <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
      {tab === 'catalog' && <ProductGrid />}
      {tab === 'inventory' && <InventoryMatrix />}
    </div>
  )
}
