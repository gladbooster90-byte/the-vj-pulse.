import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OFFICIAL_PAYMENT_DETAILS } from '../data/seedData';
import {
  Check,
  Sparkles,
  Smartphone,
  Copy,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  Tv,
  Clock
} from 'lucide-react';

export const SubscribePage: React.FC = () => {
  const {
    plans,
    submitSubscription,
    unlockWithCode,
    isSubscriber,
    activeSubscription,
    setCurrentView
  } = useApp();

  const [selectedPlanId, setSelectedPlanId] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [network, setNetwork] = useState<'Airtel Money' | 'MTN Mobile Money'>('Airtel Money');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

  // VIP pin unlock
  const [unlockCode, setUnlockCode] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[2];

  const handleCopy = (num: string) => {
    navigator.clipboard?.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setSubmitResult({ success: false, message: 'Please enter your phone number.' });
      return;
    }
    if (!transactionId.trim()) {
      setSubmitResult({ success: false, message: 'Please enter your Mobile Money Transaction ID or Reference.' });
      return;
    }

    setIsSubmitting(true);
    setSubmitResult(null);

    const res = await submitSubscription({
      fullName: fullName.trim() || 'Subscribed Viewer',
      phoneNumber: phoneNumber.trim(),
      network,
      planId: selectedPlanId,
      transactionId: transactionId.trim()
    });

    setIsSubmitting(false);
    setSubmitResult(res);
  };

  const handleUnlockWithPin = (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError('');
    if (!unlockCode.trim()) return;

    const ok = unlockWithCode(unlockCode);
    if (ok) {
      setUnlockError('');
      setSubmitResult({
        success: true,
        message: 'VIP access unlocked! Your subscription is now active.'
      });
      setUnlockCode('');
    } else {
      setUnlockError('Code or phone number not found. If you just sent money, please complete the form below or contact Admin.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-full uppercase tracking-wider">
          Uganda's #1 VJ Streaming Platform
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display text-balance">
          Unlimited Movies, Series & More.
        </h1>
        <p className="text-sm sm:text-base text-slate-300">
          Subscribe to watch from anywhere. Kill boredom anytime — all of Uganda&apos;s VJs for your best entertainment.
        </p>

        {/* Active subscription banner if user has one */}
        {isSubscriber && activeSubscription && (
          <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="text-sm font-bold text-white">
                  Active Subscription: <span className="text-emerald-400">{activeSubscription.planName}</span>
                </div>
                <div className="text-xs text-slate-400">
                  Valid until {new Date(activeSubscription.expiresAt).toLocaleDateString()} (Phone: {activeSubscription.phoneNumber})
                </div>
              </div>
            </div>
            <button
              onClick={() => setCurrentView('home')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg transition-transform active:scale-95 whitespace-nowrap cursor-pointer"
            >
              Start Streaming Now →
            </button>
          </div>
        )}
      </div>

      {/* 4 Subscription Plans Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
        {plans.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`relative rounded-2xl p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between border ${
                isSelected
                  ? 'bg-[#181d28] border-amber-500 shadow-2xl shadow-amber-500/10 ring-1 ring-amber-500 -translate-y-1'
                  : 'bg-[#121620] border-white/10 hover:border-white/20 hover:bg-[#151922]'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-amber-500 text-black text-[10px] font-extrabold rounded-full uppercase tracking-wider shadow">
                  {plan.badge}
                </div>
              )}

              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  {plan.name}
                </div>
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-3xl font-black text-white font-display tabular-nums">
                    {plan.priceUgx.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-amber-400 uppercase">UGX</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {plan.description}
                </p>

                <div className="space-y-2 border-t border-white/5 pt-4 text-xs text-slate-300">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className={`w-full mt-6 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/15'
                }`}
              >
                {isSelected ? 'Selected Plan' : 'Select Plan'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Payment & Verification Dual Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Official Mobile Money Details (5 cols) */}
        <div className="lg:col-span-5 bg-[#121620] border border-white/10 rounded-2xl p-6 sm:p-7 space-y-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">
              Payment Instructions
            </span>
            <h2 className="text-xl font-bold text-white font-display mt-1">
              Send via Airtel or MTN
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Transfer <strong className="text-amber-400">{selectedPlan.priceUgx.toLocaleString()} UGX</strong> directly to the official merchant numbers below:
            </p>
          </div>

          {/* Airtel Card */}
          <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-400 uppercase">Airtel Money</span>
              <span className="text-[10px] text-slate-400">{OFFICIAL_PAYMENT_DETAILS.airtel.ussd}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="font-mono text-lg font-bold text-white tracking-wider">
                {OFFICIAL_PAYMENT_DETAILS.airtel.number}
              </div>
              <button
                type="button"
                onClick={() => handleCopy(OFFICIAL_PAYMENT_DETAILS.airtel.number)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Copy number"
              >
                {copiedNumber === OFFICIAL_PAYMENT_DETAILS.airtel.number ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="text-[11px] text-slate-400">
              Account Name: <strong className="text-slate-200">{OFFICIAL_PAYMENT_DETAILS.airtel.name}</strong>
            </div>
          </div>

          {/* MTN Card */}
          <div className="p-4 rounded-xl bg-yellow-950/20 border border-yellow-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-yellow-400 uppercase">MTN Mobile Money</span>
              <span className="text-[10px] text-slate-400">{OFFICIAL_PAYMENT_DETAILS.mtn.ussd}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="font-mono text-lg font-bold text-white tracking-wider">
                {OFFICIAL_PAYMENT_DETAILS.mtn.number}
              </div>
              <button
                type="button"
                onClick={() => handleCopy(OFFICIAL_PAYMENT_DETAILS.mtn.number)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Copy number"
              >
                {copiedNumber === OFFICIAL_PAYMENT_DETAILS.mtn.number ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="text-[11px] text-slate-400">
              Account Name: <strong className="text-slate-200">{OFFICIAL_PAYMENT_DETAILS.mtn.name}</strong>
            </div>
          </div>

          {/* WhatsApp Direct Help Link */}
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between">
            <div className="text-xs">
              <div className="font-semibold text-emerald-400">Need immediate help?</div>
              <div className="text-slate-400 text-[11px]">Chat directly with Admin on WhatsApp</div>
            </div>
            <a
              href={OFFICIAL_PAYMENT_DETAILS.whatsapp.link}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat</span>
            </a>
          </div>

          {/* Quick VIP Pin / Existing Phone Unlock */}
          <div className="pt-4 border-t border-white/5">
            <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Already paid or have a VIP PIN?</span>
            </div>
            <form onSubmit={handleUnlockWithPin} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter phone or PIN (e.g. VJPULSE2026)"
                value={unlockCode}
                onChange={(e) => setUnlockCode(e.target.value)}
                className="flex-1 bg-[#181d28] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Verify
              </button>
            </form>
            {unlockError && <p className="text-[11px] text-red-400 mt-1">{unlockError}</p>}
          </div>

        </div>

        {/* Right Column: Submission Form (7 cols) */}
        <div className="lg:col-span-7 bg-[#121620] border border-white/10 rounded-2xl p-6 sm:p-8">
          <div className="mb-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">
              Instant Activation
            </span>
            <h2 className="text-2xl font-bold text-white font-display mt-1">
              Submit Your Subscription Details
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              After sending your payment, fill this form to immediately activate your account and start streaming.
            </p>
          </div>

          {submitResult && (
            <div
              className={`p-4 rounded-xl mb-6 text-xs leading-relaxed flex items-start gap-3 ${
                submitResult.success
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border border-red-500/30 text-red-300'
              }`}
            >
              {submitResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <KeyRound className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <div>
                <p className="font-semibold">{submitResult.message}</p>
                {submitResult.success && (
                  <button
                    onClick={() => setCurrentView('home')}
                    className="mt-2 inline-flex items-center gap-1 font-bold text-white underline cursor-pointer"
                  >
                    Go to Movies Catalog Now →
                  </button>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Selected Plan Summary Badge */}
            <div className="p-3 bg-[#181d28] rounded-xl border border-white/5 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400">Chosen Plan: </span>
                <strong className="text-white">{selectedPlan.name}</strong>
              </div>
              <div className="font-mono font-bold text-amber-400 tabular-nums">
                {selectedPlan.priceUgx.toLocaleString()} UGX
              </div>
            </div>

            {/* Network Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Payment Network Used
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNetwork('Airtel Money')}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    network === 'Airtel Money'
                      ? 'bg-red-600/20 border-red-500 text-red-300'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  Airtel Money (0749495023)
                </button>
                <button
                  type="button"
                  onClick={() => setNetwork('MTN Mobile Money')}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    network === 'MTN Mobile Money'
                      ? 'bg-yellow-600/20 border-yellow-500 text-yellow-300'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  MTN Mobile Money (0768912846)
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Your Full Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Denis Mukasa"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#181d28] border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Your Phone Number <span className="text-amber-400">*</span>
              </label>
              <input
                type="tel"
                placeholder="e.g. 0772123456 or 0752123456"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="w-full bg-[#181d28] border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">The phone number you used to send Mobile Money.</p>
            </div>

            {/* Transaction ID */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Mobile Money Transaction ID / Reference <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. MP240924.1204.A3819 or TX1298492"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                required
                className="w-full bg-[#181d28] border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Found in the SMS confirmation sent by Airtel or MTN.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm rounded-xl transition-transform active:scale-95 shadow-xl shadow-amber-500/20 mt-4 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Verifying Payment...' : `Activate Subscription (${selectedPlan.priceUgx.toLocaleString()} UGX)`}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant streaming · Protected by 100% money-back guarantee</span>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
};
