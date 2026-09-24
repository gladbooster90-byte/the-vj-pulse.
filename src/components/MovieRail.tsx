import React, { useRef } from 'react';
import { Movie } from '../types';
import { MovieCard } from './MovieCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MovieRailProps {
  title: string;
  subtitle?: string;
  movies: Movie[];
  onSeeAll?: () => void;
  showProgress?: boolean;
}

export const MovieRail: React.FC<MovieRailProps> = ({
  title,
  subtitle,
  movies,
  onSeeAll,
  showProgress = false
}) => {
  const railRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (railRef.current) {
      const scrollAmount = direction === 'left' ? -600 : 600;
      railRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <section className="my-8 relative group">
      {/* Header */}
      <div className="flex items-end justify-between mb-3.5 px-4 sm:px-6 lg:px-8">
        <div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white font-display flex items-center gap-2">
            <span>{title}</span>
            <span className="text-xs font-normal text-slate-500 tabular-nums">
              ({movies.length})
            </span>
          </h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          {onSeeAll && (
            <button
              onClick={onSeeAll}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors mr-2 cursor-pointer"
            >
              Explore All →
            </button>
          )}

          {/* Scroll Buttons */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/5 cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/5 cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Area */}
      <div
        ref={railRef}
        className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth px-4 sm:px-6 lg:px-8 py-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="w-[180px] sm:w-[200px] md:w-[220px] shrink-0"
            style={{ scrollSnapAlign: 'start' }}
          >
            <MovieCard movie={movie} showProgress={showProgress} />
          </div>
        ))}
      </div>
    </section>
  );
};
