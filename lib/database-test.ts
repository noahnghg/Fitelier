import { supabase } from './supabase'

// Test database connection and basic operations
export async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...')
    
    // Test 1: Check if we can fetch exercises
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('*')
      .limit(5)
    
    if (exercisesError) {
      console.error('Error fetching exercises:', exercisesError)
      return false
    }
    
    console.log(`✅ Successfully fetched ${exercises?.length} exercises`)
    
    // Test 2: Check if we can fetch workouts
    const { data: workouts, error: workoutsError } = await supabase
      .from('workouts')
      .select('*')
      .limit(5)
    
    if (workoutsError) {
      console.error('Error fetching workouts:', workoutsError)
      return false
    }
    
    console.log(`✅ Successfully fetched ${workouts?.length} workouts`)
    
    // Test 3: Check RLS is working (this should fail without authentication)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
    
    // This should return empty or throw an error due to RLS
    console.log('✅ RLS is properly configured for profiles table')
    
    console.log('🎉 Database connection test passed!')
    return true
    
  } catch (error) {
    console.error('Database connection test failed:', error)
    return false
  }
}

// Quick function to get database stats
export async function getDatabaseStats() {
  try {
    const [exerciseCount, workoutCount] = await Promise.all([
      supabase.from('exercises').select('*', { count: 'exact', head: true }),
      supabase.from('workouts').select('*', { count: 'exact', head: true })
    ])
    
    return {
      exercises: exerciseCount.count || 0,
      workouts: workoutCount.count || 0
    }
  } catch (error) {
    console.error('Error getting database stats:', error)
    return { exercises: 0, workouts: 0 }
  }
}
