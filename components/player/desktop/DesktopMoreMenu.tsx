import React from 'react';
import { Icons } from '@/components/ui/Icon';

interface DesktopMoreMenuProps {
    showMoreMenu: boolean;
    onToggleMoreMenu: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onCopyLink: () => void;
}

export function DesktopMoreMenu({
    showMoreMenu,
    onToggleMoreMenu,
    onMouseEnter,
    onMouseLeave,
    onCopyLink
}: DesktopMoreMenuProps) {
    return (
        <div className="relative">
            <button
                onClick={onToggleMoreMenu}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                className="btn-icon"
                aria-label="More options"
                title="更多选项"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                </svg>
            </button>

            {/* More Menu Dropdown */}
            {showMoreMenu && (
                <div
                    className="absolute bottom-full right-0 mb-2 bg-[var(--glass-bg)] backdrop-blur-[25px] saturate-[180%] rounded-[var(--radius-2xl)] border border-[var(--glass-border)] shadow-[var(--shadow-md)] p-2 min-w-[180px]"
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                >
                    <button
                        onClick={onCopyLink}
                        className="w-full px-4 py-2.5 text-left text-sm text-[var(--text-color)] hover:bg-[color-mix(in_srgb,var(--accent-color)_15%,transparent)] rounded-[var(--radius-2xl)] transition-colors flex items-center gap-3"
                    >
                        <Icons.Link size={18} />
                        <span>复制链接</span>
                    </button>
                </div>
            )}
        </div>
    );
}
