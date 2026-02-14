import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { JobApplication, ApplicationStatus } from '../backend';

export function useGetJobApplications() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<JobApplication[]>({
    queryKey: ['jobApplications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getJobApplications();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetJobApplication(appId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<JobApplication | null>({
    queryKey: ['jobApplication', appId],
    queryFn: async () => {
      if (!actor || !appId) return null;
      return actor.getJobApplication(appId);
    },
    enabled: !!actor && !actorFetching && !!appId,
  });
}

export function useCreateApplication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createApplication(jobId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobApplications'] });
    },
  });
}

export function useUpdateApplicationStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { appId: string; status: ApplicationStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateApplicationStatus(params.appId, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobApplications'] });
    },
  });
}

export function useUpdateApplicationCoverLetter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { appId: string; coverLetter: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateApplicationCoverLetter(params.appId, params.coverLetter);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobApplication', variables.appId] });
      queryClient.invalidateQueries({ queryKey: ['jobApplications'] });
    },
  });
}

export function useEnsureApplication(jobId: string | null) {
  const { data: applications } = useGetJobApplications();
  const createApplication = useCreateApplication();

  const existingApp = applications?.find((app) => app.jobId === jobId);

  const ensureApplication = async () => {
    if (!jobId) throw new Error('Job ID required');
    if (existingApp) return existingApp;
    
    const appId = await createApplication.mutateAsync(jobId);
    return { appId, jobId };
  };

  return {
    existingApp,
    ensureApplication,
    isCreating: createApplication.isPending,
  };
}
