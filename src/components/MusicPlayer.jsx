import React, { useState, useEffect, useRef } from 'react';
import { Music, VolumeX, Volume2 } from 'lucide-react';

export default function MusicPlayer({ musicUrl, autoPlayTrigger }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (autoPlayTrigger && audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Autoplay prevented by browser policy', err);
      });
    }
  }, [autoPlayTrigger]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <audio
        ref={audioRef}
        src={musicUrl || 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3'}
        loop
      />
      <button
        onClick={togglePlay}
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition border transform hover:scale-110 ${
          isPlaying
            ? 'bg-gold-500 text-slate-950 border-gold-400 animate-spin-slow'
            : 'bg-slate-900/90 text-gold-400 border-gold-500/40'
        }`}
        title={isPlaying ? 'Matikan Musik' : 'Putar Musik'}
      >
        {isPlaying ? (
          <Volume2 className="w-5 h-5 animate-pulse" />
        ) : (
          <VolumeX className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
