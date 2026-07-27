import { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { Register } from './pages/Register';
import { MyAds } from './pages/MyAds';
import { Premium } from './pages/Premium';
import { Rating } from './pages/Rating';
import { Notifications } from './pages/Notifications';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { apiRequest } from './utils/api';
import { Leaf, RefreshCw, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cookieStorage } from './utils/cookieStorage';
import type { ToastDetail } from './utils/toast';

function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [toast, setToast] = useState<ToastDetail | null>(null);

  // Initialize Dark Mode & Auth on mount
  useEffect(() => {
    const savedTheme = cookieStorage.getItem('dehqon_theme');
    
    // Default to dark mode unless light theme is explicitly stored
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    checkAuth();
  }, []);

  // Listen to custom toast event dispatcher
  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<ToastDetail>;
      setToast(customEvent.detail);
    };

    window.addEventListener('dehqon-toast', handleToast);
    return () => window.removeEventListener('dehqon-toast', handleToast);
  }, []);

  // Auto hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Poll for notifications count when logged in
  useEffect(() => {
    if (currentUser) {
      fetchNotificationsCount();
      const interval = setInterval(fetchNotificationsCount, 20000); // 20s
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      cookieStorage.setItem('dehqon_theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      cookieStorage.setItem('dehqon_theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const setPageAndPersist = (page: string) => {
    setCurrentPage(page);
    cookieStorage.setItem('dehqon_active_page', page);
  };

  const checkAuth = async () => {
    const token = cookieStorage.getItem('dehqon_token');
    const cachedUserRaw = cookieStorage.getItem('dehqon_user');

    if (cachedUserRaw) {
      try {
        const cachedUser = JSON.parse(cachedUserRaw);
        setCurrentUser(cachedUser);
      } catch (e) {}
    }

    if (!token) {
      setCurrentPage('register');
      setLoading(false);
      return;
    }

    try {
      const user = await apiRequest('/auth/me');
      setCurrentUser(user);
      cookieStorage.setItem('dehqon_user', JSON.stringify(user));
      
      const savedPage = cookieStorage.getItem('dehqon_active_page');
      if (savedPage && savedPage !== 'register') {
        setCurrentPage(savedPage);
      } else {
        setCurrentPage(user.role === 'admin' ? 'admin' : 'home');
      }
    } catch (err) {
      console.warn("Auth check warning:", err);
      if (cachedUserRaw) {
        try {
          const cachedUser = JSON.parse(cachedUserRaw);
          setCurrentUser(cachedUser);
        } catch (e) {}
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const user = await apiRequest('/auth/me');
      setCurrentUser(user);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotificationsCount = async () => {
    try {
      const list = await apiRequest('/notifications');
      const unread = list.filter((n: any) => n.is_read === 0).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Notifications fetch count warning:", err);
    }
  };

  const handleRegisterSuccess = (user: any, token: string) => {
    cookieStorage.setItem('dehqon_token', token);
    cookieStorage.setItem('dehqon_user', JSON.stringify(user));
    setCurrentUser(user);
    
    if (user.role === 'admin') {
      setPageAndPersist('admin');
    } else {
      setPageAndPersist('home');
    }
  };

  // Render Page Content with dynamic screens
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home currentUser={currentUser} setPage={setPageAndPersist} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />;
      case 'my-ads':
        return <MyAds currentUser={currentUser} setPage={setPageAndPersist} fetchProfile={fetchProfile} />;
      case 'premium':
        return <Premium currentUser={currentUser} fetchProfile={fetchProfile} />;
      case 'rating':
        return <Rating />;
      case 'notifications':
        return <Notifications fetchNotificationsCount={fetchNotificationsCount} />;
      case 'profile':
        return <Profile currentUser={currentUser} fetchProfile={fetchProfile} />;
      case 'admin':
        return <Admin />;
      default:
        return <Home currentUser={currentUser} setPage={setPageAndPersist} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-[var(--color-dehqon-green)] dark:text-[var(--color-dehqon-accent)] shadow-inner">
          <Leaf className="w-10 h-10 animate-bounce text-[var(--color-dehqon-green)]" />
        </div>
        <div className="space-y-1">
          <h2 className="font-extrabold text-lg text-[var(--text-main)]">Dehqon Market</h2>
          <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 justify-center">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[var(--color-dehqon-green)]" /> Platforma yuklanmoqda...
          </p>
        </div>
      </div>
    );
  }

  // If not logged in, force Register page
  if (!currentUser && currentPage === 'register') {
    return <Register onRegisterSuccess={handleRegisterSuccess} />;
  }

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-app)] text-[var(--text-main)] transition-colors">
      
      {/* 1. TOP HEADER BAR matching dehqon.uz screenshot */}
      <Header
        currentPage={currentPage}
        setPage={setPageAndPersist}
        currentUser={currentUser}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        unreadCount={unreadCount}
      />

      {/* Toast Alert overlay */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl glass shadow-xl border border-[var(--border-color)] max-w-sm"
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
            <span className="text-xs font-bold text-[var(--text-main)]">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        {/* 2. LEFT SIDEBAR LAYOUT FOR DESKTOP / NOTEBOOK */}
        <Sidebar
          currentPage={currentPage}
          setPage={setPageAndPersist}
          unreadCount={unreadCount}
          isAdmin={isAdmin}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />

        {/* 3. MAIN WINDOW CONTENT WRAPPER */}
        <main className="flex-1 min-h-screen overflow-y-auto px-4 py-6 md:px-8 md:py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: 'easeInOut' }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* 3. BOTTOM NAV LAYOUT FOR PHONE */}
      <BottomNav
        currentPage={currentPage}
        setPage={setPageAndPersist}
        unreadCount={unreadCount}
      />
      
    </div>
  );
}

export default App;
