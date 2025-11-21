import { useEffect, useCallback } from 'react';

interface UseDesktopPlayerLogicProps {
    src: string;
    initialTime: number;
    onError?: (error: string) => void;
    onTimeUpdate?: (currentTime: number, duration: number) => void;
    refs: any;
    state: any;
}

export function useDesktopPlayerLogic({
    src,
    initialTime,
    onError,
    onTimeUpdate,
    refs,
    state
}: UseDesktopPlayerLogicProps) {
    const {
        videoRef,
        containerRef,
        progressBarRef,
        volumeBarRef,
        controlsTimeoutRef,
        speedMenuTimeoutRef,
        skipForwardTimeoutRef,
        skipBackwardTimeoutRef,
        volumeBarTimeoutRef,
        isDraggingProgressRef,
        isDraggingVolumeRef,
        mouseMoveThrottleRef,
        toastTimeoutRef,
        moreMenuTimeoutRef
    } = refs;

    const {
        isPlaying, setIsPlaying,
        currentTime, setCurrentTime,
        duration, setDuration,
        volume, setVolume,
        isMuted, setIsMuted,
        isFullscreen, setIsFullscreen,
        showControls, setShowControls,
        setIsLoading,
        playbackRate, setPlaybackRate,
        showSpeedMenu, setShowSpeedMenu,
        isPiPSupported, setIsPiPSupported,
        isAirPlaySupported, setIsAirPlaySupported,
        skipForwardAmount, setSkipForwardAmount,
        skipBackwardAmount, setSkipBackwardAmount,
        showSkipForwardIndicator, setShowSkipForwardIndicator,
        showSkipBackwardIndicator, setShowSkipBackwardIndicator,
        setIsSkipForwardAnimatingOut,
        setIsSkipBackwardAnimatingOut,
        setShowVolumeBar,
        setToastMessage,
        setShowToast,
        showMoreMenu, setShowMoreMenu
    } = state;

    // Check for PiP and AirPlay support
    useEffect(() => {
        if (typeof document !== 'undefined') {
            setIsPiPSupported('pictureInPictureEnabled' in document);
        }
        if (typeof window !== 'undefined') {
            setIsAirPlaySupported('WebKitPlaybackTargetAvailabilityEvent' in window);
        }
    }, [setIsPiPSupported, setIsAirPlaySupported]);

    // Auto-hide controls
    useEffect(() => {
        if (!isPlaying) return;

        const hideControls = () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
            controlsTimeoutRef.current = setTimeout(() => {
                if (isPlaying && !showSpeedMenu) {
                    setShowControls(false);
                }
            }, 3000);
        };

        hideControls();

        return () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, [isPlaying, showSpeedMenu, setShowControls, controlsTimeoutRef]);

    const handleMouseMove = useCallback(() => {
        if (mouseMoveThrottleRef.current) return;

        mouseMoveThrottleRef.current = setTimeout(() => {
            mouseMoveThrottleRef.current = null;
        }, 200);

        if (!showControls) {
            setShowControls(true);
        }
        if (isPlaying && controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
            controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
        }
    }, [showControls, isPlaying, setShowControls, controlsTimeoutRef, mouseMoveThrottleRef]);

    const togglePlay = useCallback(() => {
        if (!videoRef.current) return;

        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
    }, [isPlaying, videoRef]);

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

    const handleProgressClick = useCallback((e: any) => {
        if (!videoRef.current || !progressBarRef.current) return;

        const rect = progressBarRef.current.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const newTime = pos * duration;
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    }, [videoRef, progressBarRef, duration, setCurrentTime]);

    const handleProgressMouseDown = useCallback((e: any) => {
        e.preventDefault();
        isDraggingProgressRef.current = true;
        handleProgressClick(e);
    }, [isDraggingProgressRef, handleProgressClick]);

    // Mouse move/up listeners for progress bar
    useEffect(() => {
        const handleProgressMouseMove = (e: MouseEvent) => {
            if (!isDraggingProgressRef.current || !progressBarRef.current || !videoRef.current) return;

            e.preventDefault();
            const rect = progressBarRef.current.getBoundingClientRect();
            const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const newTime = pos * duration;
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        };

        const handleMouseUp = () => {
            if (isDraggingProgressRef.current) {
                isDraggingProgressRef.current = false;
            }
        };

        document.addEventListener('mousemove', handleProgressMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleProgressMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [duration, isDraggingProgressRef, progressBarRef, videoRef, setCurrentTime]);

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

    const showVolumeBarTemporarily = useCallback(() => {
        setShowVolumeBar(true);

        if (volumeBarTimeoutRef.current) {
            clearTimeout(volumeBarTimeoutRef.current);
        }

        volumeBarTimeoutRef.current = setTimeout(() => {
            setShowVolumeBar(false);
        }, 1000);
    }, [setShowVolumeBar, volumeBarTimeoutRef]);

    const handleVolumeChange = useCallback((e: any) => {
        if (!videoRef.current || !volumeBarRef.current) return;

        const rect = volumeBarRef.current.getBoundingClientRect();
        const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

        setVolume(pos);
        videoRef.current.volume = pos;
        setIsMuted(pos === 0);
    }, [videoRef, volumeBarRef, setVolume, setIsMuted]);

    const handleVolumeMouseDown = useCallback((e: any) => {
        e.preventDefault();
        isDraggingVolumeRef.current = true;
        handleVolumeChange(e);
    }, [isDraggingVolumeRef, handleVolumeChange]);

    // Mouse move/up listeners for volume bar
    useEffect(() => {
        const handleVolumeMouseMove = (e: MouseEvent) => {
            if (!isDraggingVolumeRef.current || !volumeBarRef.current || !videoRef.current) return;

            e.preventDefault();
            const rect = volumeBarRef.current.getBoundingClientRect();
            const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

            setVolume(pos);
            videoRef.current.volume = pos;
            setIsMuted(pos === 0);
        };

        const handleMouseUp = () => {
            if (isDraggingVolumeRef.current) {
                isDraggingVolumeRef.current = false;
            }
        };

        document.addEventListener('mousemove', handleVolumeMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleVolumeMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDraggingVolumeRef, volumeBarRef, videoRef, setVolume, setIsMuted]);

    const toggleFullscreen = useCallback(() => {
        if (!containerRef.current) return;

        if (!isFullscreen) {
            if (containerRef.current.requestFullscreen) {
                containerRef.current.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }, [containerRef, isFullscreen]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
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

    const showAirPlayMenu = useCallback(() => {
        if (!videoRef.current || !isAirPlaySupported) return;

        const video = videoRef.current as any;
        if (video.webkitShowPlaybackTargetPicker) {
            video.webkitShowPlaybackTargetPicker();
        }
    }, [videoRef, isAirPlaySupported]);

    const skipForward = useCallback(() => {
        if (!videoRef.current) return;

        setShowSkipBackwardIndicator(false);
        setSkipBackwardAmount(0);
        setIsSkipBackwardAnimatingOut(false);
        if (skipBackwardTimeoutRef.current) {
            clearTimeout(skipBackwardTimeoutRef.current);
        }

        if (skipForwardTimeoutRef.current) {
            clearTimeout(skipForwardTimeoutRef.current);
        }

        const newSkipAmount = showSkipForwardIndicator ? skipForwardAmount + 10 : 10;
        setSkipForwardAmount(newSkipAmount);
        setShowSkipForwardIndicator(true);
        setIsSkipForwardAnimatingOut(false);

        const targetTime = Math.min(videoRef.current.currentTime + 10, duration);
        videoRef.current.currentTime = targetTime;
        setCurrentTime(targetTime);

        skipForwardTimeoutRef.current = setTimeout(() => {
            setIsSkipForwardAnimatingOut(true);
            setTimeout(() => {
                setShowSkipForwardIndicator(false);
                setSkipForwardAmount(0);
                setIsSkipForwardAnimatingOut(false);
            }, 200);
        }, 800);
    }, [videoRef, duration, showSkipForwardIndicator, skipForwardAmount, skipBackwardTimeoutRef, skipForwardTimeoutRef, setShowSkipBackwardIndicator, setSkipBackwardAmount, setIsSkipBackwardAnimatingOut, setSkipForwardAmount, setShowSkipForwardIndicator, setIsSkipForwardAnimatingOut, setCurrentTime]);

    const skipBackward = useCallback(() => {
        if (!videoRef.current) return;

        setShowSkipForwardIndicator(false);
        setSkipForwardAmount(0);
        setIsSkipForwardAnimatingOut(false);
        if (skipForwardTimeoutRef.current) {
            clearTimeout(skipForwardTimeoutRef.current);
        }

        if (skipBackwardTimeoutRef.current) {
            clearTimeout(skipBackwardTimeoutRef.current);
        }

        const newSkipAmount = showSkipBackwardIndicator ? skipBackwardAmount + 10 : 10;
        setSkipBackwardAmount(newSkipAmount);
        setShowSkipBackwardIndicator(true);
        setIsSkipBackwardAnimatingOut(false);

        const targetTime = Math.max(videoRef.current.currentTime - 10, 0);
        videoRef.current.currentTime = targetTime;
        setCurrentTime(targetTime);

        skipBackwardTimeoutRef.current = setTimeout(() => {
            setIsSkipBackwardAnimatingOut(true);
            setTimeout(() => {
                setShowSkipBackwardIndicator(false);
                setSkipBackwardAmount(0);
                setIsSkipBackwardAnimatingOut(false);
            }, 200);
        }, 800);
    }, [videoRef, showSkipBackwardIndicator, skipBackwardAmount, skipForwardTimeoutRef, skipBackwardTimeoutRef, setShowSkipForwardIndicator, setSkipForwardAmount, setIsSkipForwardAnimatingOut, setSkipBackwardAmount, setShowSkipBackwardIndicator, setIsSkipBackwardAnimatingOut, setCurrentTime]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                return;
            }

            const shortcuts = [' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'f', 'F', 'm', 'M', 'i', 'I', '<', '>', ',', '.'];
            if (shortcuts.includes(e.key)) {
                e.preventDefault();

                setShowControls(true);
                if (controlsTimeoutRef.current) {
                    clearTimeout(controlsTimeoutRef.current);
                }
                if (isPlaying) {
                    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
                }
            }

            switch (e.key) {
                case ' ':
                    togglePlay();
                    break;
                case 'ArrowLeft':
                case '<':
                case ',':
                    skipBackward();
                    break;
                case 'ArrowRight':
                case '>':
                case '.':
                    skipForward();
                    break;
                case 'm':
                case 'M':
                    toggleMute();
                    showVolumeBarTemporarily();
                    break;
                case 'ArrowUp':
                    if (videoRef.current) {
                        const newVolume = Math.min(1, volume + 0.05);
                        setVolume(newVolume);
                        videoRef.current.volume = newVolume;
                        setIsMuted(newVolume === 0);
                        showVolumeBarTemporarily();
                    }
                    break;
                case 'ArrowDown':
                    if (videoRef.current) {
                        const newVolume = Math.max(0, volume - 0.05);
                        setVolume(newVolume);
                        videoRef.current.volume = newVolume;
                        setIsMuted(newVolume === 0);
                        showVolumeBarTemporarily();
                    }
                    break;
                case 'f':
                case 'F':
                    toggleFullscreen();
                    break;
                case 'i':
                case 'I':
                    if (isPiPSupported) {
                        togglePictureInPicture();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isPlaying, volume, isMuted, isPiPSupported, togglePlay, toggleMute, toggleFullscreen, togglePictureInPicture, skipForward, skipBackward, showVolumeBarTemporarily, setShowControls, controlsTimeoutRef, videoRef, setVolume, setIsMuted]);

    const changePlaybackSpeed = useCallback((speed: number) => {
        if (!videoRef.current) return;
        videoRef.current.playbackRate = speed;
        setPlaybackRate(speed);
        setShowSpeedMenu(false);
        if (speedMenuTimeoutRef.current) {
            clearTimeout(speedMenuTimeoutRef.current);
        }
    }, [videoRef, setPlaybackRate, setShowSpeedMenu, speedMenuTimeoutRef]);

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

    const startSpeedMenuTimeout = useCallback(() => {
        if (speedMenuTimeoutRef.current) {
            clearTimeout(speedMenuTimeoutRef.current);
        }
        speedMenuTimeoutRef.current = setTimeout(() => {
            setShowSpeedMenu(false);
        }, 1500);
    }, [speedMenuTimeoutRef, setShowSpeedMenu]);

    const clearSpeedMenuTimeout = useCallback(() => {
        if (speedMenuTimeoutRef.current) {
            clearTimeout(speedMenuTimeoutRef.current);
        }
    }, [speedMenuTimeoutRef]);

    useEffect(() => {
        if (showSpeedMenu) {
            startSpeedMenuTimeout();
        } else {
            clearSpeedMenuTimeout();
        }
        return () => clearSpeedMenuTimeout();
    }, [showSpeedMenu, startSpeedMenuTimeout, clearSpeedMenuTimeout]);

    const formatTime = useCallback((seconds: number) => {
        if (isNaN(seconds)) return '0:00:00';
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    return {
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
        showVolumeBarTemporarily,
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
    };
}
