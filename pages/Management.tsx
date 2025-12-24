import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle, XCircle, Clock, Gift, Users, Lightbulb } from 'lucide-react';
import {
    getIdeas,
    updateIdeaStatus,
    getManagementRedemptions,
    processRedemption,
    getUsers,
    updateUser,
    Idea,
    User,
    getSavedUser
} from '../services/apiService';
import { useTranslation } from 'react-i18next';
import { Loader2, Plus, Users as UsersIcon } from 'lucide-react';
import EmptyState from '../components/EmptyState';

const Management: React.FC = () => {
    const { t } = useTranslation();
    const currentUser = getSavedUser();
    const [activeTab, setActiveTab] = useState<'ideas' | 'rewards' | 'users'>('ideas');
    const [loading, setLoading] = useState(true);
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [redemptions, setRedemptions] = useState<any[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'ideas') {
                const data = await getIdeas();
                setIdeas(data.filter(i => i.status === 'new' || i.status === 'in_review'));
            } else if (activeTab === 'rewards') {
                const data = await getManagementRedemptions();
                setRedemptions(data.filter(r => r.status === 'pending'));
            } else if (activeTab === 'users' && currentUser?.role === 'ADMIN') {
                const data = await getUsers();
                setUsers(data);
            }
        } catch (error) {
            console.error('Failed to load management data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleIdeaStatus = async (id: string, status: string) => {
        setProcessing(id);
        try {
            await updateIdeaStatus(id, status);
            setIdeas(ideas.filter(i => i.id !== id));
        } catch (error) {
            console.error('Failed to update idea status:', error);
        } finally {
            setProcessing(null);
        }
    };

    const handleRedemption = async (id: string, status: string) => {
        setProcessing(id);
        try {
            await processRedemption(id, { status });
            setRedemptions(redemptions.filter(r => r.id !== id));
        } catch (error) {
            console.error('Failed to process redemption:', error);
        } finally {
            setProcessing(null);
        }
    };

    if (currentUser?.role === 'MEMBER') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
                <ShieldCheck size={64} className="text-slate-300 mb-4" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">{t('management.accessDenied')}</h2>
                <p className="text-slate-500 max-w-md">
                    {t('management.accessDeniedDesc')}
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 px-4 md:px-0 pb-24">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-indigo-900 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShieldCheck size={200} />
                </div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <ShieldCheck className="text-indigo-400" /> {t('management.leadConsole')}
                    </h2>
                    <p className="text-indigo-100 max-w-xl">
                        {t('management.leadConsoleDesc')}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                <button
                    onClick={() => setActiveTab('ideas')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'ideas'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                        }`}
                >
                    <Lightbulb size={18} /> {t('management.ideasTab')}
                </button>
                <button
                    onClick={() => setActiveTab('rewards')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'rewards'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                        }`}
                >
                    <Gift size={18} /> {t('management.rewardsTab')}
                </button>
                {currentUser?.role === 'ADMIN' && (
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'users'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                            }`}
                    >
                        <UsersIcon size={18} /> {t('management.usersTab')}
                    </button>
                )}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 gap-4">
                        <Loader2 size={40} className="animate-spin text-indigo-600" />
                        <p className="text-slate-500">Loading requests...</p>
                    </div>
                ) : (
                    <div className="p-0">
                        {activeTab === 'ideas' && (
                            <div className="divide-y divide-slate-100">
                                {ideas.length === 0 ? (
                                    <div className="p-8">
                                        <EmptyState
                                            icon={Lightbulb}
                                            title={t('management.noPendingIdeas')}
                                            message="All tactical suggestions have been reviewed. Great job on staying on top of the queue!"
                                        />
                                    </div>
                                ) : (
                                    ideas.map(idea => (
                                        <div key={idea.id} className="p-6 hover:bg-slate-50 transition-colors">
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <img src={idea.author.avatar} alt="" className="w-6 h-6 rounded-full" />
                                                        <span className="text-sm font-medium text-slate-700">{idea.author.name}</span>
                                                        <span className="text-xs text-slate-400">• {idea.createdAt}</span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-800">{idea.title}</h3>
                                                    <div className="flex gap-4 text-sm">
                                                        <div>
                                                            <span className="font-bold block text-indigo-600">Problem:</span>
                                                            <p className="text-slate-500 line-clamp-2">{idea.problem}</p>
                                                        </div>
                                                        <div>
                                                            <span className="font-bold block text-green-600">Proposal:</span>
                                                            <p className="text-slate-500 line-clamp-2">{idea.proposal}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 flex-shrink-0">
                                                    <button
                                                        onClick={() => handleIdeaStatus(idea.id, 'APPROVED')}
                                                        disabled={processing === idea.id}
                                                        className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                                                    >
                                                        {processing === idea.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                                        {t('management.approve')}
                                                    </button>
                                                    <button
                                                        onClick={() => handleIdeaStatus(idea.id, 'REJECTED')}
                                                        disabled={processing === idea.id}
                                                        className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                                                    >
                                                        {processing === idea.id ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                                                        {t('management.reject')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'rewards' && (
                            <div className="divide-y divide-slate-100">
                                {redemptions.length === 0 ? (
                                    <div className="p-8">
                                        <EmptyState
                                            icon={Gift}
                                            title={t('management.noPendingRewards')}
                                            message="No rewards are currently awaiting fulfillment. The treasury is quiet."
                                        />
                                    </div>
                                ) : (
                                    redemptions.map(req => (
                                        <div key={req.id} className="p-6 hover:bg-slate-50 transition-colors">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                                                        <img src={req.rewardImage} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-800">{req.rewardName}</h3>
                                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                                            <span>Requested by: {req.userName}</span>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1"><Clock size={14} /> {new Date(req.requestedAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleRedemption(req.id, 'APPROVED')}
                                                        disabled={processing === req.id}
                                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                                                    >
                                                        {processing === req.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                                        {t('management.fulfill')}
                                                    </button>
                                                    <button
                                                        onClick={() => handleRedemption(req.id, 'REJECTED')}
                                                        disabled={processing === req.id}
                                                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                                                    >
                                                        {processing === req.id ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                                                        {t('management.reject')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="p-6 overflow-x-auto">
                                {users.length === 0 ? (
                                    <EmptyState
                                        icon={UsersIcon}
                                        title="No Squad Members Found"
                                        message="There are no users matching your current criteria or the system is completely empty."
                                    />
                                ) : (
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                                                <th className="pb-3 pl-2">User</th>
                                                <th className="pb-3">Team</th>
                                                <th className="pb-3">Role</th>
                                                <th className="pb-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {users.map(user => (
                                                <tr key={user.id} className="group">
                                                    <td className="py-4 pl-2">
                                                        <div className="flex items-center gap-3">
                                                            <img src={user.avatarUrl} className="w-9 h-9 rounded-full" alt="" />
                                                            <div>
                                                                <p className="font-bold text-slate-800 text-sm">{user.name}</p>
                                                                <p className="text-xs text-slate-500">{user.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4">
                                                        <span className="text-sm text-slate-600">{user.team}</span>
                                                    </td>
                                                    <td className="py-4">
                                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ${user.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                                                            user.role === 'LEADER' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-slate-100 text-slate-600'
                                                            }`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-right">
                                                        <button className="text-indigo-600 hover:text-indigo-800 text-sm font-bold">Edit</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Management;

