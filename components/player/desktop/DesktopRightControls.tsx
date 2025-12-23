import React from 'react';
import { Icons } from '@/components/ui/Icon';
import { DesktopSpeedMenu } from './DesktopSpeedMenu';
import { DesktopMoreMenu } from './DesktopMoreMenu';

interface DesktopRightControlsProps {
    isFullscreen: boolean;
    playbackRate: number;
    showSpeedMenu: boolean;
    showMoreMenu: boolean;
    isPiPSupported: boolean;
    isAirPlaySupported: boolean;
    isWideScreen: boolean;
    isWebFullscreen: boolean;
    isProxied?: boolean;
    onToggleFullscreen: () => void;
    onTogglePictureInPicture: () => void;
    onShowAirPlayMenu: () => void;
    onToggleWideScreen: () => void;
    onToggleWebFullscreen: () => void;
    onToggleSpeedMenu: () => void;
    onToggleMoreMenu: () => void;
    onSpeedChange: (speed: number) => void;
    onCopyLink: (type?: 'original' | 'proxy') => void;
    onSpeedMenuMouseEnter: () => void;
    onSpeedMenuMouseLeave: () => void;
    onMoreMenuMouseEnter: () => void;
    onMoreMenuMouseLeave: () => void;
    speeds: number[];
}

export function DesktopRightControls({
    isFullscreen,
    playbackRate,
    showSpeedMenu,
    showMoreMenu,
    isPiPSupported,
    isAirPlaySupported,
    isWideScreen,
    isWebFullscreen,
    isProxied,
    onToggleFullscreen,
    onTogglePictureInPicture,
    onShowAirPlayMenu,
    onToggleWideScreen,
    onToggleWebFullscreen,
    onToggleSpeedMenu,
    onToggleMoreMenu,
    onSpeedChange,
    onCopyLink,
    onSpeedMenuMouseEnter,
    onSpeedMenuMouseLeave,
    onMoreMenuMouseEnter,
    onMoreMenuMouseLeave,
    speeds
}: DesktopRightControlsProps) {
    return (
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
                isProxied={isProxied}
                onToggleMoreMenu={onToggleMoreMenu}
                onMouseEnter={onMoreMenuMouseEnter}
                onMouseLeave={onMoreMenuMouseLeave}
                onCopyLink={onCopyLink}
            />

            {/* Wide Screen */}
            <button
                onClick={onToggleWideScreen}
                className="btn-icon"
                aria-label={isWideScreen ? 'Exit wide screen' : 'Wide screen'}
                title={isWideScreen ? '退出宽屏' : '宽屏'}
            >
                {isWideScreen ? <Icons.WideScreenExit size={20} /> : <Icons.WideScreen size={20} />}
            </button>

            {/* Web Fullscreen */}
            <button
                onClick={onToggleWebFullscreen}
                className="btn-icon"
                aria-label={isWebFullscreen ? 'Exit web fullscreen' : 'Web fullscreen'}
                title={isWebFullscreen ? '退出网页全屏' : '网页全屏'}
            >
                {isWebFullscreen ? <Icons.WebFullscreenExit size={20} /> : <Icons.WebFullscreen size={20} />}
            </button>

            {/* Fullscreen */}
            <button
                onClick={onToggleFullscreen}
                className="btn-icon"
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                title={isFullscreen ? '退出全屏' : '全屏'}
            >
                {isFullscreen ? <Icons.Minimize size={20} /> : <Icons.Maximize size={20} />}
            </button>
        </div>
    );
}
