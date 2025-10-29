import { supabase } from './supabase'
import type { 
  Profile, 
  Workout, 
  ScheduledWorkout, 
  TrackingPlan, 
  TrackingEntry,
  Exercise,
  WorkoutExercise 
} from './supabase'

// Profile Services
export const profileService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    return { data, error }
  },

  async createProfile(userId: string, profileData: { email: string; full_name: string }) {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: profileData.email,
        full_name: profileData.full_name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    return { data, error }
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    return { data, error }
  }
}

// Workout Services
export const workoutService = {
  async getWorkouts(filters?: { type?: string; difficulty?: string; isPublic?: boolean }) {
    let query = supabase
      .from('workouts')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty)
    }
    if (filters?.isPublic !== undefined) {
      query = query.eq('is_public', filters.isPublic)
    }

    const { data, error } = await query
    return { data, error }
  },

  async getWorkoutById(id: string) {
    const { data, error } = await supabase
      .from('workouts')
      .select(`
        *,
        workout_exercises (
          *, 
          exercise:exercises (*)
        )
      `)
      .eq('id', id)
      .single()
    
    return { data, error }
  },

  async createWorkout(workout: Omit<Workout, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('workouts')
      .insert(workout)
      .select()
      .single()
    
    return { data, error }
  },

  async updateWorkout(id: string, updates: Partial<Workout>) {
    const { data, error } = await supabase
      .from('workouts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  async deleteWorkout(id: string) {
    const { data, error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', id)
    
    return { data, error }
  }
}

// Scheduled Workout Services
export const scheduledWorkoutService = {
  async getScheduledWorkouts(userId: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('scheduled_workouts')
      .select(`
        *,
        workout:workouts (*)
      `)
      .eq('user_id', userId)
      .order('scheduled_date', { ascending: true })

    if (startDate) {
      query = query.gte('scheduled_date', startDate)
    }
    if (endDate) {
      query = query.lte('scheduled_date', endDate)
    }

    const { data, error } = await query
    return { data, error }
  },

  async createScheduledWorkout(scheduledWorkout: Omit<ScheduledWorkout, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('scheduled_workouts')
      .insert(scheduledWorkout)
      .select()
      .single()
    
    return { data, error }
  },

  async updateScheduledWorkout(id: string, updates: Partial<ScheduledWorkout>) {
    const { data, error } = await supabase
      .from('scheduled_workouts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  async deleteScheduledWorkout(id: string) {
    const { data, error } = await supabase
      .from('scheduled_workouts')
      .delete()
      .eq('id', id)
    
    return { data, error }
  },

  async completeWorkout(id: string, completed: boolean = true) {
    const updates: Partial<ScheduledWorkout> = {
      completed,
      completed_at: completed ? new Date().toISOString() : undefined
    }

    return this.updateScheduledWorkout(id, updates)
  }
}

// Tracking Plan Services
export const trackingPlanService = {
  async getTrackingPlans(userId: string) {
    const { data, error } = await supabase
      .from('tracking_plans')
      .select(`
        *,
        tracking_entries (*)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  async createTrackingPlan(trackingPlan: Omit<TrackingPlan, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('tracking_plans')
      .insert(trackingPlan)
      .select()
      .single()
    
    return { data, error }
  },

  async updateTrackingPlan(id: string, updates: Partial<TrackingPlan>) {
    const { data, error } = await supabase
      .from('tracking_plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  async deleteTrackingPlan(id: string) {
    const { data, error } = await supabase
      .from('tracking_plans')
      .delete()
      .eq('id', id)
    
    return { data, error }
  }
}

// Tracking Entry Services
export const trackingEntryService = {
  async getTrackingEntries(trackingPlanId: string, limit?: number) {
    let query = supabase
      .from('tracking_entries')
      .select('*')
      .eq('tracking_plan_id', trackingPlanId)
      .order('entry_date', { ascending: true })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query
    return { data, error }
  },

  async createTrackingEntry(trackingEntry: Omit<TrackingEntry, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('tracking_entries')
      .insert(trackingEntry)
      .select()
      .single()
    
    return { data, error }
  },

  async updateTrackingEntry(id: string, updates: Partial<TrackingEntry>) {
    const { data, error } = await supabase
      .from('tracking_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  async deleteTrackingEntry(id: string) {
    const { data, error } = await supabase
      .from('tracking_entries')
      .delete()
      .eq('id', id)
    
    return { data, error }
  }
}

// Exercise Services
export const exerciseService = {
  async getExercises(filters?: { type?: string; difficulty?: string }) {
    let query = supabase
      .from('exercises')
      .select('*')
      .order('name', { ascending: true })

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty)
    }

    const { data, error } = await query
    return { data, error }
  },

  async createExercise(exercise: Omit<Exercise, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('exercises')
      .insert(exercise)
      .select()
      .single()
    
    return { data, error }
  }
}
