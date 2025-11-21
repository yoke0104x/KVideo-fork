/**
 * API Client for fetching video data from multiple sources
 * Handles parallel requests and data normalization
 */

import type {
  VideoSource,
  VideoItem,
  VideoDetail,
  ApiSearchResponse,
  ApiDetailResponse,
} from '@/lib/types';
import { fetchWithTimeout, withRetry } from './http-utils';
import { parseEpisodes } from './parsers';

/**
 * Search videos from a single source
 */
async function searchVideosBySource(
  query: string,
  source: VideoSource,
  page: number = 1
): Promise<{ results: VideoItem[]; source: string; responseTime: number }> {
  const startTime = Date.now();

  const url = new URL(`${source.baseUrl}${source.searchPath}`);
  url.searchParams.set('ac', 'detail');
  url.searchParams.set('wd', query);
  url.searchParams.set('pg', page.toString());

  try {
    const response = await withRetry(async () => {
      const res = await fetchWithTimeout(url.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0',
          ...source.headers,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      return res;
    });

    const data: ApiSearchResponse = await response.json();

    if (data.code !== 1 && data.code !== 0) {
      throw new Error(data.msg || 'Invalid API response');
    }

    const results: VideoItem[] = (data.list || []).map(item => ({
      ...item,
      source: source.id,
    }));

    return {
      results,
      source: source.id,
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error(`Search failed for source ${source.name}:`, error);
    throw {
      code: 'SEARCH_FAILED',
      message: `Failed to search from ${source.name}`,
      source: source.id,
      retryable: true,
    };
  }
}

/**
 * Search videos from multiple sources in parallel
 */
export async function searchVideos(
  query: string,
  sources: VideoSource[],
  page: number = 1
): Promise<Array<{ results: VideoItem[]; source: string; responseTime?: number; error?: string }>> {
  const searchPromises = sources.map(async source => {
    try {
      return await searchVideosBySource(query, source, page);
    } catch (error) {
      return {
        results: [],
        source: source.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  return Promise.all(searchPromises);
}



/**
 * Get video detail from a single source
 */
export async function getVideoDetail(
  id: string | number,
  source: VideoSource
): Promise<VideoDetail> {
  const url = new URL(`${source.baseUrl}${source.detailPath}`);
  url.searchParams.set('ac', 'detail');
  url.searchParams.set('ids', id.toString());

  try {
    const response = await withRetry(async () => {
      const res = await fetchWithTimeout(url.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0',
          ...source.headers,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      return res;
    });

    const data: ApiDetailResponse = await response.json();



    if (data.code !== 1 && data.code !== 0) {
      throw new Error(data.msg || 'Invalid API response');
    }

    if (!data.list || data.list.length === 0) {
      throw new Error('Video not found');
    }

    const videoData = data.list[0];

    // Parse episodes from vod_play_url
    const episodes = parseEpisodes(videoData.vod_play_url || '');


    if (episodes.length > 0) {
    }


    return {
      vod_id: videoData.vod_id,
      vod_name: videoData.vod_name,
      vod_pic: videoData.vod_pic,
      vod_remarks: videoData.vod_remarks,
      vod_year: videoData.vod_year,
      vod_area: videoData.vod_area,
      vod_actor: videoData.vod_actor,
      vod_director: videoData.vod_director,
      vod_content: videoData.vod_content,
      type_name: videoData.type_name,
      episodes,
      source: source.id,
      source_code: videoData.vod_play_from || '',
    };
  } catch (error) {
    console.error(`Detail fetch failed for source ${source.name}:`, error);
    throw {
      code: 'DETAIL_FAILED',
      message: `Failed to fetch video detail from ${source.name}`,
      source: source.id,
      retryable: false,
    };
  }
}


