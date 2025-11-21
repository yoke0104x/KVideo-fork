/**
 * PopularFeatures - Main component for popular movies section
 * Displays Douban movie recommendations with tag filtering and infinite scroll
 */

'use client';

import { TagManager } from './TagManager';
import { MovieGrid } from './MovieGrid';
import { useTagManager } from './hooks/useTagManager';
import { usePopularMovies } from './hooks/usePopularMovies';

interface PopularFeaturesProps {
  onSearch?: (query: string) => void;
}

export function PopularFeatures({ onSearch }: PopularFeaturesProps) {
  const {
    tags,
    selectedTag,
    newTagInput,
    showTagManager,
    setSelectedTag,
    setNewTagInput,
    setShowTagManager,
    handleAddTag,
    handleDeleteTag,
    handleRestoreDefaults,
  } = useTagManager();

  const {
    movies,
    loading,
    hasMore,
    prefetchRef,
    loadMoreRef,
  } = usePopularMovies(selectedTag, tags);

  const handleMovieClick = (movie: any) => {
    if (onSearch) {
      onSearch(movie.title);
    }
  };

  return (
    <div className="animate-fade-in">
      <TagManager
        tags={tags}
        selectedTag={selectedTag}
        showTagManager={showTagManager}
        newTagInput={newTagInput}
        onTagSelect={setSelectedTag}
        onTagDelete={handleDeleteTag}
        onToggleManager={() => setShowTagManager(!showTagManager)}
        onRestoreDefaults={handleRestoreDefaults}
        onNewTagInputChange={setNewTagInput}
        onAddTag={handleAddTag}
      />

      <MovieGrid
        movies={movies}
        loading={loading}
        hasMore={hasMore}
        onMovieClick={handleMovieClick}
        prefetchRef={prefetchRef}
        loadMoreRef={loadMoreRef}
      />
    </div>
  );
}
