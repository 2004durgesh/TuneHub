import { useCallback, useEffect } from 'react';
import { getCharts, getFeaturedPlaylists, getNewReleases, getTopArtists } from '@/services/music';
import { useMusicStore } from '@/store';
import type { ArtistSummary, DiscoveryItem } from '@/types';

type UseHomeDataReturn = {
  charts: DiscoveryItem[];
  newReleases: DiscoveryItem[];
  featuredPlaylists: DiscoveryItem[];
  topArtists: ArtistSummary[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useHomeData(): UseHomeDataReturn {
  const charts = useMusicStore((s) => s.charts);
  const newReleases = useMusicStore((s) => s.newReleases);
  const featuredPlaylists = useMusicStore((s) => s.featuredPlaylists);
  const topArtists = useMusicStore((s) => s.topArtists);
  const loading = useMusicStore((s) => s.homeLoading);
  const error = useMusicStore((s) => s.homeError);
  const setHome = useMusicStore((s) => s.setHome);
  const setHomeLoading = useMusicStore((s) => s.setHomeLoading);
  const setHomeError = useMusicStore((s) => s.setHomeError);

  const fetchData = useCallback(async () => {
    setHomeLoading(true);
    setHomeError(null);

    const [chartsRes, newReleasesRes, playlistsRes, artistsRes] = await Promise.allSettled([
      getCharts(),
      getNewReleases(),
      getFeaturedPlaylists(),
      getTopArtists(),
    ]);

    const results = [chartsRes, newReleasesRes, playlistsRes, artistsRes];
    const allFailed = results.every((r) => r.status === 'rejected');

    if (allFailed) {
      const reason = (chartsRes as PromiseRejectedResult).reason;
      setHomeError(reason instanceof Error ? reason.message : 'Failed to load home data');
    }

    // Read current store state to keep existing values for any failed sections
    const current = useMusicStore.getState();
    setHome({
      charts: chartsRes.status === 'fulfilled' ? chartsRes.value : current.charts,
      newReleases:
        newReleasesRes.status === 'fulfilled' ? newReleasesRes.value : current.newReleases,
      featuredPlaylists:
        playlistsRes.status === 'fulfilled' ? playlistsRes.value : current.featuredPlaylists,
      topArtists: artistsRes.status === 'fulfilled' ? artistsRes.value : current.topArtists,
    });

    setHomeLoading(false);
  }, [setHome, setHomeLoading, setHomeError]);

  const refresh = useCallback(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    // Skip fetch if data is already hydrated in the store
    if (useMusicStore.getState().charts.length === 0) {
      void fetchData();
    }
  }, [fetchData]);

  return { charts, newReleases, featuredPlaylists, topArtists, loading, error, refresh };
}
