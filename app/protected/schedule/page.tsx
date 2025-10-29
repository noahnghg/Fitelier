'use client';

import { useState } from 'react';
import ProtectedNavbar from '@/components/shared/protected-navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus, Dumbbell, Heart, Zap, Edit, Trash2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';

interface Workout {
  id: string;
  time: string;
  name: string;
  duration: string;
  type: 'strength' | 'cardio' | 'flexibility';
  completed: boolean;
}

interface WorkoutDay {
  date: Date;
  workouts: Workout[];
}

export default function SchedulePage() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([
    {
      date: new Date(2025, 9, 27), // October 27, 2025
      workouts: [
        { id: '1', time: '07:00 AM', name: 'Morning Strength Training', duration: '45 min', type: 'strength', completed: true },
        { id: '2', time: '06:00 PM', name: 'Evening Cardio', duration: '30 min', type: 'cardio', completed: false },
      ],
    },
    {
      date: new Date(2025, 9, 28), // October 28, 2025
      workouts: [
        { id: '3', time: '07:00 AM', name: 'Yoga & Stretching', duration: '40 min', type: 'flexibility', completed: false },
      ],
    },
    {
      date: new Date(2025, 9, 29), // October 29, 2025
      workouts: [
        { id: '4', time: '07:00 AM', name: 'Upper Body Strength', duration: '50 min', type: 'strength', completed: false },
        { id: '5', time: '07:00 PM', name: 'HIIT Cardio', duration: '25 min', type: 'cardio', completed: false },
      ],
    },
    {
      date: new Date(2025, 9, 30), // October 30, 2025
      workouts: [
        { id: '6', time: '07:00 AM', name: 'Recovery & Mobility', duration: '35 min', type: 'flexibility', completed: false },
      ],
    },
    {
      date: new Date(2025, 9, 31), // October 31, 2025
      workouts: [
        { id: '7', time: '07:00 AM', name: 'Full Body Workout', duration: '55 min', type: 'strength', completed: false },
      ],
    },
  ]);

  // Helper functions
  const getWorkoutsForDay = (date: Date): Workout[] => {
    const dayWorkouts = workoutDays.find(day => isSameDay(day.date, date));
    return dayWorkouts ? dayWorkouts.workouts : [];
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

  const toggleWorkoutCompletion = (workoutId: string) => {
    setWorkoutDays(prevDays =>
      prevDays.map(day => ({
        ...day,
        workouts: day.workouts.map(workout =>
          workout.id === workoutId
            ? { ...workout, completed: !workout.completed }
            : workout
        )
      }))
    );
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
                <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-2xl font-bold">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <Button variant="outline" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
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
                              {dayWorkouts.slice(0, 3).map((workout, idx) => (
                                <div
                                  key={idx}
                                  className={`w-2 h-2 rounded-full ${
                                    workout.type === 'strength' ? 'bg-blue-400' :
                                    workout.type === 'cardio' ? 'bg-red-400' : 'bg-green-400'
                                  } ${workout.completed ? 'opacity-100' : 'opacity-50'}`}
                                />
                              ))}
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
                  {workoutDays.reduce((sum, day) => sum + day.workouts.length, 0)}
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
                  {workoutDays.reduce((sum, day) => sum + day.workouts.filter(w => w.completed).length, 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Finished</p>
              </CardContent>
            </Card>

            <Card className="bg-linear-to-br from-purple-50 to-white border-purple-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Active Days</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600">{workoutDays.length}</p>
                <p className="text-xs text-gray-500 mt-1">With workouts</p>
              </CardContent>
            </Card>

            <Card className="bg-linear-to-br from-orange-50 to-white border-orange-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-600">
                  {Math.round((workoutDays.reduce((sum, day) => sum + day.workouts.filter(w => w.completed).length, 0) / 
                    Math.max(workoutDays.reduce((sum, day) => sum + day.workouts.length, 0), 1)) * 100)}%
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
                {getWorkoutsForDay(selectedDay).map((workout) => (
                  <Card key={workout.id} className={`${workout.completed ? 'bg-green-50 border-green-200' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center gap-2 ${getTypeBadgeColor(workout.type)} px-2 py-1 rounded-md text-xs font-medium`}>
                            {getTypeIcon(workout.type)}
                            <span className="capitalize">{workout.type}</span>
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
                      
                      <h3 className="font-semibold text-gray-900 mb-2">{workout.name}</h3>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {workout.time}
                        </span>
                        <span>•</span>
                        <span>{workout.duration}</span>
                      </div>

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
                ))}
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
