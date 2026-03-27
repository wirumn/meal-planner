import { useMemo } from 'react'
import { useMealPlan } from '../hooks/useMealPlan'
import { generateShoppingList, calcShoppingTotal } from '../utils/shopping'
import products from '../data/products.json'

export default function ShoppingList() {
  const { state, dispatch } = useMealPlan()
  const { checkedItems } = state.shopping

  const shoppingList = useMemo(
    () => generateShoppingList(state.plan, products),
    [state.plan]
  )

  const total = useMemo(
    () => calcShoppingTotal(shoppingList, checkedItems),
    [shoppingList, checkedItems]
  )

  const hasItems = Object.keys(shoppingList).length > 0

  function toggleItem(productId) {
    dispatch({ type: 'TOGGLE_SHOPPING_ITEM', payload: { productId } })
  }

  function clearChecks() {
    dispatch({ type: 'CLEAR_SHOPPING_CHECKS' })
  }

  if (!hasItems) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center pb-24 px-6 text-center">
        <div className="text-4xl mb-4">🛒</div>
        <h3 className="text-lg font-semibold text-zinc-300 mb-1">Lista e goală</h3>
        <p className="text-sm text-zinc-500">
          Adaugă produse la meniu ca să apară automat lista de cumpărături.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-zinc-950 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-zinc-100">Cumpărături</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Săptămâna curentă</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-amber-400 tabular-nums">{total.toFixed(2)} lei</div>
          <button
            onClick={clearChecks}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Resetează bifele
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-2 space-y-4">
        {Object.entries(shoppingList).map(([categoryId, { label, items }]) => (
          <div key={categoryId}>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-1">
              {label}
            </h3>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-800/60">
              {items.map(({ product, totalGrams, packagesNeeded, totalPrice }) => {
                const checked = !!checkedItems[product.id]
                return (
                  <button
                    key={product.id}
                    onClick={() => toggleItem(product.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-800/40 ${
                      checked ? 'opacity-50' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        checked
                          ? 'bg-emerald-400 border-emerald-400'
                          : 'border-zinc-600'
                      }`}
                    >
                      {checked && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-3 h-3 text-zinc-950">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      )}
                    </div>

                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${checked ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
                        {product.name}
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        {totalGrams}g necesar · {packagesNeeded}× {product.priceUnit}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0">
                      <div className={`text-sm font-semibold tabular-nums ${checked ? 'text-zinc-600 line-through' : 'text-amber-400'}`}>
                        {totalPrice.toFixed(2)} lei
                      </div>
                      <div className="text-xs text-zinc-600">
                        {packagesNeeded}× {product.price.toFixed(2)}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Total footer */}
      <div className="px-4 py-4 mt-2">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-zinc-100">Total de plătit</div>
            <div className="text-xs text-zinc-500">Produsele bifate sunt excluse</div>
          </div>
          <div className="text-2xl font-bold text-amber-400 tabular-nums">{total.toFixed(2)} lei</div>
        </div>
      </div>
    </div>
  )
}
