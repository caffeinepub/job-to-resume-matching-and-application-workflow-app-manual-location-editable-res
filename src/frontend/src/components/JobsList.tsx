import { useState, useMemo } from 'react';
import { useGetJobPostings } from '../hooks/useJobPostings';
import { useGetJobApplications } from '../hooks/useJobApplications';
import { useLocationString } from '../hooks/useResumeProfile';
import { JobFormDialog } from './JobFormDialog';
import { JobDetail } from './JobDetail';
import { JobsFiltersBar } from './JobsFiltersBar';
import { MatchScoreBadge } from './MatchScoreBadge';
import { ApplicationStatusPill } from './ApplicationStatusPill';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Search, Briefcase } from 'lucide-react';
import type { JobPosting } from '../backend';

export function JobsList() {
  const { data: jobs, isLoading } = useGetJobPostings();
  const { data: applications } = useGetJobApplications();
  const locationString = useLocationString();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilterEnabled, setLocationFilterEnabled] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const filteredAndSortedJobs = useMemo(() => {
    if (!jobs) return [];

    let filtered = jobs;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.company.toLowerCase().includes(query) ||
          job.location.toLowerCase().includes(query)
      );
    }

    // Location filter
    if (locationFilterEnabled && locationString) {
      const locationLower = locationString.toLowerCase();
      filtered = filtered.filter((job) => job.location.toLowerCase().includes(locationLower));
    }

    return filtered;
  }, [jobs, searchQuery, locationFilterEnabled, locationString]);

  const getApplicationForJob = (jobId: string) => {
    return applications?.find((app) => app.jobId === jobId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (selectedJobId) {
    return <JobDetail jobId={selectedJobId} onBack={() => setSelectedJobId(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Jobs</h2>
          <p className="text-muted-foreground">Track and manage your job applications</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Job
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title, company, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <JobsFiltersBar
              locationFilterEnabled={locationFilterEnabled}
              onLocationFilterChange={setLocationFilterEnabled}
              locationString={locationString}
              sortBy={sortBy}
              onSortByChange={setSortBy}
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredAndSortedJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No jobs found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {jobs?.length === 0
                  ? 'Add your first job to get started'
                  : 'Try adjusting your search or filters'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAndSortedJobs.map((job) => {
                const application = getApplicationForJob(job.id);
                return (
                  <Card
                    key={job.id}
                    className="cursor-pointer transition-colors hover:bg-accent/50"
                    onClick={() => setSelectedJobId(job.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{job.title}</h3>
                            {application && <ApplicationStatusPill status={application.status} />}
                          </div>
                          <p className="text-sm text-muted-foreground">{job.company}</p>
                          <p className="text-xs text-muted-foreground">{job.location}</p>
                        </div>
                        <MatchScoreBadge jobId={job.id} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <JobFormDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </div>
  );
}
