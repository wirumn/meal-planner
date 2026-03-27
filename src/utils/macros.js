export function calcMacros(product, serving) {
  const factor = serving / 100
  return {
    kcal: Math.round(product.per100g.kcal * factor),
    protein: Math.round(product.per100g.protein * factor * 10) / 10,
    fat: Math.round(product.per100g.fat * factor * 10) / 10,
    carbs: Math.round(product.per100g.carbs * factor * 10) / 10,
  }
}

export function calcDayMacros(dayData, products) {
  const totals = { kcal: 0, protein: 0, fat: 0, carbs: 0 }
  for (const mealItems of Object.values(dayData.meals)) {
    for (const item of mealItems) {
      const product = products.find(p => p.id === item.productId)
      if (!product) continue
      const m = calcMacros(product, item.serving)
      totals.kcal += m.kcal
      totals.protein += m.protein
      totals.fat += m.fat
      totals.carbs += m.carbs
    }
  }
  return {
    kcal: Math.round(totals.kcal),
    protein: Math.round(totals.protein * 10) / 10,
    fat: Math.round(totals.fat * 10) / 10,
    carbs: Math.round(totals.carbs * 10) / 10,
  }
}

export function calcMealMacros(items, products) {
  const totals = { kcal: 0, protein: 0, fat: 0, carbs: 0 }
  for (const item of items) {
    const product = products.find(p => p.id === item.productId)
    if (!product) continue
    const m = calcMacros(product, item.serving)
    totals.kcal += m.kcal
    totals.protein += m.protein
    totals.fat += m.fat
    totals.carbs += m.carbs
  }
  return {
    kcal: Math.round(totals.kcal),
    protein: Math.round(totals.protein * 10) / 10,
    fat: Math.round(totals.fat * 10) / 10,
    carbs: Math.round(totals.carbs * 10) / 10,
  }
}

export function getBarColor(current, target) {
  if (!target) return 'bg-zinc-600'
  const ratio = current / target
  if (ratio > 1.1) return 'bg-red-500'
  if (ratio >= 0.9) return 'bg-emerald-400'
  return 'bg-amber-400'
}

export function getMacroTextColor(current, target) {
  if (!target) return 'text-zinc-400'
  const ratio = current / target
  if (ratio > 1.1) return 'text-red-400'
  if (ratio >= 0.9) return 'text-emerald-400'
  return 'text-amber-400'
}
