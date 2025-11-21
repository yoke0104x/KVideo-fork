import React from 'react';
import { Icons } from '@/components/ui/Icon';
import { DesktopProgressBar } from './DesktopProgressBar';
import { DesktopVolumeControl } from './DesktopVolumeControl';
import { DesktopSpeedMenu } from './DesktopSpeedMenu';
import { DesktopMoreMenu } from './DesktopMoreMenu';

interface DesktopControlsProps {
    showControls: boolean;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
    isFullscreen: boolean;
    playbackRate: number;
    showSpeedMenu: boolean;
    showMoreMenu: boolean;
    showVolumeBar: boolean;
    isPiPSupported: boolean;
    isAirPlaySupported: boolean;
    progressBarRef: React.RefObject<HTMLDivElement | null>;
    volumeBarRef: React.RefObject<HTMLDivElement | null>;
    onTogglePlay: () => void;
    onSkipForward: () => void;
    onSkipBackward: () => void;
    onToggleMute: () => void;
    onVolumeChange: (e: React.MouseEvent<HTMLDivElement>) => void;
    onVolumeMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
    onToggleFullscreen: () => void;
    onTogglePictureInPicture: () => void;
    onShowAirPlayMenu: () => void;
    onToggleSpeedMenu: () => void;
    onToggleMoreMenu: () => void;
    onSpeedChange: (speed: number) => void;
    onCopyLink: () => void;
    onProgressClick: (e: React.MouseEvent<HTMLDivElement>) => void;
    onProgressMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
    onSpeedMenuMouseEnter: () => void;
    onSpeedMenuMouseLeave: () => void;
    onMoreMenuMouseEnter: () => void;
    onMoreMenuMouseLeave: () => void;
    formatTime: (seconds: number) => string;
    speeds: number[];
}

export function DesktopControls({
    showControls,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isFullscreen,
    playbackRate,
    showSpeedMenu,
    showMoreMenu,
    showVolumeBar,
    isPiPSupported,
    isAirPlaySupported,
    progressBarRef,
    volumeBarRef,
    onTogglePlay,
    onSkipForward,
    onSkipBackward,
    onToggleMute,
    onVolumeChange,
    onVolumeMouseDown,
    onToggleFullscreen,
    onTogglePictureInPicture,
    onShowAirPlayMenu,
    onToggleSpeedMenu,
    onToggleMoreMenu,
    onSpeedChange,
    onCopyLink,
    onProgressClick,
    onProgressMouseDown,
    onSpeedMenuMouseEnter,
    onSpeedMenuMouseLeave,
    onMoreMenuMouseEnter,
    onMoreMenuMouseLeave,
    formatTime,
    speeds
}: DesktopControlsProps) {
    return (
        <div
            className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
            style={{ pointerEvents: showControls ? 'auto' : 'none' }}
        >
            {/* Progress Bar */}
            <DesktopProgressBar
                progressBarRef={progressBarRef}
                currentTime={currentTime}
                duration={duration}
                onProgressClick={onProgressClick}
                onProgressMouseDown={onProgressMouseDown}
            />

            {/* Controls Bar */}
            <div className="bg-gradient-to-t from-black/90 via-black/70 to-transparent px-4 pb-4 pt-2">
                <div className="flex items-center justify-between gap-4">
                    {/* Left Controls */}
                    <div className="flex items-center gap-3">
                        {/* Play/Pause */}
                        <button
                            onClick={onTogglePlay}
                            className="btn-icon"
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isPlaying ? <Icons.Pause size={20} /> : <Icons.Play size={20} />}
                        </button>

                        {/* Skip Backward 10s */}
                        <button
                            onClick={onSkipBackward}
                            className="btn-icon"
                            aria-label="Skip backward 10 seconds"
                            title="后退 10 秒"
                        >
                            <Icons.SkipBack size={20} />
                        </button>

                        {/* Skip Forward 10s */}
                        <button
                            onClick={onSkipForward}
                            className="btn-icon"
                            aria-label="Skip forward 10 seconds"
                            title="快进 10 秒"
                        >
                            <Icons.SkipForward size={20} />
                        </button>

                        {/* Volume */}
                        <DesktopVolumeControl
                            volumeBarRef={volumeBarRef}
                            volume={volume}
                            isMuted={isMuted}
                            showVolumeBar={showVolumeBar}
                            onToggleMute={onToggleMute}
                            onVolumeChange={onVolumeChange}
                            onVolumeMouseDown={onVolumeMouseDown}
                        />

                        {/* Time */}
                        <span className="text-white text-sm font-medium tabular-nums">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-3">
                        {/* Playback Speed */}
                        <DesktopSpeedMenu
                            showSpeedMenu={showSpeedMenu}
                            playbackRate={playbackRate}
                            speeds={speeds}
                            onSpeedChange={onSpeedChange}
                            onToggleSpeedMenu={onToggleSpeedMenu}
                            onMouseEnter={onSpeedMenuMouseEnter}
                            onMouseLeave={onSpeedMenuMouseLeave}
                        />

                        {/* Picture-in-Picture */}
                        {isPiPSupported && (
                            <button
                                onClick={onTogglePictureInPicture}
                                className="btn-icon"
                                aria-label="Picture-in-Picture"
                                title="画中画"
                            >
                                <Icons.PictureInPicture size={20} />
                            </button>
                        )}

                        {/* AirPlay */}
                        {isAirPlaySupported && (
                            <button
                                onClick={onShowAirPlayMenu}
                                className="btn-icon"
                                aria-label="AirPlay"
                                title="AirPlay"
                            >
                                <Icons.Airplay size={20} />
                            </button>
                        )}

                        {/* More Menu */}
                        <DesktopMoreMenu
                            showMoreMenu={showMoreMenu}
                            onToggleMoreMenu={onToggleMoreMenu}
                            onMouseEnter={onMoreMenuMouseEnter}
                            onMouseLeave={onMoreMenuMouseLeave}
                            onCopyLink={onCopyLink}
                        />

                        {/* Fullscreen */}
                        <button
                            onClick={onToggleFullscreen}
                            className="btn-icon"
                            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                        >
                            {isFullscreen ? <Icons.Minimize size={20} /> : <Icons.Maximize size={20} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
