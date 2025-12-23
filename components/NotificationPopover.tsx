import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink, Inbox } from 'lucide-react';
import { getNotifications, markNotificationRead, markAllNotificationsRead, Notification } from '../services/apiService';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotificationPopover: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 30000); // Polling every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadNotifications = async () => {
        try {
            const data = await getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        }
    };

    const handleRead = async (id: string) => {
        try {
            await markNotificationRead(id);
            setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error('Failed to mark read:', error);
        }
    };

    const handleReadAll = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Failed to mark all read:', error);
        }
    };

    return (
        <div className="relative" ref={popoverRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-1.5 rounded-full transition-colors active:scale-95 ${isDarkMode ? 'text-slate-400 hover:bg-slate-700/50 hover:text-indigo-400' : 'text-slate-500 hover:bg-white/50 hover:text-indigo-600'
                    }`}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                )}
            </button>

            {isOpen && (
                <div className={`absolute right-0 mt-3 w-80 md:w-96 rounded-2xl shadow-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
                    } overflow-hidden z-[60]`}>
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <h3 className="font-bold">{t('notifications.title')}</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleReadAll}
                                className="text-xs text-indigo-600 hover:text-indigo-700 font-bold"
                            >
                                {t('notifications.markReadAll')}
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-10 text-center">
                                <Inbox size={32} className="mx-auto text-slate-300 mb-2" />
                                <p className="text-sm text-slate-500">{t('notifications.empty')}</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                {notifications.map(n => (
                                    <div
                                        key={n.id}
                                        className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors relative ${!n.read ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{n.title}</p>
                                                    {!n.read && (
                                                        <button
                                                            onClick={() => handleRead(n.id)}
                                                            className="text-slate-400 hover:text-indigo-600"
                                                            title="Mark as read"
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">{n.message}</p>
                                                {n.link && (
                                                    <Link
                                                        to={n.link}
                                                        onClick={() => {
                                                            setIsOpen(false);
                                                            handleRead(n.id);
                                                        }}
                                                        className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                                                    >
                                                        {t('notifications.viewDetails')} <ExternalLink size={10} />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationPopover;
