'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Bot, Send, User, Loader2, Sparkles, X, Zap, TrendingUp, Dumbbell, MessageSquare, Copy, Check, RefreshCw, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export default function AIAssistant() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hi! 👋 I\'m your **AI fitness assistant**. I can help you:\n\n• Create personalized workout plans\n• Suggest exercises and routines\n• Give nutrition advice\n• Answer fitness-related questions\n• Track your progress\n\nWhat would you like to know?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userId: user?.id,
        }),
      });

      const data = await response.json();
      
      // Handle error response
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to get response');
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ **Error:** ${error?.message || 'Sorry, I encountered an error. Please try again.'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const regenerateResponse = async (messageIndex: number) => {
    if (messageIndex === 0 || isLoading) return;
    
    // Remove messages from the selected index onwards
    const previousMessages = messages.slice(0, messageIndex);
    setMessages(previousMessages);
    
    // Get the last user message
    const lastUserMessage = previousMessages[previousMessages.length - 1];
    if (lastUserMessage && lastUserMessage.role === 'user') {
      // Regenerate by resending the last user message
      setIsLoading(true);
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: previousMessages,
            userId: user?.id,
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to regenerate response');
        }
        
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
      } catch (error: any) {
        console.error('Regenerate error:', error);
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `❌ **Error:** ${error?.message || 'Failed to regenerate. Please try again.'}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const quickActions = [
    { icon: Dumbbell, label: 'Workout Plan', prompt: 'Create a personalized workout plan for me based on my fitness level', description: 'Get a custom plan' },
    { icon: TrendingUp, label: 'Progress Tips', prompt: 'Give me evidence-based tips to improve my fitness progress', description: 'Boost your results' },
    { icon: Zap, label: 'Quick Exercise', prompt: 'Suggest a quick 15-minute high-intensity workout I can do at home', description: 'Fast and effective' },
    { icon: MessageSquare, label: 'Nutrition', prompt: 'What should my nutrition look like to support my fitness goals?', description: 'Eat for success' },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative hover:bg-black hover:text-white transition-all duration-300 group border border-transparent hover:border-black hover:shadow-lg hover:scale-110 active:scale-95"
        >
          <Sparkles className="w-5 h-5 text-black group-hover:text-white transition-colors animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-black"></span>
          </span>
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-2xl flex flex-col h-full p-0 bg-white border-l-2 border-black">
        {/* Accessible Title (hidden but required for screen readers) */}
        <SheetTitle className="sr-only">AI Fitness Coach Chat</SheetTitle>
        <SheetDescription className="sr-only">Chat with your AI fitness coach for personalized workout plans and advice</SheetDescription>
        
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-black bg-linear-to-r from-black to-gray-900 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
                <Bot className="w-6 h-6 text-black" />
              </div>
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  AI Fitness Coach
                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                </h2>
                <p className="text-xs text-gray-300">Powered by Google Gemini</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMessages([messages[0]])}
                  className="text-white hover:bg-white/10 text-xs"
                >
                  Clear Chat
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-gray-50">
          {/* Messages */}
          <ScrollArea className="flex-1 px-6 py-4">
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 group",
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Avatar */}
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 shadow-sm",
                    message.role === 'assistant' 
                      ? 'bg-black border-black' 
                      : 'bg-white border-black'
                  )}>
                    {message.role === 'assistant' ? (
                      <Bot className="w-4 h-4 text-white" />
                    ) : (
                      <User className="w-4 h-4 text-black" />
                    )}
                  </div>
                  
                  {/* Message Content */}
                  <div className="flex-1 max-w-[80%] space-y-2">
                    {/* Message Bubble */}
                    <div className={cn(
                      "rounded-2xl p-4 border-2 shadow-sm hover:shadow-md transition-shadow duration-200",
                      message.role === 'user'
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-200'
                    )}>
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">AI Coach</span>
                          {message.timestamp && (
                            <span className="text-xs text-gray-400">
                              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      )}
                      <div className={cn(
                        "text-sm leading-relaxed prose prose-sm max-w-none",
                        message.role === 'user' 
                          ? 'prose-invert' 
                          : 'prose-neutral'
                      )}>
                        {message.role === 'assistant' ? (
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                              ul: ({node, ...props}) => <ul className="mb-2 ml-4 list-disc" {...props} />,
                              ol: ({node, ...props}) => <ol className="mb-2 ml-4 list-decimal" {...props} />,
                              li: ({node, ...props}) => <li className="mb-1" {...props} />,
                              strong: ({node, ...props}) => <strong className="font-bold text-black" {...props} />,
                              code: ({node, ...props}) => <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono" {...props} />,
                              pre: ({node, ...props}) => <pre className="p-3 bg-gray-100 rounded-lg overflow-x-auto my-2" {...props} />,
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        ) : (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Message Actions - Only show for assistant messages */}
                    {message.role === 'assistant' && message.id !== 'welcome' && (
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(message.content, message.id)}
                          className="h-7 px-2 text-xs hover:bg-gray-100"
                        >
                          {copiedId === message.id ? (
                            <>
                              <Check className="w-3 h-3 mr-1" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => regenerateResponse(index)}
                          disabled={isLoading}
                          className="h-7 px-2 text-xs hover:bg-gray-100"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Regenerate
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4 animate-in fade-in duration-500">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center shrink-0 border-2 border-black">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 max-w-[80%] rounded-2xl p-4 bg-white border-2 border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs text-gray-500">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Quick Actions - Only show when empty */}
          {messages.length <= 1 && (
            <div className="px-6 py-4 border-t-2 border-gray-200 bg-linear-to-br from-white to-gray-50">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-black" />
                <p className="text-xs font-bold uppercase tracking-wider text-gray-600">Suggested Actions</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => setInput(action.prompt)}
                    className="flex flex-col items-start gap-2 p-4 rounded-xl border-2 border-gray-200 hover:border-black hover:bg-black hover:text-white transition-all duration-200 group text-left"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-white flex items-center justify-center transition-colors">
                        <action.icon className="w-4 h-4 text-black" />
                      </div>
                      <span className="text-sm font-semibold">{action.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 group-hover:text-gray-300">
                      {action.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="px-6 py-4 border-t-2 border-black bg-white">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    value={input || ''}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    placeholder="Ask your AI fitness coach..."
                    disabled={isLoading}
                    maxLength={500}
                    className="w-full pr-16 h-12 rounded-xl border-2 border-gray-300 focus:border-black focus:ring-0 text-sm placeholder:text-gray-400 transition-all duration-200"
                  />
                  <div className={cn(
                    "absolute right-3 top-1/2 -translate-y-1/2 text-xs transition-colors",
                    input?.length > 450 ? "text-orange-500 font-semibold" : "text-gray-400"
                  )}>
                    {input?.length || 0}/500
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading || !input?.trim()}
                  size="lg"
                  className={cn(
                    "h-12 px-6 rounded-xl font-medium transition-all duration-200 shadow-sm",
                    isLoading || !input?.trim()
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-black text-white hover:bg-gray-800 hover:shadow-lg hover:scale-105 active:scale-95"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-between text-xs">
                <p className="text-gray-400">
                  Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-300 font-mono">Enter</kbd> to send
                </p>
                <p className="text-gray-400">
                  AI can make mistakes. Verify important info.
                </p>
              </div>
            </form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
