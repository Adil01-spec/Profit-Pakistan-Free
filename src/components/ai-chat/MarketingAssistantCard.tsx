
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Loader2, Send, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useUsage } from '@/hooks/use-usage';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export function MarketingAssistantCard() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '💎 ProfitGen says: Hi, I’m ProfitGen — your smart marketing assistant. I’ll help you improve your ads, optimize Shopify sales, and increase profitability — all tailored for Pakistani entrepreneurs.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const { usageState, canUseFeature, recordFeatureUsage, grantUsage } = useUsage();
  const [showAdPrompt, setShowAdPrompt] = useState(false);
  const [isAdLoading, setIsAdLoading] = useState(false);
  
  const canSendPrompt = canUseFeature('ai');
  const promptsLeft = usageState.ai.limit - usageState.ai.used;

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (!canSendPrompt) {
        setShowAdPrompt(true);
        return;
    }

    const userMessage: Message = { role: 'user', content: input.trim() };
    const newMessagesForApi = [...messages, userMessage];
    setMessages(newMessagesForApi);
    setInput('');
    setIsLoading(true);

    try {
      recordFeatureUsage('ai');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send the message history for context
        body: JSON.stringify({ messages: newMessagesForApi.slice(1) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'API error');
      }
      
      const aiMessage: Message = { role: 'assistant', content: data.reply };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('API Error:', error);
      toast({
        variant: 'destructive',
        title: '⚠️ Something went wrong.',
        description: error.message || 'Please try again later.',
      });
      // Rollback the user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleWatchAd = () => {
    setIsAdLoading(true);
    setTimeout(() => {
        grantUsage('ai', 1);
        setIsAdLoading(false);
        setShowAdPrompt(false);
        toast({
            title: "✅ Access unlocked!",
            description: "You've earned 1 more AI prompt.",
        });
    }, 1500);
  };

  const onAdPromptOpenChange = (open: boolean) => {
    if (!open) {
        setShowAdPrompt(false);
        if (!isAdLoading) {
             toast({
                variant: 'destructive',
                title: '⚠️ Watch an ad to send more messages.',
            });
        }
    }
  }


  return (
    <>
      <Card className="flex h-full flex-col">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">ProfitGen</CardTitle>
          <CardDescription>Smart insights for your next business move.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col p-0">
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-3 animate-in fade-in',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      <Bot size={20} />
                    </div>
                  )}
                  <div
                    className={cn(
                      'rounded-lg p-3 max-w-[85%] whitespace-pre-wrap',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <div className="p-2 rounded-full bg-accent text-accent-foreground">
                      <User size={20} />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3 justify-start animate-in fade-in">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    <Bot size={20} />
                  </div>
                  <div className="rounded-lg p-3 bg-muted flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p className="text-sm text-muted-foreground">AI is thinking...</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="border-t p-4 bg-background/95">
             <div className="relative">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder={canSendPrompt ? "Ask about marketing, ads..." : "Daily AI limit reached"}
                                className="flex-1 pr-10"
                                disabled={isLoading || !canSendPrompt}
                            />
                        </TooltipTrigger>
                        {!canSendPrompt && (
                             <TooltipContent>
                                <p>Watch ad to unlock.</p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>

                <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()} className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" size="icon">
                    <Send size={18} />
                    <span className="sr-only">Send</span>
                </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Free users get {usageState.ai.limit} AI prompts daily. {promptsLeft > 0 ? `${promptsLeft} left.` : "Watch ads to unlock more."}
            </p>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showAdPrompt} onOpenChange={onAdPromptOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Free AI Limit Reached</AlertDialogTitle>
            <AlertDialogDescription>
              You’ve used your free AI prompts for today. Watch a short ad to unlock 1 more prompt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Maybe Later</AlertDialogCancel>
            <AlertDialogAction onClick={handleWatchAd} disabled={isAdLoading}>
                {isAdLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Watch Ad
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
