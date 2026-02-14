import { useGetJobPosting, useDeleteJobPosting } from '../hooks/useJobPostings';
import { useCalculateJobMatch } from '../hooks/useJobMatchScore';
import { useGetJobApplications, useEnsureApplication } from '../hooks/useJobApplications';
import { MatchScoreBadge } from './MatchScoreBadge';
import { ApplicationStatusPill } from './ApplicationStatusPill';
import { ApplyFlowDialog } from './ApplyFlowDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, Loader2, Trash2, ExternalLink, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

interface JobDetailProps {
  jobId: string;
  onBack: () => void;
}

export function JobDetail({ jobId, onBack }: JobDetailProps) {
  const { data: job, isLoading } = useGetJobPosting(jobId);
  const { data: matchScore } = useCalculateJobMatch(jobId);
  const { data: applications } = useGetJobApplications();
  const deleteJob = useDeleteJobPosting();
  const { existingApp, ensureApplication } = useEnsureApplication(jobId);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteJob.mutateAsync(jobId);
      toast.success('Job deleted successfully');
      onBack();
    } catch (error) {
      toast.error('Failed to delete job');
      console.error(error);
    }
  };

  const handleApply = async () => {
    try {
      await ensureApplication();
      setIsApplyDialogOpen(true);
    } catch (error) {
      toast.error('Failed to open application');
      console.error(error);
    }
  };

  const handleGoToApplication = async () => {
    if (!job?.applicationUrl) return;
    
    try {
      await ensureApplication();
      window.open(job.applicationUrl, '_blank', 'noopener,noreferrer');
      toast.success('Application link opened');
    } catch (error) {
      toast.error('Failed to record application');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Job not found</p>
        <Button onClick={onBack} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">{job.title}</h2>
            {existingApp && <ApplicationStatusPill status={existingApp.status} />}
          </div>
          <p className="text-lg text-muted-foreground">{job.company}</p>
        </div>
        <MatchScoreBadge jobId={jobId} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>{job.location}</CardDescription>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this job?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the job and any associated applications.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-2 font-semibold">Description</h3>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{job.description}</p>
          </div>

          {job.requirements && (
            <>
              <Separator />
              <div>
                <h3 className="mb-2 font-semibold">Requirements</h3>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{job.requirements}</p>
              </div>
            </>
          )}

          {matchScore && matchScore.matchedKeywords.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="mb-2 font-semibold">Matched Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {matchScore.matchedKeywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {(job.applicationUrl || job.contactDetails) && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold">Application Information</h3>
                {job.applicationUrl && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">URL:</span>
                    <a
                      href={job.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {job.applicationUrl}
                    </a>
                  </div>
                )}
                {job.contactDetails && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Contact:</span>
                    <span className="text-sm">{job.contactDetails}</span>
                  </div>
                )}
              </div>
            </>
          )}

          <Separator />

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={handleApply} className="flex-1">
              <Send className="mr-2 h-4 w-4" />
              {existingApp ? 'Edit Application' : 'Start Application'}
            </Button>
            {job.applicationUrl && (
              <Button onClick={handleGoToApplication} variant="outline" className="flex-1">
                <ExternalLink className="mr-2 h-4 w-4" />
                Go to Application
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {existingApp && (
        <ApplyFlowDialog
          open={isApplyDialogOpen}
          onOpenChange={setIsApplyDialogOpen}
          jobId={jobId}
          applicationId={existingApp ? String(applications?.indexOf(existingApp)) : undefined}
        />
      )}
    </div>
  );
}
