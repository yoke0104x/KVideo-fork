'use client';

import { useState, useEffect } from 'react';
import { TagManager } from '@/components/home/TagManager';
import { AdultContentGrid } from './AdultContentGrid';
import { useAdultTagManager } from '@/lib/hooks/useAdultTagManager';
import { useAdultContent } from '@/lib/hooks/useAdultContent';

interface AdultContentProps {
    onSearch?: (query: string) => void;
}

export function AdultContent({ onSearch }: AdultContentProps) {
    const {
        tags,
        selectedTag,
        newTagInput,
        showTagManager,
        justAddedTag,
        setSelectedTag,
        setNewTagInput,
        setShowTagManager,
        setJustAddedTag,
        handleAddTag,
        handleDeleteTag,
        handleRestoreDefaults,
        handleDragEnd,
        loading: tagsLoading,
    } = useAdultTagManager();

    // Get the category value from selected tag
    const categoryValue = tags.find(t => t.id === selectedTag)?.value || '';

    const {
        videos,
        loading: contentLoading,
        hasMore,
        prefetchRef,
        loadMoreRef,
    } = useAdultContent(categoryValue);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleVideoClick = (video: any) => {
        if (onSearch) {
            onSearch(video.vod_name);
        }
    };

    if (!mounted || tagsLoading) {
        return (
            <div className="animate-fade-in">
                <div className="mb-6 h-8 w-24 bg-[var(--glass-bg)] rounded animate-pulse" />
                <div className="mb-8 h-10 w-full bg-[var(--glass-bg)] rounded animate-pulse" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="aspect-[2/3] bg-[var(--glass-bg)] rounded-[var(--radius-2xl)] animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <TagManager
                tags={tags}
                selectedTag={selectedTag}
                showTagManager={showTagManager}
                newTagInput={newTagInput}
                justAddedTag={justAddedTag}
                onTagSelect={(tagId) => {
                    setSelectedTag(tagId);
                }}
                onTagDelete={handleDeleteTag}
                onToggleManager={() => setShowTagManager(!showTagManager)}
                onRestoreDefaults={handleRestoreDefaults}
                onNewTagInputChange={setNewTagInput}
                onAddTag={handleAddTag}
                onDragEnd={handleDragEnd}
                onJustAddedTagHandled={() => setJustAddedTag(false)}
            />
            <AdultContentGrid
                videos={videos}
                loading={contentLoading}
                hasMore={hasMore}
                onVideoClick={handleVideoClick}
                prefetchRef={prefetchRef}
                loadMoreRef={loadMoreRef}
            />
        </div>
    );
}
