-- =====================================================
-- VERIFICATION SCRIPT
-- =====================================================
-- Run this after setup to verify everything works
-- =====================================================

-- 1. CHECK IF TRIGGER EXISTS
SELECT 
  tgname as trigger_name,
  tgenabled as enabled,
  proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'on_auth_user_created';
-- Expected: 1 row showing the trigger is enabled

-- 2. CHECK IF FUNCTION EXISTS
SELECT 
  proname as function_name,
  prosrc as function_code
FROM pg_proc 
WHERE proname = 'handle_new_user';
-- Expected: 1 row with the function definition

-- 3. CHECK RLS IS ENABLED ON PROFILES
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'profiles';
-- Expected: rls_enabled = true

-- 4. LIST ALL POLICIES ON PROFILES TABLE
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
-- Expected: 4 policies (SELECT, INSERT, UPDATE, and service role INSERT)

-- 5. CHECK ALL TABLES HAVE RLS ENABLED
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'workouts', 'scheduled_workouts', 'tracking_plans', 'tracking_entries', 'exercises')
ORDER BY tablename;
-- Expected: All tables show rls_enabled = true

-- 6. VIEW ALL POLICIES ACROSS ALL TABLES
SELECT 
  tablename,
  policyname,
  cmd as operation,
  CASE 
    WHEN cmd = 'SELECT' THEN 'Read'
    WHEN cmd = 'INSERT' THEN 'Create'
    WHEN cmd = 'UPDATE' THEN 'Update'
    WHEN cmd = 'DELETE' THEN 'Delete'
    ELSE cmd
  END as action
FROM pg_policies
WHERE tablename IN ('profiles', 'workouts', 'scheduled_workouts', 'tracking_plans', 'tracking_entries', 'exercises')
ORDER BY tablename, cmd;
-- Expected: Multiple policies for each table

-- 7. COUNT EXISTING PROFILES
SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 day' THEN 1 END) as profiles_last_24h,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 hour' THEN 1 END) as profiles_last_hour
FROM profiles;
-- Shows how many profiles exist

-- 8. VIEW RECENT PROFILES (Last 10)
SELECT 
  id,
  email,
  full_name,
  created_at,
  updated_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;
-- Shows recent profile creations

-- 9. CHECK FOR ORPHANED AUTH USERS (users without profiles)
SELECT 
  u.id,
  u.email,
  u.created_at as user_created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;
-- Expected: Empty result (all users should have profiles)

-- 10. CHECK FOR ORPHANED PROFILES (profiles without auth users)
SELECT 
  p.id,
  p.email,
  p.created_at as profile_created_at
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.id IS NULL
ORDER BY p.created_at DESC;
-- Expected: Empty result (all profiles should have auth users)

-- =====================================================
-- TEST QUERIES (Optional - for debugging)
-- =====================================================

-- Test if RLS policies work correctly
-- Replace 'YOUR_USER_ID' with an actual user ID from your auth.users table

-- Test reading own profile (should work)
-- SET LOCAL jwt.claims.sub = 'YOUR_USER_ID';
-- SELECT * FROM profiles WHERE id = 'YOUR_USER_ID';

-- Test reading another user's profile (should fail)
-- SET LOCAL jwt.claims.sub = 'YOUR_USER_ID';
-- SELECT * FROM profiles WHERE id != 'YOUR_USER_ID';

-- =====================================================
-- CLEANUP QUERIES (If needed)
-- =====================================================

-- Delete test users and profiles (uncomment if needed)
-- DELETE FROM profiles WHERE email LIKE '%test%' OR email LIKE '%example%';
-- DELETE FROM auth.users WHERE email LIKE '%test%' OR email LIKE '%example%';

-- Reset a specific user's profile (uncomment and replace email)
-- DELETE FROM profiles WHERE email = 'user@example.com';
-- DELETE FROM auth.users WHERE email = 'user@example.com';

-- =====================================================
-- EXPECTED RESULTS SUMMARY
-- =====================================================
-- 
-- ✅ Trigger: 1 row (on_auth_user_created)
-- ✅ Function: 1 row (handle_new_user)
-- ✅ RLS Enabled: true for profiles table
-- ✅ Policies: 4 on profiles, multiple on other tables
-- ✅ No orphaned users or profiles
-- 
-- If all checks pass, your database is properly configured!
-- =====================================================
