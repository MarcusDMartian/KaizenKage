import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Target, TrendingUp, Award, Flame, CheckCircle2, Lightbulb, ChevronRight, Zap, Check } from 'lucide-react';
import { CURRENT_USER, MOCK_MISSIONS, MOCK_IDEAS } from '../constants';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  // Local state to simulate point updates and claiming rewards without a backend
  const [currentUserPoints, setCurrentUserPoints] = useState(CURRENT_USER.points);
  const [missions, setMissions] = useState(MOCK_MISSIONS);

  const progressToNextLevel = (currentUserPoints / CURRENT_USER.nextLevelPoints) * 100;
  
  const data = [
    { name: 'Completed', value: currentUserPoints },
    { name: 'Remaining', value: CURRENT_USER.nextLevelPoints - currentUserPoints },
  ];
  // Indigo primary, Light gray secondary for chart
  const COLORS = ['#4f46e5', '#e2e8f0'];

  const handleClaimReward = (missionId: string, reward: number) => {
    setMissions(prev => prev.map(m => 
      m.id === missionId ? { ...m, claimed: true } : m
    ));
    setCurrentUserPoints(prev => prev + reward);
  };

  return (
    <div className="space-y-6 md:space-y-8 px-4 pt-4 md:px-0 md:pt-0 pb-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Welcome back, {CURRENT_USER.name.split(' ')[0]}!</h2>
            <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-red-50 text-orange-600 px-3 py-1.5 rounded-full border border-orange-100 shadow-sm">
                <Flame size={16} className="fill-orange-500 text-orange-500" />
                <span className="font-bold text-sm">{CURRENT_USER.streak} Day Streak</span>
            </div>
        </div>
        <p className="text-slate-500 text-sm">The war for improvement never ends. Ready to deploy?</p>
      </div>

      {/* Horizontal Scroll Stats */}
      <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 snap-x no-scrollbar">
        {/* Main Stats Card - Glass */}
        <div className="min-w-[85vw] md:min-w-0 md:w-full bg-white/60 backdrop-blur-xl p-5 rounded-3xl border border-white/60 shadow-xl shadow-indigo-100/40 relative overflow-hidden snap-center group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                 <Zap size={12} /> Rank Level
              </p>
              <h3 className="text-4xl font-extrabold text-slate-800 tracking-tighter">{currentUserPoints} <span className="text-sm font-bold text-slate-400">XP</span></h3>
            </div>
            
            <div className="h-16 w-16 relative">
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    innerRadius={22}
                    outerRadius={32}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center font-bold text-lg text-indigo-600">
                  {CURRENT_USER.level}
              </div>
            </div>
          </div>
          
          <div className="space-y-2 relative z-10">
            <div className="flex justify-between text-xs text-slate-500 font-bold uppercase">
              <span>Next: Level {CURRENT_USER.level + 1}</span>
              <span>{Math.round(progressToNextLevel)}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                style={{ width: `${progressToNextLevel}%` }}
              />
            </div>
          </div>
        </div>

        {/* Badges Preview Card */}
        <div className="min-w-[70vw] md:min-w-0 md:w-full bg-white/60 backdrop-blur-xl p-5 rounded-3xl border border-white/60 shadow-xl shadow-purple-100/40 snap-center flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Award size={18} className="text-purple-600" /> Medals
            </h3>
            <Link to="/badges" className="text-xs text-white font-bold bg-indigo-600 px-2 py-1 rounded hover:bg-indigo-700 transition-colors shadow-sm">View All</Link>
          </div>
          <div className="flex gap-3">
            {CURRENT_USER.badges.slice(0,3).map(badge => (
              <div key={badge.id} className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl bg-white border border-slate-100 shadow-md flex-shrink-0`}>
                {badge.icon}
              </div>
            ))}
             <div className="h-12 w-12 rounded-xl bg-white/50 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs font-bold">
              +{CURRENT_USER.badges.length > 3 ? CURRENT_USER.badges.length - 3 : 0}
            </div>
          </div>
        </div>

        {/* Impact Card */}
        <div className="min-w-[60vw] md:min-w-0 md:w-full bg-white/60 backdrop-blur-xl p-5 rounded-3xl border border-white/60 shadow-xl shadow-emerald-100/40 snap-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-emerald-500" /> War Stats
          </h3>
          <div className="grid grid-cols-2 gap-3">
             <div className="text-center p-3 bg-white/50 rounded-xl border border-white/80 shadow-sm">
                <p className="text-xl font-bold text-slate-800">5</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Tactics</p>
             </div>
             <div className="text-center p-3 bg-white/50 rounded-xl border border-white/80 shadow-sm">
                <p className="text-xl font-bold text-slate-800">12</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Honor</p>
             </div>
          </div>
        </div>
      </div>

      {/* Missions - Gradient Glass */}
      <div className="relative rounded-3xl p-6 overflow-hidden border border-white/40 shadow-xl shadow-indigo-100/50 group">
         <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-700 backdrop-blur-xl opacity-90"></div>
         <div className="absolute top-0 right-0 p-4 opacity-10">
            <Target size={120} className="text-white" />
         </div>
         
         <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
               <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Target className="text-indigo-200" size={20} /> Daily Operations
               </h3>
               <span className="text-xs font-bold text-indigo-100 bg-white/10 px-2 py-1 rounded-lg border border-white/10">
                  {missions.filter(m => m.completed && !m.claimed).length} Claimable
               </span>
            </div>
            
            <div className="space-y-3">
               {missions.map(mission => {
                  const percent = Math.min(100, (mission.progress / mission.total) * 100);
                  const isClaimable = mission.completed && !mission.claimed;
                  
                  return (
                    <div key={mission.id} className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between border border-white/10 hover:bg-white/20 transition-all gap-3">
                       <div className="flex items-center gap-4">
                          <div className={`flex-shrink-0 p-1.5 rounded-full ${mission.completed ? 'bg-emerald-400 text-white' : 'bg-white/20 text-indigo-100'}`}>
                             {mission.completed ? <CheckCircle2 size={18} /> : <div className="w-4 h-4 rounded-full border-2 border-current" />}
                          </div>
                          <div>
                             <p className={`font-semibold text-sm leading-tight ${mission.completed ? 'text-indigo-200 line-through' : 'text-white'}`}>
                                {mission.title}
                             </p>
                             <div className="flex items-center gap-2 mt-2">
                                <div className="h-1.5 w-24 bg-black/20 rounded-full overflow-hidden">
                                   <div className="h-full bg-emerald-400 transition-all duration-500" style={{ width: `${percent}%` }} />
                                </div>
                                <span className="text-[10px] font-bold text-indigo-100">{mission.progress}/{mission.total}</span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex-shrink-0 self-end sm:self-center">
                          {isClaimable ? (
                             <button 
                                onClick={() => handleClaimReward(mission.id, mission.reward)}
                                className="text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-lg shadow-lg shadow-orange-500/30 animate-pulse hover:scale-105 transition-transform flex items-center gap-1"
                             >
                                Claim +{mission.reward} XP
                             </button>
                          ) : mission.claimed ? (
                             <span className="text-xs font-bold text-indigo-200 flex items-center gap-1 opacity-70">
                                <Check size={14} /> Collected
                             </span>
                          ) : (
                             <span className="text-xs font-bold bg-white/20 text-white border border-white/20 px-2 py-1 rounded-md shadow-sm">
                                +{mission.reward} XP
                             </span>
                          )}
                       </div>
                    </div>
                  );
               })}
            </div>
         </div>
      </div>

      {/* Recent Activity Feed */}
      <div>
         <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Zap size={18} className="text-indigo-600 fill-indigo-600" /> Field Activity
            </h3>
            <ChevronRight size={20} className="text-slate-400" />
         </div>
         <div className="space-y-3">
            {MOCK_IDEAS.slice(0, 3).map(idea => (
               <div key={idea.id} className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-sm flex gap-4 active:bg-white/80 transition-colors">
                  <div className="flex-shrink-0 mt-0.5">
                     <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100 shadow-sm">
                        <Lightbulb size={20} />
                     </div>
                  </div>
                  <div className="min-w-0 flex-1">
                     <p className="text-sm text-slate-600 leading-snug">
                        <span className="font-bold text-slate-800">{idea.author.name}</span> deployed tactic <span className="font-medium text-indigo-600">"{idea.title}"</span>
                     </p>
                     <p className="text-xs text-slate-400 mt-2 font-medium flex items-center gap-2">
                        {idea.createdAt} • <span className="text-slate-500 bg-slate-100 px-1.5 rounded">{idea.impact}</span>
                     </p>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default Dashboard;