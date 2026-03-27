import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import builtinProducts from '../data/products.json'

const CUSTOM_PRODUCTS_KEY = 'meal-planner-custom-products'
const CustomProductsContext = createContext(null)

export function CustomProductsProvider({ children }) {
  const [customProducts, setCustomProducts] = useState(() => {
    try {
      const stored = localStorage.getItem(CUSTOM_PRODUCTS_KEY)
      return stored ? JSON.parse(stored) : []
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(customProducts))
  }, [customProducts])

  const allProducts = useMemo(
    () => [...builtinProducts, ...customProducts],
    [customProducts]
  )

  function addCustomProduct(product) {
    setCustomProducts(prev => {
      const idx = prev.findIndex(p => p.id === product.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = product
        return next
      }
      return [...prev, product]
    })
  }

  function deleteCustomProduct(id) {
    setCustomProducts(prev => prev.filter(p => p.id !== id))
  }

  function mergeCustomProducts(incoming) {
    if (!Array.isArray(incoming)) return
    setCustomProducts(prev => {
      const merged = [...prev]
      for (const p of incoming) {
        if (!merged.some(m => m.id === p.id)) merged.push(p)
      }
      return merged
    })
  }

  return (
    <CustomProductsContext.Provider value={{ customProducts, allProducts, addCustomProduct, deleteCustomProduct, mergeCustomProducts }}>
      {children}
    </CustomProductsContext.Provider>
  )
}

export function useCustomProducts() {
  const ctx = useContext(CustomProductsContext)
  if (!ctx) throw new Error('useCustomProducts must be used within CustomProductsProvider')
  return ctx
}
