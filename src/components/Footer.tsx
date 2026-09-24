import React from 'react';
import { useApp } from '../context/AppContext';
import { MessageCircle, ShieldCheck, Heart, Film, ArrowUp } from 'lucide-react';
import { OFFICIAL_PAYMENT_DETAILS } from '../data/seedData';

export const Footer: React.FC = () => {
  const { setCurrentView, openVjChannel, setIsDmcaOpen } = useApp();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#08090d] border-t border-white/5 text-slate-400 text-xs mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white font-display">
                THE VJ <span className="text-amber-500">PULSE</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Uganda's premier cinematic streaming platform for movies and series translated by VJ Junior, VJ Mark, VJ Ice P, VJ Emmy, VJ Jingo, VJ Kevo, and all Ugandan Veejays.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href={OFFICIAL_PAYMENT_DETAILS.whatsapp.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-semibold hover:bg-emerald-600/25 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Admin (0749495023)</span>
              </a>
            </div>
          </div>

          {/* Col 2: VJ Channels */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Featured VJ Channels
            </h3>
            <ul className="space-y-2">
              {['VJ Junior', 'VJ Jingo', 'VJ Ice P', 'VJ Emmy', 'VJ Mark', 'VJ Kevo', 'VJ Uncle T', 'VJ Ulio'].map((vj) => (
                <li key={vj}>
                  <button
                    onClick={() => openVjChannel(vj)}
                    className="hover:text-amber-400 transition-colors text-slate-400 text-xs text-left"
                  >
                    {vj} · Translated Releases
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Subscriptions & Mobile Money */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Uganda Subscription Rates
            </h3>
            <ul className="space-y-2 text-slate-400">
              <li className="flex justify-between border-b border-white/5 pb-1">
                <span>Daily Pass:</span>
                <span className="font-semibold text-slate-200">1,000 UGX</span>
              </li>
              <li className="flex justify-between border-b border-white/5 pb-1">
                <span>Weekly VIP:</span>
                <span className="font-semibold text-slate-200">5,000 UGX</span>
              </li>
              <li className="flex justify-between border-b border-white/5 pb-1">
                <span>Monthly Unlimited:</span>
                <span className="font-semibold text-amber-400">25,000 UGX</span>
              </li>
              <li className="flex justify-between pb-1">
                <span>Annual Cinema Pass:</span>
                <span className="font-semibold text-slate-200">250,000 UGX</span>
              </li>
            </ul>
            <div className="mt-3 p-2.5 bg-white/5 rounded-lg border border-white/5 text-[11px] leading-tight text-slate-300">
              <p className="font-medium text-amber-400">Official Mobile Money Numbers:</p>
              <p className="mt-1">Airtel: <span className="font-mono text-white">0749495023</span> (Gladys)</p>
              <p>MTN: <span className="font-mono text-white">0768912846</span> (Gladys)</p>
            </div>
          </div>

          {/* Col 4: Platform & Compliance */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Platform & Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setIsDmcaOpen(true)}
                  className="hover:text-amber-400 transition-colors text-slate-400 text-xs text-left flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  <span>DMCA Copyright Policy</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('live-tv');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition-colors text-slate-400 text-xs text-left"
                >
                  Uganda Live TV & Movie Broadcasts
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('explore');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition-colors text-slate-400 text-xs text-left"
                >
                  All Genres & Releases Taxonomy
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('admin');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition-colors text-slate-400 text-xs text-left text-slate-500"
                >
                  Website Owner Portal (Upload & Manage)
                </button>
              </li>
            </ul>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Serving viewers worldwide</span>
              <button
                onClick={scrollToTop}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                title="Back to top"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom row */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} THE VJ PULSE. All Rights Reserved. Built for Ugandan film lovers worldwide.</p>
          <div className="flex items-center gap-4">
            <span>HD Quality MP4</span>
            <span aria-hidden="true">·</span>
            <span>No Buffering</span>
            <span aria-hidden="true">·</span>
            <span>Mobile, Tablet, Smart TV & PC</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
