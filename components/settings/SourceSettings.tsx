import { useState } from 'react';
import { SourceManager } from '@/components/settings/SourceManager';
import type { VideoSource } from '@/lib/types';

interface SourceSettingsProps {
    sources: VideoSource[];
    onSourcesChange: (sources: VideoSource[]) => void;
    onRestoreDefaults: () => void;
    onAddSource: () => void;
}

export function SourceSettings({
    sources,
    onSourcesChange,
    onRestoreDefaults,
    onAddSource,
}: SourceSettingsProps) {
    const [showAllSources, setShowAllSources] = useState(false);

    return (
        <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-sm)] p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[var(--text-color)]">视频源管理</h2>
                <div className="flex gap-2">
                    <button
                        onClick={onRestoreDefaults}
                        className="px-4 py-2 rounded-[var(--radius-2xl)] bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color)] text-sm font-medium hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)] transition-all duration-200"
                    >
                        恢复默认
                    </button>
                    <button
                        onClick={onAddSource}
                        className="px-4 py-2 rounded-[var(--radius-2xl)] bg-[var(--accent-color)] text-white text-sm font-semibold hover:brightness-110 hover:-translate-y-0.5 shadow-[var(--shadow-sm)] transition-all duration-200"
                    >
                        + 添加源
                    </button>
                </div>
            </div>
            <p className="text-sm text-[var(--text-color-secondary)] mb-6">
                管理视频来源，调整优先级和启用状态
            </p>
            <SourceManager
                sources={showAllSources ? sources : sources.slice(0, 10)}
                onSourcesChange={onSourcesChange}
            />
            {sources.length > 10 && (
                <button
                    onClick={() => setShowAllSources(!showAllSources)}
                    className="w-full mt-4 px-4 py-3 rounded-[var(--radius-2xl)] bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color)] text-sm font-medium hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)] transition-all duration-200"
                >
                    {showAllSources ? '收起' : `显示全部 (${sources.length})`}
                </button>
            )}
        </div>
    );
}
