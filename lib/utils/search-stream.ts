import { Video } from '@/lib/types';
import { getSourceName } from '@/lib/utils/source-names';
import { calculateRelevanceScore } from '@/lib/utils/search';
import { binaryInsertVideos } from '@/lib/utils/sorted-insert';

interface StreamHandlerParams {
    reader: ReadableStreamDefaultReader<Uint8Array>;
    onStart: (totalSources: number) => void;
    onVideos: (videos: Video[], source: string) => void;
    onProgress: (completedSources: number, totalVideosFound: number) => void;
    onComplete: () => void;
    onError: (message: string) => void;
    currentQuery: string;
}

export async function processSearchStream({
    reader,
    onStart,
    onVideos,
    onProgress,
    onComplete,
    onError,
    currentQuery,
}: StreamHandlerParams) {
    const decoder = new TextDecoder();
    let buffer = '';

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;

                try {
                    const data = JSON.parse(line.slice(6));

                    if (data.type === 'start') {
                        onStart(data.totalSources);
                    } else if (data.type === 'videos') {
                        const newVideos: Video[] = data.videos.map((video: any) => ({
                            ...video,
                            sourceName: video.sourceDisplayName || getSourceName(video.source),
                            isNew: true,
                            relevanceScore: calculateRelevanceScore(video, currentQuery),
                        }));
                        onVideos(newVideos, data.source);
                    } else if (data.type === 'progress') {
                        onProgress(data.completedSources, data.totalVideosFound);
                    } else if (data.type === 'complete') {
                        onComplete();
                    } else if (data.type === 'error') {
                        onError(data.message);
                    }
                } catch (error) {
                    console.error('Error parsing stream data:', error);
                }
            }
        }
    } catch (error) {
        throw error;
    }
}
