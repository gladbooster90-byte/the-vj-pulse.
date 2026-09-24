import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, X, Mail } from 'lucide-react';
import { OFFICIAL_PAYMENT_DETAILS } from '../data/seedData';

export const DMCAModal: React.FC = () => {
  const { isDmcaOpen, setIsDmcaOpen } = useApp();

  if (!isDmcaOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#121620] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Close button */}
        <button
          onClick={() => setIsDmcaOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-white/5 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-display">Digital Millennium Copyright Act (DMCA)</h2>
            <p className="text-xs text-slate-400">Compliance, Localization & Intellectual Property Policy</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 text-xs leading-relaxed text-slate-300">
          <p>
            <strong className="text-white">THE VJ PULSE</strong> respects the intellectual property rights of creators, producers, and content owners worldwide. Our platform provides Ugandan cultural media interpretations and language adaptations (commonly known in East Africa as Veejay or VJ audio translations) produced by local audio commentators to serve Luganda-speaking audiences in Uganda, USA, UK, Europe, and globally.
          </p>

          <h3 className="text-sm font-semibold text-white pt-2">1. Notice and Takedown Procedure</h3>
          <p>
            If you are a copyright owner or an authorized agent thereof and believe that any film, series, poster, or stream accessible on this website infringes upon your copyright, you may submit a formal notification pursuant to the Digital Millennium Copyright Act (&ldquo;DMCA&rdquo;) by providing our designated agent with the following information in writing:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>A physical or electronic signature of a person authorized to act on behalf of the copyright owner.</li>
            <li>Identification of the copyrighted work claimed to have been infringed, including title and registration details.</li>
            <li>Specific identification of the material that is claimed to be infringing on THE VJ PULSE with exact URL links.</li>
            <li>Information reasonably sufficient to permit us to contact you, such as an address, telephone number, and valid email address.</li>
            <li>A statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.</li>
            <li>A statement that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner.</li>
          </ul>

          <h3 className="text-sm font-semibold text-white pt-2">2. Designated Agent & Swift Action</h3>
          <p>
            All DMCA notices received are processed within 24 to 48 hours. Any verified infringing media will be immediately removed from the catalog and streaming servers.
          </p>

          <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-1.5">
            <div className="font-semibold text-amber-400">Designated Copyright Agent:</div>
            <div>THE VJ PULSE Legal & Content Rights Office</div>
            <div>Email: <span className="font-mono text-white">gladbooster90@gmail.com</span></div>
            <div>WhatsApp Helpline: <span className="font-mono text-white">{OFFICIAL_PAYMENT_DETAILS.airtel.number}</span></div>
            <div>Kampala, Uganda · Serving Viewers Worldwide</div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
          <button
            onClick={() => setIsDmcaOpen(false)}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-transform active:scale-95 cursor-pointer"
          >
            I Understand
          </button>
        </div>

      </div>
    </div>
  );
};
