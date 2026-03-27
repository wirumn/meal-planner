import { useState, useRef, useEffect } from 'react'
import { calcMacros } from '../utils/macros'
import { useMealPlan } from '../hooks/useMealPlan'
import { useCustomProducts } from '../hooks/useCustomProducts'

export default function FoodItem({ item, day, meal }) {
  const { dispatch } = useMealPlan()
  const { allProducts } = useCustomProducts()
  const product = allProducts.find(p => p.id === item.productId)
  const [editing, setEditing] = useState(false)
  const [draftServing, setDraftServing] = useState(String(item.serving))
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.select()
    }
  }, [editing])

  if (!product) {
    return (
      <div className="flex items-center justify-between py-2 px-3 text-xs text-zinc-600 italic">
        <span>Produs șters</span>
        <button
          onClick={() => dispatch({ type: 'REMOVE_FOOD_ITEM', payload: { day, meal, itemId: item.id } })}
          className="text-zinc-600 hover:text-red-400 transition-colors"
        >
          ✕
        </button>
      </div>
    )
  }

  const macros = calcMacros(product, item.serving)

  function commitServing() {
    const val = parseInt(draftServing, 10)
    if (!isNaN(val) && val > 0) {
      dispatch({
        type: 'UPDATE_FOOD_ITEM',
        payload: { day, meal, itemId: item.id, updates: { serving: val } },
      })
    } else {
      setDraftServing(String(item.serving))
    }
    setEditing(false)
  }

  function handleRemove() {
    dispatch({ type: 'REMOVE_FOOD_ITEM', payload: { day, meal, itemId: item.id } })
  }

  function toggleFree() {
    dispatch({
      type: 'UPDATE_FOOD_ITEM',
      payload: { day, meal, itemId: item.id, updates: { free: !item.free } },
    })
  }

  return (
    <div className={`flex items-center gap-2 py-2 px-3 rounded-lg group ${item.free ? 'opacity-60' : ''}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-zinc-100 truncate font-medium">{product.name}</span>
          {item.free && (
            <span className="text-xs bg-emerald-900 text-emerald-400 px-1.5 py-0.5 rounded font-medium shrink-0">
              gratis
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-zinc-500">{macros.kcal} kcal</span>
          <span className="text-xs text-blue-400">{macros.protein}g P</span>
          <span className="text-xs text-zinc-500">{macros.fat}g G · {macros.carbs}g C</span>
        </div>
      </div>

      {/* Serving size */}
      <div className="flex items-center gap-1 shrink-0">
        {editing ? (
          <input
            ref={inputRef}
            type="number"
            value={draftServing}
            onChange={e => setDraftServing(e.target.value)}
            onBlur={commitServing}
            onKeyDown={e => {
              if (e.key === 'Enter') commitServing()
              if (e.key === 'Escape') {
                setDraftServing(String(item.serving))
                setEditing(false)
              }
            }}
            className="w-16 bg-zinc-700 border border-amber-400 rounded px-2 py-0.5 text-sm text-zinc-100 text-center focus:outline-none"
          />
        ) : (
          <button
            onClick={() => { setDraftServing(String(item.serving)); setEditing(true) }}
            className="text-sm text-zinc-300 hover:text-amber-400 transition-colors tabular-nums px-2 py-0.5 rounded hover:bg-zinc-800"
          >
            {item.serving}g
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={toggleFree}
          title={item.free ? 'Marchează ca plătit' : 'Marchează ca gratis'}
          className="p-1 rounded text-zinc-500 hover:text-emerald-400 hover:bg-zinc-800 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6" />
          </svg>
        </button>
        <button
          onClick={handleRemove}
          className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
