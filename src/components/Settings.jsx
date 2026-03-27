import { useState } from 'react'
import { useMealPlan } from '../hooks/useMealPlan'
import { useCustomProducts } from '../hooks/useCustomProducts'
import CustomProductForm from './CustomProductForm'

function NumberInput({ label, value, onChange, unit, placeholder }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0">
      <label className="text-sm font-medium text-zinc-200">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value ?? ''}
          onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
          placeholder={placeholder}
          className="w-24 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100 text-right focus:outline-none focus:border-amber-400 transition-colors"
        />
        <span className="text-sm text-zinc-500 w-8">{unit}</span>
      </div>
    </div>
  )
}

export default function Settings() {
  const { state, dispatch } = useMealPlan()
  const { settings } = state
  const [showReset, setShowReset] = useState(false)

  function updateSetting(key, value) {
    dispatch({ type: 'SET_SETTINGS', payload: { [key]: value } })
  }

  function handleReset() {
    dispatch({ type: 'RESET_ALL' })
    setShowReset(false)
  }

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="sticky top-0 z-10 bg-zinc-950 border-b border-zinc-800 px-4 py-3">
        <h2 className="font-semibold text-zinc-100">Setări</h2>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Targets */}
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-1">
            Ținte zilnice
          </h3>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4">
            <NumberInput label="Calorii" value={settings.calorieTarget} onChange={v => updateSetting('calorieTarget', v)} unit="kcal" placeholder="1400" />
            <NumberInput label="Proteine" value={settings.proteinTarget} onChange={v => updateSetting('proteinTarget', v)} unit="g" placeholder="100" />
            <NumberInput label="Grăsimi (opțional)" value={settings.fatTarget} onChange={v => updateSetting('fatTarget', v)} unit="g" placeholder="—" />
            <NumberInput label="Carbohidrați (opțional)" value={settings.carbTarget} onChange={v => updateSetting('carbTarget', v)} unit="g" placeholder="—" />
          </div>
        </div>

        {/* Custom products */}
        <CustomProductsSection />

        {/* Export/Import */}
        <ExportImportSection />

        {/* Danger zone */}
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-1">
            Pericol
          </h3>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            {!showReset ? (
              <button
                onClick={() => setShowReset(true)}
                className="w-full py-2.5 border border-red-500/40 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/10 transition-colors"
              >
                Resetează tot planul
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-zinc-300 text-center">Ești sigur? Se șterg toate datele.</p>
                <div className="flex gap-2">
                  <button onClick={() => setShowReset(false)} className="flex-1 py-2.5 bg-zinc-800 text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors">
                    Anulează
                  </button>
                  <button onClick={handleReset} className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
                    Șterge tot
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-center text-xs text-zinc-600 pb-2">
          <p>Datele sunt salvate local în browser.</p>
          <p className="mt-1">Prețuri în RON · Produse Lidl România 2025/2026</p>
        </div>
      </div>
    </div>
  )
}

function CustomProductsSection() {
  const { customProducts, addCustomProduct, deleteCustomProduct } = useCustomProducts()
  const [editingProduct, setEditingProduct] = useState(null)
  const [showForm, setShowForm] = useState(false)

  function handleSave(product) {
    addCustomProduct(product)
    setShowForm(false)
    setEditingProduct(null)
  }

  function handleEdit(product) {
    setEditingProduct(product)
    setShowForm(true)
  }

  function handleDelete(id, name) {
    if (confirm(`Ștergi "${name}"? Produsul dispare din picker, dar rămâne în mesele deja planificate.`)) {
      deleteCustomProduct(id)
    }
  }

  return (
    <>
      <div>
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-1">
          Produse custom
        </h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {customProducts.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-5 px-4">
              Nu ai produse custom. Adaugă produse din alte magazine sau rețete proprii.
            </p>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {customProducts.map(p => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-zinc-200 truncate">{p.name}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      {p.per100g.kcal} kcal · {p.per100g.protein}g P /100g
                      {p.price > 0 && ` · ${p.price.toFixed(2)} lei/${p.priceUnit}`}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(p)}
                      className="p-1.5 text-zinc-500 hover:text-amber-400 hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                        <polyline points="3,6 5,6 21,6" />
                        <path d="M19,6l-1,14a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2L5,6" />
                        <path d="M10,11v6M14,11v6" />
                        <path d="M9,6V4a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1V6" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="px-4 py-3 border-t border-zinc-800/60">
            <button
              onClick={() => { setEditingProduct(null); setShowForm(true) }}
              className="w-full py-2 border border-dashed border-zinc-700 text-zinc-500 rounded-lg text-sm hover:border-amber-400/50 hover:text-amber-400 transition-colors"
            >
              + Adaugă produs custom
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <CustomProductForm
          existing={editingProduct}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingProduct(null) }}
        />
      )}
    </>
  )
}

function ExportImportSection() {
  const { state, dispatch } = useMealPlan()
  const { customProducts, mergeCustomProducts } = useCustomProducts()
  const [importText, setImportText] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [shareUrl, setShareUrl] = useState(null)
  const [copied, setCopied] = useState(false)
  const [importError, setImportError] = useState('')

  function buildExportData() {
    return { ...state, customProducts }
  }

  async function handleCopyJson() {
    const json = JSON.stringify(buildExportData(), null, 2)
    await navigator.clipboard.writeText(json)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownloadJson() {
    const json = JSON.stringify(buildExportData(), null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `meal-plan-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleShareLink() {
    const { createShareLink } = await import('../utils/shareLink')
    const url = createShareLink(buildExportData())
    if (url) {
      setShareUrl(url)
      await navigator.clipboard.writeText(url)
    } else {
      alert('Planul e prea mare pentru un link. Descarcă JSON în schimb.')
    }
  }

  function handleImport() {
    setImportError('')
    try {
      const parsed = JSON.parse(importText)
      if (!parsed.plan || !parsed.settings) {
        setImportError('Format invalid — asigură-te că ai copiat tot JSON-ul.')
        return
      }
      dispatch({ type: 'LOAD_PLAN', payload: parsed })
      if (parsed.customProducts?.length) {
        mergeCustomProducts(parsed.customProducts)
      }
      setShowImport(false)
      setImportText('')
    } catch {
      setImportError('JSON invalid. Verifică formatul.')
    }
  }

  function handleFileImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => { setImportText(ev.target.result); setShowImport(true) }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div>
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-1">
        Export / Import
      </h3>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button onClick={handleCopyJson} className="py-2.5 bg-zinc-800 text-zinc-200 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors">
            {copied ? 'Copiat!' : 'Copiază JSON'}
          </button>
          <button onClick={handleDownloadJson} className="py-2.5 bg-zinc-800 text-zinc-200 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors">
            Descarcă JSON
          </button>
        </div>
        <button onClick={handleShareLink} className="w-full py-2.5 bg-zinc-800 text-zinc-200 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors">
          Generează link de partajare
        </button>
        {shareUrl && (
          <div className="bg-zinc-800 rounded-lg px-3 py-2">
            <p className="text-xs text-emerald-400 mb-1">Link copiat în clipboard!</p>
            <p className="text-xs text-zinc-500 break-all">{shareUrl.slice(0, 80)}…</p>
          </div>
        )}

        <div className="border-t border-zinc-800 pt-2">
          <div className="flex gap-2">
            <button onClick={() => setShowImport(!showImport)} className="flex-1 py-2.5 bg-zinc-800 text-zinc-200 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors">
              Importă JSON
            </button>
            <label className="flex-1 py-2.5 bg-zinc-800 text-zinc-200 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors text-center cursor-pointer">
              Deschide fișier
              <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
            </label>
          </div>

          {showImport && (
            <div className="mt-2 space-y-2">
              <textarea
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder="Lipește JSON-ul planului aici..."
                rows={5}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-300 font-mono focus:outline-none focus:border-amber-400 resize-none"
              />
              {importError && <p className="text-xs text-red-400">{importError}</p>}
              <button onClick={handleImport} className="w-full py-2.5 bg-amber-400 text-zinc-950 rounded-lg text-sm font-semibold hover:bg-amber-300 transition-colors">
                Importă planul
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
