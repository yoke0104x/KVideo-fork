import { useState, useEffect, useCallback } from 'react';
import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll';

interface AdultVideo {
    vod_id: string | number;
    vod_name: string;
    vod_pic?: string;
    vod_remarks?: string;
    type_name?: string;
    source: string;
}

const PAGE_LIMIT = 20;

export function useAdultContent(categoryValue: string) {
    const [videos, setVideos] = useState<AdultVideo[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);

    const loadVideos = useCallback(async (pageNum: number, append = false) => {
        if (loading) return;

        setLoading(true);
        try {
            const response = await fetch(
                `/api/adult/category?category=${encodeURIComponent(categoryValue)}&page=${pageNum}&limit=${PAGE_LIMIT}`
            );

            if (!response.ok) throw new Error('Failed to fetch');

            const data = await response.json();
            const newVideos = data.videos || [];

            setVideos(prev => append ? [...prev, ...newVideos] : newVideos);
            setHasMore(newVideos.length === PAGE_LIMIT);
        } catch (error) {
            console.error('Failed to load videos:', error);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [loading, categoryValue]);

    useEffect(() => {
        setPage(1);
        setVideos([]);
        setHasMore(true);
        loadVideos(1, false);
    }, [categoryValue]); // eslint-disable-line react-hooks/exhaustive-deps

    const { prefetchRef, loadMoreRef } = useInfiniteScroll({
        hasMore,
        loading,
        page,
        onLoadMore: (nextPage) => {
            setPage(nextPage);
            loadVideos(nextPage, true);
        },
    });

    return {
        videos,
        loading,
        hasMore,
        prefetchRef,
        loadMoreRef,
    };
}
