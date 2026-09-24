import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VideoPlayer } from '../components/VideoPlayer';
import { MovieRail } from '../components/MovieRail';
import { ArrowLeft, Plus, Check, Star, Download, Share2, Sparkles, Film, AlertCircle } from 'lucide-react';
import { Episode } from '../types';

export const WatchPage: React.FC = () => {
  const {
    activeMovieId,
    movies,
    setCurrentView,
    openVjChannel,
    isInMyList,
    toggleMyList,
    updateWatchProgress,
    watchHistory,
    isSubscriber
  } = useApp();

  const movie = movies.find((m) => m.id === activeMovieId) || movies[0];
  const inList = isInMyList(movie.id);
  const historyItem = watchHistory[movie.id];

  // If the movie has series episodes, keep track of currently active episode
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(
    movie.episodes && movie.episodes.length > 0 ? movie.episodes[0] : null
  );

  const [shareSuccess, setShareSuccess] = useState(false);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2000);
  };

  // Video source to play
  const currentVideoUrl = activeEpisode ? activeEpisode.videoUrl : movie.videoUrl;
  const currentVideoTitle = activeEpisode ? `${movie.title} - S${activeEpisode.season}E${activeEpisode.episode}: ${activeEpisode.title}` : movie.title;

  // More movies from same VJ
  const sameVjMovies = movies.filter((m) => m.vj === movie.vj && m.id !== movie.id);
  // Similar genre movies
  const similarGenreMovies = movies.filter((m) => m.genre === movie.genre && m.id !== movie.id && m.vj !== movie.vj);

  return (
    <div className="min-h-screen pb-16">
      {/* Top back bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button
          onClick={() => setCurrentView('home')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>
      </div>

      {/* Main Video Viewport Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full">
          <VideoPlayer
            src={currentVideoUrl}
            poster={movie.posterUrl}
            title={currentVideoTitle}
            vj={movie.vj}
            initialTime={historyItem ? historyItem.currentTime : 0}
            onTimeUpdate={(cur, dur) => updateWatchProgress(movie.id, cur, dur)}
          />
        </div>

        {/* Title, VJ, and Actions Bar */}
        <div className="mt-6 flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-white/5">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="px-2 py-0.5 bg-amber-500 text-black font-extrabold rounded text-[10px] uppercase">
                {movie.quality}
              </span>
              <button
                onClick={() => openVjChannel(movie.vj)}
                className="text-amber-400 hover:underline font-semibold"
              >
                Voiced by {movie.vj}
              </button>
              <span aria-hidden="true">·</span>
              <span>{movie.genre}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{movie.year}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{movie.duration}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span className="tabular-nums">{movie.rating}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-display">
              {movie.title}
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
              {movie.synopsis}
            </p>

            {/* Language & Quality Highlights */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <div>
                <span className="text-slate-500">Audio Translation:</span>{' '}
                <span className="text-white font-medium">Luganda (Full Veejay Interpretations)</span>
              </div>
              <div>
                <span className="text-slate-500">Original Format:</span>{' '}
                <span className="text-white font-medium">Crystal Clear MP4 1080p</span>
              </div>
              {movie.cast && movie.cast.length > 0 && (
                <div>
                  <span className="text-slate-500">Cast:</span>{' '}
                  <span className="text-slate-300">{movie.cast.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => toggleMyList(movie.id)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl border border-white/10 transition-colors cursor-pointer"
            >
              {inList ? <Check className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4" />}
              <span>{inList ? 'In My List' : 'Add to List'}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl border border-white/10 transition-colors cursor-pointer"
              title="Copy share link"
            >
              <Share2 className="w-4 h-4" />
              <span>{shareSuccess ? 'Link Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Series Episodes Rail (if series) */}
        {movie.episodes && movie.episodes.length > 0 && (
          <div className="my-8 bg-[#121620] rounded-2xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <Film className="w-5 h-5 text-amber-500" />
                <span>Season 1 Episodes ({movie.episodes.length})</span>
              </h3>
              <span className="text-xs text-slate-400">All episodes translated by {movie.vj}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {movie.episodes.map((ep) => {
                const isSelected = activeEpisode?.id === ep.id;
                return (
                  <button
                    key={ep.id}
                    onClick={() => {
                      setActiveEpisode(ep);
                      window.scrollTo({ top: 100, behavior: 'smooth' });
                    }}
                    className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 text-white'
                        : 'bg-white/5 border-white/5 hover:border-white/15 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-amber-400">Episode {ep.episode}</span>
                      <span className="text-[11px] text-slate-500 tabular-nums">{ep.duration}</span>
                    </div>
                    <div className="text-sm font-semibold text-white line-clamp-1">{ep.title}</div>
                    <div className="text-[11px] text-slate-400 mt-1">1080p Full HD MP4</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* More from this VJ */}
        {sameVjMovies.length > 0 && (
          <div className="mt-8">
            <MovieRail
              title={`More Translated by ${movie.vj}`}
              subtitle={`Explore more titles interpreted by ${movie.vj}`}
              movies={sameVjMovies}
              onSeeAll={() => openVjChannel(movie.vj)}
            />
          </div>
        )}

        {/* Similar Movies */}
        {similarGenreMovies.length > 0 && (
          <div className="mt-4">
            <MovieRail
              title={`More in ${movie.genre}`}
              subtitle={`Top recommendations in ${movie.genre}`}
              movies={similarGenreMovies}
              onSeeAll={() => setCurrentView('explore')}
            />
          </div>
        )}

      </div>
    </div>
  );
};
