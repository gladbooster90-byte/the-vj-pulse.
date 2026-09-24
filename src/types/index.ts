export type MediaType = 'movie' | 'series';

export interface Episode {
  id: string;
  season: number;
  episode: number;
  title: string;
  duration: string;
  videoUrl: string;
  synopsis?: string;
}

export interface Movie {
  id: string;
  title: string;
  vj: string;
  genre: string;
  type: MediaType;
  year: number;
  duration: string;
  quality: string;
  rating: string;
  synopsis: string;
  posterUrl: string;
  videoUrl: string;
  featured?: boolean;
  trending?: boolean;
  latest?: boolean;
  newlyAdded?: boolean;
  cast?: string[];
  director?: string;
  language?: string;
  episodes?: Episode[];
}

export interface VJProfile {
  id: string;
  name: string;
  nickname: string;
  avatarColor: string;
  bio: string;
  tagline: string;
  movieCount: number;
  popularGenres: string[];
}

export interface SubscriptionPlan {
  id: 'daily' | 'weekly' | 'monthly' | 'yearly';
  name: string;
  priceUgx: number;
  durationDays: number;
  badge?: string;
  description: string;
  features: string[];
  popular?: boolean;
}

export interface SubscriptionRequest {
  id: string;
  fullName: string;
  phoneNumber: string;
  network: 'Airtel Money' | 'MTN Mobile Money';
  planId: 'daily' | 'weekly' | 'monthly' | 'yearly';
  planName: string;
  amountUgx: number;
  transactionId: string;
  status: 'pending' | 'active' | 'expired';
  createdAt: string;
  expiresAt: string;
}

export interface BroadcastSlot {
  id: string;
  movieId: string;
  title: string;
  vj: string;
  genre: string;
  startTime: string; // e.g., "14:00"
  endTime: string;   // e.g., "16:15"
  videoUrl: string;
  posterUrl: string;
}

export interface WatchHistoryItem {
  movieId: string;
  progressPercent: number;
  currentTime: number;
  duration: number;
  lastWatchedAt: string;
}
