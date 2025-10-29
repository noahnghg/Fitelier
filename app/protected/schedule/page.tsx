'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedNavbar from '@/components/shared/protected-navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus, Dumbbell, Heart, Zap, Edit, Trash2, Loader2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { useAuth } from '@/lib/auth';
import { scheduledWorkoutService } from '@/lib/database';
import type { ScheduledWorkout } from '@/lib/supabase';

interface WorkoutDay {
  date: Date;
  workouts: ScheduledWorkout[];
}

export default function SchedulePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch scheduled workouts when component mounts or month changes
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }
    
    if (user) {
      fetchScheduledWorkouts();
    }
  }, [user, authLoading, currentMonth, router]);

  const fetchScheduledWorkouts = async () => {
    if (!user) return;
    
    setLoading(true);
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    const { data, error } = await scheduledWorkoutService.getScheduledWorkouts(
      user.id,
      format(monthStart, 'yyyy-MM-dd'),
      format(monthEnd, 'yyyy-MM-dd')
    );
    
    if (error) {
      console.error('Error fetching scheduled workouts:', error);
    } else {
      setScheduledWorkouts(data || []);
    }
    setLoading(false);
  };

  // Helper functions
  const getWorkoutsForDay = (date: Date): ScheduledWorkout[] => {
    return scheduledWorkouts.filter(workout => 
      isSameDay(new Date(workout.scheduled_date), date)
    );
  };

  const hasWorkoutsOnDay = (date: Date): boolean => {
    return getWorkoutsForDay(date).length > 0;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'strength':
        return <Dumbbell className="w-4 h-4" />;
      case 'cardio':
        return <Heart className="w-4 h-4" />;
      case 'flexibility':
        return <Zap className="w-4 h-4" />;
      default:
        return <Dumbbell className="w-4 h-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'strength':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cardio':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'flexibility':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleDayClick = (date: Date) => {
    setSelectedDay(date);
    setIsSheetOpen(true);
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const toggleWorkoutCompletion = async (workoutId: string) => {
    const workout = scheduledWorkouts.find(w => w.id === workoutId);
    if (!workout) return;

    const { error } = await scheduledWorkoutService.completeWorkout(workoutId, !workout.completed);
    
    if (error) {
      console.error('Error toggling workout completion:', error);
    } else {
      // Update local state
      setScheduledWorkouts(prev =>
        prev.map(w =>
          w.id === workoutId
            ? { ...w, completed: !w.completed, completed_at: !w.completed ? new Date().toISOString() : undefined }
            : w
        )
      );
    }
  };

  const getWorkoutName = (workout: ScheduledWorkout): string => {
    return workout.custom_name || workout.workout?.name || 'Workout';
  };

  const getWorkoutType = (workout: ScheduledWorkout): 'strength' | 'cardio' | 'flexibility' => {
    return workout.workout_type || workout.workout?.type || 'strength';
  };

  const getWorkoutDuration = (workout: ScheduledWorkout): string => {
    const minutes = workout.duration_minutes || workout.workout?.duration_minutes || 30;
    return `${minutes} min`;
  };

  // Get calendar grid data
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get first day of month to calculate offset
  const firstDayOfWeek = monthStart.getDay();
  const totalCells = Math.ceil((daysInMonth.length + firstDayOfWeek) / 7) * 7;
  
  // Create grid with empty cells for proper alignment
  const calendarGrid = Array.from({ length: totalCells }, (_, index) => {
    if (index < firstDayOfWeek) {
      return null; // Empty cell before month starts
    }
    const dayIndex = index - firstDayOfWeek;
    return dayIndex < daysInMonth.length ? daysInMonth[dayIndex] : null;
  });

  return (
    <>
      <ProtectedNavbar />
      <div className="min-h-screen bg-linear-to-b from-white via-sky-50 to-white pt-28 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Workout Schedule</h1>
              <p className="text-gray-600">Click on any day to view or manage your workouts</p>
            </div>
            <Button className="bg-linear-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Workout
            </Button>
          </div>

          {/* Calendar Card */}
          <Card className="mb-6">
            <CardHeader>
              {/* Month Navigation */}
              <div className="flex items-center justify-between">
                <Button variant="outline" size="icon" onClick={handlePreviousMonth} disabled={loading}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-2xl font-bold">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <Button variant="outline" size="icon" onClick={handleNextMonth} disabled={loading}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
                </div>
              ) : (
                <>
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2">
                {/* Day Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
                
                {/* Calendar Days */}
                {calendarGrid.map((date, index) => {
                  if (!date) {
                    return <div key={index} className="aspect-square" />;
                  }
                  
                  const dayWorkouts = getWorkoutsForDay(date);
                  const hasWorkouts = dayWorkouts.length > 0;
                  const completedWorkouts = dayWorkouts.filter(w => w.completed).length;
                  
                  return (
                    <div
                      key={date.toString()}
                      onClick={() => handleDayClick(date)}
                      className={`
                        aspect-square p-2 border rounded-lg cursor-pointer transition-all hover:shadow-md
                        ${isToday(date) ? 'border-sky-400 bg-sky-50' : 'border-gray-200 hover:border-sky-300'}
                        ${hasWorkouts ? 'bg-linear-to-br from-sky-50 to-white' : 'bg-white hover:bg-gray-50'}
                      `}
                    >
                      <div className="h-full flex flex-col">
                        <div className="text-sm font-medium text-center mb-1">
                          {format(date, 'd')}
                        </div>
                        {hasWorkouts && (
                          <div className="flex-1 space-y-1">
                            <div className="text-xs text-center text-gray-600">
                              {dayWorkouts.length} workout{dayWorkouts.length !== 1 ? 's' : ''}
                            </div>
                            {completedWorkouts > 0 && (
                              <div className="text-xs text-center text-green-600 font-medium">
                                {completedWorkouts} done
                              </div>
                            )}
                            {/* Show workout type indicators */}
                            <div className="flex justify-center gap-1">
                              {dayWorkouts.slice(0, 3).map((workout, idx) => {
                                const workoutType = getWorkoutType(workout);
                                return (
                                  <div
                                    key={idx}
                                    className={`w-2 h-2 rounded-full ${
                                      workoutType === 'strength' ? 'bg-blue-400' :
                                      workoutType === 'cardio' ? 'bg-red-400' : 'bg-green-400'
                                    } ${workout.completed ? 'opacity-100' : 'opacity-50'}`}
                                  />
                                );
                              })}
                              {dayWorkouts.length > 3 && (
                                <div className="text-xs text-gray-500">+{dayWorkouts.length - 3}</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Monthly Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-linear-to-br from-sky-50 to-white border-sky-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-sky-600">
                  {scheduledWorkouts.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Total workouts</p>
              </CardContent>
            </Card>

            <Card className="bg-linear-to-br from-green-50 to-white border-green-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {scheduledWorkouts.filter(w => w.completed).length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Finished</p>
              </CardContent>
            </Card>

            <Card className="bg-linear-to-br from-purple-50 to-white border-purple-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Active Days</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600">
                  {new Set(scheduledWorkouts.map(w => w.scheduled_date)).size}
                </p>
                <p className="text-xs text-gray-500 mt-1">With workouts</p>
              </CardContent>
            </Card>

            <Card className="bg-linear-to-br from-orange-50 to-white border-orange-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-600">
                  {scheduledWorkouts.length > 0 
                    ? Math.round((scheduledWorkouts.filter(w => w.completed).length / scheduledWorkouts.length) * 100)
                    : 0}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Complete</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Day Detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {selectedDay && format(selectedDay, 'EEEE, MMMM d, yyyy')}
            </SheetTitle>
            <SheetDescription>
              {selectedDay && getWorkoutsForDay(selectedDay).length > 0
                ? 'Manage your workouts for this day'
                : 'No workouts scheduled for this day'}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {selectedDay && getWorkoutsForDay(selectedDay).length > 0 ? (
              <>
                {getWorkoutsForDay(selectedDay).map((workout) => {
                  const workoutType = getWorkoutType(workout);
                  const workoutName = getWorkoutName(workout);
                  const workoutDuration = getWorkoutDuration(workout);
                  
                  return (
                    <Card key={workout.id} className={`${workout.completed ? 'bg-green-50 border-green-200' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`flex items-center gap-2 ${getTypeBadgeColor(workoutType)} px-2 py-1 rounded-md text-xs font-medium`}>
                              {getTypeIcon(workoutType)}
                              <span className="capitalize">{workoutType}</span>
                            </div>
                            <Badge variant={workout.completed ? 'default' : 'secondary'} className={workout.completed ? 'bg-green-600' : ''}>
                              {workout.completed ? 'Completed' : 'Pending'}
                            </Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-2">{workoutName}</h3>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {workout.scheduled_time || 'Not set'}
                          </span>
                          <span>•</span>
                          <span>{workoutDuration}</span>
                        </div>

                        {workout.notes && (
                          <p className="text-sm text-gray-600 mb-3 italic">{workout.notes}</p>
                        )}

                        <Button
                          onClick={() => toggleWorkoutCompletion(workout.id)}
                          size="sm"
                          variant={workout.completed ? "outline" : "default"}
                          className={workout.completed ? "border-green-600 text-green-600 hover:bg-green-50" : "bg-sky-600 hover:bg-sky-700"}
                        >
                          {workout.completed ? 'Mark as Pending' : 'Mark as Complete'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No workouts scheduled for this day</p>
                <Button className="bg-linear-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Workout
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
