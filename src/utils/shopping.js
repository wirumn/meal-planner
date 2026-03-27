export function generateShoppingList(plan, products) {
  const quantities = {}

  for (const dayData of Object.values(plan)) {
    for (const mealItems of Object.values(dayData.meals)) {
      for (const item of mealItems) {
        if (item.free) continue
        quantities[item.productId] = (quantities[item.productId] || 0) + item.serving
      }
    }
  }

  const categoryMap = {}
  const CATEGORY_LABELS = {
    'lactate': 'Lactate',
    'bauturi-proteice': 'Băuturi Proteice',
    'carne': 'Carne',
    'peste': 'Pește',
    'panificatie': 'Panificație',
    'legume': 'Legume',
    'fructe': 'Fructe',
    'conserve': 'Conserve & Paste',
    'condimente': 'Condimente',
  }

  for (const [productId, totalGrams] of Object.entries(quantities)) {
    const product = products.find(p => p.id === productId)
    if (!product) continue

    const packagesNeeded = Math.ceil(totalGrams / product.packageSize)
    const totalPrice = packagesNeeded * product.price

    const category = product.category
    if (!categoryMap[category]) {
      categoryMap[category] = {
        label: CATEGORY_LABELS[category] || category,
        items: [],
      }
    }

    categoryMap[category].items.push({
      product,
      totalGrams,
      packagesNeeded,
      totalPrice,
    })
  }

  return categoryMap
}

export function calcShoppingTotal(shoppingList, checkedItems) {
  let total = 0
  for (const { items } of Object.values(shoppingList)) {
    for (const entry of items) {
      if (!checkedItems[entry.product.id]) {
        total += entry.totalPrice
      }
    }
  }
  return Math.round(total * 100) / 100
}
