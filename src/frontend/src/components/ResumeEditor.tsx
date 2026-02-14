import { useState, useEffect } from 'react';
import { useGetResumeProfile, useSaveResumeProfile } from '../hooks/useResumeProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';

export function ResumeEditor() {
  const { data: profile, isLoading } = useGetResumeProfile();
  const saveProfile = useSaveResumeProfile();
  const [resumeText, setResumeText] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (profile) {
      setResumeText(profile.resumeText);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile) {
      toast.error('Please set up your location first');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        resumeText,
        coverLetterText: profile.coverLetterText,
        location: profile.location,
      });
      setHasChanges(false);
      toast.success('Resume saved successfully!');
    } catch (error) {
      toast.error('Failed to save resume');
      console.error(error);
    }
  };

  const handleChange = (value: string) => {
    setResumeText(value);
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Resume</h2>
        <p className="text-muted-foreground">
          Your resume will be used to match against job descriptions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resume Content</CardTitle>
          <CardDescription>
            Enter your resume text. Include your skills, experience, and qualifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resume">Resume Text</Label>
            <Textarea
              id="resume"
              placeholder="Enter your resume content here..."
              value={resumeText}
              onChange={(e) => handleChange(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {hasChanges ? (
                <span className="text-accent-foreground">Unsaved changes</span>
              ) : (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Saved
                </span>
              )}
            </div>
            <Button onClick={handleSave} disabled={saveProfile.isPending || !hasChanges}>
              {saveProfile.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Resume
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
