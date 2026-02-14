import { Badge } from '@/components/ui/badge';
import type { ApplicationStatus } from '../backend';

interface ApplicationStatusPillProps {
  status: ApplicationStatus;
}

export function ApplicationStatusPill({ status }: ApplicationStatusPillProps) {
  const statusConfig: Record<ApplicationStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    pending: { label: 'Draft', variant: 'outline' },
    applied: { label: 'Applied', variant: 'default' },
    interviewing: { label: 'Interviewing', variant: 'secondary' },
    offered: { label: 'Offered', variant: 'default' },
    rejected: { label: 'Rejected', variant: 'destructive' },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className="text-xs">
      {config.label}
    </Badge>
  );
}
