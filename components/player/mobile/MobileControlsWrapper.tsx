import { MobileControls } from './MobileControls';
import { useMobilePlayerState } from '../hooks/useMobilePlayerState';
import { useMobilePlayerLogic } from '../hooks/useMobilePlayerLogic';

interface MobileControlsWrapperProps {
    state: ReturnType<typeof useMobilePlayerState>['state'];
    logic: ReturnType<typeof useMobilePlayerLogic>;
    refs: ReturnType<typeof useMobilePlayerState>['refs'];
}

export function MobileControlsWrapper({ state, logic, refs }: MobileControlsWrapperProps) {
    const {
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isFullscreen,
        showControls,
        playbackRate,
        showSpeedMenu,
        showVolumeMenu,
        showMoreMenu,
        isPiPSupported,
        viewportWidth,
    } = state;

    const {
        progressBarRef,
        videoRef,
    } = refs;

    const {
        togglePlay,
        skipVideo,
        toggleMute,
        toggleFullscreen,
        togglePictureInPicture,
        changePlaybackSpeed,
        handleCopyLink,
        handleProgressClick,
        handleProgressTouchStart,
        handleProgressTouchMove,
        handleProgressTouchEnd,
        formatTime,
    } = logic;

    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const isCompactLayout = viewportWidth < 640;

    return (
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
    );
}
