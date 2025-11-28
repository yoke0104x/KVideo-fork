'use client';

import { useEffect, useRef, useState } from 'react';
import { Icons } from '@/components/ui/Icon';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Tag {
  id: string;
  label: string;
  value: string;
}

interface TagManagerProps {
  tags: Tag[];
  selectedTag: string;
  showTagManager: boolean;
  newTagInput: string;
  justAddedTag: boolean;
  onTagSelect: (tagId: string) => void;
  onTagDelete: (tagId: string) => void;
  onToggleManager: () => void;
  onRestoreDefaults: () => void;
  onNewTagInputChange: (value: string) => void;
  onAddTag: () => void;
  onDragEnd: (event: DragEndEvent) => void;
  onJustAddedTagHandled: () => void;
}

function SortableTag({
  tag,
  selectedTag,
  showTagManager,
  onTagSelect,
  onTagDelete,
}: {
  tag: Tag;
  selectedTag: string;
  showTagManager: boolean;
  onTagSelect: (id: string) => void;
  onTagDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tag.id, disabled: !showTagManager });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative flex-shrink-0"
    >
      <div className={`${showTagManager && !isDragging ? 'animate-jiggle' : ''}`}>
        <button
          onClick={() => !showTagManager && onTagSelect(tag.id)}
          className={`
            px-6 py-2.5 text-sm font-semibold transition-all whitespace-nowrap rounded-[var(--radius-full)] cursor-pointer select-none
            ${selectedTag === tag.id
              ? 'bg-[var(--accent-color)] text-white shadow-md scale-105'
              : 'bg-[var(--glass-bg)] backdrop-blur-xl text-[var(--text-color)] border border-[var(--glass-border)] hover:border-[var(--accent-color)] hover:scale-105'
            }
          `}
        >
          {tag.label}
        </button>
        {showTagManager && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTagDelete(tag.id);
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors rounded-[var(--radius-full)] cursor-pointer z-20 shadow-sm"
          >
            <Icons.X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export function TagManager({
  tags,
  selectedTag,
  showTagManager,
  newTagInput,
  justAddedTag,
  onTagSelect,
  onTagDelete,
  onToggleManager,
  onRestoreDefaults,
  onNewTagInputChange,
  onAddTag,
  onDragEnd,
  onJustAddedTagHandled,
}: TagManagerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevTagsLength = useRef(tags.length);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Auto-scroll to end when new tag is added
  useEffect(() => {
    if (justAddedTag && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: scrollContainerRef.current.scrollWidth,
        behavior: 'smooth',
      });
      onJustAddedTagHandled();
    }
  }, [justAddedTag, onJustAddedTagHandled]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    onDragEnd(event);
  };

  const activeTag = tags.find((t) => t.id === activeId);

  return (
    <>
      {/* Management Controls */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onToggleManager}
          className="text-sm text-[var(--text-color-secondary)] hover:text-[var(--accent-color)] transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Icons.Tag size={16} />
          {showTagManager ? '完成' : '管理标签'}
        </button>
        {showTagManager && (
          <button
            onClick={onRestoreDefaults}
            className="text-sm text-[var(--text-color-secondary)] hover:text-[var(--accent-color)] transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Icons.RefreshCw size={16} />
            恢复默认
          </button>
        )}
      </div>

      {/* Add Custom Tag */}
      {showTagManager && (
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            value={newTagInput}
            onChange={(e) => onNewTagInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onAddTag()}
            placeholder="添加自定义标签..."
            className="flex-1 bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] text-[var(--text-color)] px-4 py-2 focus:outline-none focus:border-[var(--accent-color)] transition-colors rounded-[var(--radius-2xl)]"
          />
          <button
            onClick={onAddTag}
            className="px-6 py-2 bg-[var(--accent-color)] text-white font-semibold hover:opacity-90 transition-opacity rounded-[var(--radius-2xl)] cursor-pointer"
          >
            添加
          </button>
        </div>
      )}

      {/* Tag Filter */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          ref={scrollContainerRef}
          className="mb-8 flex items-center gap-3 overflow-x-auto pb-3 pt-2 px-1 scrollbar-hide"
        >
          <SortableContext
            items={tags.map(t => t.id)}
            strategy={horizontalListSortingStrategy}
          >
            {tags.map((tag) => (
              <SortableTag
                key={tag.id}
                tag={tag}
                selectedTag={selectedTag}
                showTagManager={showTagManager}
                onTagSelect={onTagSelect}
                onTagDelete={onTagDelete}
              />
            ))}
          </SortableContext>
        </div>

        <DragOverlay>
          {activeId && activeTag ? (
            <div className="relative flex-shrink-0 animate-jiggle">
              <button className="px-6 py-2.5 text-sm font-semibold whitespace-nowrap rounded-[var(--radius-full)] bg-[var(--accent-color)] text-white shadow-xl scale-110 cursor-grabbing border border-transparent">
                {activeTag.label}
              </button>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  );
}
