import React from 'react';
import { Icons } from '@/components/ui/Icon';
import { MobileSpeedMenu } from '../MobileSpeedMenu';

interface RightControlsProps {
    playbackRate: number;
    showSpeedMenu: boolean;
    onToggleSpeedMenu: () => void;
    speeds: number[];
    onSpeedChange: (speed: number) => void;
    isPiPSupported: boolean;
    onTogglePiP: () => void;
    onToggleMoreMenu: () => void;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
    iconSize: number;
    buttonPadding: string;
    textSize: string;
    controlsGap: string;
}

export function RightControls({
    playbackRate,
    showSpeedMenu,
    onToggleSpeedMenu,
    speeds,
    onSpeedChange,
    isPiPSupported,
    onTogglePiP,
    onToggleMoreMenu,
    isFullscreen,
    onToggleFullscreen,
    iconSize,
    buttonPadding,
    textSize,
    controlsGap,
}: RightControlsProps) {
    return (
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
    );
}
