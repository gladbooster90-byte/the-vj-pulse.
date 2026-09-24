import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MovieCard } from '../components/MovieCard';
import { ArrowLeft, Film, Sparkles, Star } from 'lucide-react';

export const VJChannelPage: React.FC = () => {
  const { selectedVjName, vjs, movies, setCurrentView, openVjChannel } = useApp();

  const currentVjName = selectedVjName || 'VJ Junior';
  const vjProfile = vjs.find((v) => v.name.toLowerCase() === currentVjName.toLowerCase()) || vjs[0];

  const [filterGenre, setFilterGenre] = useState<string>('All');

  // Movies translated by this VJ
  const vjMovies = movies.filter((m) => m.vj.toLowerCase() === vjProfile.name.toLowerCase());
  const displayedMovies = filterGenre === 'All'
    ? vjMovies
    : vjMovies.filter((m) => m.genre.toLowerCase() === filterGenre.toLowerCase());

  // Available genres for this VJ
  const availableGenres = ['All', ...Array.from(new Set(vjMovies.map((m) => m.genre)))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* Back button */}
      <button
        onClick={() => setCurrentView('home')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {/* VJ Channel Header Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#151922] via-[#1a202c] to-[#121620] border border-white/10 p-6 sm:p-8 mb-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          
          {/* Avatar Icon */}
          <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br ${vjProfile.avatarColor} p-1 shadow-2xl shrink-0`}>
            <div className="w-full h-full rounded-2xl bg-[#0b0d13] flex items-center justify-center text-2xl font-black text-white font-display">
              {vjProfile.name.replace('VJ ', '')}
            </div>
          </div>

          {/* Bio & Details */}
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-0.5 bg-amber-500 text-black text-[10px] font-extrabold uppercase rounded">
                Official Channel
              </span>
              <span className="text-xs text-amber-400 font-medium">{vjProfile.nickname}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-xs text-slate-400 tabular-nums">Currently showing {vjMovies.length} titles</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white font-display">
              {vjProfile.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {vjProfile.bio}
            </p>

            <p className="text-xs text-amber-400/90 italic pt-1">
              &ldquo;{vjProfile.tagline}&rdquo;
            </p>
          </div>

          {/* Quick Switch Channel Chips */}
          <div className="sm:border-l sm:border-white/10 sm:pl-6 shrink-0 flex flex-col items-center sm:items-start gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Other VJ Channels
            </span>
            <div className="flex flex-wrap sm:flex-col gap-1.5 max-w-[200px] justify-center sm:justify-start">
              {vjs
                .filter((v) => v.name !== vjProfile.name)
                .slice(0, 4)
                .map((otherVj) => (
                  <button
                    key={otherVj.name}
                    onClick={() => openVjChannel(otherVj.name)}
                    className="text-xs text-slate-300 hover:text-amber-400 transition-colors text-left"
                  >
                    → {otherVj.name}
                  </button>
                ))}
            </div>
          </div>

        </div>
      </div>

      {/* Genre Filter Tabs within this VJ's Channel */}
      {availableGenres.length > 2 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 mb-6">
          <span className="text-xs text-slate-400 shrink-0 mr-1">Filter by Genre:</span>
          {availableGenres.map((g) => (
            <button
              key={g}
              onClick={() => setFilterGenre(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                filterGenre === g
                  ? 'bg-amber-500 text-black font-bold'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {/* Movies Grid */}
      {displayedMovies.length === 0 ? (
        <div className="py-16 text-center bg-[#121620] rounded-2xl border border-white/5 p-8">
          <Film className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white mb-1">No titles found in this genre for {vjProfile.name}</h3>
          <button
            onClick={() => setFilterGenre('All')}
            className="mt-3 px-3.5 py-1.5 bg-amber-500 text-black text-xs font-semibold rounded-lg hover:bg-amber-400"
          >
            Show All {vjProfile.name} Titles
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {displayedMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}

    </div>
  );
};
