import { useCalculateJobMatch } from '../hooks/useJobMatchScore';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface MatchScoreBadgeProps {
  jobId: string;
}

export function MatchScoreBadge({ jobId }: MatchScoreBadgeProps) {
  const { data: matchScore, isLoading } = useCalculateJobMatch(jobId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
      </div>
    );
  }

  if (!matchScore) {
    return (
      <Badge variant="outline" className="text-xs">
        No match
      </Badge>
    );
  }

  const score = Number(matchScore.score);
  const variant = score >= 70 ? 'default' : score >= 40 ? 'secondary' : 'outline';

  return (
    <Badge variant={variant} className="text-xs font-semibold">
      {score}% match
    </Badge>
  );
}
