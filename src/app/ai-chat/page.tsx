
'use client';

import { MarketingAssistantCard } from '@/components/ai-chat/MarketingAssistantCard';
import { Header } from '@/components/header';

export default function AIChatPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <Header />
      <main className="flex-1 flex flex-col p-4 md:p-6 items-center">
        <div className="w-full max-w-3xl flex-1 h-full">
          <MarketingAssistantCard />
        </div>
      </main>
    </div>
  );
}
