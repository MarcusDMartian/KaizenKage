import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Target, TrendingUp, Award, Flame, CheckCircle2, Lightbulb, ChevronRight, Zap, Check, Loader2, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
   getCurrentUser as apiGetCurrentUser,
   getMissions as apiGetMissions,
   getIdeas as apiGetIdeas,
   claimMission,
   User,
   Mission,
   Idea
} from '../services/apiService';
import { useTranslation } from 'react-i18next';
import EmptyState from '../components/EmptyState';

const Dashboard: React.FC = () => {
   const navigate = useNavigate();
   const { t } = useTranslation();
   const [currentUser, setCurrentUser] = useState<User | null>(null);
   const [missions, setMissions] = useState<Mission[]>([]);
   const [ideas, setIdeas] = useState<Idea[]>([]);
   const [loading, setLoading] = useState(true);
   const [claimingId, setClaimingId] = useState<string | null>(null);

   useEffect(() => {
      loadData();
   }, []);

   const loadData = async () => {
      try {
         const [user, missionsData, ideasData] = await Promise.all([
            apiGetCurrentUser(),
            apiGetMissions(),
            apiGetIdeas(),
         ]);
         setCurrentUser(user);
         setMissions(missionsData);
         setIdeas(ideasData);
      } catch (error) {
         console.error('Failed to load data:', error);
      } finally {
         setLoading(false);
      }
   };

   const handleClaimReward = async (missionId: string) => {
      setClaimingId(missionId);
      try {
         await claimMission(missionId);
         // Reload data to get updated points and missions
         await loadData();
      } catch (error) {
         console.error('Failed to claim mission:', error);
      } finally {
         setClaimingId(null);
      }
   };

   if (loading || !currentUser) {
      return (
         <div className="min-h-[50vh] flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-indigo-600" />
         </div>
      );
   }

   const nextLevelPts = currentUser.nextLevelPoints || 1000;
   const currentPts = currentUser.points || 0;
   const progressToNextLevel = (currentPts / nextLevelPts) * 100;

   const data = [
      { name: 'Completed', value: currentUser.points || 0 },
      { name: 'Remaining', value: Math.max(0, (currentUser.nextLevelPoints || 1000) - (currentUser.points || 0)) },
   ];
   const COLORS = ['#4f46e5', '#e2e8f0'];

   const completedMissions = missions.filter(m => m.completed && !m.claimed).length;
   const totalIdeas = ideas.filter(i => i.author.id === currentUser.id).length;
   const totalKudosReceived = (currentUser.badges?.length || 0) * 4;

   return (
      <div className="max-w-4xl mx-auto px-4 pt-2 md:px-0 pb-20 space-y-6">
         {/* Welcome Section */}
         <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
               <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                  {t('dashboard.welcome')}, {(currentUser.name || 'User').split(' ')[0]}!
               </h2>
               <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-full border border-orange-100 dark:border-orange-800/50 shadow-sm">
                  <Flame size={16} className="fill-orange-500 text-orange-500" />
                  <span className="font-bold text-sm">{currentUser.streak || 0} {t('dashboard.streak')}</span>
               </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{t('dashboard.quote')}</p>
         </div>

         {/* Horizontal Scroll Stats */}
         <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 snap-x no-scrollbar">
            {/* Main Stats Card - Glass */}
            <div className="min-w-[85vw] md:min-w-0 md:w-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-5 rounded-3xl border border-white/60 dark:border-slate-700/60 shadow-xl shadow-indigo-100/40 dark:shadow-none relative overflow-hidden snap-center group">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

               <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                     <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Zap size={12} /> Rank Level
                     </p>
                     <h3 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tighter">{(currentUser.points || 0).toLocaleString()} <span className="text-sm font-bold text-slate-400">XP</span></h3>
                  </div>
                  <div className="w-20 h-20 relative">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie
                              data={data}
                              cx="50%"
                              cy="50%"
                              innerRadius={25}
                              outerRadius={35}
                              paddingAngle={2}
                              dataKey="value"
                           >
                              {data.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={COLORS[index]} />
                              ))}
                           </Pie>
                        </PieChart>
                     </ResponsiveContainer>
                     <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">{currentUser.level || 1}</span>
                     </div>
                  </div>
               </div>

               <div className="space-y-2 relative z-10">
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                     <span>Progress to Level {(currentUser.level || 1) + 1}</span>
                     <span className="text-indigo-600 dark:text-indigo-400 font-bold">{Math.round(progressToNextLevel)}%</span>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                     <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, progressToNextLevel)}%` }}
                     />
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{(currentUser.nextLevelPoints || 1000) - (currentUser.points || 0)} XP needed</p>
               </div>
            </div>
         </div>

         {/* Quick Stats Grid */}
         <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
               <Target size={20} className="text-emerald-600 dark:text-emerald-400 mb-2" />
               <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{completedMissions}</p>
               <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">Missions Ready</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/50">
               <TrendingUp size={20} className="text-blue-600 dark:text-blue-400 mb-2" />
               <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{totalIdeas}</p>
               <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Ideas Posted</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 p-4 rounded-2xl border border-amber-100 dark:border-amber-800/50">
               <Award size={20} className="text-amber-600 dark:text-amber-400 mb-2" />
               <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{totalKudosReceived}</p>
               <p className="text-xs text-amber-600/70 dark:text-amber-400/70">Kudos Received</p>
            </div>
         </div>

         {/* Daily Operations */}
         <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-indigo-600 dark:text-indigo-400" />
                  Daily Operations
               </h3>
               <span className="text-sm text-slate-500 dark:text-slate-400">{missions.filter(m => m.claimed).length}/{missions.length}</span>
            </div>

            <div className="space-y-3">
               {missions.filter(m => !m.claimed).length === 0 ? (
                  <EmptyState
                     icon={Target}
                     title="No Missions Active"
                     message="You've cleared all current operations! Check back later for new assignments."
                  />
               ) : (
                  missions.filter(m => !m.claimed).slice(0, 4).map((mission) => (
                     <div
                        key={mission.id}
                        className={`p-4 rounded-xl border transition-all ${mission.completed
                           ? 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50'
                           : 'bg-slate-50/50 dark:bg-slate-700/50 border-slate-100 dark:border-slate-700'
                           }`}
                     >
                        <div className="flex items-start justify-between mb-2">
                           <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${mission.completed
                                 ? 'bg-emerald-500 text-white'
                                 : 'bg-slate-100 dark:bg-slate-600 text-slate-400 dark:text-slate-300'
                                 }`}>
                                 {mission.completed ? <Check size={16} /> : <Target size={16} />}
                              </div>
                              <div>
                                 <p className={`font-medium ${mission.completed ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-200'}`}>
                                    {mission.name}
                                 </p>
                                 <p className="text-xs text-slate-500 dark:text-slate-400">{mission.description}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">+{mission.reward}</span>
                              {mission.completed && !mission.claimed && (
                                 <button
                                    onClick={() => handleClaimReward(mission.id)}
                                    disabled={claimingId === mission.id}
                                    className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full hover:bg-emerald-600 transition-colors disabled:opacity-50"
                                 >
                                    {claimingId === mission.id ? <Loader2 size={12} className="animate-spin" /> : 'Claim'}
                                 </button>
                              )}
                              {mission.claimed && (
                                 <span className="text-xs text-slate-400 dark:text-slate-500">Claimed</span>
                              )}
                           </div>
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                           <div
                              className={`h-full rounded-full transition-all ${mission.completed
                                 ? 'bg-emerald-500'
                                 : 'bg-indigo-500'
                                 }`}
                              style={{ width: `${Math.min(100, (mission.progress / mission.target) * 100)}%` }}
                           />
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{mission.progress}/{mission.target}</p>
                     </div>
                  ))
               )}
            </div>
         </div>

         {/* Recent Field Activity */}
         <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                  <Lightbulb size={20} className="text-amber-500" />
                  Recent Ideas
               </h3>
               <Link to="/ideas" className="text-indigo-600 dark:text-indigo-400 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                  View All <ChevronRight size={16} />
               </Link>
            </div>

            <div className="space-y-3">
               {ideas.length === 0 ? (
                  <EmptyState
                     icon={Lightbulb}
                     title="Intel Feed Empty"
                     message="No ideas have been submitted yet. Be the first to suggest a tactical improvement!"
                     action={{
                        label: "Submit First Idea",
                        onClick: () => navigate('/ideas', { state: { mode: 'create' } }),
                        icon: Plus
                     }}
                  />
               ) : (
                  ideas.slice(0, 3).map((idea) => (
                     <div
                        key={idea.id}
                        onClick={() => navigate(`/ideas/${idea.id}`)}
                        className="p-4 bg-slate-50/50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600 hover:border-indigo-200 dark:hover:border-indigo-700 transition-all cursor-pointer"
                     >
                        <div className="flex items-start gap-3">
                           <img
                              src={idea.author.avatar}
                              alt={idea.author.name}
                              className="w-10 h-10 rounded-full object-cover"
                           />
                           <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-800 dark:text-white truncate">{idea.title}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{idea.author.name} · {idea.createdAt}</p>
                           </div>
                           <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                              <span className="text-sm font-bold">{idea.votes}</span>
                              <TrendingUp size={14} />
                           </div>
                        </div>
                     </div>
                  ))
               )}
            </div>
         </div>
      </div>
   );
};

export default Dashboard;