'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedNavbar from '@/components/shared/protected-navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, Scale, Dumbbell, Activity, Calendar, Edit, Trash2, LineChart as LineChartIcon, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useAuth } from '@/lib/auth';
import { trackingPlanService, trackingEntryService } from '@/lib/database';
import type { TrackingPlan, TrackingEntry } from '@/lib/supabase';

interface TrackingPlanWithEntries extends TrackingPlan {
  tracking_entries?: TrackingEntry[];
}

const UNITS = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'lbs', label: 'Pounds (lbs)' },
  { value: 'cm', label: 'Centimeters (cm)' },
  { value: 'inches', label: 'Inches (in)' },
  { value: 'reps', label: 'Repetitions' },
  { value: 'sets', label: 'Sets' },
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
  { value: '%', label: 'Percentage (%)' },
];

const CATEGORIES = [
  { value: 'weight', label: 'Body Weight', icon: Scale },
  { value: 'strength', label: 'Strength Training', icon: Dumbbell },
  { value: 'measurement', label: 'Body Measurements', icon: Activity },
  { value: 'other', label: 'Other', icon: LineChartIcon },
];

export default function TrackingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [trackingPlans, setTrackingPlans] = useState<TrackingPlanWithEntries[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPlan, setNewPlan] = useState({ title: '', unit: '', category: '' });
  const [newEntry, setNewEntry] = useState({ planId: '', value: '', date: new Date().toISOString().split('T')[0], note: '' });
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Fetch tracking plans on mount
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }
    
    if (user) {
      fetchTrackingPlans();
    }
  }, [user, authLoading, router]);

  const fetchTrackingPlans = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await trackingPlanService.getTrackingPlans(user.id);
    
    if (error) {
      console.error('Error fetching tracking plans:', error);
    } else {
      setTrackingPlans(data || []);
    }
    setLoading(false);
  };

  const createTrackingPlan = async () => {
    if (!newPlan.title || !newPlan.unit || !newPlan.category || !user) return;

    const { data, error } = await trackingPlanService.createTrackingPlan({
      user_id: user.id,
      title: newPlan.title,
      unit: newPlan.unit,
      category: newPlan.category as 'weight' | 'strength' | 'measurement' | 'other',
      is_active: true,
    });

    if (error) {
      console.error('Error creating tracking plan:', error);
    } else {
      setNewPlan({ title: '', unit: '', category: '' });
      setIsCreatePlanOpen(false);
      fetchTrackingPlans();
    }
  };

  const addEntry = async () => {
    if (!newEntry.planId || !newEntry.value || !newEntry.date) return;

    const { data, error} = await trackingEntryService.createTrackingEntry({
      tracking_plan_id: newEntry.planId,
      value: parseFloat(newEntry.value),
      entry_date: newEntry.date,
      notes: newEntry.note || undefined,
    });

    if (error) {
      console.error('Error adding entry:', error);
    } else {
      setNewEntry({ planId: '', value: '', date: new Date().toISOString().split('T')[0], note: '' });
      fetchTrackingPlans();
    }
  };

  const deletePlan = async (planId: string) => {
    const { error } = await trackingPlanService.deleteTrackingPlan(planId);
    
    if (error) {
      console.error('Error deleting plan:', error);
    } else {
      fetchTrackingPlans();
    }
  };

  const getChartData = (entries?: TrackingEntry[]) => {
    if (!entries) return [];
    return entries.map(entry => ({
      date: new Date(entry.entry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: entry.value,
      fullDate: entry.entry_date,
    })).sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
  };

  const getCategoryIcon = (category: string) => {
    const categoryInfo = CATEGORIES.find(cat => cat.value === category);
    const Icon = categoryInfo?.icon || LineChartIcon;
    return <Icon className="w-4 h-4" />;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'weight': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'strength': return 'bg-red-100 text-red-700 border-red-200';
      case 'measurement': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-purple-100 text-purple-700 border-purple-200';
    }
  };

  const chartConfig = {
    value: {
      label: "Value",
      color: "hsl(var(--chart-1))",
    },
  };

  if (authLoading || loading) {
    return (
      <>
        <ProtectedNavbar />
        <div className="min-h-screen bg-linear-to-b from-white via-sky-50 to-white pt-28 pb-12 px-4 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
        </div>
      </>
    );
  }

  return (
    <>
      <ProtectedNavbar />
      <div className="min-h-screen bg-linear-to-b from-white via-sky-50 to-white pt-28 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Progress Tracking</h1>
              <p className="text-gray-600">Track your fitness journey with custom tracking plans</p>
            </div>
            <Dialog open={isCreatePlanOpen} onOpenChange={setIsCreatePlanOpen}>
              <DialogTrigger asChild>
                <Button className="bg-linear-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tracking Plan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Tracking Plan</DialogTitle>
                  <DialogDescription>
                    Set up a new plan to track your progress over time
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Plan Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Body Weight, Bench Press 1RM"
                      value={newPlan.title}
                      onChange={(e) => setNewPlan(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newPlan.category} onValueChange={(value) => setNewPlan(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(category => (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex items-center gap-2">
                              <category.icon className="w-4 h-4" />
                              {category.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Select value={newPlan.unit} onValueChange={(value) => setNewPlan(prev => ({ ...prev, unit: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {UNITS.map(unit => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={createTrackingPlan} className="w-full">
                    Create Plan
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Period Selection */}
          <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as any)} className="mb-6">
            <TabsList>
              <TabsTrigger value="daily">Daily View</TabsTrigger>
              <TabsTrigger value="weekly">Weekly View</TabsTrigger>
              <TabsTrigger value="monthly">Monthly View</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Tracking Plans */}
          {trackingPlans.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <LineChartIcon className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tracking Plans Yet</h3>
                <p className="text-gray-600 mb-6 text-center max-w-md">
                  Create your first tracking plan to start monitoring your fitness progress over time
                </p>
                <Dialog open={isCreatePlanOpen} onOpenChange={setIsCreatePlanOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Plan
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {trackingPlans.map((plan) => {
                const entries = plan.tracking_entries || [];
                return (
                  <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(plan.category)}`}>
                            {getCategoryIcon(plan.category)}
                          </div>
                          <div>
                            <CardTitle className="text-xl">{plan.title}</CardTitle>
                            <CardDescription>
                              {entries.length} entries • Unit: {plan.unit}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={getCategoryColor(plan.category)}>
                            {CATEGORIES.find(cat => cat.value === plan.category)?.label}
                          </Badge>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => setNewEntry(prev => ({ ...prev, planId: plan.id, date: new Date().toISOString().split('T')[0] }))}
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Log Data
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Entry to {plan.title}</DialogTitle>
                                <DialogDescription>Record a new data point for this tracking plan</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="value">Value ({plan.unit})</Label>
                                  <Input
                                    id="value"
                                    type="number"
                                    step="0.1"
                                    placeholder={`Enter value in ${plan.unit}`}
                                    value={newEntry.value}
                                    onChange={(e) => setNewEntry(prev => ({ ...prev, value: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="date">Date</Label>
                                  <Input
                                    id="date"
                                    type="date"
                                    value={newEntry.date}
                                    onChange={(e) => setNewEntry(prev => ({ ...prev, date: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="note">Note (optional)</Label>
                                  <Input
                                    id="note"
                                    placeholder="Add a note about this entry"
                                    value={newEntry.note}
                                    onChange={(e) => setNewEntry(prev => ({ ...prev, note: e.target.value }))}
                                  />
                                </div>
                                <Button onClick={addEntry} className="w-full">
                                  Add Entry
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deletePlan(plan.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {entries.length === 0 ? (
                        <div className="text-center py-8">
                          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500">No entries yet. Start logging your data!</p>
                        </div>
                      ) : (
                        <>
                          {/* Chart */}
                          <div className="mb-6">
                            <ChartContainer config={chartConfig} className="h-64">
                              <LineChart data={getChartData(entries)}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Line
                                  type="monotone"
                                  dataKey="value"
                                  stroke="var(--color-value)"
                                  strokeWidth={2}
                                  dot={{ r: 4 }}
                                  activeDot={{ r: 6 }}
                                />
                              </LineChart>
                            </ChartContainer>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-600">Latest</p>
                              <p className="font-semibold">
                                {entries[entries.length - 1]?.value} {plan.unit}
                              </p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-600">Best</p>
                              <p className="font-semibold">
                                {Math.max(...entries.map(e => e.value))} {plan.unit}
                              </p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-600">Average</p>
                              <p className="font-semibold">
                                {(entries.reduce((sum, e) => sum + e.value, 0) / entries.length).toFixed(1)} {plan.unit}
                              </p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-600">Change</p>
                              <p className={`font-semibold flex items-center justify-center gap-1 ${
                                entries.length > 1 && entries[entries.length - 1].value > entries[0].value
                                  ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {entries.length > 1 && (
                                  <>
                                    <TrendingUp className="w-3 h-3" />
                                    {((entries[entries.length - 1].value - entries[0].value) / entries[0].value * 100).toFixed(1)}%
                                  </>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Recent Entries */}
                          <div>
                            <h4 className="font-medium mb-3">Recent Entries</h4>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {entries.slice(-5).reverse().map((entry) => (
                                <div key={entry.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div>
                                    <p className="font-medium">{entry.value} {plan.unit}</p>
                                    <p className="text-sm text-gray-600">
                                      {new Date(entry.entry_date).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric', 
                                        year: 'numeric' 
                                      })}
                                    </p>
                                  </div>
                                  {entry.notes && (
                                    <p className="text-sm text-gray-500 italic">{entry.notes}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
