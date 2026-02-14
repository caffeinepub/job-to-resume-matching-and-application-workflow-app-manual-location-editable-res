import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useUserProfile';
import { AuthGate } from './components/AuthGate';
import { ProfileSetupDialog } from './components/ProfileSetupDialog';
import { AppLayout } from './components/AppLayout';
import { ResumeEditor } from './components/ResumeEditor';
import { CoverLetterEditor } from './components/CoverLetterEditor';
import { LocationSettings } from './components/LocationSettings';
import { JobsList } from './components/JobsList';
import { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

type View = 'resume' | 'coverLetter' | 'location' | 'jobs';

export default function App() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [currentView, setCurrentView] = useState<View>('jobs');

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthGate>
        {showProfileSetup && <ProfileSetupDialog />}
        <AppLayout currentView={currentView} onViewChange={setCurrentView}>
          {currentView === 'resume' && <ResumeEditor />}
          {currentView === 'coverLetter' && <CoverLetterEditor />}
          {currentView === 'location' && <LocationSettings />}
          {currentView === 'jobs' && <JobsList />}
        </AppLayout>
      </AuthGate>
      <Toaster />
    </ThemeProvider>
  );
}
