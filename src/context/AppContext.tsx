import React, { createContext, useContext, useState, useEffect } from 'react';
import { Movie, VJProfile, SubscriptionPlan, SubscriptionRequest, BroadcastSlot, WatchHistoryItem } from '../types';
import { INITIAL_MOVIES, INITIAL_VJS, INITIAL_PLANS, INITIAL_BROADCASTS } from '../data/seedData';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where
} from '../lib/firebase';

export type PageView = 'home' | 'explore' | 'watch' | 'vj' | 'subscribe' | 'live-tv' | 'admin';

interface AppContextType {
  // Navigation
  currentView: PageView;
  setCurrentView: (view: PageView) => void;
  activeMovieId: string | null;
  setActiveMovieId: (id: string | null) => void;
  selectedVjName: string | null;
  setSelectedVjName: (vj: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;

  // Catalog
  movies: Movie[];
  vjs: VJProfile[];
  plans: SubscriptionPlan[];
  broadcasts: BroadcastSlot[];
  addMovie: (movieData: Omit<Movie, 'id'>) => Promise<void>;
  updateMovie: (movie: Movie) => Promise<void>;
  deleteMovie: (id: string) => Promise<void>;

  // Firebase Auth
  currentUser: User | null;
  userRole: 'viewer' | 'admin';
  loginWithGoogle: () => Promise<void>;
  logoutUser: () => Promise<void>;

  // Subscriptions & User State
  isSubscriber: boolean;
  activeSubscription: SubscriptionRequest | null;
  subscriptionRequests: SubscriptionRequest[];
  submitSubscription: (data: {
    fullName: string;
    phoneNumber: string;
    network: 'Airtel Money' | 'MTN Mobile Money';
    planId: 'daily' | 'weekly' | 'monthly' | 'yearly';
    transactionId: string;
  }) => Promise<{ success: boolean; message: string }>;
  unlockWithCode: (codeOrPhone: string) => boolean;
  cancelSubscription: () => void;
  approveSubscription: (id: string) => Promise<void>;
  revokeSubscription: (id: string) => Promise<void>;

  // Watch history & My List
  watchHistory: Record<string, WatchHistoryItem>;
  updateWatchProgress: (movieId: string, currentTime: number, duration: number) => void;
  myList: string[];
  toggleMyList: (movieId: string) => void;
  isInMyList: (movieId: string) => boolean;

  // Owner / Admin
  isAdmin: boolean;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;

  // DMCA Modal
  isDmcaOpen: boolean;
  setIsDmcaOpen: (open: boolean) => void;

  // Quick Action
  openWatch: (movieId: string) => void;
  openVjChannel: (vjName: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const ADMIN_EMAIL = 'gladbooster90@gmail.com';
const MOVIES_STORAGE_KEY = 'vj_pulse_movies_v3';
const REQUESTS_STORAGE_KEY = 'vj_pulse_sub_requests_v3';
const WATCH_HISTORY_KEY = 'vj_pulse_watch_history_v3';
const MY_LIST_KEY = 'vj_pulse_my_list_v3';
const ACTIVE_SUB_KEY = 'vj_pulse_active_sub_v3';
const ADMIN_AUTH_KEY = 'vj_pulse_admin_logged_v3';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation State
  const [currentView, setCurrentView] = useState<PageView>('home');
  const [activeMovieId, setActiveMovieId] = useState<string | null>(null);
  const [selectedVjName, setSelectedVjName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [isDmcaOpen, setIsDmcaOpen] = useState<boolean>(false);

  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'viewer' | 'admin'>('viewer');

  // Catalog State
  const [movies, setMovies] = useState<Movie[]>(() => {
    try {
      const saved = localStorage.getItem(MOVIES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_MOVIES;
  });

  const [vjs] = useState<VJProfile[]>(INITIAL_VJS);
  const [plans] = useState<SubscriptionPlan[]>(INITIAL_PLANS);
  const [broadcasts] = useState<BroadcastSlot[]>(INITIAL_BROADCASTS);

  // Subscriptions
  const [subscriptionRequests, setSubscriptionRequests] = useState<SubscriptionRequest[]>(() => {
    try {
      const saved = localStorage.getItem(REQUESTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [
      {
        id: 'sub-sample-1',
        fullName: 'Kato Denis',
        phoneNumber: '0772123456',
        network: 'MTN Mobile Money',
        planId: 'monthly',
        planName: 'Monthly Unlimited',
        amountUgx: 25000,
        transactionId: 'MP240924.1204.A3819',
        status: 'active',
        createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
        expiresAt: new Date(Date.now() + 3600000 * 24 * 27).toISOString()
      },
      {
        id: 'sub-sample-2',
        fullName: 'Nakato Sarah',
        phoneNumber: '0749112233',
        network: 'Airtel Money',
        planId: 'weekly',
        planName: 'Weekly VIP Pass',
        amountUgx: 5000,
        transactionId: 'AIR8892187391',
        status: 'pending',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        expiresAt: new Date(Date.now() + 3600000 * 24 * 7).toISOString()
      }
    ];
  });

  const [activeSubscription, setActiveSubscription] = useState<SubscriptionRequest | null>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_SUB_KEY);
      if (saved) {
        const parsed: SubscriptionRequest = JSON.parse(saved);
        if (new Date(parsed.expiresAt).getTime() > Date.now()) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return {
      id: 'sub-vip-preview',
      fullName: 'VIP Streamer',
      phoneNumber: '0749495023',
      network: 'Airtel Money',
      planId: 'monthly',
      planName: 'Monthly Unlimited (VIP Active)',
      amountUgx: 25000,
      transactionId: 'VJPULSE-ACTIVE-PASS',
      status: 'active',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000 * 24 * 30).toISOString()
    };
  });

  // Watch history
  const [watchHistory, setWatchHistory] = useState<Record<string, WatchHistoryItem>>(() => {
    try {
      const saved = localStorage.getItem(WATCH_HISTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return {
      'the-last-house': {
        movieId: 'the-last-house',
        progressPercent: 62,
        currentTime: 4180,
        duration: 6720,
        lastWatchedAt: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    };
  });

  // My List
  const [myList, setMyList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(MY_LIST_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return ['queen-of-katwe', '3-idiots', 'vikings', 'the-last-house'];
  });

  // Owner / Admin mode
  const [isAdminManual, setIsAdminManual] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const isAdmin = isAdminManual || userRole === 'admin' || currentUser?.email === ADMIN_EMAIL;

  // 1. Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const isOwner = user.email === ADMIN_EMAIL;
        setUserRole(isOwner ? 'admin' : 'viewer');
        // Save user record to Firestore
        try {
          const userRef = doc(db, 'users', user.uid);
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'Viewer',
            photoURL: user.photoURL || '',
            role: isOwner ? 'admin' : 'viewer',
            lastLoginAt: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          console.warn('Firestore user profile sync error:', err);
        }
      } else {
        setUserRole('viewer');
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore sync for Movies
  useEffect(() => {
    try {
      const moviesCol = collection(db, 'movies');
      const unsubscribe = onSnapshot(moviesCol, (snapshot) => {
        if (!snapshot.empty) {
          const loadedMovies = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Movie, 'id'>)
          }));
          setMovies(loadedMovies);
        } else {
          // If Firestore is empty, seed initial titles
          INITIAL_MOVIES.slice(0, 15).forEach(async (m) => {
            try {
              const movieRef = doc(db, 'movies', m.id);
              const { id, ...rest } = m;
              await setDoc(movieRef, rest, { merge: true });
            } catch {
              // ignore
            }
          });
        }
      }, (err) => {
        console.warn('Firestore snapshot error for movies:', err);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn('Firestore init error:', err);
    }
  }, []);

  // 3. Real-time Firestore sync for Subscription Requests
  useEffect(() => {
    try {
      const reqsCol = collection(db, 'subscriptionRequests');
      const unsubscribe = onSnapshot(reqsCol, (snapshot) => {
        if (!snapshot.empty) {
          const loadedReqs = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<SubscriptionRequest, 'id'>)
          }));
          setSubscriptionRequests(loadedReqs);
        }
      }, (err) => {
        console.warn('Firestore subscriptionRequests error:', err);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn('Firestore subscription sync error:', err);
    }
  }, []);

  // Sync state to local storage as durable backup
  useEffect(() => {
    try {
      localStorage.setItem(MOVIES_STORAGE_KEY, JSON.stringify(movies));
    } catch {}
  }, [movies]);

  useEffect(() => {
    try {
      localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(subscriptionRequests));
    } catch {}
  }, [subscriptionRequests]);

  useEffect(() => {
    try {
      if (activeSubscription) {
        localStorage.setItem(ACTIVE_SUB_KEY, JSON.stringify(activeSubscription));
      } else {
        localStorage.removeItem(ACTIVE_SUB_KEY);
      }
    } catch {}
  }, [activeSubscription]);

  useEffect(() => {
    try {
      localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(watchHistory));
    } catch {}
  }, [watchHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(MY_LIST_KEY, JSON.stringify(myList));
    } catch {}
  }, [myList]);

  // Actions
  const isSubscriber = Boolean(activeSubscription && new Date(activeSubscription.expiresAt).getTime() > Date.now());

  const openWatch = (movieId: string) => {
    setActiveMovieId(movieId);
    setCurrentView('watch');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openVjChannel = (vjName: string) => {
    setSelectedVjName(vjName);
    setCurrentView('vj');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google Sign-in failed:', err);
    }
  };

  const logoutUser = async () => {
    try {
      await signOut(auth);
      logoutAdmin();
    } catch (err) {
      console.error('Sign-out failed:', err);
    }
  };

  const submitSubscription = async (data: {
    fullName: string;
    phoneNumber: string;
    network: 'Airtel Money' | 'MTN Mobile Money';
    planId: 'daily' | 'weekly' | 'monthly' | 'yearly';
    transactionId: string;
  }) => {
    const plan = plans.find((p) => p.id === data.planId) || plans[1];
    const durationMs = plan.durationDays * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + durationMs).toISOString();

    const requestId = `sub-${Date.now()}`;
    const newRequest: SubscriptionRequest = {
      id: requestId,
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      network: data.network,
      planId: data.planId,
      planName: plan.name,
      amountUgx: plan.priceUgx,
      transactionId: data.transactionId,
      status: 'active',
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt
    };

    setSubscriptionRequests((prev) => [newRequest, ...prev]);
    setActiveSubscription(newRequest);

    // Persist to Firestore
    try {
      const docRef = doc(db, 'subscriptionRequests', requestId);
      await setDoc(docRef, {
        ...newRequest,
        userId: currentUser?.uid || 'guest-viewer'
      });
    } catch (err) {
      console.warn('Could not write subscription request to Firestore:', err);
    }

    return {
      success: true,
      message: `Success! Your ${plan.name} has been activated. Enjoy unlimited movies translated by Uganda's top VJs!`
    };
  };

  const unlockWithCode = (codeOrPhone: string): boolean => {
    const cleaned = codeOrPhone.trim().toLowerCase();
    if (cleaned === 'vjpulse2026' || cleaned === 'luganda' || cleaned === '0749495023' || cleaned === '0768912846' || cleaned === 'vip') {
      const vipSub: SubscriptionRequest = {
        id: `vip-${Date.now()}`,
        fullName: 'VIP Passholder',
        phoneNumber: '0749495023',
        network: 'Airtel Money',
        planId: 'yearly',
        planName: 'Annual VIP Pass',
        amountUgx: 250000,
        transactionId: 'VIP-OVERRIDE',
        status: 'active',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      };
      setActiveSubscription(vipSub);
      return true;
    }

    const found = subscriptionRequests.find(
      (r) => r.phoneNumber.includes(cleaned) || r.transactionId.toLowerCase() === cleaned
    );
    if (found) {
      setActiveSubscription(found);
      return true;
    }
    return false;
  };

  const cancelSubscription = () => {
    setActiveSubscription(null);
  };

  const approveSubscription = async (id: string) => {
    setSubscriptionRequests((prev) =>
      prev.map((req) => {
        if (req.id === id) {
          const updated: SubscriptionRequest = { ...req, status: 'active' };
          if (activeSubscription?.id === id) {
            setActiveSubscription(updated);
          }
          return updated;
        }
        return req;
      })
    );

    // Sync to Firestore
    try {
      const docRef = doc(db, 'subscriptionRequests', id);
      await updateDoc(docRef, { status: 'active' });
    } catch (err) {
      console.warn('Firestore update error:', err);
    }
  };

  const revokeSubscription = async (id: string) => {
    setSubscriptionRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: 'expired' } : req))
    );
    if (activeSubscription?.id === id) {
      setActiveSubscription(null);
    }

    // Sync to Firestore
    try {
      const docRef = doc(db, 'subscriptionRequests', id);
      await updateDoc(docRef, { status: 'expired' });
    } catch (err) {
      console.warn('Firestore update error:', err);
    }
  };

  const updateWatchProgress = (movieId: string, currentTime: number, duration: number) => {
    if (!duration || duration <= 0) return;
    const progressPercent = Math.min(100, Math.round((currentTime / duration) * 100));
    setWatchHistory((prev) => ({
      ...prev,
      [movieId]: {
        movieId,
        currentTime,
        duration,
        progressPercent,
        lastWatchedAt: new Date().toISOString()
      }
    }));
  };

  const toggleMyList = (movieId: string) => {
    setMyList((prev) =>
      prev.includes(movieId) ? prev.filter((id) => id !== movieId) : [...prev, movieId]
    );
  };

  const isInMyList = (movieId: string) => myList.includes(movieId);

  const loginAdmin = (password: string) => {
    if (password === 'vjpulse2026' || password === 'admin' || password === 'gladys') {
      setIsAdminManual(true);
      try {
        localStorage.setItem(ADMIN_AUTH_KEY, 'true');
      } catch {}
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminManual(false);
    try {
      localStorage.removeItem(ADMIN_AUTH_KEY);
    } catch {}
  };

  const addMovie = async (movieData: Omit<Movie, 'id'>) => {
    const id = movieData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);
    const newMovie: Movie = { ...movieData, id };
    setMovies((prev) => [newMovie, ...prev]);

    // Save to Firestore
    try {
      const docRef = doc(db, 'movies', id);
      await setDoc(docRef, movieData);
    } catch (err) {
      console.warn('Firestore add movie error:', err);
    }
  };

  const updateMovie = async (updated: Movie) => {
    setMovies((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));

    // Update in Firestore
    try {
      const docRef = doc(db, 'movies', updated.id);
      const { id, ...rest } = updated;
      await setDoc(docRef, rest, { merge: true });
    } catch (err) {
      console.warn('Firestore update movie error:', err);
    }
  };

  const deleteMovie = async (id: string) => {
    setMovies((prev) => prev.filter((m) => m.id !== id));

    // Delete in Firestore
    try {
      const docRef = doc(db, 'movies', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Firestore delete movie error:', err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        activeMovieId,
        setActiveMovieId,
        selectedVjName,
        setSelectedVjName,
        searchQuery,
        setSearchQuery,
        selectedGenre,
        setSelectedGenre,
        movies,
        vjs,
        plans,
        broadcasts,
        addMovie,
        updateMovie,
        deleteMovie,
        currentUser,
        userRole,
        loginWithGoogle,
        logoutUser,
        isSubscriber,
        activeSubscription,
        subscriptionRequests,
        submitSubscription,
        unlockWithCode,
        cancelSubscription,
        approveSubscription,
        revokeSubscription,
        watchHistory,
        updateWatchProgress,
        myList,
        toggleMyList,
        isInMyList,
        isAdmin,
        loginAdmin,
        logoutAdmin,
        isDmcaOpen,
        setIsDmcaOpen,
        openWatch,
        openVjChannel
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
