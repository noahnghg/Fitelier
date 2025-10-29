-- Insert sample exercises
INSERT INTO public.exercises (name, description, muscle_groups, equipment, instructions, difficulty, type) VALUES
-- Strength exercises
('Push-ups', 'Classic bodyweight upper body exercise', ARRAY['chest', 'shoulders', 'triceps'], ARRAY['none'], ARRAY['Start in plank position', 'Lower body until chest nearly touches floor', 'Push back up to starting position'], 'beginner', 'strength'),
('Squats', 'Fundamental lower body exercise', ARRAY['quadriceps', 'glutes', 'hamstrings'], ARRAY['none'], ARRAY['Stand with feet shoulder-width apart', 'Lower body as if sitting back into chair', 'Keep chest up and knees behind toes', 'Return to standing'], 'beginner', 'strength'),
('Pull-ups', 'Upper body pulling exercise', ARRAY['back', 'biceps'], ARRAY['pull-up bar'], ARRAY['Hang from bar with palms facing away', 'Pull body up until chin clears bar', 'Lower with control'], 'intermediate', 'strength'),
('Deadlifts', 'Full body compound exercise', ARRAY['hamstrings', 'glutes', 'back', 'traps'], ARRAY['barbell', 'weights'], ARRAY['Stand with feet hip-width apart', 'Grip bar with hands just outside legs', 'Lift by driving hips forward and standing up', 'Lower bar back to ground with control'], 'advanced', 'strength'),
('Bench Press', 'Upper body pressing exercise', ARRAY['chest', 'shoulders', 'triceps'], ARRAY['barbell', 'bench', 'weights'], ARRAY['Lie on bench with feet on floor', 'Grip bar slightly wider than shoulders', 'Lower bar to chest', 'Press bar back up'], 'intermediate', 'strength'),
('Lunges', 'Single-leg lower body exercise', ARRAY['quadriceps', 'glutes', 'hamstrings'], ARRAY['none'], ARRAY['Step forward into lunge position', 'Lower hips until both knees at 90 degrees', 'Push back to starting position', 'Repeat on other leg'], 'beginner', 'strength'),

-- Cardio exercises
('Jumping Jacks', 'Full body cardio exercise', ARRAY['full body'], ARRAY['none'], ARRAY['Start standing with arms at sides', 'Jump feet apart while raising arms overhead', 'Jump back to starting position'], 'beginner', 'cardio'),
('High Knees', 'Running in place cardio', ARRAY['legs', 'core'], ARRAY['none'], ARRAY['Run in place lifting knees high', 'Keep core engaged', 'Pump arms for momentum'], 'beginner', 'cardio'),
('Burpees', 'Full body high-intensity exercise', ARRAY['full body'], ARRAY['none'], ARRAY['Start standing', 'Drop into squat and place hands on floor', 'Jump feet back to plank', 'Do push-up', 'Jump feet back to squat', 'Jump up with arms overhead'], 'advanced', 'cardio'),
('Mountain Climbers', 'Core and cardio exercise', ARRAY['core', 'shoulders'], ARRAY['none'], ARRAY['Start in plank position', 'Bring one knee toward chest', 'Quickly switch legs', 'Keep hips level'], 'intermediate', 'cardio'),

-- Flexibility exercises
('Downward Dog', 'Yoga pose for flexibility', ARRAY['hamstrings', 'calves', 'shoulders'], ARRAY['yoga mat'], ARRAY['Start on hands and knees', 'Tuck toes and lift hips up', 'Straighten legs and arms', 'Hold position'], 'beginner', 'flexibility'),
('Child''s Pose', 'Relaxing yoga pose', ARRAY['back', 'hips'], ARRAY['yoga mat'], ARRAY['Kneel on floor', 'Sit back on heels', 'Fold forward with arms extended', 'Rest forehead on ground'], 'beginner', 'flexibility'),
('Pigeon Pose', 'Hip opening stretch', ARRAY['hips', 'glutes'], ARRAY['yoga mat'], ARRAY['Start in downward dog', 'Bring one knee forward', 'Extend other leg back', 'Lower hips to ground'], 'intermediate', 'flexibility'),
('Cat-Cow Stretch', 'Spinal mobility exercise', ARRAY['spine', 'core'], ARRAY['yoga mat'], ARRAY['Start on hands and knees', 'Arch back and look up (cow)', 'Round spine and tuck chin (cat)', 'Alternate between positions'], 'beginner', 'flexibility');

-- Insert sample workouts
INSERT INTO public.workouts (name, description, type, duration_minutes, difficulty, estimated_calories, exercise_count, is_public) VALUES
('Full Body Strength', 'Complete workout targeting all major muscle groups', 'strength', 45, 'intermediate', 420, 6, true),
('HIIT Cardio Blast', 'High-intensity intervals to burn maximum calories', 'cardio', 30, 'advanced', 380, 4, true),
('Morning Yoga Flow', 'Gentle morning routine to improve flexibility', 'flexibility', 40, 'beginner', 210, 5, true),
('Upper Body Power', 'Focus on chest, back, shoulders, and arms', 'strength', 50, 'advanced', 450, 4, true),
('Core Crusher', 'Strengthen your core with targeted exercises', 'strength', 25, 'intermediate', 280, 3, true),
('Beginner Cardio', 'Easy cardio routine for beginners', 'cardio', 35, 'beginner', 320, 3, true);

-- Link exercises to workouts
WITH workout_ids AS (
    SELECT id, name FROM public.workouts
),
exercise_ids AS (
    SELECT id, name FROM public.exercises
)
INSERT INTO public.workout_exercises (workout_id, exercise_id, sets, reps, duration_seconds, rest_seconds, order_index) VALUES
-- Full Body Strength workout
((SELECT id FROM workout_ids WHERE name = 'Full Body Strength'), (SELECT id FROM exercise_ids WHERE name = 'Squats'), 3, 12, NULL, 60, 1),
((SELECT id FROM workout_ids WHERE name = 'Full Body Strength'), (SELECT id FROM exercise_ids WHERE name = 'Push-ups'), 3, 10, NULL, 60, 2),
((SELECT id FROM workout_ids WHERE name = 'Full Body Strength'), (SELECT id FROM exercise_ids WHERE name = 'Lunges'), 3, 10, NULL, 60, 3),
((SELECT id FROM workout_ids WHERE name = 'Full Body Strength'), (SELECT id FROM exercise_ids WHERE name = 'Pull-ups'), 3, 8, NULL, 90, 4),

-- HIIT Cardio Blast workout
((SELECT id FROM workout_ids WHERE name = 'HIIT Cardio Blast'), (SELECT id FROM exercise_ids WHERE name = 'Burpees'), 4, NULL, 45, 15, 1),
((SELECT id FROM workout_ids WHERE name = 'HIIT Cardio Blast'), (SELECT id FROM exercise_ids WHERE name = 'Mountain Climbers'), 4, NULL, 45, 15, 2),
((SELECT id FROM workout_ids WHERE name = 'HIIT Cardio Blast'), (SELECT id FROM exercise_ids WHERE name = 'Jumping Jacks'), 4, NULL, 45, 15, 3),
((SELECT id FROM workout_ids WHERE name = 'HIIT Cardio Blast'), (SELECT id FROM exercise_ids WHERE name = 'High Knees'), 4, NULL, 45, 15, 4),

-- Morning Yoga Flow workout
((SELECT id FROM workout_ids WHERE name = 'Morning Yoga Flow'), (SELECT id FROM exercise_ids WHERE name = 'Cat-Cow Stretch'), 1, NULL, 120, 0, 1),
((SELECT id FROM workout_ids WHERE name = 'Morning Yoga Flow'), (SELECT id FROM exercise_ids WHERE name = 'Downward Dog'), 1, NULL, 180, 30, 2),
((SELECT id FROM workout_ids WHERE name = 'Morning Yoga Flow'), (SELECT id FROM exercise_ids WHERE name = 'Pigeon Pose'), 1, NULL, 120, 30, 3),
((SELECT id FROM workout_ids WHERE name = 'Morning Yoga Flow'), (SELECT id FROM exercise_ids WHERE name = 'Child''s Pose'), 1, NULL, 180, 0, 4),

-- Upper Body Power workout
((SELECT id FROM workout_ids WHERE name = 'Upper Body Power'), (SELECT id FROM exercise_ids WHERE name = 'Bench Press'), 4, 8, NULL, 120, 1),
((SELECT id FROM workout_ids WHERE name = 'Upper Body Power'), (SELECT id FROM exercise_ids WHERE name = 'Pull-ups'), 4, 10, NULL, 120, 2),
((SELECT id FROM workout_ids WHERE name = 'Upper Body Power'), (SELECT id FROM exercise_ids WHERE name = 'Push-ups'), 3, 15, NULL, 90, 3),
((SELECT id FROM workout_ids WHERE name = 'Upper Body Power'), (SELECT id FROM exercise_ids WHERE name = 'Deadlifts'), 4, 6, NULL, 180, 4),

-- Core Crusher workout
((SELECT id FROM workout_ids WHERE name = 'Core Crusher'), (SELECT id FROM exercise_ids WHERE name = 'Mountain Climbers'), 3, NULL, 60, 30, 1),
((SELECT id FROM workout_ids WHERE name = 'Core Crusher'), (SELECT id FROM exercise_ids WHERE name = 'Burpees'), 3, 8, NULL, 60, 2),

-- Beginner Cardio workout
((SELECT id FROM workout_ids WHERE name = 'Beginner Cardio'), (SELECT id FROM exercise_ids WHERE name = 'Jumping Jacks'), 3, NULL, 60, 30, 1),
((SELECT id FROM workout_ids WHERE name = 'Beginner Cardio'), (SELECT id FROM exercise_ids WHERE name = 'High Knees'), 3, NULL, 60, 30, 2),
((SELECT id FROM workout_ids WHERE name = 'Beginner Cardio'), (SELECT id FROM exercise_ids WHERE name = 'Mountain Climbers'), 3, NULL, 45, 45, 3);

-- Update exercise counts in workouts
UPDATE public.workouts SET exercise_count = (
    SELECT COUNT(*) FROM public.workout_exercises WHERE workout_id = workouts.id
);
