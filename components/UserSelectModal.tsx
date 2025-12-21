import React, { useState, useMemo } from 'react';
import { X, Search, Check } from 'lucide-react';
import { User } from '../types';

interface UserSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (user: User) => void;
    users: User[];
    currentUserId: string;
    selectedUser?: User | null;
}

const UserSelectModal: React.FC<UserSelectModalProps> = ({
    isOpen,
    onClose,
    onSelect,
    users,
    currentUserId,
    selectedUser
}) => {
    const [search, setSearch] = useState('');

    const filteredUsers = useMemo(() => {
        return users
            .filter(u => u.id !== currentUserId)
            .filter(u =>
                u.name.toLowerCase().includes(search.toLowerCase()) ||
                u.team.toLowerCase().includes(search.toLowerCase())
            );
    }, [users, currentUserId, search]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white w-full max-w-md max-h-[80vh] rounded-t-3xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <h3 className="font-bold text-lg text-slate-800">Select Colleague</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-slate-100">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or team..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            autoFocus
                        />
                    </div>
                </div>

                {/* User List */}
                <div className="flex-1 overflow-y-auto p-2">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => {
                            const isSelected = selectedUser?.id === user.id;

                            return (
                                <button
                                    key={user.id}
                                    onClick={() => {
                                        onSelect(user);
                                        onClose();
                                    }}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${isSelected
                                        ? 'bg-indigo-50 border border-indigo-200'
                                        : 'hover:bg-slate-50'
                                        }`}
                                >
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                                    />
                                    <div className="flex-1 text-left">
                                        <p className="font-medium text-slate-800">{user.name}</p>
                                        <p className="text-xs text-slate-500">{user.team} • {user.role}</p>
                                    </div>
                                    {isSelected && (
                                        <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                                            <Check size={14} className="text-white" />
                                        </div>
                                    )}
                                </button>
                            );
                        })
                    ) : (
                        <div className="text-center py-8 text-slate-400">
                            No users found
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};

export default UserSelectModal;
