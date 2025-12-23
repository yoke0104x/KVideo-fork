'use client';

import { useDesktopPlayerState } from './hooks/useDesktopPlayerState';
import { useDesktopPlayerLogic } from './hooks/useDesktopPlayerLogic';
import { useHLSPreloader } from './hooks/useHLSPreloader';
import { useHlsPlayer } from './hooks/useHlsPlayer';
import { DesktopControlsWrapper } from './desktop/DesktopControlsWrapper';
import { DesktopOverlayWrapper } from './desktop/DesktopOverlayWrapper';

interface DesktopVideoPlayerProps {
  src: string;
  poster?: string;
  onError?: (error: string) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  initialTime?: number;
  shouldAutoPlay?: boolean;
}

export function DesktopVideoPlayer({
  src,
  poster,
  onError,
  onTimeUpdate,
  onEnded,
  initialTime = 0,
  shouldAutoPlay = false,
}: DesktopVideoPlayerProps) {
  const { refs, state } = useDesktopPlayerState();
  const { currentTime } = state;

  // Preload HLS segments
  useHLSPreloader({ src, currentTime, videoRef: refs.videoRef, isLoading: state.isLoading });

  // Initialize HLS Player
  useHlsPlayer({
    videoRef: refs.videoRef,
    src,
    autoPlay: shouldAutoPlay
  });

  const {
    videoRef,
    containerRef,
  } = refs;

  const {
    isPlaying,
    isWideScreen,
    isWebFullscreen,
    setShowControls,
    setIsLoading,
  } = state;

  const logic = useDesktopPlayerLogic({
    src,
    initialTime,
    shouldAutoPlay,
    onError,
    onTimeUpdate,
    refs,
    state
  });

  const {
    handleMouseMove,
    togglePlay,
    handlePlay,
    handlePause,
    handleTimeUpdateEvent,
    handleLoadedMetadata,
    handleVideoError,
  } = logic;

  return (
    <div
      ref={containerRef}
      className={`relative bg-black overflow-hidden group ${
        isWebFullscreen
          ? 'fixed h-screen inset-0 z-[9999] rounded-none'
          : isWideScreen
            ? 'w-full aspect-video rounded-[var(--radius-2xl)]'
            : 'aspect-video rounded-[var(--radius-2xl)]'
      }`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster}
        x-webkit-airplay="allow"
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdateEvent}
        onLoadedMetadata={handleLoadedMetadata}
        onError={handleVideoError}
        onWaiting={() => { if (videoRef.current && videoRef.current.currentTime > 0) setIsLoading(true); }}
        onCanPlay={() => setIsLoading(false)}
        onEnded={onEnded}
        onClick={togglePlay}
      />

      <DesktopOverlayWrapper
        state={state}
        onTogglePlay={togglePlay}
      />

      <DesktopControlsWrapper
        src={src}
        state={state}
        logic={logic}
        refs={refs}
      />
    </div>
  );
}
