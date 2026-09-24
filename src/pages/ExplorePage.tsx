import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { MovieCard } from '../components/MovieCard';
import { GENRES_LIST } from '../data/seedData';
import { Search, Filter, SlidersHorizontal, Film, ArrowUpDown, X } from 'lucide-react';

export const ExplorePage: React.FC = () => {
  const {
    movies,
    vjs,
    searchQuery,
    setSearchQuery,
    selectedGenre,
    setSelectedGenre,
    openVjChannel
  } = useApp();

  const [selectedVj, setSelectedVj] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<'all' | 'movie' | 'series'>('all');
  const [sortBy, setSortBy] = useState<'trending' | 'year' | 'rating' | 'title'>('trending');

  // Filter logic
  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      // Search text match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = movie.title.toLowerCase().includes(q);
        const matchesVj = movie.vj.toLowerCase().includes(q);
        const matchesGenre = movie.genre.toLowerCase().includes(q);
        const matchesSynopsis = movie.synopsis.toLowerCase().includes(q);
        if (!matchesTitle && !matchesVj && !matchesGenre && !matchesSynopsis) {
          return false;
        }
      }

      // Genre filter
      if (selectedGenre !== 'All') {
        if (selectedGenre === 'Western Series' && movie.type === 'series') {
          // match
        } else if (movie.genre.toLowerCase() !== selectedGenre.toLowerCase()) {
          return false;
        }
      }

      // VJ filter
      if (selectedVj !== 'All') {
        if (movie.vj.toLowerCase() !== selectedVj.toLowerCase()) {
          return false;
        }
      }

      // Content type filter
      if (selectedType !== 'all') {
        if (movie.type !== selectedType) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'trending') return (b.trending ? 1 : 0) - (a.trending ? 1 : 0);
      if (sortBy === 'year') return b.year - a.year;
      if (sortBy === 'rating') return parseFloat(b.rating) - parseFloat(a.rating);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });
  }, [movies, searchQuery, selectedGenre, selectedVj, selectedType, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGenre('All');
    setSelectedVj('All');
    setSelectedType('all');
  };

  const hasActiveFilters = searchQuery !== '' || selectedGenre !== 'All' || selectedVj !== 'All' || selectedType !== 'all';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* Page Title & Search Header */}
      <div className="space-y-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Explore All Translated Movies & Series
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse our complete catalog of crystal clear 1080p films translated by Uganda&apos;s leading Veejays.
          </p>
        </div>

        {/* Big Search Input */}
        <div className="relative">
          <div className="flex items-center bg-[#121620] border border-white/10 rounded-xl px-4 py-3 focus-within:border-amber-500/50 shadow-lg">
            <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
            <input
              type="text"
              placeholder="Search by title, VJ (Junior, Jingo, Emmy...), genre (Action, Ekikorea...)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs / Controls */}
      <div className="bg-[#121620]/60 border border-white/5 rounded-2xl p-4 sm:p-5 mb-8 space-y-4">
        
        {/* Genre Filter Scrollable Buttons (Functional Segmented Controls) */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Categories & Genres
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {GENRES_LIST.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedGenre === genre
                    ? 'bg-amber-500 text-black font-bold shadow-sm'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter Row: VJ Dropdown, Type Segment, Sort Dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/5">
          <div className="flex flex-wrap items-center gap-3">
            
            {/* VJ Filter Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">VJ:</span>
              <select
                value={selectedVj}
                onChange={(e) => setSelectedVj(e.target.value)}
                className="bg-[#181d28] text-slate-200 border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="All">All VJs ({vjs.length}+)</option>
                {vjs.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Segment (Movies vs Series) */}
            <div className="flex items-center gap-1 bg-[#181d28] p-1 rounded-lg border border-white/10 text-xs">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedType === 'all' ? 'bg-white/10 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedType('movie')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedType === 'movie' ? 'bg-white/10 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Movies
              </button>
              <button
                onClick={() => setSelectedType('series')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedType === 'series' ? 'bg-white/10 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Series
              </button>
            </div>

            {/* Clear Filters Button if any */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-amber-400 hover:text-amber-300 underline cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#181d28] text-slate-200 border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="trending">Trending & Featured</option>
              <option value="year">Release Year (Newest)</option>
              <option value="rating">Top Rated (4.9+)</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

      </div>

      {/* Results Count & Grid */}
      <div className="mb-4 flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <strong className="text-white font-semibold tabular-nums">{filteredMovies.length}</strong> titles
        </span>
        {selectedGenre !== 'All' && <span>Category: <strong className="text-amber-400">{selectedGenre}</strong></span>}
      </div>

      {filteredMovies.length === 0 ? (
        <div className="py-20 text-center bg-[#121620] rounded-2xl border border-white/5 p-8">
          <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No movies matched your search</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Try adjusting your search terms, choosing another VJ channel, or clearing your category filters.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-amber-500 text-black text-xs font-bold rounded-lg hover:bg-amber-400 cursor-pointer"
          >
            Show All Movies
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}

    </div>
  );
};
