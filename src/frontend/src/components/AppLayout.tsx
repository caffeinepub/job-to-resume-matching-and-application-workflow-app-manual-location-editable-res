import { LoginButton } from './LoginButton';
import { useGetCallerUserProfile } from '../hooks/useUserProfile';
import { FileText, Mail, MapPin, Briefcase, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

type View = 'resume' | 'coverLetter' | 'location' | 'jobs';

interface AppLayoutProps {
  children: React.ReactNode;
  currentView: View;
  onViewChange: (view: View) => void;
}

export function AppLayout({ children, currentView, onViewChange }: AppLayoutProps) {
  const { data: userProfile } = useGetCallerUserProfile();

  const navItems: { view: View; label: string; icon: React.ReactNode }[] = [
    { view: 'jobs', label: 'Jobs', icon: <Briefcase className="h-4 w-4" /> },
    { view: 'resume', label: 'Resume', icon: <FileText className="h-4 w-4" /> },
    { view: 'coverLetter', label: 'Cover Letter', icon: <Mail className="h-4 w-4" /> },
    { view: 'location', label: 'Location', icon: <MapPin className="h-4 w-4" /> },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">JobMatch</h1>
          </div>
          <div className="flex items-center gap-4">
            {userProfile && (
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {userProfile.name}
              </span>
            )}
            <LoginButton />
          </div>
        </div>
      </header>

      <nav className="border-b bg-card">
        <div className="container px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {navItems.map((item) => (
              <Button
                key={item.view}
                variant={currentView === item.view ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange(item.view)}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <div className="container py-6 px-4">{children}</div>
      </main>

      <footer className="border-t bg-card py-6">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1">
            Built with <Heart className="h-4 w-4 fill-destructive text-destructive" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                window.location.hostname
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4 hover:text-foreground"
            >
              caffeine.ai
            </a>
          </p>
          <p className="mt-2 text-xs">© {new Date().getFullYear()} JobMatch. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
