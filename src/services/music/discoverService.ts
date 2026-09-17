import type { DiscoveryItem, ArtistSummary } from '@/types';
import { discoverApi } from './client';
import { toDiscoveryItem, toArtistSummary } from './adapter';

export async function getCharts(): Promise<DiscoveryItem[]> {
  const charts = await discoverApi.getCharts();
  return charts.map((c) => toDiscoveryItem(c, 'chart'));
}

export async function getNewReleases(page = 1, limit = 20): Promise<DiscoveryItem[]> {
  const releases = await discoverApi.getNewReleases({ page, limit });
  return releases.map((r) => toDiscoveryItem(r, 'album'));
}

export async function getFeaturedPlaylists(page = 1, limit = 20): Promise<DiscoveryItem[]> {
  const playlists = await discoverApi.getFeaturedPlaylists({ page, limit });
  return playlists.map((p) => toDiscoveryItem(p, 'playlist'));
}

export async function getTopArtists(): Promise<ArtistSummary[]> {
  const artists = await discoverApi.getTopArtists();
  return artists.map(toArtistSummary);
}
