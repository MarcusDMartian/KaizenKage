import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Users,
    Target,
    Gift,
    Settings,
    Plus,
    Edit2,
    Trash2,
    Save,
    X,
    Loader2,
    ShieldAlert,
    BarChart3,
    UserPlus,
    Check,
    XCircle
} from 'lucide-react';
import {
    adminGetUsers,
    adminUpdateUser,
    adminGetMissions,
    adminCreateMission,
    adminUpdateMission,
    adminDeleteMission,
    adminGetRewards,
    adminCreateReward,
    adminUpdateReward,
    adminDeleteReward,
    adminGetStats,
    getSavedUser,
    getJoinRequests,
    approveJoinRequest,
    rejectJoinRequest,
    User
} from '../services/apiService';
import { useTranslation } from 'react-i18next';
import EmptyState from '../components/EmptyState';

const SuperadminConsole: React.FC = () => {
    const { t } = useTranslation();
    const currentUser = getSavedUser();
    const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'missions' | 'rewards' | 'requests'>('stats');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [missions, setMissions] = useState<any[]>([]);
    const [rewards, setRewards] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [modalData, setModalData] = useState<any>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadTabData();
    }, [activeTab]);

    const loadTabData = async () => {
        setLoading(true);
        try {
            switch (activeTab) {
                case 'stats':
                    setStats(await adminGetStats());
                    break;
                case 'users':
                    setUsers(await adminGetUsers());
                    break;
                case 'missions':
                    const missionsRes = await adminGetMissions();
                    setMissions(Array.isArray(missionsRes) ? missionsRes : []);
                    break;
                case 'rewards':
                    const rewardsRes = await adminGetRewards();
                    setRewards(Array.isArray(rewardsRes) ? rewardsRes : []);
                    break;
                case 'requests':
                    const requestsRes = await getJoinRequests();
                    setRequests(Array.isArray(requestsRes) ? requestsRes : []);
                    break;
            }
        } catch (error) {
            console.error('Failed to load admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (activeTab === 'missions') {
                if (modalData.id) {
                    await adminUpdateMission(modalData.id, modalData);
                } else {
                    await adminCreateMission(modalData);
                }
            } else if (activeTab === 'rewards') {
                if (modalData.id) {
                    await adminUpdateReward(modalData.id, modalData);
                } else {
                    await adminCreateReward(modalData);
                }
            }
            setShowModal(false);
            loadTabData();
        } catch (error) {
            console.error('Failed to save:', error);
            alert('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const openModal = (data: any = {}) => {
        if (activeTab === 'missions' && !data.id) {
            setModalData({ name: '', description: '', triggerType: 'DAILY', rewardPoints: 100, isActive: true });
        } else if (activeTab === 'rewards' && !data.id) {
            setModalData({ name: '', description: '', imageUrl: '', pointsCost: 500, stock: 10, type: 'VOUCHER', isActive: true });
        } else {
            setModalData(data);
        }
        setShowModal(true);
    };

    if (currentUser?.role !== 'SUPERADMIN') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
                <ShieldAlert size={64} className="text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t('management.accessDenied')}</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md">
                    {t('management.accessDeniedDesc')}
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 px-4 md:px-6 pb-24">
            {/* Header */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden border border-slate-800">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Settings size={220} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
                            <span className="bg-indigo-600 p-2 rounded-xl"><Settings size={24} /></span>
                            {t('management.adminConsole')}
                        </h2>
                        <p className="text-slate-400 font-medium max-w-xl">
                            System-wide management of users, core content, and platform performance.
                        </p>
                    </div>
                </div>
            </div>

            {/* Sidebar/Tabs Navigation */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-2">
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'stats' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50'}`}
                    >
                        <BarChart3 size={20} /> {t('management.systemStats')}
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Users size={20} /> {t('management.users')}
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'requests' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50'}`}
                    >
                        <UserPlus size={20} /> Member Requests
                        {requests.length > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{requests.length}</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('missions')}
                        className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'missions' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Target size={20} /> {t('management.missions')}
                    </button>
                    <button
                        onClick={() => setActiveTab('rewards')}
                        className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'rewards' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Gift size={20} /> {t('management.rewards')}
                    </button>
                </div>

                <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl overflow-hidden min-h-[500px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full p-20 gap-4">
                                <Loader2 size={48} className="animate-spin text-indigo-600" />
                                <p className="text-slate-500 font-bold">Synchronizing Data...</p>
                            </div>
                        ) : (
                            <div className="p-6">
                                {activeTab === 'stats' && <StatsOverview stats={stats} />}
                                {activeTab === 'users' && <UserTable users={users} onRefresh={loadTabData} />}
                                {activeTab === 'requests' && <RequestsList requests={requests} onRefresh={loadTabData} />}
                                {activeTab === 'missions' && <MissionsList missions={missions} onRefresh={loadTabData} onEdit={openModal} onAdd={() => openModal()} />}
                                {activeTab === 'rewards' && <RewardsList rewards={rewards} onRefresh={loadTabData} onEdit={openModal} onAdd={() => openModal()} />}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/50">
                            <h3 className="text-xl font-black text-slate-800 dark:text-white">
                                {modalData.id ? t('common.edit') : t('common.submit')} {activeTab === 'missions' ? t('management.missions') : t('management.rewards')}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase text-slate-400 tracking-widest">{t('management.nameLabel')}</label>
                                <input
                                    required
                                    type="text"
                                    value={modalData.name || ''}
                                    onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-700 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase text-slate-400 tracking-widest">{t('management.descriptionLabel')}</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={modalData.description || ''}
                                    onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-700 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                />
                            </div>

                            {activeTab === 'missions' ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest">{t('management.triggerTypeLabel')}</label>
                                        <select
                                            value={modalData.triggerType || 'DAILY'}
                                            onChange={(e) => setModalData({ ...modalData, triggerType: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-700 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 font-bold"
                                        >
                                            <option value="DAILY">{t('management.daily')}</option>
                                            <option value="WEEKLY">{t('management.weekly')}</option>
                                            <option value="EVENT">{t('management.event')}</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest">{t('management.pointsLabel')}</label>
                                        <input
                                            required
                                            type="number"
                                            value={modalData.rewardPoints || 0}
                                            onChange={(e) => setModalData({ ...modalData, rewardPoints: parseInt(e.target.value) })}
                                            className="w-full bg-slate-50 dark:bg-slate-700 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 font-bold"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest">{t('management.imageUrlLabel')}</label>
                                        <input
                                            type="text"
                                            value={modalData.imageUrl || ''}
                                            onChange={(e) => setModalData({ ...modalData, imageUrl: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-700 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all"
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest">{t('management.pointsLabel')}</label>
                                            <input
                                                required
                                                type="number"
                                                value={modalData.pointsCost || 0}
                                                onChange={(e) => setModalData({ ...modalData, pointsCost: parseInt(e.target.value) })}
                                                className="w-full bg-slate-50 dark:bg-slate-700 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 font-bold"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest">{t('management.stockLabel')}</label>
                                            <input
                                                required
                                                type="number"
                                                value={modalData.stock || 0}
                                                onChange={(e) => setModalData({ ...modalData, stock: parseInt(e.target.value) })}
                                                className="w-full bg-slate-50 dark:bg-slate-700 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 font-bold"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={modalData.isActive}
                                    onChange={(e) => setModalData({ ...modalData, isActive: e.target.checked })}
                                    className="w-5 h-5 rounded border-none bg-slate-100 dark:bg-slate-700 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="isActive" className="text-sm font-bold text-slate-600 dark:text-slate-300">{t('management.active')}</label>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                            >
                                {saving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                                {t('common.save')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Sub-components

const StatsOverview: React.FC<{ stats: any }> = ({ stats }) => {
    const { t } = useTranslation();
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {[
                { label: t('management.systemStats'), value: stats?.userCount || 0, icon: <Users />, color: 'bg-blue-500' },
                { label: 'Ideas Deployed', value: stats?.ideaCount || 0, icon: <LayoutDashboard />, color: 'bg-emerald-500' },
                { label: 'Kudos Exchanged', value: stats?.kudosCount || 0, icon: <ShieldAlert />, color: 'bg-rose-500' },
                { label: t('management.missions'), value: stats?.activeMissions || 0, icon: <Target />, color: 'bg-amber-500' },
            ].map((item, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-700/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-600 shadow-sm flex items-center gap-6">
                    <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                        {item.icon}
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">{item.label}</p>
                        <p className="text-3xl font-black text-slate-800 dark:text-white">{item.value.toLocaleString()}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

const UserTable: React.FC<{ users: User[], onRefresh: () => void }> = ({ users, onRefresh }) => {
    const { t } = useTranslation();
    const handleUpdate = async (id: string, data: any) => {
        try {
            await adminUpdateUser(id, data);
            onRefresh();
        } catch (e) {
            console.error(e);
            alert('Failed to update user');
        }
    };

    return (
        <div className="overflow-x-auto">
            {users.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="No Citizens Found"
                    message="The population registry is currently empty. Direct recruitment or registration required."
                />
            ) : (
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-slate-400 text-xs font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-700">
                            <th className="pb-4 pl-2">User Identity</th>
                            <th className="pb-4">Affiliation / Role</th>
                            <th className="pb-4">Operational Status</th>
                            <th className="pb-4 text-right pr-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {users.map(user => (
                            <tr key={user.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                                <td className="py-5 pl-2">
                                    <div className="flex items-center gap-4">
                                        <img src={user.avatarUrl} className="w-11 h-11 rounded-2xl border-2 border-white dark:border-slate-700 shadow-md" alt="" />
                                        <div>
                                            <p className="font-black text-slate-800 dark:text-white">{user.name}</p>
                                            <p className="text-xs text-slate-500 font-medium">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-5">
                                    <div className="space-y-1">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block">{user.team || 'Unassigned'}</span>
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleUpdate(user.id, { role: e.target.value })}
                                            className="text-[10px] font-black tracking-widest bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg border-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="MEMBER">MEMBER</option>
                                            <option value="LEADER">LEADER</option>
                                            <option value="ADMIN">ADMIN</option>
                                            <option value="SUPERADMIN">SUPERADMIN</option>
                                        </select>
                                    </div>
                                </td>
                                <td className="py-5">
                                    <button
                                        onClick={() => handleUpdate(user.id, { isActive: !(user as any).isActive })}
                                        className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${(user as any).isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                    >
                                        {(user as any).isActive ? t('management.active').toUpperCase() : t('management.inactive').toUpperCase()}
                                    </button>
                                </td>
                                <td className="py-5 text-right pr-2">
                                    <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

const MissionsList: React.FC<{ missions: any[], onRefresh: () => void, onEdit: (m: any) => void, onAdd: () => void }> = ({ missions, onRefresh, onEdit, onAdd }) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800 dark:text-white">{t('management.missions')}</h3>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                >
                    <Plus size={18} /> {t('management.addMission')}
                </button>
            </div>
            {missions.length === 0 ? (
                <EmptyState
                    icon={Target}
                    title="No Missions Available"
                    message="The mission deck is empty. Create a new directive to challenge your operatives."
                    action={{
                        label: t('management.addMission'),
                        onClick: onAdd,
                        icon: Plus
                    }}
                />
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {missions.map(m => (
                        <div key={m.id} className={`p-5 rounded-2xl border transition-all flex justify-between items-center group ${m.isActive ? 'bg-slate-50 dark:bg-slate-700/50 border-slate-100 dark:border-slate-600' : 'bg-slate-200/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 opacity-60'}`}>
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    {m.name}
                                    {!m.isActive && <span className="text-[8px] font-black px-1.5 py-0.5 bg-slate-400 text-white rounded uppercase">{t('management.inactive')}</span>}
                                </h4>
                                <p className="text-sm text-slate-500">{m.description}</p>
                                <div className="mt-2 flex gap-3 items-center">
                                    <span className="text-[10px] font-black px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-lg">{m.triggerType}</span>
                                    <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-lg">+{m.rewardPoints} XP</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onEdit(m)}
                                    className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-400 hover:text-indigo-600 shadow-sm transition-all"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={async () => { if (confirm(t('management.confirmDelete'))) { await adminDeleteMission(m.id); onRefresh(); } }}
                                    className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-400 hover:text-red-600 shadow-sm transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const RewardsList: React.FC<{ rewards: any[], onRefresh: () => void, onEdit: (r: any) => void, onAdd: () => void }> = ({ rewards, onRefresh, onEdit, onAdd }) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800 dark:text-white">{t('management.rewards')}</h3>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                >
                    <Plus size={18} /> {t('management.addReward')}
                </button>
            </div>
            {rewards.length === 0 ? (
                <EmptyState
                    icon={Gift}
                    title="Treasury Empty"
                    message="No rewards are available for requisition. Stock up the armory with new loot."
                    action={{
                        label: t('management.addReward'),
                        onClick: onAdd,
                        icon: Plus
                    }}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rewards.map(r => (
                        <div key={r.id} className={`p-4 rounded-2xl border flex gap-4 group transition-all ${r.isActive ? 'bg-slate-50 dark:bg-slate-700/50 border-slate-100 dark:border-slate-600' : 'bg-slate-200/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 opacity-60'}`}>
                            <div className="relative">
                                <img src={r.imageUrl || 'https://via.placeholder.com/100'} className="w-16 h-16 rounded-xl object-cover" alt="" />
                                {!r.isActive && <div className="absolute inset-0 bg-slate-900/40 rounded-xl flex items-center justify-center"><X className="text-white" size={24} /></div>}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-800 dark:text-white">{r.name}</h4>
                                <p className="text-xs text-slate-500 line-clamp-1">{r.description}</p>
                                <p className="text-sm font-black text-indigo-600 mt-1">
                                    {r.pointsCost} PTS
                                    <span className={`text-[10px] ml-2 ${r.stock <= 5 ? 'text-rose-500' : 'text-slate-400'}`}>
                                        {t('management.stockLabel')}: {r.stock}
                                    </span>
                                </p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={() => onEdit(r)}
                                    className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    onClick={async () => { if (confirm(t('management.confirmDelete'))) { await adminDeleteReward(r.id); onRefresh(); } }}
                                    className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const RequestsList: React.FC<{ requests: any[], onRefresh: () => void }> = ({ requests, onRefresh }) => {
    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        try {
            if (action === 'approve') {
                await approveJoinRequest(id);
            } else {
                await rejectJoinRequest(id);
            }
            onRefresh();
        } catch (e) {
            console.error(e);
            alert('Failed to process request');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800 dark:text-white">Member Requests</h3>
            </div>
            {requests.length === 0 ? (
                <EmptyState
                    icon={UserPlus}
                    title="No Pending Requests"
                    message="All join requests have been processed. The gates are clear."
                />
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {requests.map(req => (
                        <div key={req.id} className="p-5 rounded-2xl border border-slate-100 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                                    <UserPlus size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-white">{req.name}</h4>
                                    <p className="text-sm text-slate-500">{req.email}</p>
                                    <p className="text-xs font-bold text-slate-400 mt-1">
                                        Requested: {new Date(req.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleAction(req.id, 'approve')}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all"
                                >
                                    <Check size={18} /> Approve
                                </button>
                                <button
                                    onClick={() => handleAction(req.id, 'reject')}
                                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-rose-500 border border-rose-200 dark:border-rose-900/30 rounded-xl text-sm font-bold hover:bg-rose-50 transition-all"
                                >
                                    <XCircle size={18} /> Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SuperadminConsole;
