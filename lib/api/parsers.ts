/**
 * API Response Parsers
 */

import type { Episode } from '@/lib/types';

/**
 * Parse episode URL string into structured array
 */
export function parseEpisodes(playUrl: string): Episode[] {
    if (!playUrl) return [];

    try {
        // Format: "Episode1$url1#Episode2$url2#..."
        const episodes = playUrl.split('#').filter(Boolean);

        return episodes.map((episode, index) => {
            const [name, url] = episode.split('$');
            return {
                name: name || `Episode ${index + 1}`,
                url: url || '',
                index,
            };
        });
    } catch (error) {
        console.error('Failed to parse episodes:', error);
        return [];
    }
}
