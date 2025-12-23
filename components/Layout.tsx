import React from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import {
  Home,
  Lightbulb,
  Heart,
  Gift,
  User,
  Bell,
  LogOut,
  Trophy,
  Award,
  Plus,
  Settings,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { getSavedUser, getCurrentUser as apiGetCurrentUser, logout as apiLogout, User as UserType } from '../services/apiService';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import NotificationPopover from './NotificationPopover';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = React.useState<UserType | null>(getSavedUser());

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await apiGetCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to load user in layout:', error);
    }
  };

  const handleLogout = async () => {
    await apiLogout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: t('nav.home'), icon: Home },
    { path: '/ideas', label: t('nav.ideas'), icon: Lightbulb },
    { path: '/kudos', label: t('nav.kudos'), icon: Heart },
    { path: '/leaderboard', label: t('nav.leaderboard'), icon: Trophy },
    { path: '/badges', label: t('nav.badges'), icon: Award },
    { path: '/rewards', label: t('nav.rewards'), icon: Gift },
    { path: '/profile', label: t('nav.profile'), icon: User },
  ];

  if (currentUser?.role === 'LEADER' || currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPERADMIN') {
    navItems.splice(navItems.length - 1, 0, { path: '/management', label: t('nav.management'), icon: ShieldCheck });
  }

  if (currentUser?.role === 'SUPERADMIN') {
    navItems.splice(navItems.length - 1, 0, { path: '/console', label: 'Console', icon: ShieldAlert });
  }

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDarkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>

      {/* --- LIQUID BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-300/40'} rounded-full blur-[100px] liquid-blob mix-blend-multiply`} style={{ animationDelay: '0s' }}></div>
        <div className={`absolute bottom-[10%] right-[-5%] w-[600px] h-[600px] ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-300/40'} rounded-full blur-[120px] liquid-blob mix-blend-multiply`} style={{ animationDelay: '2s' }}></div>
        <div className={`absolute top-[40%] left-[30%] w-[300px] h-[300px] ${isDarkMode ? 'bg-pink-900/30' : 'bg-pink-300/40'} rounded-full blur-[80px] liquid-blob mix-blend-multiply`} style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">

        {/* --- DESKTOP TOP NAVIGATION BAR (Floating Island) --- */}
        <header className={`hidden md:flex fixed top-4 left-6 right-6 h-18 z-50 items-center justify-between px-6 py-3 rounded-2xl ${isDarkMode ? 'bg-slate-800/60' : 'bg-white/60'} backdrop-blur-2xl border ${isDarkMode ? 'border-slate-700/60' : 'border-white/60'} shadow-lg shadow-indigo-500/5 transition-all`}>

          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} tracking-tight`}>KaizenHub</span>
          </div>

          {/* Navigation Links - Center */}
          <nav className={`flex items-center gap-1 ${isDarkMode ? 'bg-slate-700/30' : 'bg-white/30'} p-1 rounded-xl border ${isDarkMode ? 'border-slate-600/40' : 'border-white/40'}`}>
            {navItems.filter(item => item.path !== '/profile').map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 font-medium text-sm ${isActive
                    ? `${isDarkMode ? 'bg-slate-700' : 'bg-white'} shadow-sm text-indigo-600`
                    : `${isDarkMode ? 'text-slate-400 hover:text-indigo-400 hover:bg-slate-700/50' : 'text-slate-500 hover:bg-white/50 hover:text-indigo-600'}`
                  }`
                }
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-5">
            {/* Settings */}
            <Link
              to="/settings"
              className={`${isDarkMode ? 'text-slate-400 hover:text-indigo-400' : 'text-slate-500 hover:text-indigo-600'} transition-colors p-1.5 rounded-full ${isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-white/50'}`}
            >
              <Settings size={20} />
            </Link>

            {/* Notification */}
            <NotificationPopover isDarkMode={isDarkMode} />

            <div className={`h-6 w-px ${isDarkMode ? 'bg-slate-600/50' : 'bg-slate-300/50'}`}></div>

            {/* Profile & Logout */}
            <div className="flex items-center gap-3">
              {currentUser && (
                <Link to="/profile" className="flex items-center gap-3 group">
                  <div className="text-right hidden lg:block">
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} leading-none group-hover:text-indigo-600 transition-colors`}>{currentUser.name}</p>
                    <p className="text-xs text-indigo-600 font-bold mt-0.5">{(currentUser.points || 0).toLocaleString()} pts</p>
                  </div>
                  <div className="relative">
                    <img src={currentUser.avatarUrl} alt="Avatar" className="w-9 h-9 rounded-full border-2 border-white shadow-sm group-hover:scale-105 transition-transform" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                </Link>
              )}

              <button
                onClick={handleLogout}
                className={`${isDarkMode ? 'text-slate-500 hover:text-red-400' : 'text-slate-400 hover:text-red-500'} transition-colors p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg`} title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 flex flex-col min-h-screen relative pb-28 md:pb-8 md:pt-28 md:px-8">

          {/* Mobile Header - Glass */}
          <header className={`md:hidden sticky top-0 z-20 ${isDarkMode ? 'bg-slate-800/70' : 'bg-white/70'} backdrop-blur-xl border-b ${isDarkMode ? 'border-slate-700/50' : 'border-white/50'} px-4 py-3 flex items-center justify-between safe-top shadow-sm mb-4`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <span className="text-white font-bold">K</span>
              </div>
              <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} text-lg tracking-tight`}>KaizenHub</span>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/settings" className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'} active:scale-90 transition-transform`}>
                <Settings size={22} />
              </Link>
              <NotificationPopover isDarkMode={isDarkMode} />
              {currentUser && (
                <Link to="/profile">
                  <div className="p-0.5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600">
                    <img src={currentUser.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full border-2 border-white" />
                  </div>
                </Link>
              )}
            </div>
          </header>

          {/* Page Content */}
          <div className="w-full md:max-w-7xl md:mx-auto">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation - Floating Glass */}
        <nav className={`md:hidden fixed bottom-6 left-4 right-4 z-30 ${isDarkMode ? 'bg-slate-800/80' : 'bg-white/80'} backdrop-blur-2xl border ${isDarkMode ? 'border-slate-700/60' : 'border-white/60'} flex justify-between items-center px-6 py-3 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)]`}>
          <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all w-12 active:scale-95 ${isActive ? 'text-indigo-600 drop-shadow-sm' : isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            <Home size={24} strokeWidth={location.pathname === '/' ? 2.5 : 2} />
          </NavLink>
          <NavLink to="/ideas" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all w-12 active:scale-95 ${isActive ? 'text-indigo-600 drop-shadow-sm' : isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            <Lightbulb size={24} strokeWidth={location.pathname === '/ideas' ? 2.5 : 2} />
          </NavLink>
          <div className="relative -top-8">
            <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-40"></div>
            <Link to="/ideas" state={{ mode: 'create' }} className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full text-white shadow-lg active:scale-95 transition-all border-4 border-white/80">
              <Plus size={28} strokeWidth={3} />
            </Link>
          </div>
          <NavLink to="/kudos" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all w-12 active:scale-95 ${isActive ? 'text-indigo-600 drop-shadow-sm' : isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            <Heart size={24} strokeWidth={location.pathname === '/kudos' ? 2.5 : 2} />
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all w-12 active:scale-95 ${isActive ? 'text-indigo-600 drop-shadow-sm' : isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            <User size={24} strokeWidth={location.pathname === '/profile' ? 2.5 : 2} />
          </NavLink>
        </nav>

      </div>
    </div>
  );
};

export default Layout;