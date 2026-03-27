import { useRef, useEffect } from 'react'
import { calcDayMacros } from '../utils/macros'
import products from '../data/products.json'

const SHORT_DAYS = {
  'Luni': 'Lu',
  'Marți': 'Ma',
  'Miercuri': 'Mi',
  'Joi': 'Jo',
  'Vineri': 'Vi',
  'Sâmbătă': 'Sâ',
  'Duminică': 'Du',
}

function getDayStatus(dayData, settings) {
  const macros = calcDayMacros(dayData, products)
  const hasItems = Object.values(dayData.meals).some(m => m.length > 0)
  if (!hasItems) return 'empty'
  const ratio = macros.kcal / settings.calorieTarget
  if (ratio > 1.1) return 'over'
  if (ratio >= 0.9) return 'on-target'
  return 'under'
}

export default function DaySelector({ days, selectedDay, onSelectDay, plan, settings }) {
  const containerRef = useRef(null)
  const activeRef = useRef(null)

  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [selectedDay])

  return (
    <div className="sticky top-0 z-30 bg-zinc-950 border-b border-zinc-800">
      <div
        ref={containerRef}
        className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide"
      >
        {days.map(day => {
          const status = getDayStatus(plan[day], settings)
          const isActive = day === selectedDay

          const dotColor =
            status === 'over' ? 'bg-red-500' :
            status === 'on-target' ? 'bg-emerald-400' :
            status === 'under' ? 'bg-amber-400' :
            'transparent'

          return (
            <button
              key={day}
              ref={isActive ? activeRef : null}
              onClick={() => onSelectDay(day)}
              className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-amber-400 text-zinc-950'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
              }`}
            >
              <span>{SHORT_DAYS[day]}</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isActive ? 'bg-zinc-950 opacity-50' : dotColor
                }`}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
