import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { LoginButton } from './LoginButton';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { identity, loginStatus } = useInternetIdentity();

  const isAuthenticated = !!identity;
  const isInitializing = loginStatus === 'initializing';

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-soft">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome to JobMatch</CardTitle>
            <CardDescription className="text-base">
              Track jobs, match your resume, and manage applications all in one place.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <LoginButton />
            <p className="text-xs text-muted-foreground text-center">
              Sign in to access your personalized job tracking dashboard
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
