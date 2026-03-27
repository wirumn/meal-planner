import { useState } from 'react'
import { useMealPlan } from '../hooks/useMealPlan'
import { useCustomProducts } from '../hooks/useCustomProducts'
import { mealTemplates } from '../data/mealTemplates'
import { generateDay } from '../utils/randomizer'

const PROTEIN_OPTIONS = [
  { id: 'pui',    label: '🐔 Pui'   },
  { id: 'vita',   label: '🥩 Vită'  },
  { id: 'porc',   label: '🐷 Porc'  },
  { id: 'peste',  label: '🐟 Pește' },
  { id: 'veggie', label: '🧆 Veggie'},
  { id: 'any',    label: '🎲 Orice' },
]

const LOCATION_OPTIONS = [
  { id: 'acasa',  label: '🏠 Acasă' },
  { id: 'birou',  label: '🏢 Birou' },
]

export default function Randomizer({ day, onClose }) {
  const { state, dispatch } = useMealPlan()
  const { allProducts } = useCustomProducts()

  const [step, setStep] = useState(1)
  const [proteinType, setProteinType] = useState('any')
  const [location, setLocation] = useState(
    state.plan[day]?.type === 'office' ? 'birou' : 'acasa'
  )
  const [targetKcal, setTargetKcal] = useState(state.settings.calorieTarget)
  const [targetProtein, setTargetProtein] = useState(state.settings.proteinTarget)
  const [generated, setGenerated] = useState(null)

  function runGenerate() {
    const result = generateDay({
      proteinType,
      location,
      targetKcal: Number(targetKcal),
      targetProtein: Number(targetProtein),
      allProducts,
      templates: mealTemplates,
    })
    setGenerated(result)
    setStep(2)
  }

  function applyToDay() {
    if (!generated) return
    dispatch({ type: 'REPLACE_DAY_MEALS', payload: { day, meals: generated.meals } })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center max-w-lg mx-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full bg-zinc-900 rounded-t-2xl border-t border-zinc-800 max-h-[88vh] flex flex-col">
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-zinc-700 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 shrink-0">
          <h2 className="font-semibold text-zinc-100">
            {step === 1 ? '🎲 Ce mănânc azi?' : '🎲 Meniul tău de azi'}
          </h2>
          <div className="flex items-center gap-2">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                ← Înapoi
              </button>
            )}
            <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {step === 1 ? (
            <Step1
              proteinType={proteinType} setProteinType={setProteinType}
              location={location} setLocation={setLocation}
              targetKcal={targetKcal} setTargetKcal={setTargetKcal}
              targetProtein={targetProtein} setTargetProtein={setTargetProtein}
              onGenerate={runGenerate}
            />
          ) : (
            <Step2
              generated={generated}
              allProducts={allProducts}
              targetKcal={Number(targetKcal)}
              targetProtein={Number(targetProtein)}
              onApply={applyToDay}
              onRegenerate={() => {
                const result = generateDay({
                  proteinType, location,
                  targetKcal: Number(targetKcal),
                  targetProtein: Number(targetProtein),
                  allProducts, templates: mealTemplates,
                })
                setGenerated(result)
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function Step1({ proteinType, setProteinType, location, setLocation, targetKcal, setTargetKcal, targetProtein, setTargetProtein, onGenerate }) {
  return (
    <div className="p-4 space-y-5 pb-6">
      <div>
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
          Proteina principală
        </label>
        <div className="flex flex-wrap gap-2">
          {PROTEIN_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setProteinType(opt.id)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                proteinType === opt.id
                  ? 'bg-amber-400 text-zinc-950'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
          Locație
        </label>
        <div className="flex gap-2">
          {LOCATION_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setLocation(opt.id)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                location === opt.id
                  ? 'bg-amber-400 text-zinc-950'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
          Target
        </label>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs text-zinc-500 block mb-1">Calorii (kcal)</label>
            <input
              type="number"
              value={targetKcal}
              onChange={e => setTargetKcal(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 text-center focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-zinc-500 block mb-1">Proteine (g)</label>
            <input
              type="number"
              value={targetProtein}
              onChange={e => setTargetProtein(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 text-center focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>
        </div>
      </div>

      <button
        onClick={onGenerate}
        className="w-full py-3.5 bg-amber-400 text-zinc-950 rounded-xl font-bold text-base hover:bg-amber-300 transition-colors active:scale-95"
      >
        🎲 Generează
      </button>
    </div>
  )
}

function Step2({ generated, allProducts, targetKcal, targetProtein, onApply, onRegenerate }) {
  if (!generated) return null
  const { meals, macros, templateNames } = generated

  return (
    <div className="p-4 space-y-3 pb-6">
      {Object.entries(meals).map(([mealName, items]) => {
        if (!items.length) return null

        let mealKcal = 0, mealProtein = 0
        items.forEach(item => {
          const p = allProducts.find(p => p.id === item.productId)
          if (!p) return
          mealKcal    += Math.round(p.per100g.kcal    * item.serving / 100)
          mealProtein += p.per100g.protein * item.serving / 100
        })
        mealProtein = Math.round(mealProtein * 10) / 10

        return (
          <div key={mealName} className="bg-zinc-800/60 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                {mealName}
              </span>
              {templateNames[mealName] && (
                <span className="text-xs text-amber-400 font-medium">{templateNames[mealName]}</span>
              )}
            </div>
            <div className="space-y-1">
              {items.map((item, idx) => {
                const product = allProducts.find(p => p.id === item.productId)
                if (!product) return null
                return (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-200 truncate flex-1">
                      {product.name}
                      {item.free && <span className="text-xs text-emerald-400 ml-1.5">gratis</span>}
                    </span>
                    <span className="text-zinc-500 ml-2 shrink-0 tabular-nums">{item.serving}g</span>
                  </div>
                )
              })}
            </div>
            <div className="flex gap-3 mt-2 pt-2 border-t border-zinc-700/60">
              <span className="text-xs text-zinc-400">{mealKcal} kcal</span>
              <span className="text-xs text-blue-400">{mealProtein}g P</span>
            </div>
          </div>
        )
      })}

      {/* Totals */}
      <div className="bg-zinc-800 rounded-xl px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-zinc-300">Total</span>
          <div className="flex gap-3">
            <span className={`text-sm font-bold tabular-nums ${
              targetKcal && Math.abs(macros.kcal - targetKcal) / targetKcal > 0.2
                ? 'text-amber-400' : 'text-emerald-400'
            }`}>{macros.kcal} kcal</span>
            <span className={`text-sm font-bold tabular-nums ${
              targetProtein && Math.abs(macros.protein - targetProtein) / targetProtein > 0.2
                ? 'text-amber-400' : 'text-blue-400'
            }`}>{macros.protein}g P</span>
          </div>
        </div>
        <div className="text-xs text-zinc-500 mt-0.5">
          Target: {targetKcal} kcal · {targetProtein}g P
        </div>
      </div>

      {/* Actions */}
      <button
        onClick={onApply}
        className="w-full py-3 bg-amber-400 text-zinc-950 rounded-xl font-bold text-sm hover:bg-amber-300 transition-colors active:scale-95"
      >
        👍 Arată bine! Aplicați ziua
      </button>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onApply}
          className="py-2.5 bg-zinc-800 text-zinc-200 rounded-xl text-sm font-medium hover:bg-zinc-700 transition-colors"
        >
          ✏️ Editează
        </button>
        <button
          onClick={onRegenerate}
          className="py-2.5 bg-zinc-800 text-zinc-200 rounded-xl text-sm font-medium hover:bg-zinc-700 transition-colors"
        >
          🔄 Altul
        </button>
      </div>
    </div>
  )
}
