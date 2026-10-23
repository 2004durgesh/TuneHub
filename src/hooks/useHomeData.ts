import { useQuery } from '@tanstack/react-query';

import { homeQueries } from '@/hooks/queries';
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

// One shared empty list, so a missing section doesn't hand its row a new array every render.
const EMPTY: never[] = [];

export function useHomeData(): UseHomeDataReturn {
  const charts = useQuery(homeQueries.charts);
  const newReleases = useQuery(homeQueries.newReleases);
  const featuredPlaylists = useQuery(homeQueries.featuredPlaylists);
  const topArtists = useQuery(homeQueries.topArtists);
  const sections = [charts, newReleases, featuredPlaylists, topArtists];

  // The screen only waits or fails as a whole: any section with data is shown.
  const hasData = sections.some((section) => section.data !== undefined);
  const loading =
    !hasData &&
    sections.some((section) => section.isLoading || (section.isError && section.isFetching));
  const failed = !hasData && !loading;

  return {
    charts: charts.data ?? EMPTY,
    newReleases: newReleases.data ?? EMPTY,
    featuredPlaylists: featuredPlaylists.data ?? EMPTY,
    topArtists: topArtists.data ?? EMPTY,
    loading,
    error: failed ? (charts.error?.message ?? 'Failed to load home data') : null,
    refresh: () => {
      for (const section of sections) void section.refetch();
    },
  };
}
