import { useState, useEffect } from 'react';
import { useGetResumeProfile, useSaveResumeProfile } from '../hooks/useResumeProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';
import type { GeoLocation } from '../backend';

export function LocationSettings() {
  const { data: profile, isLoading } = useGetResumeProfile();
  const saveProfile = useSaveResumeProfile();
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [country, setCountry] = useState('');
  const [radiusKm, setRadiusKm] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (profile) {
      setCity(profile.location.city);
      setRegion(profile.location.region);
      setCountry(profile.location.country);
      setRadiusKm(profile.location.radiusKm ? String(profile.location.radiusKm) : '');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!city.trim() || !country.trim()) {
      toast.error('City and country are required');
      return;
    }

    const location: GeoLocation = {
      city: city.trim(),
      region: region.trim(),
      country: country.trim(),
      radiusKm: radiusKm ? BigInt(radiusKm) : undefined,
    };

    try {
      await saveProfile.mutateAsync({
        resumeText: profile?.resumeText || '',
        coverLetterText: profile?.coverLetterText || '',
        location,
      });
      setHasChanges(false);
      toast.success('Location saved successfully!');
    } catch (error) {
      toast.error('Failed to save location');
      console.error(error);
    }
  };

  const handleChange = () => {
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Location Settings</h2>
        <p className="text-muted-foreground">
          Set your preferred job search location for filtering opportunities.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Location</CardTitle>
          <CardDescription>
            Enter your city, region, and country to filter jobs near you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="San Francisco"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  handleChange();
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">State/Region</Label>
              <Input
                id="region"
                placeholder="California"
                value={region}
                onChange={(e) => {
                  setRegion(e.target.value);
                  handleChange();
                }}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                placeholder="United States"
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  handleChange();
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="radius">Search Radius (km)</Label>
              <Input
                id="radius"
                type="number"
                placeholder="50"
                value={radiusKm}
                onChange={(e) => {
                  setRadiusKm(e.target.value);
                  handleChange();
                }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-muted-foreground">
              {hasChanges ? (
                <span className="text-accent-foreground">Unsaved changes</span>
              ) : (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Saved
                </span>
              )}
            </div>
            <Button onClick={handleSave} disabled={saveProfile.isPending || !hasChanges}>
              {saveProfile.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Location
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
