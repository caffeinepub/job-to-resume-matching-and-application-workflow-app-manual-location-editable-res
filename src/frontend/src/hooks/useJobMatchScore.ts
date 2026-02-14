import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { MatchScore } from '../backend';

export function useCalculateJobMatch(jobId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MatchScore | null>({
    queryKey: ['jobMatch', jobId],
    queryFn: async () => {
      if (!actor || !jobId) return null;
      return actor.calculateJobMatch(jobId);
    },
    enabled: !!actor && !actorFetching && !!jobId,
    retry: false,
  });
}
