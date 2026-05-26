import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export type LocationInfo = {
  lat: number;
  lon: number;
  city: string | null;
  district: string | null;
  state: string | null;
  country: string | null;
  raw: string;
} | null;

export function useLocation() {
  const [location, setLocation] = useState<LocationInfo>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!cancelled) {
            setError('Permission denied');
            setLoading(false);
          }
          return;
        }

        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (cancelled) return;

        // Reverse geocode to get a human-readable address
        const [place] = await Location.reverseGeocodeAsync({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });

        if (cancelled) return;

        const city = place.city || place.subregion || place.region || null;
        const district = place.district || place.subregion || null;
        const state = place.region || null;
        const country = place.country || null;

        // Build a short display string (e.g. "Pune, Maharashtra")
        const parts = [city, district, state].filter(Boolean);
        const raw = parts.length > 0 ? parts.join(', ') : 'Unknown location';

        setLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          city,
          district,
          state,
          country,
          raw,
        });
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message ?? 'Failed to get location');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, []);

  return { location, loading, error };
}
