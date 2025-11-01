
'use client';

import Link from 'next/link';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from './ui/button';
import { FolderClock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Skeleton } from './ui/skeleton';

export function Header() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Logo className="h-8 w-8" />
            <span className="font-bold font-headline sm:inline-block">
              Profit Pakistan (Free)
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/history">
                <FolderClock className="h-5 w-5"/>
                <span className="sr-only">My Reports</span>
            </Link>
          </Button>
          {isClient ? <ThemeToggle /> : <Skeleton className="h-10 w-10 rounded-full" />}
          <Button
            className="rounded-full text-sm font-medium px-5 py-2 transition-colors bg-primary hover:bg-primary/90"
            variant="default"
            onClick={() => router.push('/upgrade')}
          >
            Upgrade
          </Button>
        </div>
      </div>
    </header>
  );
}
