import { useState, useEffect } from 'react';
import { useGetResumeProfile, useSaveResumeProfile } from '../hooks/useResumeProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';

export function CoverLetterEditor() {
  const { data: profile, isLoading } = useGetResumeProfile();
  const saveProfile = useSaveResumeProfile();
  const [coverLetterText, setCoverLetterText] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (profile) {
      setCoverLetterText(profile.coverLetterText);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile) {
      toast.error('Please set up your location first');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        resumeText: profile.resumeText,
        coverLetterText,
        location: profile.location,
      });
      setHasChanges(false);
      toast.success('Cover letter saved successfully!');
    } catch (error) {
      toast.error('Failed to save cover letter');
      console.error(error);
    }
  };

  const handleChange = (value: string) => {
    setCoverLetterText(value);
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
        <h2 className="text-3xl font-bold tracking-tight">Cover Letter</h2>
        <p className="text-muted-foreground">
          Your default cover letter template. You can customize it for each application.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cover Letter Template</CardTitle>
          <CardDescription>
            This will be used as the starting point for job applications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover Letter Text</Label>
            <Textarea
              id="coverLetter"
              placeholder="Enter your cover letter template here..."
              value={coverLetterText}
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
                  Save Cover Letter
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
