
import { AIChatScreen } from '@/components/ai-chat/AIChatScreen';
import { Header } from '@/components/header';

export default function AIChatPage() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 flex flex-col">
        <AIChatScreen />
      </main>
    </div>
  );
}
