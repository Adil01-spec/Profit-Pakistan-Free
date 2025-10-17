
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Loader2, SendHoriz, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { runChat } from '@/ai/flows/marketing-chat-flow';
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

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const MESSAGE_LIMIT = 5;

export function AIChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedCount = Number(localStorage.getItem('aiMessageCount') || '0');
    setMessageCount(storedCount);
    if (storedCount >= MESSAGE_LIMIT) {
      setLimitReached(true);
    }
  }, []);

  const incrementMessageCount = () => {
    const newCount = messageCount + 1;
    setMessageCount(newCount);
    localStorage.setItem('aiMessageCount', String(newCount));
    if (newCount >= MESSAGE_LIMIT) {
      setLimitReached(true);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (messageCount >= MESSAGE_LIMIT) {
        setLimitReached(true);
        return;
    }

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await runChat([
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: newUserMessage.role, content: newUserMessage.content }
      ]);
      
      const newAiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
      };
      setMessages((prev) => [...prev, newAiMessage]);
      incrementMessageCount();

    } catch (error) {
      console.error('AI chat error:', error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Could not get a response from the AI. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages])

  const handleWatchAd = () => {
    // In a real app, you would show a rewarded ad here.
    // For this demo, we'll just reset the counter.
    localStorage.setItem('aiMessageCount', '0');
    setMessageCount(0);
    setLimitReached(false);
    toast({
      title: 'Thanks for watching!',
      description: 'You can now send more messages.',
    });
  };

  return (
    <>
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto bg-card">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex items-start gap-3',
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
                  'rounded-lg p-3 max-w-sm md:max-w-md lg:max-w-lg',
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
            <div className="flex items-start gap-3 justify-start">
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
      <div className="border-t p-4 bg-background">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything about marketing, ads, or sales!"
            className="flex-1"
            disabled={isLoading || limitReached}
          />
          <Button onClick={handleSendMessage} disabled={isLoading || !input.trim() || limitReached}>
            <SendHoriz size={18} />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
    </div>
    <AlertDialog open={limitReached} onOpenChange={setLimitReached}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Message Limit Reached</AlertDialogTitle>
            <AlertDialogDescription>
              You've reached your free limit of {MESSAGE_LIMIT} messages. Please watch a short ad to continue or upgrade for unlimited access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Maybe Later</AlertDialogCancel>
            <AlertDialogAction onClick={handleWatchAd}>Watch Ad</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
