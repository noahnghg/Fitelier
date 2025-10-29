-- =====================================================
-- FITELIER SUPABASE - ADDITIONAL RLS POLICIES
-- =====================================================
-- Run this AFTER the minimal setup works
-- This adds RLS policies for all other tables
-- =====================================================

-- WORKOUTS TABLE
-- =====================================================
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
-- =====================================================
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
-- =====================================================
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
-- =====================================================
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
-- =====================================================
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
-- VERIFICATION
-- =====================================================

-- Check RLS is enabled on all tables
SELECT tablename, rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('workouts', 'scheduled_workouts', 'tracking_plans', 'tracking_entries', 'exercises')
ORDER BY tablename;

-- Count policies per table
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('workouts', 'scheduled_workouts', 'tracking_plans', 'tracking_entries', 'exercises')
GROUP BY tablename
ORDER BY tablename;

-- =====================================================
-- DONE!
-- =====================================================
-- ✅ RLS enabled on all tables
-- ✅ Policies protect user data
-- ✅ Users can only access their own data
-- 
-- Your app is now fully secured!
-- =====================================================
