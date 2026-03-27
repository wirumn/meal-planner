import { calcMacros } from './macros'

function randomPick(arr) {
  if (!arr.length) return null
  return arr[Math.floor(Math.random() * arr.length)]
}

function isValidTemplate(template, allProducts) {
  return template.items.every(item => allProducts.some(p => p.id === item.productId))
}

function templateToItems(template) {
  return template.items.map(item => ({
    id: crypto.randomUUID(),
    productId: item.productId,
    serving: item.serving,
    free: item.free || false,
  }))
}

function calcTotalMacros(meals, allProducts) {
  const totals = { kcal: 0, protein: 0, fat: 0, carbs: 0 }
  for (const items of Object.values(meals)) {
    for (const item of items) {
      const product = allProducts.find(p => p.id === item.productId)
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

export function generateDay({ proteinType, location, targetKcal, targetProtein, allProducts, templates }) {
  const valid = templates.filter(t => isValidTemplate(t, allProducts))

  const matchesProtein = t =>
    proteinType === 'any' || t.proteinType.includes('any') || t.proteinType.includes(proteinType)
  const matchesLocation = t => t.location.includes(location)

  const pranzPool = valid.filter(t => t.type === 'pranz' && matchesLocation(t))
  const cinaPool  = valid.filter(t => t.type === 'cina'  && matchesProtein(t) && matchesLocation(t))
  const snackPool = valid.filter(t => t.type === 'snack' && matchesLocation(t))

  let bestResult = null
  let bestScore = Infinity
  const triedCina = new Set()

  for (let attempt = 0; attempt < 5; attempt++) {
    const available = cinaPool.filter(t => !triedCina.has(t.id))
    const cinaTemplate = available.length ? randomPick(available) : randomPick(cinaPool)
    if (cinaTemplate) triedCina.add(cinaTemplate.id)

    const snackTemplate = randomPick(snackPool)

    const pranzTemplate = location === 'birou' ? null : randomPick(pranzPool)
    const meals =
      location === 'birou'
        ? {
            'Cină':  cinaTemplate  ? templateToItems(cinaTemplate)  : [],
            'Snack': snackTemplate ? templateToItems(snackTemplate) : [],
          }
        : {
            'Prânz': pranzTemplate ? templateToItems(pranzTemplate) : [],
            'Cină':  cinaTemplate  ? templateToItems(cinaTemplate)  : [],
            'Snack': snackTemplate ? templateToItems(snackTemplate) : [],
          }

    const macros = calcTotalMacros(meals, allProducts)
    const kcalDiff    = targetKcal    ? Math.abs(macros.kcal     - targetKcal)    / targetKcal    : 0
    const proteinDiff = targetProtein ? Math.abs(macros.protein  - targetProtein) / targetProtein : 0
    const score = kcalDiff * 0.5 + proteinDiff * 0.5

    if (score < bestScore) {
      bestScore = score
      bestResult = {
        meals,
        macros,
        templateNames: {
          ...(location !== 'birou' && { 'Prânz': '' }),
          'Cină':  cinaTemplate?.name  || '',
          'Snack': snackTemplate?.name || '',
        },
      }
    }
  }

  return bestResult
}
