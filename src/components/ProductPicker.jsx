import { useState, useEffect, useRef } from 'react'
import { useCustomProducts } from '../hooks/useCustomProducts'
import CustomProductForm from './CustomProductForm'

const CATEGORIES = [
  { id: 'all',              label: 'Toate'      },
  { id: 'lactate',          label: 'Lactate'    },
  { id: 'bauturi-proteice', label: 'Proteice'   },
  { id: 'carne',            label: 'Carne'      },
  { id: 'peste',            label: 'Pește'      },
  { id: 'panificatie',      label: 'Pâine'      },
  { id: 'legume',           label: 'Legume'     },
  { id: 'fructe',           label: 'Fructe'     },
  { id: 'conserve',         label: 'Conserve'   },
  { id: 'condimente',       label: 'Condimente' },
  { id: 'altele',           label: 'Altele'     },
]

const FORM_CATEGORIES = CATEGORIES.filter(c => c.id !== 'all')

function slugify(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function guessCategory(tags = []) {
  const s = tags.join(' ')
  if (s.includes('dairy') || s.includes('yogurt') || s.includes('milk') || s.includes('cheese')) return 'lactate'
  if (s.includes('meat') || s.includes('chicken') || s.includes('beef') || s.includes('pork')) return 'carne'
  if (s.includes('fish') || s.includes('tuna') || s.includes('seafood') || s.includes('salmon')) return 'peste'
  if (s.includes('bread') || s.includes('pasta') || s.includes('cereal') || s.includes('bakery')) return 'panificatie'
  if (s.includes('vegetable') || s.includes('legume')) return 'legume'
  if (s.includes('fruit')) return 'fructe'
  if (s.includes('canned') || s.includes('conserve') || s.includes('preserve')) return 'conserve'
  if (s.includes('drink') || s.includes('protein') || s.includes('sport') || s.includes('whey')) return 'bauturi-proteice'
  if (s.includes('sauce') || s.includes('spice') || s.includes('oil') || s.includes('condiment')) return 'condimente'
  return 'altele'
}

async function searchOFF(query, onlyLidl) {
  const cacheKey = `off-cache-${query}-${onlyLidl}`
  try {
    const cached = sessionStorage.getItem(cacheKey)
    if (cached) return JSON.parse(cached)
  } catch {}

  const params = new URLSearchParams({
    search_terms: query,
    fields: 'code,product_name,brands,nutriments,image_front_small_url,categories_tags,quantity',
    page_size: '20',
    json: '1',
  })
  if (onlyLidl) params.set('stores_tags', 'lidl')

  const res = await fetch(`https://world.openfoodfacts.org/api/v2/search?${params}`)
  if (!res.ok) throw new Error('OFF error')
  const data = await res.json()

  const products = (data.products || [])
    .map(p => ({
      code: p.code || '',
      name: p.product_name || '',
      brand: p.brands || '',
      kcal: p.nutriments?.['energy-kcal_100g'] ?? null,
      protein: p.nutriments?.proteins_100g ?? null,
      fat: p.nutriments?.fat_100g ?? null,
      carbs: p.nutriments?.carbohydrates_100g ?? null,
      image: p.image_front_small_url || null,
      quantity: p.quantity || '',
      categories: p.categories_tags || [],
    }))
    .filter(p => p.name)

  try { sessionStorage.setItem(cacheKey, JSON.stringify(products)) } catch {}
  return products
}

export default function ProductPicker({ onAdd, onClose }) {
  const { allProducts, addCustomProduct } = useCustomProducts()
  const [activeTab, setActiveTab] = useState('local')

  // Local tab state
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [serving, setServing] = useState('')
  const [showCustomForm, setShowCustomForm] = useState(false)
  const searchRef = useRef(null)

  // Online tab state
  const [offQuery, setOffQuery] = useState('')
  const [onlyLidl, setOnlyLidl] = useState(false)
  const [offResults, setOffResults] = useState([])
  const [offLoading, setOffLoading] = useState(false)
  const [offError, setOffError] = useState('')
  const [offEditData, setOffEditData] = useState(null)
  const [offForm, setOffForm] = useState(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (activeTab === 'local') searchRef.current?.focus()
  }, [activeTab])

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
    setActiveTab('local')
  }

  function runOFFSearch(query, lidlOnly) {
    clearTimeout(debounceRef.current)
    setOffError('')
    if (!query.trim()) { setOffResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setOffLoading(true)
      try {
        const results = await searchOFF(query.trim(), lidlOnly)
        setOffResults(results)
      } catch {
        setOffError('Eroare la căutare. Verifică conexiunea.')
        setOffResults([])
      } finally {
        setOffLoading(false)
      }
    }, 300)
  }

  function handleOffQueryChange(value) {
    setOffQuery(value)
    runOFFSearch(value, onlyLidl)
  }

  function handleLidlToggle(checked) {
    setOnlyLidl(checked)
    runOFFSearch(offQuery, checked)
  }

  function selectOFFProduct(offProd) {
    setOffEditData(offProd)
    setOffForm({
      name: offProd.name,
      brand: offProd.brand,
      category: guessCategory(offProd.categories),
      kcal: offProd.kcal !== null ? String(Math.round(offProd.kcal)) : '',
      protein: offProd.protein !== null ? String(Math.round(offProd.protein * 10) / 10) : '',
      fat: offProd.fat !== null ? String(Math.round(offProd.fat * 10) / 10) : '',
      carbs: offProd.carbs !== null ? String(Math.round(offProd.carbs * 10) / 10) : '',
      price: '',
      defaultServing: '100',
    })
  }

  function buildProductFromOffForm() {
    const id = offEditData?.code
      ? `custom-off-${offEditData.code}`
      : `custom-${slugify(offForm.name)}-${Date.now()}`
    return {
      id,
      name: offForm.name.trim(),
      brand: offForm.brand.trim() || 'Open Food Facts',
      category: offForm.category,
      per100g: {
        kcal: Number(offForm.kcal) || 0,
        protein: Number(offForm.protein) || 0,
        fat: Number(offForm.fat) || 0,
        carbs: Number(offForm.carbs) || 0,
      },
      defaultServing: Number(offForm.defaultServing) || 100,
      unit: 'g',
      price: Number(offForm.price) || 0,
      priceUnit: '100g',
      packageSize: 100,
      tags: [],
      isCustom: true,
      source: 'openfoodfacts',
      offCode: offEditData?.code || '',
    }
  }

  function handleOFFSaveAndAdd() {
    const product = buildProductFromOffForm()
    addCustomProduct(product)
    onAdd(product.id, product.defaultServing)
  }

  function handleOFFSaveOnly() {
    const product = buildProductFromOffForm()
    addCustomProduct(product)
    setOffEditData(null)
    setOffForm(null)
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

        {/* Tab bar */}
        <div className="flex shrink-0 border-b border-zinc-800 bg-zinc-900">
          {[
            { id: 'local', label: '📦 Locale' },
            { id: 'online', label: '🔍 Online' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setOffEditData(null); setOffForm(null) }}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'text-amber-400 border-amber-400'
                  : 'text-zinc-500 border-transparent hover:text-zinc-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            onClick={() => setShowCustomForm(true)}
            className="flex-1 py-2.5 text-sm font-medium text-zinc-500 border-b-2 border-transparent hover:text-amber-400 transition-colors"
          >
            ➕ Custom
          </button>
        </div>

        {activeTab === 'local' ? (
          <>
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
                <div className="flex items-center justify-center h-32 text-zinc-500 text-sm">
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
                          <span className="text-sm font-medium text-zinc-100 truncate">{product.name}</span>
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
            </div>

            {/* Add panel */}
            {selectedProduct && (
              <div className="border-t border-zinc-800 bg-zinc-900 p-4 shrink-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-zinc-100 truncate">{selectedProduct.name}</span>
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
          </>
        ) : (
          /* Online tab */
          <div className="flex-1 flex flex-col min-h-0">
            {offEditData ? (
              <OFFEditView
                form={offForm}
                setForm={setOffForm}
                formCategories={FORM_CATEGORIES}
                image={offEditData.image}
                onBack={() => { setOffEditData(null); setOffForm(null) }}
                onSaveAndAdd={handleOFFSaveAndAdd}
                onSaveOnly={handleOFFSaveOnly}
              />
            ) : (
              <OFFSearchView
                query={offQuery}
                onQueryChange={handleOffQueryChange}
                onlyLidl={onlyLidl}
                onLidlToggle={handleLidlToggle}
                results={offResults}
                loading={offLoading}
                error={offError}
                onSelect={selectOFFProduct}
              />
            )}
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

function OFFSearchView({ query, onQueryChange, onlyLidl, onLidlToggle, results, loading, error, onSelect }) {
  return (
    <>
      <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900 shrink-0">
        <div className="relative">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            placeholder="Caută pe Open Food Facts..."
            autoFocus
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>
        <label className="flex items-center gap-2 mt-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyLidl}
            onChange={e => onLidlToggle(e.target.checked)}
            className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-amber-400"
          />
          <span className="text-xs text-zinc-400">Doar Lidl</span>
        </label>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-zinc-600 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32 text-red-400 text-sm px-4 text-center">{error}</div>
        ) : !query.trim() ? (
          <div className="flex flex-col items-center justify-center h-48 text-zinc-600 text-sm px-6 text-center">
            <span className="text-3xl mb-3">🔍</span>
            <span className="text-zinc-500">Caută produse cu valori nutriționale</span>
            <span className="text-xs mt-1">Filtrat pentru România · Open Food Facts</span>
          </div>
        ) : results.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-zinc-500 text-sm">
            Niciun rezultat
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {results.map((p, i) => {
              const incomplete = p.kcal === null || p.protein === null
              return (
                <button
                  key={p.code || i}
                  onClick={() => onSelect(p)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-800/50 transition-colors"
                >
                  {p.image ? (
                    <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-zinc-800 shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 shrink-0 flex items-center justify-center text-zinc-600 text-lg">
                      🛒
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-zinc-100 truncate">{p.name}</span>
                      {incomplete && <span className="shrink-0 text-xs text-amber-500" title="Date incomplete">⚠️</span>}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5 truncate">
                      {p.brand && `${p.brand} · `}
                      {p.kcal !== null ? `${Math.round(p.kcal)} kcal` : '— kcal'}
                      {' · '}
                      {p.protein !== null ? `${p.protein}g P` : '— P'}
                      {' /100g'}
                    </div>
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-zinc-600 shrink-0">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              )
            })}
          </div>
        )}
        {results.length > 0 && (
          <div className="py-3 text-center text-xs text-zinc-700">
            Sursă: Open Food Facts · Licență ODbL
          </div>
        )}
      </div>
    </>
  )
}

function OFFEditView({ form, setForm, formCategories, image, onBack, onSaveAndAdd, onSaveOnly }) {
  const [errors, setErrors] = useState({})

  function set(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  function validate() {
    const errs = {}
    if (!form?.name?.trim()) errs.name = 'Necesar'
    if (!form?.kcal || isNaN(Number(form.kcal))) errs.kcal = 'Necesar'
    if (!form?.protein || isNaN(Number(form.protein))) errs.protein = 'Necesar'
    return errs
  }

  function doSaveAndAdd() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSaveAndAdd()
  }

  function doSaveOnly() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSaveOnly()
  }

  if (!form) return null

  const inp = (hasErr) =>
    `w-full bg-zinc-800 border rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors ${
      hasErr ? 'border-red-500' : 'border-zinc-700 focus:border-amber-400'
    }`

  return (
    <>
      <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/60 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors py-1"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Înapoi la rezultate
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {image && (
          <img src={image} alt="" className="w-16 h-16 rounded-xl object-cover bg-zinc-800 mx-auto block" />
        )}

        <div>
          <label className="text-xs font-medium text-zinc-400 block mb-1">Nume produs *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            className={inp(errors.name)}
          />
          {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-1">Brand</label>
            <input
              type="text"
              value={form.brand}
              onChange={e => set('brand', e.target.value)}
              className={inp(false)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-1">Categorie</label>
            <select
              value={form.category}
              onChange={e => set('category', e.target.value)}
              className={inp(false)}
            >
              {formCategories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-400 block mb-2">Valori nutriționale / 100g</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'kcal',    label: 'Calorii (kcal) *' },
              { key: 'protein', label: 'Proteine (g) *'   },
              { key: 'fat',     label: 'Grăsimi (g)'      },
              { key: 'carbs',   label: 'Carbohidrați (g)' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-xs text-zinc-500 block mb-1">{label}</label>
                <input
                  type="number"
                  value={form[key] ?? ''}
                  onChange={e => set(key, e.target.value)}
                  placeholder="0"
                  className={`w-full bg-zinc-800 border rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none transition-colors ${
                    errors[key] ? 'border-red-500' : 'border-zinc-700 focus:border-amber-400'
                  }`}
                />
                {errors[key] && <p className="text-xs text-red-400 mt-0.5">{errors[key]}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-1">Preț (lei, opțional)</label>
            <input
              type="number"
              value={form.price}
              onChange={e => set('price', e.target.value)}
              placeholder="0.00"
              className={inp(false)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-1">Porție implicită (g)</label>
            <input
              type="number"
              value={form.defaultServing}
              onChange={e => set('defaultServing', e.target.value)}
              placeholder="100"
              className={inp(false)}
            />
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-zinc-800 bg-zinc-900 space-y-2 shrink-0">
        <button
          onClick={doSaveAndAdd}
          className="w-full py-3 bg-amber-400 text-zinc-950 rounded-xl font-semibold text-sm hover:bg-amber-300 transition-colors active:scale-95"
        >
          Salvează și adaugă la masă
        </button>
        <button
          onClick={doSaveOnly}
          className="w-full py-2.5 bg-zinc-800 text-zinc-200 rounded-xl text-sm font-medium hover:bg-zinc-700 transition-colors"
        >
          Doar salvează în produse custom
        </button>
      </div>
    </>
  )
}
