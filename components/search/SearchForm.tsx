'use client';

import { SearchLoadingAnimation } from '@/components/SearchLoadingAnimation';
import { SearchBox } from './SearchBox';

interface SearchFormProps {
  onSearch: (query: string) => void;
  onClear?: () => void;
  isLoading: boolean;
  initialQuery?: string;
  currentSource?: string;
  checkedSources?: number;
  totalSources?: number;
}

export function SearchForm({
  onSearch,
  onClear,
  isLoading,
  initialQuery = '',
  currentSource = '',
  checkedSources = 0,
  totalSources = 16,
}: SearchFormProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <SearchBox
        onSearch={onSearch}
        onClear={onClear}
        initialQuery={initialQuery}
      />

      {/* Loading Animation */}
      {isLoading && (
        <div className="mt-4">
          <SearchLoadingAnimation
            currentSource={currentSource}
            checkedSources={checkedSources}
            totalSources={totalSources}
          />
        </div>
      )}
    </div>
  );
}
