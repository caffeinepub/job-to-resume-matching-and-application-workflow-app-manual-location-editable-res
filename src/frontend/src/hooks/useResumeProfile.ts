import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ResumeProfile, GeoLocation } from '../backend';

export function useGetResumeProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ResumeProfile | null>({
    queryKey: ['resumeProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getResumeProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useSaveResumeProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { resumeText: string; coverLetterText: string; location: GeoLocation }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveResumeProfile(params.resumeText, params.coverLetterText, params.location);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumeProfile'] });
    },
  });
}

export function useLocationString() {
  const { data: profile } = useGetResumeProfile();
  
  if (!profile) return '';
  
  const { city, region, country } = profile.location;
  const parts = [city, region, country].filter(Boolean);
  return parts.join(', ');
}
