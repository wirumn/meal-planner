import { getBarColor, getMacroTextColor } from '../utils/macros'

export default function MacroBar({ label, current, target, unit, colorOverride }) {
  const pct = target ? Math.min((current / target) * 100, 110) : 0
  const barColor = colorOverride || getBarColor(current, target)
  const textColor = getMacroTextColor(current, target)

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-zinc-400 font-medium">{label}</span>
        <span className={`text-xs font-semibold tabular-nums ${textColor}`}>
          {current}
          {target && <span className="text-zinc-500 font-normal"> / {target}{unit}</span>}
          {!target && <span className="text-zinc-500">{unit}</span>}
        </span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
