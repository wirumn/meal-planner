import { useState, useEffect, useRef } from 'react'
import { useCustomProducts } from '../hooks/useCustomProducts'
import CustomProductForm from './CustomProductForm'

const CATEGORIES = [
  { id: 'all',              label: 'Toate'       },
  { id: 'lactate',          label: 'Lactate'     },
  { id: 'bauturi-proteice', label: 'Proteice'    },
  { id: 'carne',            label: 'Carne'       },
  { id: 'mezeluri',         label: 'Mezeluri'    },
  { id: 'peste',            label: 'Pește'       },
  { id: 'vegetale',         label: 'Vegetale'    },
  { id: 'panificatie',      label: 'Panificație' },
  { id: 'paste',            label: 'Paste & Orez'},
  { id: 'conserve',         label: 'Conserve'    },
  { id: 'legume',           label: 'Legume'      },
  { id: 'fructe',           label: 'Fructe'      },
  { id: 'condimente',       label: 'Condimente'  },
  { id: 'snacks',           label: 'Snacks'      },
  { id: 'cereale',          label: 'Cereale'     },
  { id: 'bacanie',          label: 'Băcănie'     },
  { id: 'bauturi',          label: 'Băuturi'     },
  { id: 'congelate',        label: 'Congelate'   },
  { id: 'ready-meals',      label: 'Ready Meals' },
  { id: 'altele',           label: 'Altele'      },
]

export default function ProductPicker({ onAdd, onClose }) {
  const { allProducts, addCustomProduct } = useCustomProducts()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [serving, setServing] = useState('')
  const [showCustomForm, setShowCustomForm] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => { searchRef.current?.focus() }, [])
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const filtered = allProducts.filter(p => {
    const matchesSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === 'all' || p.category === category
    return matchesSearch && matchesCategory
  })

  function handleSelect(product) {
    setSelectedProduct(product)
    setServing(String(product.defaultServing))
  }

  function handleAdd() {
    if (!selectedProduct) return
    const val = parseInt(serving, 10)
    if (isNaN(val) || val <= 0) return
    onAdd(selectedProduct.id, val)
  }

  function handleSaveCustom(product) {
    addCustomProduct(product)
    setShowCustomForm(false)
    setSelectedProduct(product)
    setServing(String(product.defaultServing))
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-900 shrink-0">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
          <h2 className="font-semibold text-zinc-100">Adaugă produs</h2>
        </div>

        {/* Search + categories */}
        <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900 shrink-0">
          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Caută produs..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-0.5">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  category === cat.id
                    ? 'bg-amber-400 text-zinc-950'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-zinc-500 text-sm">
              Niciun produs găsit
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/50">
              {filtered.map(product => (
                <button
                  key={product.id}
                  onClick={() => handleSelect(product)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                    selectedProduct?.id === product.id
                      ? 'bg-amber-400/10 border-l-2 border-amber-400'
                      : 'hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-zinc-100 truncate">
                        {product.name}
                      </span>
                      {product.isCustom && (
                        <span className="shrink-0 text-xs bg-amber-400/15 text-amber-400 px-1.5 py-0.5 rounded font-medium">
                          custom
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-zinc-500">{product.brand}</span>
                      <span className="text-xs text-zinc-600">·</span>
                      <span className="text-xs text-zinc-500">{product.per100g.kcal} kcal</span>
                      <span className="text-xs text-blue-400 font-medium">{product.per100g.protein}g P</span>
                      <span className="text-xs text-zinc-500">/100g</span>
                    </div>
                  </div>
                  <div className="ml-3 text-right shrink-0">
                    <div className="text-sm font-semibold text-amber-400">
                      {product.price > 0 ? `${product.price.toFixed(2)} lei` : '—'}
                    </div>
                    <div className="text-xs text-zinc-500">{product.priceUnit}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Add custom product button */}
          <button
            onClick={() => setShowCustomForm(true)}
            className="w-full flex items-center justify-center gap-2 py-4 text-sm text-zinc-500 hover:text-amber-400 hover:bg-zinc-800/30 transition-colors border-t border-zinc-800/60"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Produs custom
          </button>
        </div>

        {/* Add panel */}
        {selectedProduct && (
          <div className="border-t border-zinc-800 bg-zinc-900 p-4 shrink-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-zinc-100 truncate">
                    {selectedProduct.name}
                  </span>
                  {selectedProduct.isCustom && (
                    <span className="text-xs bg-amber-400/15 text-amber-400 px-1.5 py-0.5 rounded font-medium shrink-0">
                      custom
                    </span>
                  )}
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  {Math.round(selectedProduct.per100g.kcal * parseInt(serving || 0) / 100)} kcal ·{' '}
                  {Math.round(selectedProduct.per100g.protein * parseInt(serving || 0) / 100 * 10) / 10}g proteină
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="number"
                  value={serving}
                  onChange={e => setServing(e.target.value)}
                  className="w-20 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-zinc-100 text-center focus:outline-none focus:border-amber-400"
                />
                <span className="text-sm text-zinc-400">g</span>
              </div>
            </div>
            <button
              onClick={handleAdd}
              className="w-full py-3 bg-amber-400 text-zinc-950 rounded-xl font-semibold text-sm hover:bg-amber-300 transition-colors active:scale-95"
            >
              Adaugă la masă
            </button>
          </div>
        )}
      </div>

      {showCustomForm && (
        <CustomProductForm
          onSave={handleSaveCustom}
          onClose={() => setShowCustomForm(false)}
        />
      )}
    </>
  )
}
