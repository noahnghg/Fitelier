import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (auto-generated from schema)
export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  age?: number
  height_cm?: number
  weight_kg?: number
  fitness_goal?: 'lose_weight' | 'gain_muscle' | 'maintain' | 'improve_endurance' | 'general_fitness'
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active'
  created_at: string
  updated_at: string
}

export interface Workout {
  id: string
  name: string
  description?: string
  type: 'strength' | 'cardio' | 'flexibility'
  duration_minutes: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimated_calories?: number
  exercise_count: number
  instructions?: any
  created_by?: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface ScheduledWorkout {
  id: string
  user_id: string
  workout_id?: string
  custom_name?: string
  custom_description?: string
  workout_type?: 'strength' | 'cardio' | 'flexibility'
  scheduled_date: string
  scheduled_time?: string
  duration_minutes?: number
  completed: boolean
  completed_at?: string
  notes?: string
  created_at: string
  updated_at: string
  workout?: Workout
}

export interface TrackingPlan {
  id: string
  user_id: string
  title: string
  unit: string
  category: 'weight' | 'strength' | 'measurement' | 'other'
  description?: string
  target_value?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TrackingEntry {
  id: string
  tracking_plan_id: string
  value: number
  entry_date: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Exercise {
  id: string
  name: string
  description?: string
  muscle_groups?: string[]
  equipment?: string[]
  instructions?: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  type: 'strength' | 'cardio' | 'flexibility' | 'balance'
  created_at: string
}

export interface WorkoutExercise {
  id: string
  workout_id: string
  exercise_id: string
  sets?: number
  reps?: number
  duration_seconds?: number
  rest_seconds?: number
  weight_kg?: number
  distance_meters?: number
  order_index: number
  notes?: string
  exercise?: Exercise
}
