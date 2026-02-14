import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, ArrowUpDown } from 'lucide-react';

interface JobsFiltersBarProps {
  locationFilterEnabled: boolean;
  onLocationFilterChange: (enabled: boolean) => void;
  locationString: string;
  sortBy: 'date' | 'score';
  onSortByChange: (sortBy: 'date' | 'score') => void;
}

export function JobsFiltersBar({
  locationFilterEnabled,
  onLocationFilterChange,
  locationString,
  sortBy,
  onSortByChange,
}: JobsFiltersBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Switch
          id="location-filter"
          checked={locationFilterEnabled}
          onCheckedChange={onLocationFilterChange}
          disabled={!locationString}
        />
        <Label htmlFor="location-filter" className="flex items-center gap-1 text-sm">
          <MapPin className="h-3.5 w-3.5" />
          Filter by location
          {locationString && (
            <span className="text-muted-foreground">({locationString})</span>
          )}
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        <Select value={sortBy} onValueChange={(value) => onSortByChange(value as 'date' | 'score')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Sort by Date</SelectItem>
            <SelectItem value="score">Sort by Match Score</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
