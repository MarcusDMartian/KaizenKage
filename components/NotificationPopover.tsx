import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock } from 'lucide-react';
import { Popover, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { getNotifications as apiGetNotifications, markNotificationRead as apiMarkRead, markAllNotificationsRead as apiMarkAllRead, Notification } from '../services/apiService';

const NotificationPopover: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const data = await apiGetNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (id: string) => {
        try {
            await apiMarkRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error('Failed to mark read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await apiMarkAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Failed to mark all read:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <Popover className="relative">
            <Popover.Button className="relative p-2 text-slate-500 hover:text-indigo-600 hover:bg-white/50 rounded-full transition-all outline-none">
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-slate-50">
                        {unreadCount}
                    </span>
                )}
            </Popover.Button>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
            >
                <Popover.Panel className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[60]">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">Notifications</h3>
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center">
                                <span className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-10 text-center">
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Bell size={20} className="text-slate-300" />
                                </div>
                                <p className="text-sm text-slate-500 font-medium">All clear! No new updates.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {notifications.map(n => (
                                    <div
                                        key={n.id}
                                        className={`p-4 hover:bg-slate-50 transition-colors relative ${!n.read ? 'bg-indigo-50/30' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 ${!n.read ? 'bg-indigo-600' : 'bg-transparent'}`}></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className={`text-sm font-bold truncate ${!n.read ? 'text-slate-800' : 'text-slate-600'}`}>
                                                        {n.title}
                                                    </p>
                                                    {!n.read && (
                                                        <button
                                                            onClick={() => handleMarkRead(n.id)}
                                                            className="text-indigo-600 p-0.5 hover:bg-indigo-50 rounded"
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 mb-2 leading-relaxed">{n.message}</p>
                                                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                                                    <Clock size={10} />
                                                    {n.createdAt}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Popover.Panel>
            </Transition>
        </Popover>
    );
};

export default NotificationPopover;
