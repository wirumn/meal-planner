import { useState, useEffect } from 'react'
import { MealPlanProvider, useMealPlan, DAYS } from './hooks/useMealPlan'
import DaySelector from './components/DaySelector'
import MealCard from './components/MealCard'
import MacroBar from './components/MacroBar'
import ShoppingList from './components/ShoppingList'
import Settings from './components/Settings'
import TabBar from './components/TabBar'
import products from './data/products.json'
import { calcDayMacros } from './utils/macros'

function PlanView({ selectedDay, setSelectedDay }) {
  const { state, dispatch } = useMealPlan()
  const dayData = state.plan[selectedDay]
  const macros = calcDayMacros(dayData, products)
  const { calorieTarget, proteinTarget, fatTarget, carbTarget } = state.settings

  const [newMealName, setNewMealName] = useState('')
  const [showAddMeal, setShowAddMeal] = useState(false)

  function handleAddMeal() {
    const name = newMealName.trim()
    if (!name) return
    dispatch({ type: 'ADD_MEAL_SLOT', payload: { day: selectedDay, mealName: name } })
    setNewMealName('')
    setShowAddMeal(false)
  }

  // Total items count for the week
  const weekTotal = DAYS.reduce((acc, day) => {
    return acc + Object.values(state.plan[day].meals).reduce((a, m) => a + m.length, 0)
  }, 0)

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      {/* App header */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold text-zinc-100">
          Meal Planner
          {weekTotal > 0 && (
            <span className="ml-2 text-sm font-normal text-zinc-500">{weekTotal} produse</span>
          )}
        </h1>
      </div>

      <DaySelector
        days={DAYS}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
        plan={state.plan}
        settings={state.settings}
      />

      <div className="px-4 py-4">
        {/* Day header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-100">{selectedDay}</h2>
          <button
            onClick={() =>
              dispatch({
                type: 'SET_DAY_TYPE',
                payload: { day: selectedDay, dayType: dayData.type === 'office' ? 'home' : 'office' },
              })
            }
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
              dayData.type === 'office'
                ? 'border-blue-400 text-blue-400 bg-blue-400/10'
                : 'border-zinc-700 text-zinc-500 hover:border-zinc-500'
            }`}
          >
            {dayData.type === 'office' ? 'Birou' : 'Acasă'}
          </button>
        </div>

        {/* Macro summary */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 mb-4 space-y-3">
          <MacroBar label="Calorii" current={macros.kcal} target={calorieTarget} unit="kcal" />
          <MacroBar
            label="Proteine"
            current={macros.protein}
            target={proteinTarget}
            unit="g"
            colorOverride={proteinTarget ? undefined : 'bg-blue-400'}
          />
          {fatTarget && (
            <MacroBar label="Grăsimi" current={macros.fat} target={fatTarget} unit="g" />
          )}
          {carbTarget && (
            <MacroBar label="Carbohidrați" current={macros.carbs} target={carbTarget} unit="g" />
          )}
          {(!fatTarget || !carbTarget) && (
            <div className="flex gap-4 text-xs text-zinc-500 pt-0.5">
              {!fatTarget && <span>Grăsimi: <span className="text-zinc-400">{macros.fat}g</span></span>}
              {!carbTarget && <span>Carbohidrați: <span className="text-zinc-400">{macros.carbs}g</span></span>}
            </div>
          )}
        </div>

        {/* Meal cards */}
        <div className="space-y-3">
          {Object.entries(dayData.meals).map(([mealName, items]) => (
            <MealCard key={mealName} day={selectedDay} mealName={mealName} items={items} />
          ))}
        </div>

        {/* Add meal slot */}
        {showAddMeal ? (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={newMealName}
              onChange={e => setNewMealName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAddMeal()
                if (e.key === 'Escape') setShowAddMeal(false)
              }}
              placeholder="Nume masă (ex. Mic dejun)"
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
              autoFocus
            />
            <button
              onClick={handleAddMeal}
              className="px-4 py-2.5 bg-amber-400 text-zinc-950 rounded-xl text-sm font-semibold hover:bg-amber-300 transition-colors"
            >
              OK
            </button>
            <button
              onClick={() => setShowAddMeal(false)}
              className="px-3 py-2.5 bg-zinc-800 text-zinc-400 rounded-xl text-sm hover:bg-zinc-700 transition-colors"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddMeal(true)}
            className="mt-3 w-full py-2.5 border border-dashed border-zinc-700 rounded-xl text-sm text-zinc-500 hover:border-zinc-600 hover:text-zinc-400 hover:bg-zinc-900/50 transition-colors"
          >
            + Adaugă masă
          </button>
        )}
      </div>
    </div>
  )
}

function AppInner() {
  const [activeTab, setActiveTab] = useState('plan')
  const [selectedDay, setSelectedDay] = useState(() => {
    // Default to today's day of week
    const dayIndex = new Date().getDay()
    // Sunday=0 in JS, but our week starts Monday
    const romanianIndex = dayIndex === 0 ? 6 : dayIndex - 1
    return DAYS[romanianIndex] || DAYS[0]
  })

  // Handle shared plan notification
  useEffect(() => {
    if (window.location.hash.startsWith('#plan=')) {
      // Hash was consumed by the provider; show a toast or just do nothing
    }
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col max-w-lg mx-auto relative">
      {activeTab === 'plan' && (
        <PlanView selectedDay={selectedDay} setSelectedDay={setSelectedDay} />
      )}
      {activeTab === 'shopping' && (
        <div className="flex-1 flex flex-col">
          <ShoppingList />
        </div>
      )}
      {activeTab === 'settings' && (
        <div className="flex-1 flex flex-col">
          <Settings />
        </div>
      )}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

export default function App() {
  return (
    <MealPlanProvider>
      <AppInner />
    </MealPlanProvider>
  )
}
