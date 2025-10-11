import Link from 'next/link';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from './ui/button';
import { FolderClock } from 'lucide-react';
import { SettingsDialog } from './settings-dialog';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Logo className="h-8 w-8" />
            <span className="font-bold font-headline sm:inline-block">
              Profit Pakistan Pro
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
          <SettingsDialog />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
