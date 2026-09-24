import React from 'react';
import { Movie } from '../types';
import { useApp } from '../context/AppContext';
import { Play, Plus, Check, Star } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  showProgress?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, showProgress = true }) => {
  const { openWatch, toggleMyList, isInMyList, watchHistory } = useApp();
  const inList = isInMyList(movie.id);
  const historyItem = watchHistory[movie.id];

  return (
    <div className="group relative flex flex-col bg-[#121620] rounded-xl overflow-hidden border border-white/5 hover:border-amber-500/40 transition-all duration-200 hover:-translate-y-1 shadow-lg hover:shadow-amber-500/5">
      {/* Poster Image Container (3:4 aspect ratio) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-900 cursor-pointer" onClick={() => openWatch(movie.id)}>
        <img
          src={movie.posterUrl}
          alt={movie.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // High quality fallback gradient if image URL has loading quirks
            e.currentTarget.style.display = 'none';
          }}
        />
        
        {/* Quality indicator overlay (Top right, clean unboxed typographic badge) */}
        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm text-[10px] font-semibold text-amber-400 rounded tracking-wider">
          {movie.quality.includes('4K') ? '4K' : 'HD'}
        </div>

        {/* Series Badge if series */}
        {movie.type === 'series' && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-amber-500 text-black text-[10px] font-bold rounded tracking-wider uppercase">
            SERIE
          </div>
        )}

        {/* Hover overlay with Play and Quick List buttons */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openWatch(movie.id);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-transform active:scale-95 shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Watch</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMyList(movie.id);
              }}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              title={inList ? 'Remove from My List' : 'Add to My List'}
            >
              {inList ? <Check className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Continue watching progress bar */}
        {showProgress && historyItem && historyItem.progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
            <div
              className="h-full bg-amber-500"
              style={{ width: `${historyItem.progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Movie Details (Zero-Pill Typography) */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          <h4
            onClick={() => openWatch(movie.id)}
            className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors line-clamp-1 cursor-pointer"
            title={movie.title}
          >
            {movie.title}
          </h4>

          {/* VJ Attribution & Metadata with clean unboxed typographic separator */}
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-amber-400/90 font-medium">{movie.vj}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{movie.genre}</span>
          </div>
        </div>

        {/* Bottom meta row: Year & rating */}
        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 tabular-nums">
          <span>{movie.year}</span>
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>{movie.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
