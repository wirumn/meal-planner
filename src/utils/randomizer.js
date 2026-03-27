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

function scaleItems(items, factor) {
  return items.map(item => ({
    ...item,
    serving: Math.max(10, Math.round(item.serving * factor)),
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

  // pranzPool is filtered by location — birou gets birou templates, acasa gets acasa templates
  const pranzPool = valid.filter(t => t.type === 'pranz' && matchesLocation(t))
  const cinaPool  = valid.filter(t => t.type === 'cina'  && matchesProtein(t) && matchesLocation(t))
  const snackPool = valid.filter(t => t.type === 'snack' && matchesLocation(t))

  // More snacks for higher calorie targets
  const snackCount = targetKcal > 2000 ? 3 : targetKcal > 1600 ? 2 : 1

  let bestResult = null
  let bestScore = Infinity
  const triedCina = new Set()

  for (let attempt = 0; attempt < 5; attempt++) {
    const available = cinaPool.filter(t => !triedCina.has(t.id))
    const cinaTemplate = available.length ? randomPick(available) : randomPick(cinaPool)
    if (cinaTemplate) triedCina.add(cinaTemplate.id)

    const pranzTemplate = randomPick(pranzPool)

    // Pick unique snacks where possible
    const selectedSnacks = []
    const usedSnackIds = new Set()
    for (let s = 0; s < snackCount; s++) {
      const pool = snackPool.filter(t => !usedSnackIds.has(t.id))
      const snack = pool.length ? randomPick(pool) : randomPick(snackPool)
      if (snack) { selectedSnacks.push(snack); usedSnackIds.add(snack.id) }
    }

    // Build base meals with template-default servings
    const baseMeals = {}
    if (pranzTemplate) baseMeals['Prânz'] = templateToItems(pranzTemplate)
    if (cinaTemplate)  baseMeals['Cină']  = templateToItems(cinaTemplate)
    selectedSnacks.forEach((snack, i) => {
      baseMeals[i === 0 ? 'Snack' : `Snack ${i + 1}`] = templateToItems(snack)
    })

    // Scale all servings proportionally to hit the calorie target
    const baseMacros = calcTotalMacros(baseMeals, allProducts)
    const scaleFactor = (baseMacros.kcal > 0 && targetKcal)
      ? Math.max(0.65, Math.min(1.5, targetKcal / baseMacros.kcal))
      : 1

    const meals = {}
    for (const [name, items] of Object.entries(baseMeals)) {
      meals[name] = scaleItems(items, scaleFactor)
    }

    const macros = calcTotalMacros(meals, allProducts)
    const kcalDiff    = targetKcal    ? Math.abs(macros.kcal    - targetKcal)    / targetKcal    : 0
    const proteinDiff = targetProtein ? Math.abs(macros.protein - targetProtein) / targetProtein : 0
    const score = kcalDiff * 0.5 + proteinDiff * 0.5

    if (score < bestScore) {
      bestScore = score
      const templateNames = {}
      if (pranzTemplate) templateNames['Prânz'] = pranzTemplate.name || ''
      if (cinaTemplate)  templateNames['Cină']  = cinaTemplate.name || ''
      selectedSnacks.forEach((s, i) => {
        templateNames[i === 0 ? 'Snack' : `Snack ${i + 1}`] = s.name || ''
      })
      bestResult = { meals, macros, templateNames }
    }
  }

  return bestResult
}
