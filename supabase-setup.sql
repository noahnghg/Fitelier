-- =====================================================
-- FITELIER SUPABASE DATABASE SETUP
-- =====================================================
-- Run this script in your Supabase SQL Editor to set up
-- automatic profile creation and proper RLS policies
-- =====================================================

-- 1. ENABLE ROW LEVEL SECURITY ON PROFILES TABLE
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. DROP EXISTING POLICIES (if any)
-- =====================================================
DROP POLICY IF EXISTS "Users can insert own profile on signup" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;

-- 3. CREATE RLS POLICIES FOR PROFILES TABLE
-- =====================================================

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow service role to insert profiles (for triggers)
CREATE POLICY "Service role can insert profiles"
  ON profiles
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to insert their own profile during signup
CREATE POLICY "Users can insert own profile on signup"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 4. CREATE FUNCTION TO HANDLE NEW USER SIGNUP
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    now(),
    now()
  );
  RETURN new;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, skip
    RETURN new;
  WHEN OTHERS THEN
    -- Log error but don't fail signup
    RAISE WARNING 'Error creating profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;

-- 5. CREATE TRIGGER FOR AUTOMATIC PROFILE CREATION
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. OPTIONAL: CREATE FUNCTION TO UPDATE PROFILE TIMESTAMP
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 7. SETUP RLS FOR OTHER TABLES (if needed)
-- =====================================================

-- WORKOUTS TABLE
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public workouts are viewable by everyone" ON workouts;
DROP POLICY IF EXISTS "Users can create their own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can update their own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can delete their own workouts" ON workouts;

CREATE POLICY "Public workouts are viewable by everyone"
  ON workouts
  FOR SELECT
  USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create their own workouts"
  ON workouts
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own workouts"
  ON workouts
  FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own workouts"
  ON workouts
  FOR DELETE
  USING (created_by = auth.uid());

-- SCHEDULED_WORKOUTS TABLE
ALTER TABLE scheduled_workouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own scheduled workouts" ON scheduled_workouts;
DROP POLICY IF EXISTS "Users can create own scheduled workouts" ON scheduled_workouts;
DROP POLICY IF EXISTS "Users can update own scheduled workouts" ON scheduled_workouts;
DROP POLICY IF EXISTS "Users can delete own scheduled workouts" ON scheduled_workouts;

CREATE POLICY "Users can view own scheduled workouts"
  ON scheduled_workouts
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own scheduled workouts"
  ON scheduled_workouts
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own scheduled workouts"
  ON scheduled_workouts
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own scheduled workouts"
  ON scheduled_workouts
  FOR DELETE
  USING (user_id = auth.uid());

-- TRACKING_PLANS TABLE
ALTER TABLE tracking_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tracking plans" ON tracking_plans;
DROP POLICY IF EXISTS "Users can create own tracking plans" ON tracking_plans;
DROP POLICY IF EXISTS "Users can update own tracking plans" ON tracking_plans;
DROP POLICY IF EXISTS "Users can delete own tracking plans" ON tracking_plans;

CREATE POLICY "Users can view own tracking plans"
  ON tracking_plans
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own tracking plans"
  ON tracking_plans
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own tracking plans"
  ON tracking_plans
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own tracking plans"
  ON tracking_plans
  FOR DELETE
  USING (user_id = auth.uid());

-- TRACKING_ENTRIES TABLE
ALTER TABLE tracking_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tracking entries" ON tracking_entries;
DROP POLICY IF EXISTS "Users can create own tracking entries" ON tracking_entries;
DROP POLICY IF EXISTS "Users can update own tracking entries" ON tracking_entries;
DROP POLICY IF EXISTS "Users can delete own tracking entries" ON tracking_entries;

CREATE POLICY "Users can view own tracking entries"
  ON tracking_entries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tracking_plans
      WHERE tracking_plans.id = tracking_entries.tracking_plan_id
      AND tracking_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own tracking entries"
  ON tracking_entries
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tracking_plans
      WHERE tracking_plans.id = tracking_entries.tracking_plan_id
      AND tracking_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own tracking entries"
  ON tracking_entries
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM tracking_plans
      WHERE tracking_plans.id = tracking_entries.tracking_plan_id
      AND tracking_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own tracking entries"
  ON tracking_entries
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM tracking_plans
      WHERE tracking_plans.id = tracking_entries.tracking_plan_id
      AND tracking_plans.user_id = auth.uid()
    )
  );

-- EXERCISES TABLE
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Exercises are viewable by everyone" ON exercises;
DROP POLICY IF EXISTS "Authenticated users can create exercises" ON exercises;

CREATE POLICY "Exercises are viewable by everyone"
  ON exercises
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create exercises"
  ON exercises
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the setup:

-- Check if trigger exists
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Check if function exists
-- SELECT * FROM pg_proc WHERE proname = 'handle_new_user';

-- Check RLS policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename IN ('profiles', 'workouts', 'scheduled_workouts', 'tracking_plans', 'tracking_entries', 'exercises')
-- ORDER BY tablename, policyname;

-- Test profile creation (after signup)
-- SELECT * FROM profiles WHERE email = 'your-test-email@example.com';

-- =====================================================
-- DONE!
-- =====================================================
-- Your database is now properly configured with:
-- ✅ Automatic profile creation via trigger
-- ✅ Row Level Security enabled
-- ✅ Proper policies for all tables
-- ✅ Updated_at timestamp automation
-- =====================================================
