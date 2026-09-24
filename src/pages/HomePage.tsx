import React from 'react';
import { useApp } from '../context/AppContext';
import { MovieRail } from '../components/MovieRail';
import { Play, Plus, Check, Star, Sparkles, Tv, Download, ArrowRight, ShieldCheck } from 'lucide-react';
import heroBannerImg from '../assets/images/vj_pulse_hero_banner_1790285204691.jpg';
import { OFFICIAL_PAYMENT_DETAILS } from '../data/seedData';

export const HomePage: React.FC = () => {
  const {
    movies,
    vjs,
    openWatch,
    openVjChannel,
    setCurrentView,
    watchHistory,
    myList,
    toggleMyList,
    isInMyList,
    isSubscriber
  } = useApp();

  // Featured hero movie (default to 'the-last-house' or first featured)
  const featuredMovie = movies.find(m => m.id === 'the-last-house') || movies[0];
  const inMyList = isInMyList(featuredMovie.id);

  // Filter rails
  const continueWatchingMovies = Object.keys(watchHistory)
    .map(id => movies.find(m => m.id === id))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  const trendingMovies = movies.filter(m => m.trending);
  const latestMovies = movies.filter(m => m.latest);
  const newlyAddedMovies = movies.filter(m => m.newlyAdded);
  const seriesMovies = movies.filter(m => m.type === 'series' || m.genre.includes('Series') || m.genre === 'Ekikorea');
  const kidsMovies = movies.filter(m => m.genre === 'Kids' || m.genre === 'Animation');

  return (
    <div className="pb-16 min-h-screen">
      
      {/* 1. Cinematic Hero Section */}
      <div className="relative w-full min-h-[540px] sm:min-h-[620px] lg:min-h-[700px] flex items-end overflow-hidden border-b border-white/5">
        {/* Backdrop Image with gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroBannerImg}
            alt={featuredMovie.title}
            className="w-full h-full object-cover object-center filter brightness-90 contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d13] via-[#0b0d13]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0d13] via-[#0b0d13]/50 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 pt-28 w-full">
          <div className="max-w-2xl space-y-4">
            
            {/* Top metadata unboxed text line */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span className="px-2 py-0.5 bg-amber-500 text-black font-extrabold rounded text-[11px] uppercase tracking-wider">
                VJ Translated
              </span>
              <span className="text-amber-400 font-semibold">{featuredMovie.vj}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{featuredMovie.genre}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">{featuredMovie.year}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{featuredMovie.rating}</span>
              </span>
            </div>

            {/* Display Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] font-display text-balance">
              {featuredMovie.title}
            </h1>

            {/* Synopsis */}
            <p className="text-sm sm:text-base text-slate-300 line-clamp-3 leading-relaxed max-w-xl">
              {featuredMovie.synopsis}
            </p>

            {/* Feature Highlights */}
            <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Crystal Clear 1080p MP4</span>
              </span>
              <span aria-hidden="true">·</span>
              <span>Instant Streaming (No Buffering)</span>
              <span aria-hidden="true">·</span>
              <span>Full VJ Audio Clarity</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={() => openWatch(featuredMovie.id)}
                className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm rounded-xl transition-transform active:scale-95 shadow-xl shadow-amber-500/20 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Play Movie Now</span>
              </button>

              <button
                onClick={() => toggleMyList(featuredMovie.id)}
                className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/15 text-white font-medium text-sm rounded-xl backdrop-blur-md transition-colors border border-white/10 cursor-pointer"
              >
                {inMyList ? (
                  <>
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>In My List</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add to List</span>
                  </>
                )}
              </button>

              {!isSubscriber && (
                <button
                  onClick={() => setCurrentView('subscribe')}
                  className="px-4 py-3 text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors cursor-pointer"
                >
                  Plans from 1,000 UGX →
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* 2. VJ Channel Avatars Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
        <div className="bg-[#121620]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200">
                Explore by VJ Channel
              </h2>
            </div>
            <button
              onClick={() => setCurrentView('explore')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
            >
              View All VJs →
            </button>
          </div>

          {/* VJ Avatars Horizontal Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-4 text-center">
            {vjs.map((vj) => (
              <button
                key={vj.id}
                onClick={() => openVjChannel(vj.name)}
                className="group flex flex-col items-center p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br ${vj.avatarColor} p-0.5 shadow-md group-hover:scale-105 group-hover:ring-2 group-hover:ring-amber-400 transition-all`}>
                  <div className="w-full h-full rounded-full bg-[#0b0d13] flex items-center justify-center text-xs sm:text-sm font-bold text-white">
                    {vj.name.replace('VJ ', '')}
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-400 mt-2 truncate w-full">
                  {vj.name}
                </span>
                <span className="text-[10px] text-slate-500 tabular-nums">
                  {vj.movieCount} titles
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Continue Watching Rail (if any) */}
      {continueWatchingMovies.length > 0 && (
        <MovieRail
          title="Continue Watching"
          subtitle="Pick up right where you paused with your saved progress"
          movies={continueWatchingMovies}
          showProgress={true}
        />
      )}

      {/* 4. Trending Right Now Rail */}
      <MovieRail
        title="Trending in Uganda"
        subtitle="The most-watched Luganda translated movies this week"
        movies={trendingMovies}
        onSeeAll={() => setCurrentView('explore')}
      />

      {/* 5. Latest Releases Rail */}
      <MovieRail
        title="Latest Translated Releases"
        subtitle="Fresh cinema drops translated by VJ Junior, VJ Emmy, VJ Ice P & VJ Jingo"
        movies={latestMovies}
        onSeeAll={() => setCurrentView('explore')}
      />

      {/* 6. Mobile Money Quick Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-amber-600/20 via-[#151922] to-amber-950/20 border border-amber-500/30 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-full">
                Unlimited Movies, Series & More
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
                Subscribe to Watch From Anywhere. Kill Boredom Anytime.
              </h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Daily <strong className="text-white">1,000 UGX</strong> · Weekly <strong className="text-white">5,000 UGX</strong> · Monthly <strong className="text-amber-400">25,000 UGX</strong> · Annual <strong className="text-white">250,000 UGX</strong>.
                Instant access via Airtel <span className="font-mono text-white">0749495023</span> or MTN <span className="font-mono text-white">0768912846</span>.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setCurrentView('subscribe')}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs sm:text-sm rounded-xl transition-transform active:scale-95 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                Get Started Now
              </button>
              <button
                onClick={() => setCurrentView('live-tv')}
                className="flex items-center gap-1.5 px-4 py-3 bg-white/10 hover:bg-white/15 text-white font-medium text-xs sm:text-sm rounded-xl transition-colors border border-white/10 cursor-pointer"
              >
                <Tv className="w-4 h-4 text-amber-400" />
                <span>Live Broadcast</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Newly Added Rail */}
      <MovieRail
        title="Newly Added Movies & Series"
        subtitle="Classic and modern hits recently remastered and added to the vault"
        movies={newlyAddedMovies}
        onSeeAll={() => setCurrentView('explore')}
      />

      {/* 8. Series & Ekikorea Drama Rail */}
      <MovieRail
        title="Series & Ekikorea Drama"
        subtitle="All seasons and episodes translated into Luganda"
        movies={seriesMovies}
        onSeeAll={() => setCurrentView('explore')}
      />

      {/* 9. Kids & Family Animation Rail */}
      <MovieRail
        title="Kids, Animation & Family"
        subtitle="Heartwarming 3D adventures and animations translated by VJ Kevo & Uncle T"
        movies={kidsMovies}
        onSeeAll={() => setCurrentView('explore')}
      />

    </div>
  );
};
