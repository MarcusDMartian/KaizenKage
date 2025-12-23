import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
   Settings,
   LogOut,
   Lightbulb,
   Heart,
   Trophy,
   Award,
   Gift,
   ChevronRight,
   ShieldCheck,
   Target,
   CheckCircle2,
   Zap
} from 'lucide-react';
import {
   getCurrentUser as apiGetCurrentUser,
   getMissions as apiGetMissions,
   getIdeas as apiGetIdeas,
   getKudos as apiGetKudos,
   logout as apiLogout,
   User,
   Mission
} from '../services/apiService';
import { useTranslation } from 'react-i18next';
import { Loader2, Plus } from 'lucide-react';
import EmptyState from '../components/EmptyState';

const Profile: React.FC = () => {
   const { t } = useTranslation();
   const navigate = useNavigate();
   const [currentUser, setCurrentUser] = useState<User | null>(null);
   const [missions, setMissions] = useState<Mission[]>([]);
   const [stats, setStats] = useState({ ideas: 0, kudosSent: 0, kudosReceived: 0 });
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      loadData();
   }, []);

   const loadData = async () => {
      try {
         const [user, missionsData, ideas, kudos] = await Promise.all([
            apiGetCurrentUser(),
            apiGetMissions(),
            apiGetIdeas(),
            apiGetKudos()
         ]);

         setCurrentUser(user);
         setMissions(missionsData);
         setStats({
            ideas: ideas.filter(i => i.author.id === user.id).length,
            kudosSent: kudos.filter(k => k.sender.id === user.id).length,
            kudosReceived: kudos.filter(k => k.receiver.id === user.id).length
         });
      } catch (error) {
         console.error('Failed to load profile data:', error);
      } finally {
         setLoading(false);
      }
   };

   const handleLogout = async () => {
      await apiLogout();
      navigate('/login');
   };

   const menuItems = [
      {
         label: 'Tactics',
         path: '/ideas',
         icon: Lightbulb,
         color: 'text-blue-600 dark:text-blue-400',
         bg: 'bg-blue-100 dark:bg-blue-900/30',
         desc: 'Submit and vote on strategies'
      },
      {
         label: 'Honor',
         path: '/kudos',
         icon: Heart,
         color: 'text-rose-600 dark:text-rose-400',
         bg: 'bg-rose-100 dark:bg-rose-900/30',
         desc: 'Recognize your squad'
      },
      {
         label: 'Rankings',
         path: '/leaderboard',
         icon: Trophy,
         color: 'text-yellow-600 dark:text-yellow-400',
         bg: 'bg-yellow-100 dark:bg-yellow-900/30',
         desc: 'See top operatives'
      },
      {
         label: 'Loot',
         path: '/rewards',
         icon: Gift,
         color: 'text-emerald-600 dark:text-emerald-400',
         bg: 'bg-emerald-100 dark:bg-emerald-900/30',
         desc: 'Requisition supplies'
      },
      {
         label: 'Intel Report',
         path: '/feedback',
         icon: ShieldCheck,
         color: 'text-slate-600 dark:text-slate-400',
         bg: 'bg-slate-100 dark:bg-slate-700/50',
         desc: 'Send encrypted feedback'
      }
   ];

   const progressPercent = Math.min(100, (currentUser.points / currentUser.nextLevelPoints) * 100);

   if (loading || !currentUser) {
      return (
         <div className="min-h-[50vh] flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-indigo-600" />
         </div>
      );
   }

   return (
      <div className="max-w-3xl mx-auto space-y-6 pb-24 px-4 md:px-0">
         {/* User Header */}
         <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-white/60 dark:border-slate-700/60 overflow-hidden group">
            <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
               <div className="absolute inset-0 bg-black/5"></div>
               <Link to="/settings" className="absolute top-4 right-4 text-white/80 hover:text-white p-2">
                  <Settings size={20} />
               </Link>
            </div>
            <div className="px-6 pb-6">
               <div className="relative -mt-12 mb-4 flex justify-between items-end">
                  <img src={currentUser.avatarUrl} alt="" className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 shadow-lg bg-white dark:bg-slate-700" />
               </div>

               <div>
                  <div className="flex items-start justify-between">
                     <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">{currentUser.name}</h2>
                        <p className="text-slate-500 dark:text-slate-400">{currentUser.role} • {currentUser.team}</p>
                     </div>
                     <div className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-xl border border-indigo-100 dark:border-indigo-800/50 font-bold shadow-sm">
                        <Zap size={16} className="fill-indigo-600 dark:fill-indigo-400" />
                        <span>Level {currentUser.level}</span>
                     </div>
                  </div>
               </div>

               {/* Level Progress Indicator */}
               <div className="mt-6 bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-600">
                  <div className="flex justify-between items-end mb-2">
                     <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Next Milestone</span>
                        <div className="flex items-baseline gap-1">
                           <span className="text-lg font-bold text-slate-800 dark:text-white">{currentUser.points.toLocaleString()}</span>
                           <span className="text-xs font-medium text-slate-500 dark:text-slate-400">/ {currentUser.nextLevelPoints.toLocaleString()} XP</span>
                        </div>
                     </div>
                     <div className="text-right">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{Math.floor(progressPercent)}%</span>
                     </div>
                  </div>
                  <div className="h-3 w-full bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                     <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.4)]"
                        style={{ width: `${progressPercent}%` }}
                     />
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium flex items-center gap-1">
                     <Target size={12} />
                     {(currentUser.nextLevelPoints - currentUser.points).toLocaleString()} XP needed for Level {currentUser.level + 1}
                  </p>
               </div>

               <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-white dark:bg-slate-700/50 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-600 shadow-sm">
                     <span className="block text-2xl font-bold text-indigo-600 dark:text-indigo-400">{currentUser.points.toLocaleString()}</span>
                     <span className="text-xs text-slate-400 uppercase font-bold tracking-wide">Total XP</span>
                  </div>
                  <div className="bg-white dark:bg-slate-700/50 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-600 shadow-sm">
                     <span className="block text-2xl font-bold text-orange-500">{currentUser.streak}</span>
                     <span className="text-xs text-slate-400 uppercase font-bold tracking-wide">Day Streak</span>
                  </div>
                  <div className="bg-white dark:bg-slate-700/50 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-600 shadow-sm">
                     <span className="block text-2xl font-bold text-emerald-500">{stats.ideas}</span>
                     <span className="text-xs text-slate-400 uppercase font-bold tracking-wide">Ideas</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Active Missions Section */}
         <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-white/60 dark:border-slate-700/60 p-6">
            <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Target className="text-indigo-600 dark:text-indigo-400" size={20} /> Active Missions
               </h3>
               <Link to="/" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">View Dashboard</Link>
            </div>
            <div className="space-y-3">
               {missions.filter(m => !m.claimed).length === 0 ? (
                  <EmptyState
                     icon={Target}
                     title="Ready for Reassignment"
                     message="No active missions right now. Check the main board for new objectives."
                  />
               ) : (
                  missions.filter(m => !m.claimed).slice(0, 3).map(mission => (
                     <div key={mission.id} className="flex items-center gap-3 p-3 bg-white/50 dark:bg-slate-700/50 rounded-xl border border-white/80 dark:border-slate-600 shadow-sm">
                        <div className={`p-2 rounded-full ${mission.completed ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-600 text-slate-400'}`}>
                           {mission.completed ? <CheckCircle2 size={16} /> : <div className="w-4 h-4 rounded-full border-2 border-current" />}
                        </div>
                        <div className="flex-1">
                           <p className={`text-sm font-medium ${mission.completed ? 'text-slate-500 dark:text-slate-400 line-through' : 'text-slate-800 dark:text-white'}`}>
                              {mission.title || mission.name}
                           </p>
                           <div className="w-full bg-slate-200 dark:bg-slate-600 h-1 rounded-full mt-2 overflow-hidden">
                              <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${(mission.progress / (mission.total || mission.target || 1)) * 100}%` }}></div>
                           </div>
                        </div>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">+{mission.reward}pts</span>
                     </div>
                  ))
               )}
            </div>
         </div>

         {/* Badge Collection Grid */}
         <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-white/60 dark:border-slate-700/60 p-6">
            <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Award className="text-purple-600 dark:text-purple-400" size={20} /> Badge Collection
               </h3>
               <Link to="/badges" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">See All</Link>
            </div>

            {currentUser.badges.length > 0 ? (
               <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {currentUser.badges.map(badge => (
                     <div key={badge.id} className="flex flex-col items-center gap-2 p-3 bg-white/50 dark:bg-slate-700/50 rounded-xl border border-white/80 dark:border-slate-600 shadow-sm group hover:scale-105 transition-transform">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${badge.color || 'bg-indigo-100'} shadow-sm`}>
                           {badge.icon}
                        </div>
                        <span className="text-[10px] text-center font-bold text-slate-600 dark:text-slate-300 leading-tight line-clamp-2">
                           {badge.name}
                        </span>
                     </div>
                  ))}
                  <Link to="/badges" className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                     <span className="text-xs font-bold text-slate-400 text-center">View<br />All</span>
                  </Link>
               </div>
            ) : (
               <EmptyState
                  icon={Award}
                  title="Honors Pending"
                  message="No badges secured yet. Accomplish missions to fill your trophy cabinet!"
                  action={{
                     label: "Browse Honors",
                     onClick: () => navigate('/badges'),
                     icon: Award
                  }}
               />
            )}
         </div>

         {/* Navigation Menu */}
         <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-white/60 dark:border-slate-700/60 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700">
               <h3 className="font-bold text-slate-800 dark:text-white">Dossier Access</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
               {menuItems.map((item) => (
                  <Link
                     key={item.path}
                     to={item.path}
                     className="flex items-center justify-between p-4 hover:bg-white/80 dark:hover:bg-slate-700/50 transition-colors group"
                  >
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.bg} ${item.color}`}>
                           <item.icon size={20} />
                        </div>
                        <div>
                           <p className="font-medium text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{item.label}</p>
                           <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                        </div>
                     </div>
                     <ChevronRight size={18} className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                  </Link>
               ))}
            </div>
         </div>

         {/* Logout Button */}
         <button
            onClick={handleLogout}
            className="w-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-md text-red-500 font-bold p-4 rounded-2xl shadow-sm border border-white/60 dark:border-slate-700/60 flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-100 dark:hover:border-red-800/50 transition-colors"
         >
            <LogOut size={20} /> Abort Mission (Sign Out)
         </button>
      </div>
   );
};

export default Profile;