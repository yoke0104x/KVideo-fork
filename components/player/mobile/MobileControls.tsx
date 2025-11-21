import React from 'react';
import { Icons } from '@/components/ui/Icon';
import { MobileProgressBar } from './MobileProgressBar';
import { MobileVolumeMenu } from './MobileVolumeMenu';
import { MobileSpeedMenu } from './MobileSpeedMenu';
import { MobileMoreMenu } from './MobileMoreMenu';

interface MobileControlsProps {
    showControls: boolean;
    isCompactLayout: boolean;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
    isFullscreen: boolean;
    playbackRate: number;
    showMoreMenu: boolean;
    showVolumeMenu: boolean;
    showSpeedMenu: boolean;
    isPiPSupported: boolean;
    progressBarRef: React.RefObject<HTMLDivElement | null>;

    onTogglePlay: () => void;
    onSkipVideo: (seconds: number, side: 'left' | 'right') => void;
    onToggleMute: () => void;
    onToggleFullscreen: () => void;
    onToggleMoreMenu: () => void;
    onToggleVolumeMenu: () => void;
    onToggleSpeedMenu: () => void;
    onTogglePiP: () => void;
    onVolumeChange: (volume: number) => void;
    onSpeedChange: (speed: number) => void;
    onCopyLink: () => void;
    onProgressClick: (e: React.MouseEvent<HTMLDivElement>) => void;
    onProgressTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
    onProgressTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void;
    onProgressTouchEnd: (e: React.TouchEvent<HTMLDivElement>) => void;
    formatTime: (seconds: number) => string;
    speeds: number[];
}

export function MobileControls({
    showControls,
    isCompactLayout,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isFullscreen,
    playbackRate,
    showMoreMenu,
    showVolumeMenu,
    showSpeedMenu,
    isPiPSupported,
    progressBarRef,
    onTogglePlay,
    onSkipVideo,
    onToggleMute,
    onToggleFullscreen,
    onToggleMoreMenu,
    onToggleVolumeMenu,
    onToggleSpeedMenu,
    onTogglePiP,
    onVolumeChange,
    onSpeedChange,
    onCopyLink,
    onProgressClick,
    onProgressTouchStart,
    onProgressTouchMove,
    onProgressTouchEnd,
    formatTime,
    speeds
}: MobileControlsProps) {
    const iconSize = isCompactLayout ? 20 : 22;
    const buttonPadding = isCompactLayout ? 'p-2' : 'p-2.5';
    const controlsGap = isCompactLayout ? 'gap-2' : 'gap-3';
    const textSize = isCompactLayout ? 'text-xs' : 'text-sm';
    const controlsPadding = isCompactLayout ? 'px-3 pb-3' : 'px-4 pb-4';

    return (
        <div
            className={`absolute bottom-0 left-0 right-0 z-50 transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
            style={{ pointerEvents: showControls ? 'auto' : 'none' }}
        >
            {/* Progress Bar */}
            <MobileProgressBar
                progressBarRef={progressBarRef}
                currentTime={currentTime}
                duration={duration}
                onProgressClick={onProgressClick}
                onProgressTouchStart={onProgressTouchStart}
                onProgressTouchMove={onProgressTouchMove}
                onProgressTouchEnd={onProgressTouchEnd}
            />

            {/* Controls Bar */}
            <div className={`bg-gradient-to-t from-black/90 via-black/70 to-transparent ${controlsPadding} pt-2`}>
                {isCompactLayout ? (
                    // Compact Layout
                    <div className={`flex items-center justify-between ${controlsGap}`}>
                        <div className={`flex items-center ${controlsGap} min-w-0`}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onTogglePlay();
                                }}
                                className={`btn-icon ${buttonPadding} flex-shrink-0 touch-manipulation relative z-[60]`}
                                aria-label={isPlaying ? 'Pause' : 'Play'}
                                style={{ WebkitTapHighlightColor: 'transparent' }}
                            >
                                {isPlaying ? <Icons.Pause size={iconSize} /> : <Icons.Play size={iconSize} />}
                            </button>

                            <span className={`text-white ${textSize} font-medium tabular-nums whitespace-nowrap`}>
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>

                        <div className={`flex items-center ${controlsGap} flex-shrink-0`}>
                            <div className="relative z-[60]">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleMoreMenu();
                                    }}
                                    className={`btn-icon ${buttonPadding} flex-shrink-0 touch-manipulation`}
                                    aria-label="更多"
                                    style={{ WebkitTapHighlightColor: 'transparent' }}
                                >
                                    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="1" />
                                        <circle cx="12" cy="5" r="1" />
                                        <circle cx="12" cy="19" r="1" />
                                    </svg>
                                </button>

                                <MobileMoreMenu
                                    showMoreMenu={showMoreMenu}
                                    isMuted={isMuted}
                                    volume={volume}
                                    playbackRate={playbackRate}
                                    isPiPSupported={isPiPSupported}
                                    onCopyLink={() => {
                                        onToggleMoreMenu();
                                        onCopyLink();
                                    }}
                                    onToggleVolumeMenu={() => {
                                        onToggleMoreMenu();
                                        onToggleVolumeMenu();
                                    }}
                                    onToggleSpeedMenu={() => {
                                        onToggleMoreMenu();
                                        onToggleSpeedMenu();
                                    }}
                                    onTogglePiP={() => {
                                        onToggleMoreMenu();
                                        onTogglePiP();
                                    }}
                                />
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleFullscreen();
                                }}
                                className={`btn-icon ${buttonPadding} flex-shrink-0 touch-manipulation relative z-[60]`}
                                aria-label={isFullscreen ? '退出全屏' : '全屏'}
                                style={{ WebkitTapHighlightColor: 'transparent' }}
                            >
                                {isFullscreen ? <Icons.Minimize size={iconSize} /> : <Icons.Maximize size={iconSize} />}
                            </button>
                        </div>
                    </div>
                ) : (
                    // Full Layout
                    <div className={`flex items-center ${controlsGap}`}>
                        <div className={`flex items-center ${controlsGap}`}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onTogglePlay();
                                }}
                                className={`btn-icon ${buttonPadding} flex-shrink-0 touch-manipulation relative z-[60]`}
                                aria-label={isPlaying ? 'Pause' : 'Play'}
                                style={{ WebkitTapHighlightColor: 'transparent' }}
                            >
                                {isPlaying ? <Icons.Pause size={iconSize} /> : <Icons.Play size={iconSize} />}
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSkipVideo(10, 'left');
                                }}
                                className={`btn-icon ${buttonPadding} flex-shrink-0 touch-manipulation`}
                                aria-label="后退 10 秒"
                                style={{ WebkitTapHighlightColor: 'transparent' }}
                            >
                                <Icons.SkipBack size={iconSize} />
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSkipVideo(10, 'right');
                                }}
                                className={`btn-icon ${buttonPadding} flex-shrink-0 touch-manipulation`}
                                aria-label="前进 10 秒"
                                style={{ WebkitTapHighlightColor: 'transparent' }}
                            >
                                <Icons.SkipForward size={iconSize} />
                            </button>

                            <div className="relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleVolumeMenu();
                                    }}
                                    className={`btn-icon ${buttonPadding} flex-shrink-0 touch-manipulation`}
                                    aria-label="音量"
                                    style={{ WebkitTapHighlightColor: 'transparent' }}
                                >
                                    {isMuted || volume === 0 ? <Icons.VolumeX size={iconSize} /> : <Icons.Volume2 size={iconSize} />}
                                </button>

                                <MobileVolumeMenu
                                    showVolumeMenu={showVolumeMenu}
                                    isCompactLayout={false}
                                    isMuted={isMuted}
                                    volume={volume}
                                    onToggleMute={onToggleMute}
                                    onVolumeChange={onVolumeChange}
                                    onClose={onToggleVolumeMenu}
                                />
                            </div>

                            <span className={`text-white ${textSize} font-medium tabular-nums whitespace-nowrap`}>
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>

                        <div className="flex-1" />

                        <div className={`flex items-center ${controlsGap} flex-shrink-0`}>
                            <div className="relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleSpeedMenu();
                                    }}
                                    className={`btn-icon ${buttonPadding} flex-shrink-0 touch-manipulation`}
                                    aria-label="播放速度"
                                    style={{ WebkitTapHighlightColor: 'transparent' }}
                                >
                                    <span className={`text-white ${textSize} font-medium`}>{playbackRate}x</span>
                                </button>

                                <MobileSpeedMenu
                                    showSpeedMenu={showSpeedMenu}
                                    isCompactLayout={false}
                                    playbackRate={playbackRate}
                                    speeds={speeds}
                                    onSpeedChange={onSpeedChange}
                                    onClose={onToggleSpeedMenu}
                                />
                            </div>

                            {isPiPSupported && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onTogglePiP();
                                    }}
                                    className={`btn-icon ${buttonPadding} flex-shrink-0 touch-manipulation`}
                                    aria-label="画中画"
                                    style={{ WebkitTapHighlightColor: 'transparent' }}
                                >
                                    <Icons.PictureInPicture size={iconSize} />
                                </button>
                            )}

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleMoreMenu();
                                }}
                                className={`btn-icon ${buttonPadding} flex-shrink-0 touch-manipulation`}
                                aria-label="更多"
                                style={{ WebkitTapHighlightColor: 'transparent' }}
                            >
                                <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="1" />
                                    <circle cx="12" cy="5" r="1" />
                                    <circle cx="12" cy="19" r="1" />
                                </svg>
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleFullscreen();
                                }}
                                className={`btn-icon ${buttonPadding} flex-shrink-0 touch-manipulation relative z-[60]`}
                                aria-label={isFullscreen ? '退出全屏' : '全屏'}
                                style={{ WebkitTapHighlightColor: 'transparent' }}
                            >
                                {isFullscreen ? <Icons.Minimize size={iconSize} /> : <Icons.Maximize size={iconSize} />}
                            </button>
                        </div>
                    </div>
                )}

                {/* Compact Layout Submenus */}
                <MobileVolumeMenu
                    showVolumeMenu={showVolumeMenu}
                    isCompactLayout={true}
                    isMuted={isMuted}
                    volume={volume}
                    onToggleMute={onToggleMute}
                    onVolumeChange={onVolumeChange}
                    onClose={onToggleVolumeMenu}
                />

                <MobileSpeedMenu
                    showSpeedMenu={showSpeedMenu}
                    isCompactLayout={true}
                    playbackRate={playbackRate}
                    speeds={speeds}
                    onSpeedChange={onSpeedChange}
                    onClose={onToggleSpeedMenu}
                />
            </div>
        </div>
    );
}
