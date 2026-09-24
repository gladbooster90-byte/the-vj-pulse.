import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Film, Shield, Tv, Sparkles, X, Menu } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    searchQuery,
    setSearchQuery,
    isSubscriber,
    activeSubscription,
    isAdmin,
    openVjChannel,
    currentUser,
    loginWithGoogle,
    logoutUser
  } = useApp();

  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentView('explore');
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'Home', view: 'home' as const },
    { label: 'Explore All', view: 'explore' as const },
    { label: 'Live TV', view: 'live-tv' as const },
    { label: 'Pricing & Plans', view: 'subscribe' as const },
    { label: 'Admin Panel', view: 'admin' as const },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0b0d13]/95 backdrop-blur-md border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Wordmark (Single text element in display face) */}
          <button
            onClick={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-left group flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white group-hover:text-amber-400 transition-colors font-display">
              THE VJ <span className="text-amber-500">PULSE</span>
            </span>
            <span className="hidden lg:inline-block text-[11px] font-semibold uppercase tracking-wider text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded">
              Uganda HD
            </span>
          </button>

          {/* Zone 2: Clean Text Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            {navLinks.map((link) => {
              const isActive = currentView === link.view;
              return (
                <button
                  key={link.label}
                  onClick={() => {
                    setCurrentView(link.view);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`relative py-1 transition-colors whitespace-nowrap cursor-pointer ${
                    isActive ? 'text-amber-400 font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
                  )}
                </button>
              );
            })}
            
            {/* Quick VJ Channel Selector */}
            <div className="relative group">
              <button
                className={`py-1 flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer ${
                  currentView === 'vj' ? 'text-amber-400 font-semibold' : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>VJ Channels</span>
                <span className="text-xs text-amber-500">▼</span>
              </button>
              <div className="absolute left-0 mt-1 w-48 py-2 bg-[#121620] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                {['VJ Junior', 'VJ Jingo', 'VJ Ice P', 'VJ Emmy', 'VJ Mark', 'VJ Kevo', 'VJ Uncle T', 'VJ Ulio'].map((vj) => (
                  <button
                    key={vj}
                    onClick={() => openVjChannel(vj)}
                    className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:text-amber-400 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    {vj}
                  </button>
                ))}
              </div>
            </div>
          </nav>

          {/* Zone 3: Search & Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Search Input Desktop */}
            <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
              <div className="flex items-center bg-[#151922] border border-white/10 rounded-lg px-3 py-1.5 focus-within:border-amber-500/50 transition-colors">
                <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Search movies, VJ, genre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (currentView !== 'explore') setCurrentView('explore');
                  }}
                  className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-36 lg:w-48"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-slate-400 hover:text-white ml-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>

            {/* Mobile Search Toggle */}
            <button
              onClick={() => {
                setIsSearchExpanded(!isSearchExpanded);
                if (currentView !== 'explore') setCurrentView('explore');
              }}
              className="sm:hidden p-2 text-slate-300 hover:text-white cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Subscription CTA / VIP status badge */}
            {isSubscriber ? (
              <button
                onClick={() => setCurrentView('subscribe')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-semibold hover:bg-amber-500/25 transition-colors whitespace-nowrap cursor-pointer"
                title={`Active VIP: ${activeSubscription?.planName}`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>VIP Active</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentView('subscribe')}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-xs font-bold transition-transform active:scale-95 whitespace-nowrap shadow-sm shadow-amber-500/20 cursor-pointer"
              >
                Subscribe (1k UGX)
              </button>
            )}

            {/* Google Sign-in / User Profile */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={logoutUser}
                  className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title={`Signed in as ${currentUser.displayName || currentUser.email}. Click to sign out`}
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-black font-bold text-[10px] flex items-center justify-center">
                      {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="hidden lg:inline max-w-[100px] truncate text-slate-200">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </span>
                </button>
              </div>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Sign in</span>
              </button>
            )}

            {/* Owner Admin link */}
            <button
              onClick={() => setCurrentView('admin')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                isAdmin
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-white/5 text-slate-300 border border-white/10 hover:text-white hover:bg-white/10'
              }`}
              title={isAdmin ? 'Owner Admin Panel (Active)' : 'Owner Admin Panel'}
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Admin Panel</span>
              <span className="sm:hidden">Admin</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Dropdown */}
        {isSearchExpanded && (
          <div className="sm:hidden pb-3 pt-1">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search movies, VJs, genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-[#151922] border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
            </form>
          </div>
        )}

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 py-3 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => {
                  setCurrentView(link.view);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === link.view
                    ? 'text-amber-400 bg-amber-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </button>
            ))}

            <div className="pt-2 border-t border-white/5">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 py-1">
                Top VJ Channels
              </div>
              <div className="grid grid-cols-2 gap-1 px-1 pt-1">
                {['VJ Junior', 'VJ Jingo', 'VJ Ice P', 'VJ Emmy', 'VJ Mark', 'VJ Kevo', 'VJ Uncle T', 'VJ Ulio'].map((vj) => (
                  <button
                    key={vj}
                    onClick={() => {
                      openVjChannel(vj);
                      setMobileMenuOpen(false);
                    }}
                    className="text-left px-3 py-1.5 text-xs text-slate-300 hover:text-amber-400 hover:bg-white/5 rounded"
                  >
                    {vj}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
