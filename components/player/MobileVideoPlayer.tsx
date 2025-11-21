'use client';

import { useEffect } from 'react';
import { useDoubleTap, useScreenOrientation } from '@/lib/hooks/useMobilePlayer';
import { useMobilePlayerState } from './hooks/useMobilePlayerState';
import { useMobilePlayerLogic } from './hooks/useMobilePlayerLogic';
import { MobileControls } from './mobile/MobileControls';
import { MobileOverlay } from './mobile/MobileOverlay';
import { MobileSkipIndicator } from './mobile/MobileSkipIndicator';

interface MobileVideoPlayerProps {
  src: string;
  poster?: string;
  onError?: (error: string) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  initialTime?: number;
}

export function MobileVideoPlayer({
  src,
  poster,
  onError,
  onTimeUpdate,
  initialTime = 0
}: MobileVideoPlayerProps) {
  const { refs, state } = useMobilePlayerState();
  const {
    videoRef,
    containerRef,
    progressBarRef,
    controlsTimeoutRef
  } = refs;

  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isFullscreen,
    showControls,
    isLoading,
    playbackRate,
    showSpeedMenu,
    showVolumeMenu,
    showMoreMenu,
    isPiPSupported,
    skipAmount,
    skipSide,
    showSkipIndicator,
    toastMessage,
    showToast,
    viewportWidth,
    setShowControls,
    setIsLoading
  } = state;

  const logic = useMobilePlayerLogic({
    src,
    initialTime,
    onError,
    onTimeUpdate,
    refs,
    state
  });

  const {
    skipVideo,
    togglePlay,
    handlePlay,
    handlePause,
    handleTimeUpdateEvent,
    handleLoadedMetadata,
    handleVideoError,
    handleProgressTouchStart,
    handleProgressTouchMove,
    handleProgressTouchEnd,
    handleProgressClick,
    toggleMute,
    toggleFullscreen,
    togglePictureInPicture,
    changePlaybackSpeed,
    handleCopyLink,
    formatTime
  } = logic;

  // Screen orientation management
  useScreenOrientation(isFullscreen);

  // Double tap handler
  const { handleTap } = useDoubleTap({
    onDoubleTapLeft: () => skipVideo(10, 'left'),
    onDoubleTapRight: () => skipVideo(10, 'right'),
    onSkipContinueLeft: () => skipVideo(10, 'left'),
    onSkipContinueRight: () => skipVideo(10, 'right'),
    isSkipModeActive: showSkipIndicator,
    onSingleTap: () => {
      if (!showControls) {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
        if (isPlaying) {
          controlsTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
          }, 3000);
        }
      } else {
        togglePlay();
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
        if (isPlaying) {
          controlsTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
          }, 3000);
        }
      }
    },
  });

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const isCompactLayout = viewportWidth < 640;

  return (
    <div
      ref={containerRef}
      className="relative aspect-video bg-black rounded-[var(--radius-2xl)] overflow-hidden"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        src={src}
        poster={poster}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdateEvent}
        onLoadedMetadata={handleLoadedMetadata}
        onError={handleVideoError}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onTouchEnd={handleTap}
        playsInline
        webkit-playsinline="true"
        x-webkit-airplay="allow"
      />

      <MobileOverlay
        isLoading={isLoading}
        showToast={showToast}
        toastMessage={toastMessage}
      />

      <MobileSkipIndicator
        showSkipIndicator={showSkipIndicator}
        skipSide={skipSide}
        skipAmount={skipAmount}
      />

      <MobileControls
        showControls={showControls}
        isCompactLayout={isCompactLayout}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        isFullscreen={isFullscreen}
        playbackRate={playbackRate}
        showMoreMenu={showMoreMenu}
        showVolumeMenu={showVolumeMenu}
        showSpeedMenu={showSpeedMenu}
        isPiPSupported={isPiPSupported}
        progressBarRef={progressBarRef}
        onTogglePlay={togglePlay}
        onSkipVideo={skipVideo}
        onToggleMute={toggleMute}
        onToggleFullscreen={toggleFullscreen}
        onToggleMoreMenu={() => state.setShowMoreMenu(!showMoreMenu)}
        onToggleVolumeMenu={() => state.setShowVolumeMenu(!showVolumeMenu)}
        onToggleSpeedMenu={() => state.setShowSpeedMenu(!showSpeedMenu)}
        onTogglePiP={togglePictureInPicture}
        onVolumeChange={(v) => {
          state.setVolume(v);
          if (videoRef.current) videoRef.current.volume = v;
          state.setIsMuted(v === 0);
        }}
        onSpeedChange={changePlaybackSpeed}
        onCopyLink={handleCopyLink}
        onProgressClick={handleProgressClick}
        onProgressTouchStart={handleProgressTouchStart}
        onProgressTouchMove={handleProgressTouchMove}
        onProgressTouchEnd={handleProgressTouchEnd}
        formatTime={formatTime}
        speeds={speeds}
      />
    </div>
  );
}
