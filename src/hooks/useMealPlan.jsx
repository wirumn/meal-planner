import { createContext, useContext, useReducer, useEffect } from 'react'
import { loadFromHash } from '../utils/shareLink'

export const DAYS = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă', 'Duminică']
const DEFAULT_MEALS = ['Prânz', 'Cină', 'Snack']

function makeEmptyDay() {
  return {
    type: 'home',
    meals: Object.fromEntries(DEFAULT_MEALS.map(m => [m, []])),
  }
}

const initialState = {
  settings: {
    calorieTarget: 1400,
    proteinTarget: 100,
    fatTarget: null,
    carbTarget: null,
  },
  plan: Object.fromEntries(DAYS.map(d => [d, makeEmptyDay()])),
  shopping: {
    checkedItems: {},
  },
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } }

    case 'ADD_FOOD_ITEM': {
      const { day, meal, item } = action.payload
      return {
        ...state,
        plan: {
          ...state.plan,
          [day]: {
            ...state.plan[day],
            meals: {
              ...state.plan[day].meals,
              [meal]: [...state.plan[day].meals[meal], item],
            },
          },
        },
      }
    }

    case 'REMOVE_FOOD_ITEM': {
      const { day, meal, itemId } = action.payload
      return {
        ...state,
        plan: {
          ...state.plan,
          [day]: {
            ...state.plan[day],
            meals: {
              ...state.plan[day].meals,
              [meal]: state.plan[day].meals[meal].filter(i => i.id !== itemId),
            },
          },
        },
      }
    }

    case 'UPDATE_FOOD_ITEM': {
      const { day, meal, itemId, updates } = action.payload
      return {
        ...state,
        plan: {
          ...state.plan,
          [day]: {
            ...state.plan[day],
            meals: {
              ...state.plan[day].meals,
              [meal]: state.plan[day].meals[meal].map(i =>
                i.id === itemId ? { ...i, ...updates } : i
              ),
            },
          },
        },
      }
    }

    case 'SET_DAY_TYPE': {
      const { day, dayType } = action.payload
      return {
        ...state,
        plan: {
          ...state.plan,
          [day]: { ...state.plan[day], type: dayType },
        },
      }
    }

    case 'ADD_MEAL_SLOT': {
      const { day, mealName } = action.payload
      if (state.plan[day].meals[mealName] !== undefined) return state
      return {
        ...state,
        plan: {
          ...state.plan,
          [day]: {
            ...state.plan[day],
            meals: { ...state.plan[day].meals, [mealName]: [] },
          },
        },
      }
    }

    case 'REMOVE_MEAL_SLOT': {
      const { day, mealName } = action.payload
      const newMeals = { ...state.plan[day].meals }
      delete newMeals[mealName]
      return {
        ...state,
        plan: {
          ...state.plan,
          [day]: { ...state.plan[day], meals: newMeals },
        },
      }
    }

    case 'TOGGLE_SHOPPING_ITEM': {
      const { productId } = action.payload
      return {
        ...state,
        shopping: {
          checkedItems: {
            ...state.shopping.checkedItems,
            [productId]: !state.shopping.checkedItems[productId],
          },
        },
      }
    }

    case 'CLEAR_SHOPPING_CHECKS':
      return { ...state, shopping: { checkedItems: {} } }

    case 'LOAD_PLAN':
      return action.payload

    case 'RESET_ALL':
      return initialState

    default:
      return state
  }
}

const STORAGE_KEY = 'meal-planner-v1'

const MealPlanContext = createContext(null)

export function MealPlanProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, () => {
    const fromHash = loadFromHash()
    if (fromHash) {
      history.replaceState(null, '', window.location.pathname + window.location.search)
      return fromHash
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return JSON.parse(stored)
    } catch {}
    return initialState
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {}
  }, [state])

  return (
    <MealPlanContext.Provider value={{ state, dispatch }}>
      {children}
    </MealPlanContext.Provider>
  )
}

export function useMealPlan() {
  const ctx = useContext(MealPlanContext)
  if (!ctx) throw new Error('useMealPlan must be used within MealPlanProvider')
  return ctx
}
