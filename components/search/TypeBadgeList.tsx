/**
 * TypeBadgeList - Badge list container with responsive layout
 * Desktop: Expandable grid with show more/less
 * Mobile: Horizontal scroll with snap
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import { Icons } from '@/components/ui/Icon';
import { TypeBadgeItem } from './TypeBadgeItem';
import { useKeyboardNavigation } from '@/lib/hooks/useKeyboardNavigation';

interface TypeBadge {
  type: string;
  count: number;
}

interface TypeBadgeListProps {
  badges: TypeBadge[];
  selectedTypes: Set<string>;
  onToggleType: (type: string) => void;
}

export function TypeBadgeList({ badges, selectedTypes, onToggleType }: TypeBadgeListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Keyboard navigation
  useKeyboardNavigation({
    enabled: true,
    containerRef: containerRef,
    currentIndex: focusedIndex,
    itemCount: badges.length,
    orientation: 'horizontal',
    onNavigate: useCallback((index: number) => {
      setFocusedIndex(index);
      badgeRefs.current[index]?.focus();
      // Scroll into view for mobile
      badgeRefs.current[index]?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest',
        inline: 'center',
      });
    }, []),
    onSelect: useCallback((index: number) => {
      onToggleType(badges[index].type);
    }, [badges, onToggleType]),
  });

  return (
    <>
      {/* Desktop: Expandable Grid */}
      <div 
        ref={containerRef}
        className="hidden md:flex md:flex-col md:flex-1 -mx-1 px-1"
        role="group"
        aria-label="类型筛选"
      >
        <div className={`flex items-center gap-2 flex-wrap transition-all duration-300 ${
          !isExpanded ? 'max-h-[3rem] overflow-hidden' : ''
        }`}>
          {badges.map((badge, index) => (
            <TypeBadgeItem
              key={badge.type}
              type={badge.type}
              count={badge.count}
              isSelected={selectedTypes.has(badge.type)}
              onToggle={() => onToggleType(badge.type)}
              isFocused={focusedIndex === index}
              onFocus={() => setFocusedIndex(index)}
              innerRef={(el) => { badgeRefs.current[index] = el; }}
            />
          ))}
        </div>
        
        {badges.length > 5 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-xs text-[var(--text-color-secondary)] hover:text-[var(--accent-color)] 
                     flex items-center gap-1 transition-colors self-start"
          >
            <span>{isExpanded ? '收起' : '展开更多'}</span>
            <Icons.ChevronDown 
              size={14} 
              className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>

      {/* Mobile & Tablet: Horizontal Scroll */}
      <div 
        className="flex md:hidden flex-1 -mx-1 px-1"
        role="group"
        aria-label="类型筛选"
      >
        <div 
          ref={containerRef}
          className="flex items-center gap-2 overflow-x-auto overflow-y-visible pb-2 scrollbar-hide snap-x snap-mandatory"
        >
          {badges.map((badge, index) => (
            <TypeBadgeItem
              key={badge.type}
              type={badge.type}
              count={badge.count}
              isSelected={selectedTypes.has(badge.type)}
              onToggle={() => onToggleType(badge.type)}
              isFocused={focusedIndex === index}
              onFocus={() => setFocusedIndex(index)}
              innerRef={(el) => { badgeRefs.current[index] = el; }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
