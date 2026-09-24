import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VideoPlayer } from '../components/VideoPlayer';
import { Tv, Radio, Clock, Calendar, Sparkles, Volume2, Play } from 'lucide-react';
import { BroadcastSlot } from '../types';

export const LiveTVPage: React.FC = () => {
  const { broadcasts, openWatch } = useApp();
  const [activeSlot, setActiveSlot] = useState<BroadcastSlot>(broadcasts[0]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-red-500">
              Live Cinema Broadcast 24/7
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-1">
            Uganda VJ Live Movie Channel
          </h1>
          <p className="text-xs text-slate-400">
            Non-stop continuous streaming channel featuring scheduled blockbusters voiced by Uganda&apos;s best VJs.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#121620] border border-white/10 px-3.5 py-2 rounded-xl text-xs text-slate-300">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>Broadcast Schedule: EAT (Kampala Time)</span>
        </div>
      </div>

      {/* Main Stream Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Live Player (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative">
            <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-2.5 py-1 bg-red-600/90 text-white text-[10px] font-extrabold rounded-md shadow uppercase tracking-wider">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>ON AIR NOW</span>
            </div>
            <VideoPlayer
              src={activeSlot.videoUrl}
              poster={activeSlot.posterUrl}
              title={`LIVE: ${activeSlot.title}`}
              vj={activeSlot.vj}
            />
          </div>

          {/* Current Broadcast Meta */}
          <div className="p-4 sm:p-5 bg-[#121620] border border-white/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <span className="text-amber-400 font-semibold">{activeSlot.vj}</span>
                <span aria-hidden="true">·</span>
                <span>{activeSlot.genre}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums font-mono text-slate-300">{activeSlot.startTime} - {activeSlot.endTime}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white font-display">
                {activeSlot.title}
              </h2>
            </div>

            <button
              onClick={() => openWatch(activeSlot.movieId)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-transform active:scale-95 whitespace-nowrap cursor-pointer"
            >
              Watch On Demand →
            </button>
          </div>
        </div>

        {/* Right Column: Schedule / Up Next (4 cols) */}
        <div className="lg:col-span-4 bg-[#121620] border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>Today&apos;s Broadcast Schedule</span>
            </h3>
            <span className="text-[11px] text-slate-400">{broadcasts.length} Films</span>
          </div>

          {/* Schedule Slots */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
            {broadcasts.map((slot, idx) => {
              const isSelected = activeSlot.id === slot.id;
              return (
                <div
                  key={slot.id}
                  onClick={() => setActiveSlot(slot)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-md'
                      : 'bg-white/5 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="font-mono text-amber-400 font-semibold">
                      {slot.startTime} - {slot.endTime}
                    </span>
                    {idx === 0 && (
                      <span className="px-1.5 py-0.2 bg-red-600/80 text-white rounded text-[9px] font-bold uppercase">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-white line-clamp-1">
                    {slot.title}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 flex items-center justify-between">
                    <span>Voiced by <strong className="text-slate-300">{slot.vj}</strong></span>
                    <span className="text-[11px] text-slate-500">{slot.genre}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-white/5 rounded-xl text-[11px] text-slate-400 leading-tight">
            Schedule runs 24 hours daily. Movies switch automatically according to Kampala local time.
          </div>
        </div>

      </div>

    </div>
  );
};
