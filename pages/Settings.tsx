import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Moon,
    Sun,
    Globe,
    Bell,
    Shield,
    RotateCcw,
    ChevronRight,
    Info,
    LogOut
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { resetStorage } from '../services/storageService';
import { logout, clearAuth } from '../services/apiService';


const Settings: React.FC = () => {
    const navigate = useNavigate();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const [notifications, setNotifications] = React.useState(true);
    const [language, setLanguage] = React.useState('en');
    const [showResetConfirm, setShowResetConfirm] = React.useState(false);

    const handleReset = () => {
        resetStorage();
        window.location.reload();
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-4 pb-24">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                    <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
                </button>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">Settings</h1>
            </div>

            <div className="space-y-6">
                {/* Appearance Section */}
                <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                        <h2 className="font-bold text-slate-800 dark:text-white">Appearance</h2>
                    </div>

                    {/* Dark Mode Toggle */}
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'}`}>
                                {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                            </div>
                            <div>
                                <p className="font-medium text-slate-800 dark:text-white">Dark Mode</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {isDarkMode ? 'Currently using dark theme' : 'Currently using light theme'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={toggleDarkMode}
                            className={`relative w-14 h-8 rounded-full transition-colors ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-200'
                                }`}
                        >
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${isDarkMode ? 'translate-x-7' : 'translate-x-1'
                                }`} />
                        </button>
                    </div>

                    {/* Language */}
                    <div className="p-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                <Globe size={20} />
                            </div>
                            <div>
                                <p className="font-medium text-slate-800 dark:text-white">Language</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Choose your preferred language</p>
                            </div>
                        </div>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200"
                        >
                            <option value="en">English</option>
                            <option value="vi">Tiếng Việt</option>
                            <option value="ja">日本語</option>
                        </select>
                    </div>
                </section>

                {/* Notifications Section */}
                <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                        <h2 className="font-bold text-slate-800 dark:text-white">Notifications</h2>
                    </div>

                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                                <Bell size={20} />
                            </div>
                            <div>
                                <p className="font-medium text-slate-800 dark:text-white">Push Notifications</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Receive updates about your activity</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setNotifications(!notifications)}
                            className={`relative w-14 h-8 rounded-full transition-colors ${notifications ? 'bg-green-500' : 'bg-slate-200'
                                }`}
                        >
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${notifications ? 'translate-x-7' : 'translate-x-1'
                                }`} />
                        </button>
                    </div>
                </section>

                {/* Privacy Section */}
                <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                        <h2 className="font-bold text-slate-800 dark:text-white">Privacy & Data</h2>
                    </div>

                    <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                <Shield size={20} />
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-slate-800 dark:text-white">Privacy Policy</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Learn how we handle your data</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-slate-400" />
                    </button>
                </section>

                {/* Danger Zone */}
                <section className="bg-white dark:bg-slate-800 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-red-100 dark:border-red-900/30">
                        <h2 className="font-bold text-red-600">Danger Zone</h2>
                    </div>

                    <div className="p-4">
                        <button
                            onClick={() => setShowResetConfirm(true)}
                            className="w-full flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                                    <RotateCcw size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-red-600">Reset All Data</p>
                                    <p className="text-xs text-red-400">This will clear all your saved data</p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-red-400" />
                        </button>

                        {/* Sign Out Button */}
                        <button
                            onClick={async () => {
                                clearAuth();
                                navigate('/login', { replace: true });
                            }}
                            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors mt-3"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                                    <LogOut size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-slate-600 dark:text-slate-300">Sign Out</p>
                                    <p className="text-xs text-slate-400">End your session</p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-slate-400" />
                        </button>
                    </div>
                </section>

                {/* App Info */}
                <div className="text-center text-sm text-slate-400 dark:text-slate-500">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Info size={14} />
                        <span>KaizenHub v1.0.0</span>
                    </div>
                    <p>Made with ❤️ for continuous improvement</p>
                </div>
            </div>

            {/* Reset Confirmation Modal */}
            {showResetConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowResetConfirm(false)} />
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Reset All Data?</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            This will reset all your ideas, kudos, transactions, and preferences back to the demo data. This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowResetConfirm(false)}
                                className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold py-3 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReset}
                                className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
