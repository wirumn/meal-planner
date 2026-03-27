import { useState } from 'react'
import { useMealPlan } from '../hooks/useMealPlan'
import { calcMealMacros } from '../utils/macros'
import FoodItem from './FoodItem'
import ProductPicker from './ProductPicker'
import products from '../data/products.json'

export default function MealCard({ day, mealName, items }) {
  const { dispatch } = useMealPlan()
  const [pickerOpen, setPickerOpen] = useState(false)
  const macros = calcMealMacros(items, products)

  function handleAddProduct(productId, serving) {
    dispatch({
      type: 'ADD_FOOD_ITEM',
      payload: {
        day,
        meal: mealName,
        item: {
          id: crypto.randomUUID(),
          productId,
          serving,
          free: false,
        },
      },
    })
    setPickerOpen(false)
  }

  function handleRemoveMeal() {
    if (items.length > 0) {
      if (!confirm(`Ștergi masa "${mealName}" cu toate produsele?`)) return
    }
    dispatch({ type: 'REMOVE_MEAL_SLOT', payload: { day, mealName } })
  }

  return (
    <>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {/* Meal header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-800/60">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-200">{mealName}</span>
            {items.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="text-zinc-400">{macros.kcal} kcal</span>
                <span className="text-blue-400">{macros.protein}g P</span>
              </div>
            )}
          </div>
          <button
            onClick={handleRemoveMeal}
            className="p-1.5 text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Șterge masa"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Food items */}
        {items.length > 0 && (
          <div className="divide-y divide-zinc-800/40">
            {items.map(item => (
              <FoodItem key={item.id} item={item} day={day} meal={mealName} />
            ))}
          </div>
        )}

        {/* Add item button */}
        <div className="px-3 py-2">
          <button
            onClick={() => setPickerOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-zinc-500 hover:text-amber-400 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Adaugă produs
          </button>
        </div>
      </div>

      {pickerOpen && (
        <ProductPicker onAdd={handleAddProduct} onClose={() => setPickerOpen(false)} />
      )}
    </>
  )
}
