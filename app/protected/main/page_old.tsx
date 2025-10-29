'use client';

import Link from 'next/link';
import ProtectedNavbar from '@/components/shared/protected-navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, TrendingUp, Dumbbell, ArrowRight, Sparkles, Target, Activity } from 'lucide-react';

export default function MainPage() {
  const features = [
    {
      title: 'Schedule',
      description: 'Plan and track your weekly fitness routine with personalized workout schedules',
      icon: Calendar,
      href: '/protected/schedule',
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      stats: '8 workouts this week'
    },
    {
      title: 'Progress Tracking',
      description: 'Monitor your fitness journey with custom tracking plans and detailed analytics',
      icon: TrendingUp,
      href: '/protected/tracking',
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      stats: '2 active tracking plans'
    },
    {
      title: 'Workouts',
      description: 'Access a comprehensive library of exercises and create custom workout routines',
      icon: Dumbbell,
      href: '/protected/workouts',
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      stats: '50+ exercises available'
    },
  ];

  const quickStats = [
    { label: 'Workout Streak', value: '5 days', icon: Target },
    { label: 'This Week', value: '4 workouts', icon: Activity },
    { label: 'Total Progress', value: '85%', icon: Sparkles },
  ];
        content: "I understand your question! Let me help you with that. As your AI fitness coach, I can provide personalized workout plans, nutrition advice, and track your progress. What specific area would you like to focus on?",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedPrompts = [
    'Create a workout plan for me',
    'What should I eat before a workout?',
    'How can I improve my running endurance?',
    'Suggest exercises for core strength',
  ];

  return (
    <>
      <ProtectedNavbar />
      <div className="min-h-screen bg-linear-to-b from-white via-sky-50 to-white pt-24 pb-6 px-4">
        <div className="container mx-auto max-w-4xl h-[calc(100vh-8rem)] flex flex-col">
          {/* Chat Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-linear-to-br from-sky-400 to-sky-600 rounded-full flex items-center justify-center shadow-lg">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Chat with Fitelier</h1>
                <p className="text-sm text-gray-600">Your AI-powered personal trainer</p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <Card className="flex-1 mb-4 p-0 overflow-hidden">
            <ScrollArea className="h-full p-6">
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="w-8 h-8 bg-linear-to-br from-sky-400 to-sky-600">
                        <AvatarFallback className="bg-transparent text-white">
                          <Sparkles className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-linear-to-r from-sky-500 to-sky-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {message.role === 'user' && (
                      <Avatar className="w-8 h-8 bg-sky-100">
                        <AvatarFallback className="bg-sky-100 text-sky-600 font-semibold">
                          JD
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="w-8 h-8 bg-linear-to-br from-sky-400 to-sky-600">
                      <AvatarFallback className="bg-transparent text-white">
                        <Sparkles className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>

          {/* Suggested Prompts (only show when no messages) */}
          {messages.length === 1 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">Try asking:</p>
              <div className="grid grid-cols-2 gap-2">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(prompt)}
                    className="text-left text-sm p-3 rounded-lg border border-sky-200 hover:border-sky-400 hover:bg-sky-50 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Fitelier, your personal trainer..."
              className="pr-12 min-h-[60px] resize-none"
              disabled={loading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              size="icon"
              className="absolute right-2 bottom-2 bg-linear-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}