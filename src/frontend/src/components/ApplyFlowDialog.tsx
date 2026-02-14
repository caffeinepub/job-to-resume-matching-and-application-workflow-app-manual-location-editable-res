import { useState, useEffect } from 'react';
import { useGetResumeProfile } from '../hooks/useResumeProfile';
import { useGetJobApplications, useUpdateApplicationCoverLetter, useUpdateApplicationStatus } from '../hooks/useJobApplications';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Loader2, Save, Send } from 'lucide-react';
import { ApplicationStatus } from '../backend';

interface ApplyFlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  applicationId?: string;
}

export function ApplyFlowDialog({ open, onOpenChange, jobId, applicationId }: ApplyFlowDialogProps) {
  const { data: profile } = useGetResumeProfile();
  const { data: applications } = useGetJobApplications();
  const updateCoverLetter = useUpdateApplicationCoverLetter();
  const updateStatus = useUpdateApplicationStatus();
  const [coverLetter, setCoverLetter] = useState('');
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  const application = applications?.find((app) => app.jobId === jobId);

  useEffect(() => {
    if (application) {
      setCoverLetter(application.customCoverLetter || profile?.coverLetterText || '');
      const checklistState: Record<string, boolean> = {};
      application.submissionChecklist.forEach((item) => {
        checklistState[item] = false;
      });
      setChecklist(checklistState);
    } else if (profile) {
      setCoverLetter(profile.coverLetterText);
      setChecklist({
        'Resume attached': false,
        'Cover letter attached': false,
      });
    }
  }, [application, profile]);

  const handleSaveDraft = async () => {
    if (!application) {
      toast.error('Application not found');
      return;
    }

    try {
      await updateCoverLetter.mutateAsync({
        appId: String(applications?.indexOf(application)),
        coverLetter,
      });
      toast.success('Draft saved successfully!');
    } catch (error) {
      toast.error('Failed to save draft');
      console.error(error);
    }
  };

  const handleMarkAsApplied = async () => {
    if (!application) {
      toast.error('Application not found');
      return;
    }

    const allChecked = Object.values(checklist).every((checked) => checked);
    if (!allChecked) {
      toast.error('Please complete all checklist items');
      return;
    }

    try {
      await updateCoverLetter.mutateAsync({
        appId: String(applications?.indexOf(application)),
        coverLetter,
      });
      await updateStatus.mutateAsync({
        appId: String(applications?.indexOf(application)),
        status: ApplicationStatus.applied,
      });
      toast.success('Marked as applied!');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to mark as applied');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Application</DialogTitle>
          <DialogDescription>
            Review and customize your application materials before submitting.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 pr-4">
            <div className="space-y-2">
              <Label>Resume (Read-only)</Label>
              <Textarea
                value={profile?.resumeText || ''}
                readOnly
                className="min-h-[150px] resize-none bg-muted font-mono text-xs"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="coverLetter">Cover Letter (Editable)</Label>
              <Textarea
                id="coverLetter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
                placeholder="Customize your cover letter for this application..."
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Submission Checklist</Label>
              {Object.entries(checklist).map(([item, checked]) => (
                <div key={item} className="flex items-center space-x-2">
                  <Checkbox
                    id={item}
                    checked={checked}
                    onCheckedChange={(checked) =>
                      setChecklist({ ...checklist, [item]: checked === true })
                    }
                  />
                  <label
                    htmlFor={item}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {item}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDraft}
            disabled={updateCoverLetter.isPending}
            className="w-full sm:w-auto"
          >
            {updateCoverLetter.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </>
            )}
          </Button>
          <Button
            onClick={handleMarkAsApplied}
            disabled={updateStatus.isPending || updateCoverLetter.isPending}
            className="w-full sm:w-auto"
          >
            {updateStatus.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Mark as Applied
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
