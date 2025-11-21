'use client';

import { useDesktopPlayerState } from './hooks/useDesktopPlayerState';
import { useDesktopPlayerLogic } from './hooks/useDesktopPlayerLogic';
import { DesktopControls } from './desktop/DesktopControls';
import { DesktopOverlay } from './desktop/DesktopOverlay';

interface DesktopVideoPlayerProps {
  src: string;
  poster?: string;
  onError?: (error: string) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  initialTime?: number;
}

export function DesktopVideoPlayer({
  src,
  poster,
  onError,
  onTimeUpdate,
  initialTime = 0
}: DesktopVideoPlayerProps) {
  const { refs, state } = useDesktopPlayerState();
  const {
    videoRef,
    containerRef,
    progressBarRef,
    volumeBarRef,
    moreMenuTimeoutRef
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
    isPiPSupported,
    isAirPlaySupported,
    skipForwardAmount,
    skipBackwardAmount,
    showSkipForwardIndicator,
    showSkipBackwardIndicator,
    isSkipForwardAnimatingOut,
    isSkipBackwardAnimatingOut,
    showVolumeBar,
    toastMessage,
    showToast,
    showMoreMenu,
    setShowControls,
    setIsLoading,
    setShowMoreMenu
  } = state;

  const logic = useDesktopPlayerLogic({
    src,
    initialTime,
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
    handleProgressClick,
    handleProgressMouseDown,
    toggleMute,
    handleVolumeChange,
    handleVolumeMouseDown,
    toggleFullscreen,
    togglePictureInPicture,
    showAirPlayMenu,
    skipForward,
    skipBackward,
    changePlaybackSpeed,
    handleCopyLink,
    startSpeedMenuTimeout,
    clearSpeedMenuTimeout,
    formatTime
  } = logic;

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div
      ref={containerRef}
      className="relative aspect-video bg-black rounded-[var(--radius-2xl)] overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
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
        onClick={togglePlay}
      />

      <DesktopOverlay
        isLoading={isLoading}
        isPlaying={isPlaying}
        showSkipForwardIndicator={showSkipForwardIndicator}
        showSkipBackwardIndicator={showSkipBackwardIndicator}
        skipForwardAmount={skipForwardAmount}
        skipBackwardAmount={skipBackwardAmount}
        isSkipForwardAnimatingOut={isSkipForwardAnimatingOut}
        isSkipBackwardAnimatingOut={isSkipBackwardAnimatingOut}
        showToast={showToast}
        toastMessage={toastMessage}
        onTogglePlay={togglePlay}
      />

      <DesktopControls
        showControls={showControls}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        isFullscreen={isFullscreen}
        playbackRate={playbackRate}
        showSpeedMenu={showSpeedMenu}
        showMoreMenu={showMoreMenu}
        showVolumeBar={showVolumeBar}
        isPiPSupported={isPiPSupported}
        isAirPlaySupported={isAirPlaySupported}
        progressBarRef={progressBarRef}
        volumeBarRef={volumeBarRef}
        onTogglePlay={togglePlay}
        onSkipForward={skipForward}
        onSkipBackward={skipBackward}
        onToggleMute={toggleMute}
        onVolumeChange={handleVolumeChange}
        onVolumeMouseDown={handleVolumeMouseDown}
        onToggleFullscreen={toggleFullscreen}
        onTogglePictureInPicture={togglePictureInPicture}
        onShowAirPlayMenu={showAirPlayMenu}
        onToggleSpeedMenu={() => state.setShowSpeedMenu(!showSpeedMenu)}
        onToggleMoreMenu={() => setShowMoreMenu(!showMoreMenu)}
        onSpeedChange={changePlaybackSpeed}
        onCopyLink={handleCopyLink}
        onProgressClick={handleProgressClick}
        onProgressMouseDown={handleProgressMouseDown}
        onSpeedMenuMouseEnter={clearSpeedMenuTimeout}
        onSpeedMenuMouseLeave={startSpeedMenuTimeout}
        onMoreMenuMouseEnter={() => {
          if (moreMenuTimeoutRef.current) {
            clearTimeout(moreMenuTimeoutRef.current);
          }
        }}
        onMoreMenuMouseLeave={() => {
          moreMenuTimeoutRef.current = setTimeout(() => {
            setShowMoreMenu(false);
          }, 300);
        }}
        formatTime={formatTime}
        speeds={speeds}
      />
    </div>
  );
}
