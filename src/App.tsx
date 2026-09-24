import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DMCAModal } from './components/DMCAModal';
import { HomePage } from './pages/HomePage';
import { WatchPage } from './pages/WatchPage';
import { ExplorePage } from './pages/ExplorePage';
import { VJChannelPage } from './pages/VJChannelPage';
import { SubscribePage } from './pages/SubscribePage';
import { LiveTVPage } from './pages/LiveTVPage';
import { AdminPage } from './pages/AdminPage';

const AppContent: React.FC = () => {
  const { currentView } = useApp();

  return (
    <div className="min-h-screen bg-[#0b0d13] text-[#e8ecf2] flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      <Navbar />

      <main className="flex-1">
        {currentView === 'home' && <HomePage />}
        {currentView === 'watch' && <WatchPage />}
        {currentView === 'explore' && <ExplorePage />}
        {currentView === 'vj' && <VJChannelPage />}
        {currentView === 'subscribe' && <SubscribePage />}
        {currentView === 'live-tv' && <LiveTVPage />}
        {currentView === 'admin' && <AdminPage />}
      </main>

      <Footer />
      <DMCAModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
