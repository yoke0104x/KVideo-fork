import { useEffect, useCallback } from 'react';
import { useIsIOS } from '@/lib/hooks/useMobilePlayer';

interface UseMobilePlayerLogicProps {
    src: string;
    poster?: string;
    initialTime: number;
    onError?: (error: string) => void;
    onTimeUpdate?: (currentTime: number, duration: number) => void;
    refs: any;
    state: any;
}

export function useMobilePlayerLogic({
    src,
    initialTime,
    onError,
    onTimeUpdate,
    refs,
    state
}: UseMobilePlayerLogicProps) {
    const {
        videoRef,
        containerRef,
        progressBarRef,
        controlsTimeoutRef,
        skipTimeoutRef,
        isDraggingProgressRef,
        menuIdleTimeoutRef,
        isTogglingRef,
        toastTimeoutRef
    } = refs;

    const {
        isPlaying, setIsPlaying,
        currentTime, setCurrentTime,
        duration, setDuration,
        volume, setVolume,
        isMuted, setIsMuted,
        isFullscreen, setIsFullscreen,
        setShowControls,
        setIsLoading,
        setPlaybackRate,
        showSpeedMenu, setShowSpeedMenu,
        showVolumeMenu, setShowVolumeMenu,
        showMoreMenu, setShowMoreMenu,
        isPiPSupported, setIsPiPSupported,
        skipAmount, setSkipAmount,
        skipSide, setSkipSide,
        setShowSkipIndicator,
        wasPlayingBeforeMenu, setWasPlayingBeforeMenu,
        setToastMessage,
        setShowToast,
        setViewportWidth
    } = state;

    const isIOS = useIsIOS();

    // Screen orientation management
    // Note: This was originally a hook call in the component. 
    // We can't call hooks conditionally or inside callbacks, so we assume the component calls useScreenOrientation separately if needed,
    // or we move it here if it's a top-level hook.
    // Since useScreenOrientation is a hook, we should call it in the component, not here if this is just a logic function.
    // But this IS a hook (useMobilePlayerLogic), so we can call other hooks.
    // However, useScreenOrientation takes isFullscreen as an argument.

    // Check for PiP support
    useEffect(() => {
        if (typeof document !== 'undefined') {
            setIsPiPSupported('pictureInPictureEnabled' in document);
        }
    }, [setIsPiPSupported]);

    // Track viewport width
    useEffect(() => {
        const updateViewportWidth = () => {
            setViewportWidth(window.innerWidth);
        };
        updateViewportWidth();
        window.addEventListener('resize', updateViewportWidth);
        return () => window.removeEventListener('resize', updateViewportWidth);
    }, [setViewportWidth]);

    // Skip forward/backward
    const skipVideo = useCallback((seconds: number, side: 'left' | 'right') => {
        if (!videoRef.current) return;

        if (skipTimeoutRef.current) {
            clearTimeout(skipTimeoutRef.current);
        }

        const newSkipAmount = skipSide === side ? skipAmount + Math.abs(seconds) : Math.abs(seconds);
        setSkipAmount(newSkipAmount);
        setSkipSide(side);
        setShowSkipIndicator(true);

        const targetTime = side === 'left'
            ? Math.max(videoRef.current.currentTime - Math.abs(seconds), 0)
            : Math.min(videoRef.current.currentTime + Math.abs(seconds), duration);

        videoRef.current.currentTime = targetTime;
        setCurrentTime(targetTime);

        skipTimeoutRef.current = setTimeout(() => {
            setShowSkipIndicator(false);
            setSkipAmount(0);
            setSkipSide(null);
        }, 1500);
    }, [duration, skipAmount, skipSide, videoRef, skipTimeoutRef, setSkipAmount, setSkipSide, setShowSkipIndicator, setCurrentTime]);

    const togglePlay = useCallback(async () => {
        if (!videoRef.current || isTogglingRef.current) return;
        isTogglingRef.current = true;

        try {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                setShowMoreMenu(false);
                setShowVolumeMenu(false);
                setShowSpeedMenu(false);
                await videoRef.current.play();
            }
        } catch (error) {
            console.warn('Play/pause error:', error);
        } finally {
            isTogglingRef.current = false;
        }
    }, [isPlaying, videoRef, isTogglingRef, setShowMoreMenu, setShowVolumeMenu, setShowSpeedMenu]);

    const handlePlay = useCallback(() => setIsPlaying(true), [setIsPlaying]);
    const handlePause = useCallback(() => setIsPlaying(false), [setIsPlaying]);

    const handleTimeUpdateEvent = useCallback(() => {
        if (!videoRef.current || isDraggingProgressRef.current) return;
        const current = videoRef.current.currentTime;
        const total = videoRef.current.duration;
        setCurrentTime(current);
        setDuration(total);
        if (onTimeUpdate) {
            onTimeUpdate(current, total);
        }
    }, [videoRef, isDraggingProgressRef, setCurrentTime, setDuration, onTimeUpdate]);

    const handleLoadedMetadata = useCallback(() => {
        if (!videoRef.current) return;
        setDuration(videoRef.current.duration);
        setIsLoading(false);
        if (initialTime > 0) {
            videoRef.current.currentTime = initialTime;
        }
        videoRef.current.play().catch((err: Error) => {
            console.warn('Autoplay was prevented:', err);
        });
    }, [videoRef, setDuration, setIsLoading, initialTime]);

    const handleVideoError = useCallback(() => {
        setIsLoading(false);
        if (onError) {
            onError('Video failed to load');
        }
    }, [setIsLoading, onError]);

    const updateProgressFromEvent = useCallback((e: any) => {
        if (!videoRef.current || !progressBarRef.current) return;

        const rect = progressBarRef.current.getBoundingClientRect();
        let clientX: number;

        if ('touches' in e) {
            const touch = e.touches[0] || e.changedTouches?.[0];
            if (!touch) return;
            clientX = touch.clientX;
        } else {
            clientX = e.clientX;
        }

        const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        return pos * duration;
    }, [videoRef, progressBarRef, duration]);

    const handleProgressTouchStart = useCallback((e: any) => {
        isDraggingProgressRef.current = true;
        const newTime = updateProgressFromEvent(e);
        if (newTime !== undefined) {
            setCurrentTime(newTime);
        }
    }, [isDraggingProgressRef, updateProgressFromEvent, setCurrentTime]);

    const handleProgressTouchMove = useCallback((e: any) => {
        if (!isDraggingProgressRef.current) return;
        e.preventDefault();
        const newTime = updateProgressFromEvent(e);
        if (newTime !== undefined) {
            setCurrentTime(newTime);
            if (videoRef.current) {
                videoRef.current.currentTime = newTime;
            }
        }
    }, [isDraggingProgressRef, updateProgressFromEvent, setCurrentTime, videoRef]);

    const handleProgressTouchEnd = useCallback((e: any) => {
        if (!isDraggingProgressRef.current) return;
        isDraggingProgressRef.current = false;
        const newTime = updateProgressFromEvent(e);
        if (newTime !== undefined && videoRef.current) {
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    }, [isDraggingProgressRef, updateProgressFromEvent, videoRef, setCurrentTime]);

    const handleProgressClick = useCallback((e: any) => {
        const newTime = updateProgressFromEvent(e);
        if (newTime !== undefined && videoRef.current) {
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    }, [updateProgressFromEvent, videoRef, setCurrentTime]);

    const toggleMute = useCallback(() => {
        if (!videoRef.current) return;
        if (isMuted) {
            videoRef.current.volume = volume;
            setIsMuted(false);
        } else {
            videoRef.current.volume = 0;
            setIsMuted(true);
        }
    }, [videoRef, isMuted, volume, setIsMuted]);

    const toggleFullscreen = useCallback(() => {
        if (!containerRef.current) return;

        if (!isFullscreen) {
            if (isIOS && videoRef.current && (videoRef.current as any).webkitEnterFullscreen) {
                (videoRef.current as any).webkitEnterFullscreen();
                return;
            }

            if (containerRef.current.requestFullscreen) {
                containerRef.current.requestFullscreen().catch((err: Error) => console.warn('Fullscreen request failed:', err));
            } else if ((containerRef.current as any).webkitRequestFullscreen) {
                (containerRef.current as any).webkitRequestFullscreen();
            } else if ((containerRef.current as any).webkitRequestFullScreen) {
                (containerRef.current as any).webkitRequestFullScreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch((err: Error) => console.warn('Exit fullscreen failed:', err));
            } else if ((document as any).webkitExitFullscreen) {
                (document as any).webkitExitFullscreen();
            } else if ((document as any).webkitCancelFullScreen) {
                (document as any).webkitCancelFullScreen();
            }
        }
    }, [containerRef, isFullscreen, isIOS, videoRef]);

    // Fullscreen change listener
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isInFullscreen = !!(
                document.fullscreenElement ||
                (document as any).webkitFullscreenElement ||
                (document as any).webkitCurrentFullScreenElement
            );
            setIsFullscreen(isInFullscreen);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, [setIsFullscreen]);

    const togglePictureInPicture = useCallback(async () => {
        if (!videoRef.current || !isPiPSupported) return;

        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else {
                await videoRef.current.requestPictureInPicture();
            }
        } catch (error) {
            console.error('Failed to toggle Picture-in-Picture:', error);
        }
    }, [videoRef, isPiPSupported]);

    const changePlaybackSpeed = useCallback((speed: number) => {
        if (!videoRef.current) return;
        videoRef.current.playbackRate = speed;
        setPlaybackRate(speed);
        setShowSpeedMenu(false);
    }, [videoRef, setPlaybackRate, setShowSpeedMenu]);

    const showToastNotification = useCallback((message: string) => {
        setToastMessage(message);
        setShowToast(true);

        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
        }

        toastTimeoutRef.current = setTimeout(() => {
            setShowToast(false);
            setTimeout(() => setToastMessage(null), 300);
        }, 3000);
    }, [setToastMessage, setShowToast, toastTimeoutRef]);

    const handleCopyLink = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(src);
            showToastNotification('链接已复制到剪贴板');
        } catch (error) {
            console.error('Copy failed:', error);
            showToastNotification('复制失败，请重试');
        }
    }, [src, showToastNotification]);

    const formatTime = useCallback((seconds: number) => {
        if (isNaN(seconds)) return '0:00:00';
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    // Auto-hide controls
    useEffect(() => {
        if (!isPlaying) {
            setShowControls(true);
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
            return;
        }

        const hideControls = () => {
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
            controlsTimeoutRef.current = setTimeout(() => {
                if (isPlaying) {
                    setShowControls(false);
                    setShowSpeedMenu(false);
                    setShowVolumeMenu(false);
                    setShowMoreMenu(false);
                }
            }, 3000);
        };

        hideControls();
        return () => {
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        };
    }, [isPlaying, setShowControls, setShowSpeedMenu, setShowVolumeMenu, setShowMoreMenu, controlsTimeoutRef]);

    // Auto-close menus
    useEffect(() => {
        if (showMoreMenu) {
            if (videoRef.current && isPlaying) {
                setWasPlayingBeforeMenu(true);
                videoRef.current.pause();
            }
            if (menuIdleTimeoutRef.current) clearTimeout(menuIdleTimeoutRef.current);
            menuIdleTimeoutRef.current = setTimeout(() => {
                setShowMoreMenu(false);
                if (wasPlayingBeforeMenu && videoRef.current) {
                    videoRef.current.play().catch((err: Error) => console.warn('Resume play error:', err));
                    setWasPlayingBeforeMenu(false);
                }
            }, 2000);
        }
        return () => {
            if (menuIdleTimeoutRef.current) clearTimeout(menuIdleTimeoutRef.current);
        };
    }, [showMoreMenu, isPlaying, wasPlayingBeforeMenu, videoRef, menuIdleTimeoutRef, setShowMoreMenu, setWasPlayingBeforeMenu]);

    // Pause on submenu open
    useEffect(() => {
        if (showVolumeMenu || showSpeedMenu) {
            if (videoRef.current && isPlaying) {
                setWasPlayingBeforeMenu(true);
                videoRef.current.pause();
            }
        }
    }, [showVolumeMenu, showSpeedMenu, isPlaying, videoRef, setWasPlayingBeforeMenu]);

    // Click outside listener
    useEffect(() => {
        const handleClickOutside = (e: any) => {
            const target = e.target as HTMLElement;
            const isMenuClick = target.closest('.menu-container') || target.closest('[aria-label="更多"]');

            if (!isMenuClick && (showMoreMenu || showVolumeMenu || showSpeedMenu)) {
                setShowMoreMenu(false);
                setShowVolumeMenu(false);
                setShowSpeedMenu(false);

                if (wasPlayingBeforeMenu && videoRef.current) {
                    videoRef.current.play().catch((err: Error) => console.warn('Resume play error:', err));
                    setWasPlayingBeforeMenu(false);
                }

            }
        };

        if (showMoreMenu || showVolumeMenu || showSpeedMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [showMoreMenu, showVolumeMenu, showSpeedMenu, wasPlayingBeforeMenu, videoRef, setShowMoreMenu, setShowVolumeMenu, setShowSpeedMenu, setWasPlayingBeforeMenu]);

    return {
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
        showToastNotification,
        handleCopyLink,
        formatTime
    };
}
