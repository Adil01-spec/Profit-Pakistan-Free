
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
import { runChat } from '@/ai/flows/marketing-chat-flow';


type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const MESSAGE_LIMIT = 5;

export function MarketingAssistantCard() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 Hi! I’m your Profit Pakistan Marketing Assistant. Ask me how to market your products effectively!',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const storedCount = Number(localStorage.getItem('aiMessageCount') || '0');
      setSessionCount(storedCount);
      if (storedCount >= MESSAGE_LIMIT) {
        setLimitReached(true);
      }
    } catch (error) {
      console.error("Could not access localStorage:", error);
    }
  }, []);

  const incrementSessionCount = useCallback(() => {
    try {
        const newCount = sessionCount + 1;
        setSessionCount(newCount);
        localStorage.setItem('aiMessageCount', String(newCount));
        if (newCount >= MESSAGE_LIMIT) {
            setLimitReached(true);
        }
    } catch (error) {
      console.error("Could not write to localStorage:", error);
    }
  }, [sessionCount]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (sessionCount >= MESSAGE_LIMIT) {
      setLimitReached(true);
      return;
    }

    const userMessage: Message = { role: 'user', content: input.trim() };
    const newMessages: Message[] = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const aiContent = await runChat(newMessages);

      const aiMessage: Message = { role: 'assistant', content: aiContent };
      setMessages((prev) => [...prev, aiMessage]);
      incrementSessionCount();
    } catch (error) {
      console.error('AI API Error:', error);
      toast({
        variant: 'destructive',
        title: '⚠️ Something went wrong.',
        description: 'Please try again later.',
      });
      // Rollback the user message if AI fails
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
    // In a real app, this would trigger a rewarded ad.
    // For now, we'll just reset the counter.
    try {
        localStorage.setItem('aiMessageCount', '0');
        setSessionCount(0);
        setLimitReached(false);
        toast({
            title: "Thank You!",
            description: "You can now send more messages.",
        });
    } catch (error) {
        console.error("Could not write to localStorage:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not reset your session. Please check your browser settings.",
        });
    }
  };


  return (
    <>
      <Card className="flex h-full flex-col">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">AI Marketing Assistant</CardTitle>
          <CardDescription>Get instant marketing advice for your e-commerce business</CardDescription>
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
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about marketing, ads..."
                className="flex-1"
                disabled={isLoading || limitReached}
              />
              <Button onClick={handleSendMessage} disabled={isLoading || !input.trim() || limitReached}>
                <Send size={18} />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={limitReached}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Free AI Limit Reached</AlertDialogTitle>
            <AlertDialogDescription>
              You’ve reached your free AI limit of {MESSAGE_LIMIT} messages for this session. Watch an ad to continue or upgrade to Profit Pro Pakistan for unlimited AI access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
             {/* Optional: Add upgrade logic later */}
             {/* <Button variant="secondary" onClick={() => window.open('https://example.com/upgrade', '_blank')}>Upgrade</Button> */}
            <AlertDialogCancel onClick={() => setLimitReached(false)}>Maybe Later</AlertDialogCancel>
            <AlertDialogAction onClick={handleWatchAd}>Watch Ad</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
