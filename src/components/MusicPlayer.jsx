import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';

export default function MusicPlayer({ musicUrl, autoPlayTrigger }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [youtubeId, setYoutubeId] = useState(null);
  const audioRef = useRef(null);

  // Extract YouTube ID if valid
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  useEffect(() => {
    const ytId = getYouTubeId(musicUrl);
    setYoutubeId(ytId);
  }, [musicUrl]);

  useEffect(() => {
    if (autoPlayTrigger) {
      if (!youtubeId && audioRef.current) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.warn('Audio play error:', err));
      } else if (youtubeId) {
        setIsPlaying(true);
      }
    }
  }, [autoPlayTrigger, youtubeId]);

  const togglePlay = () => {
    if (youtubeId) {
      setIsPlaying(!isPlaying);
      const iframe = document.getElementById('youtube-audio-iframe');
      if (iframe) {
        const func = isPlaying ? 'pauseVideo' : 'playVideo';
        iframe.contentWindow.postMessage(`{"event":"command","func":"${func}","args":""}`, '*');
      }
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(console.error);
      }
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-40">
      {youtubeId ? (
        <iframe
          id="youtube-audio-iframe"
          className="hidden"
          width="0"
          height="0"
          src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&autoplay=${
            isPlaying ? 1 : 0
          }&loop=1&playlist=${youtubeId}`}
          allow="autoplay"
        />
      ) : (
        <audio
          ref={audioRef}
          src={musicUrl || 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3'}
          loop
        />
      )}

      <button
        onClick={togglePlay}
        className={`w-11 h-11 rounded-full flex items-center justify-center shadow-xl transition-all border transform hover:scale-110 ${
          isPlaying
            ? 'bg-rosewood-500 text-white border-rosewood-400 animate-spin-slow shadow-rosewood-500/30'
            : 'bg-white/90 text-rosewood-700 border-rose-200 backdrop-blur-md'
        }`}
        title={isPlaying ? 'Matikan Musik' : 'Putar Musik'}
      >
        {isPlaying ? (
          <Volume2 className="w-5 h-5 animate-pulse text-white" />
        ) : (
          <VolumeX className="w-5 h-5 text-rosewood-700" />
        )}
      </button>
    </div>
  );
}
