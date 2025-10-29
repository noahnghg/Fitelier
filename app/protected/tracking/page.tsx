'use client';

import { useState } from 'react';
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
import { Plus, TrendingUp, Scale, Dumbbell, Activity, Calendar, Edit, Trash2, LineChart as LineChartIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface TrackingEntry {
  id: string;
  date: string;
  value: number;
  note?: string;
}

interface TrackingPlan {
  id: string;
  title: string;
  unit: string;
  category: 'weight' | 'strength' | 'measurement' | 'other';
  entries: TrackingEntry[];
  createdAt: string;
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
  const [trackingPlans, setTrackingPlans] = useState<TrackingPlan[]>([
    {
      id: '1',
      title: 'Body Weight',
      unit: 'kg',
      category: 'weight',
      createdAt: '2025-10-20',
      entries: [
        { id: '1', date: '2025-10-20', value: 75.5 },
        { id: '2', date: '2025-10-22', value: 75.2 },
        { id: '3', date: '2025-10-24', value: 75.0 },
        { id: '4', date: '2025-10-26', value: 74.8 },
        { id: '5', date: '2025-10-28', value: 74.5 },
      ],
    },
    {
      id: '2',
      title: 'Bench Press 1RM',
      unit: 'kg',
      category: 'strength',
      createdAt: '2025-10-15',
      entries: [
        { id: '1', date: '2025-10-15', value: 80 },
        { id: '2', date: '2025-10-20', value: 82.5 },
        { id: '3', date: '2025-10-25', value: 85 },
        { id: '4', date: '2025-10-28', value: 87.5 },
      ],
    },
  ]);

  const [newPlan, setNewPlan] = useState({ title: '', unit: '', category: '' });
  const [newEntry, setNewEntry] = useState({ planId: '', value: '', date: '', note: '' });
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const createTrackingPlan = () => {
    if (!newPlan.title || !newPlan.unit || !newPlan.category) return;

    const plan: TrackingPlan = {
      id: Date.now().toString(),
      title: newPlan.title,
      unit: newPlan.unit,
      category: newPlan.category as any,
      entries: [],
      createdAt: new Date().toISOString().split('T')[0],
    };

    setTrackingPlans(prev => [...prev, plan]);
    setNewPlan({ title: '', unit: '', category: '' });
    setIsCreatePlanOpen(false);
  };

  const addEntry = () => {
    if (!newEntry.planId || !newEntry.value || !newEntry.date) return;

    const entry: TrackingEntry = {
      id: Date.now().toString(),
      date: newEntry.date,
      value: parseFloat(newEntry.value),
      note: newEntry.note || undefined,
    };

    setTrackingPlans(prev =>
      prev.map(plan =>
        plan.id === newEntry.planId
          ? { ...plan, entries: [...plan.entries, entry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) }
          : plan
      )
    );

    setNewEntry({ planId: '', value: '', date: '', note: '' });
    setIsAddEntryOpen(false);
  };

  const deletePlan = (planId: string) => {
    setTrackingPlans(prev => prev.filter(plan => plan.id !== planId));
  };

  const getChartData = (entries: TrackingEntry[]) => {
    return entries.map(entry => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: entry.value,
      fullDate: entry.date,
    }));
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
              {trackingPlans.map((plan) => (
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
                            {plan.entries.length} entries • Unit: {plan.unit}
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
                    {plan.entries.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No entries yet. Start logging your data!</p>
                      </div>
                    ) : (
                      <>
                        {/* Chart */}
                        <div className="mb-6">
                          <ChartContainer config={chartConfig} className="h-64">
                            <LineChart data={getChartData(plan.entries)}>
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
                              {plan.entries[plan.entries.length - 1]?.value} {plan.unit}
                            </p>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Best</p>
                            <p className="font-semibold">
                              {Math.max(...plan.entries.map(e => e.value))} {plan.unit}
                            </p>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Average</p>
                            <p className="font-semibold">
                              {(plan.entries.reduce((sum, e) => sum + e.value, 0) / plan.entries.length).toFixed(1)} {plan.unit}
                            </p>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Change</p>
                            <p className={`font-semibold flex items-center justify-center gap-1 ${
                              plan.entries.length > 1 && plan.entries[plan.entries.length - 1].value > plan.entries[0].value
                                ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {plan.entries.length > 1 && (
                                <>
                                  <TrendingUp className="w-3 h-3" />
                                  {((plan.entries[plan.entries.length - 1].value - plan.entries[0].value) / plan.entries[0].value * 100).toFixed(1)}%
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Recent Entries */}
                        <div>
                          <h4 className="font-medium mb-3">Recent Entries</h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {plan.entries.slice(-5).reverse().map((entry) => (
                              <div key={entry.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div>
                                  <p className="font-medium">{entry.value} {plan.unit}</p>
                                  <p className="text-sm text-gray-600">
                                    {new Date(entry.date).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric', 
                                      year: 'numeric' 
                                    })}
                                  </p>
                                </div>
                                {entry.note && (
                                  <p className="text-sm text-gray-500 italic">{entry.note}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
