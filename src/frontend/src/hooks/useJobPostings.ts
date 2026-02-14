import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { JobPosting } from '../backend';

export function useGetJobPostings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<JobPosting[]>({
    queryKey: ['jobPostings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getJobPostings();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetJobPosting(jobId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<JobPosting | null>({
    queryKey: ['jobPosting', jobId],
    queryFn: async () => {
      if (!actor || !jobId) return null;
      return actor.getJobPosting(jobId);
    },
    enabled: !!actor && !actorFetching && !!jobId,
  });
}

export function useAddJobPosting() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      title: string;
      company: string;
      location: string;
      description: string;
      requirements: string | null;
      applicationUrl: string | null;
      contactDetails: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addJobPosting(
        params.title,
        params.company,
        params.location,
        params.description,
        params.requirements,
        params.applicationUrl,
        params.contactDetails
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobPostings'] });
    },
  });
}

export function useDeleteJobPosting() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteJobPosting(jobId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobPostings'] });
      queryClient.invalidateQueries({ queryKey: ['jobApplications'] });
    },
  });
}
