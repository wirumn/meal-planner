import { useState } from 'react'

const CATEGORIES = [
  { id: 'lactate', label: 'Lactate' },
  { id: 'bauturi-proteice', label: 'Băuturi Proteice' },
  { id: 'carne', label: 'Carne' },
  { id: 'peste', label: 'Pește' },
  { id: 'panificatie', label: 'Panificație' },
  { id: 'legume', label: 'Legume' },
  { id: 'fructe', label: 'Fructe' },
  { id: 'conserve', label: 'Conserve & Paste' },
  { id: 'condimente', label: 'Condimente' },
  { id: 'altele', label: 'Altele' },
]

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-zinc-400 block mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}

const inputCls = (error) =>
  `w-full bg-zinc-800 border rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors ${
    error ? 'border-red-500' : 'border-zinc-700 focus:border-amber-400'
  }`

export default function CustomProductForm({ existing, onSave, onClose }) {
  const [form, setForm] = useState({
    name: existing?.name ?? '',
    category: existing?.category ?? 'lactate',
    kcal: existing?.per100g?.kcal ?? '',
    protein: existing?.per100g?.protein ?? '',
    fat: existing?.per100g?.fat ?? '',
    carbs: existing?.per100g?.carbs ?? '',
    price: existing?.price ?? '',
    packageSize: existing?.packageSize ?? '',
    packageUnit: 'g',
    defaultServing: existing?.defaultServing ?? 100,
  })
  const [errors, setErrors] = useState({})

  function set(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Necesar'
    if (form.kcal === '' || isNaN(Number(form.kcal))) errs.kcal = 'Necesar'
    if (form.protein === '' || isNaN(Number(form.protein))) errs.protein = 'Necesar'
    return errs
  }

  function handleSave() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const packageSizeNum = Number(form.packageSize) || 100
    const id = existing?.id || `custom-${slugify(form.name)}`

    onSave({
      id,
      name: form.name.trim(),
      brand: 'Custom',
      category: form.category,
      per100g: {
        kcal: Number(form.kcal),
        protein: Number(form.protein),
        fat: Number(form.fat) || 0,
        carbs: Number(form.carbs) || 0,
      },
      defaultServing: Number(form.defaultServing) || 100,
      unit: 'g',
      price: Number(form.price) || 0,
      priceUnit: `${packageSizeNum}${form.packageUnit}`,
      packageSize: packageSizeNum,
      tags: [],
      isCustom: true,
    })
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-zinc-950 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-900">
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
        <h2 className="font-semibold text-zinc-100">
          {existing ? 'Editează produs' : 'Produs nou'}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <Field label="Nume produs *" error={errors.name}>
          <input
            type="text"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="ex. Iaurt Zuzu 2%"
            className={inputCls(errors.name)}
            autoFocus
          />
        </Field>

        <Field label="Categorie">
          <select
            value={form.category}
            onChange={e => set('category', e.target.value)}
            className={inputCls(false)}
          >
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </Field>

        <div>
          <label className="text-xs font-medium text-zinc-400 block mb-2">
            Valori nutriționale / 100g
          </label>
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
                  value={form[key]}
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
          <Field label="Preț (lei)">
            <input
              type="number"
              value={form.price}
              onChange={e => set('price', e.target.value)}
              placeholder="0.00"
              className={inputCls(false)}
            />
          </Field>
          <Field label="Porție implicită (g)">
            <input
              type="number"
              value={form.defaultServing}
              onChange={e => set('defaultServing', e.target.value)}
              placeholder="100"
              className={inputCls(false)}
            />
          </Field>
        </div>

        <Field label="Gramaj pachet">
          <div className="flex gap-2">
            <input
              type="number"
              value={form.packageSize}
              onChange={e => set('packageSize', e.target.value)}
              placeholder="ex. 450"
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400 transition-colors"
            />
            <select
              value={form.packageUnit}
              onChange={e => set('packageUnit', e.target.value)}
              className="w-20 bg-zinc-800 border border-zinc-700 rounded-xl px-2 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400 transition-colors"
            >
              <option value="g">g</option>
              <option value="ml">ml</option>
              <option value="kg">kg</option>
              <option value="buc">buc</option>
            </select>
          </div>
        </Field>
      </div>

      <div className="p-4 border-t border-zinc-800 bg-zinc-900">
        <button
          onClick={handleSave}
          className="w-full py-3 bg-amber-400 text-zinc-950 rounded-xl font-semibold text-sm hover:bg-amber-300 transition-colors active:scale-95"
        >
          {existing ? 'Salvează modificările' : 'Adaugă produs'}
        </button>
      </div>
    </div>
  )
}
