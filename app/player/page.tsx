'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icon';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { VideoMetadata } from '@/components/player/VideoMetadata';
import { EpisodeList } from '@/components/player/EpisodeList';
import { PlayerError } from '@/components/player/PlayerError';
import { useVideoPlayer } from '@/lib/hooks/useVideoPlayer';
import { useHistoryStore } from '@/lib/store/history-store';
import { usePlayerStore } from '@/lib/store/player-store';
import { WatchHistorySidebar } from '@/components/history/WatchHistorySidebar';
import { PlayerNavbar } from '@/components/player/PlayerNavbar';

interface Episode {
  name?: string;
  url: string;
}

function PlayerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToHistory } = useHistoryStore();
  const { isWideScreen, isWebFullscreen } = usePlayerStore();

  const videoId = searchParams.get('id');
  const source = searchParams.get('source');
  const title = searchParams.get('title');
  const episodeParam = searchParams.get('episode');

  const {
    videoData,
    loading,
    videoError,
    currentEpisode,
    playUrl,
    setCurrentEpisode,
    setPlayUrl,
    setVideoError,
    fetchVideoDetails,
  } = useVideoPlayer(videoId || '', source || '', episodeParam);

  // Hide scrollbar when web fullscreen
  useEffect(() => {
    document.body.style.overflow = isWebFullscreen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isWebFullscreen]);

  // Add initial history entry when video data is loaded
  useEffect(() => {
    if (videoData && playUrl && videoId) {
      const mappedEpisodes = videoData.episodes?.map((ep, idx) => ({
        name: ep.name || `第${idx + 1}集`,
        url: ep.url,
        index: idx,
      })) || [];

      addToHistory(
        videoId,
        videoData.vod_name || title || '未知视频',
        playUrl,
        currentEpisode,
        source || '',
        0,
        0,
        videoData.vod_pic,
        mappedEpisodes
      );
    }
  }, [videoData, playUrl, videoId, currentEpisode, source, title, addToHistory]);

  // Redirect if no video ID or source
  if (!videoId || !source) {
    router.push('/');
    return null;
  }

  const handleEpisodeClick = (episode: Episode, index: number) => {
    setCurrentEpisode(index);
    setPlayUrl(episode.url);
    setVideoError('');

    const params = new URLSearchParams(searchParams.toString());
    params.set('episode', index.toString());
    router.replace(`/player?${params.toString()}`, { scroll: false });
  };

  const episodes = videoData?.episodes || [];
  const hasNext = currentEpisode < episodes.length - 1;
  const handleNextEpisode = () => {
    if (hasNext) handleEpisodeClick(episodes[currentEpisode + 1], currentEpisode + 1);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)]">
      {!isWebFullscreen && <PlayerNavbar />}

      <main className={isWebFullscreen ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20'}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[var(--accent-color)] border-t-transparent mb-4"></div>
            <p className="text-[var(--text-color-secondary)]">正在加载视频详情...</p>
          </div>
        ) : videoError && !videoData ? (
          <PlayerError
            error={videoError}
            onBack={() => router.back()}
            onRetry={fetchVideoDetails}
          />
        ) : (
          <div className={`grid gap-6 ${isWebFullscreen ? '' : isWideScreen ? 'lg:grid-cols-1' : 'lg:grid-cols-3'}`}>
            {/* Video Player Section */}
            <div className={`${isWebFullscreen ? '' : isWideScreen ? '' : 'lg:col-span-2'}`}>
              <VideoPlayer
                playUrl={playUrl}
                videoId={videoId || undefined}
                currentEpisode={currentEpisode}
                onBack={() => router.back()}
                onNextEpisode={handleNextEpisode}
              />
              {/* Episode Navigation Buttons */}
            </div>
            {!isWebFullscreen && (
              <div className={`${isWideScreen ? '' : 'lg:col-span-2'}`}>
                <VideoMetadata
                  videoData={videoData}
                  source={source}
                  title={title}
                />
              </div>
            )}

            {/* Episodes Sidebar */}
            {!isWebFullscreen && (
              <div className={`${isWideScreen ? '' : 'lg:col-span-1 lg:row-span-2 lg:row-start-1 lg:col-start-3'}`}>
                <EpisodeList
                  episodes={videoData?.episodes || null}
                  currentEpisode={currentEpisode}
                  onEpisodeClick={handleEpisodeClick}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {!isWebFullscreen && <WatchHistorySidebar />}
    </div>
  );
}

export default function PlayerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-color)]">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[var(--accent-color)] border-t-transparent"></div>
      </div>
    }>
      <PlayerContent />
    </Suspense>
  );
}
