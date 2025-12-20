import React from 'react';
import { Link } from 'react-router-dom';
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
import { CURRENT_USER, MOCK_MISSIONS } from '../constants';

const Profile: React.FC = () => {
  const menuItems = [
    { 
      label: 'Tactics', 
      path: '/ideas', 
      icon: Lightbulb, 
      color: 'text-blue-600', 
      bg: 'bg-blue-100',
      desc: 'Submit and vote on strategies'
    },
    { 
      label: 'Honor', 
      path: '/kudos', 
      icon: Heart, 
      color: 'text-rose-600', 
      bg: 'bg-rose-100',
      desc: 'Recognize your squad'
    },
    { 
      label: 'Rankings', 
      path: '/leaderboard', 
      icon: Trophy, 
      color: 'text-yellow-600', 
      bg: 'bg-yellow-100',
      desc: 'See top operatives'
    },
    { 
      label: 'Loot', 
      path: '/rewards', 
      icon: Gift, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-100',
      desc: 'Requisition supplies'
    },
    {
       label: 'Intel Report',
       path: '/feedback',
       icon: ShieldCheck,
       color: 'text-slate-600',
       bg: 'bg-slate-100',
       desc: 'Send encrypted feedback'
    }
  ];

  const progressPercent = Math.min(100, (CURRENT_USER.points / CURRENT_USER.nextLevelPoints) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
       {/* User Header */}
       <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-white/60 overflow-hidden group">
          <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
             <div className="absolute inset-0 bg-black/5"></div>
             <button className="absolute top-4 right-4 text-white/80 hover:text-white p-2">
                <Settings size={20} />
             </button>
          </div>
          <div className="px-6 pb-6">
             <div className="relative -mt-12 mb-4 flex justify-between items-end">
                <img src={CURRENT_USER.avatar} alt="" className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-white" />
             </div>
             
             <div>
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{CURRENT_USER.name}</h2>
                        <p className="text-slate-500">{CURRENT_USER.role} • {CURRENT_USER.team}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-xl border border-indigo-100 font-bold shadow-sm">
                        <Zap size={16} className="fill-indigo-600" />
                        <span>Level {CURRENT_USER.level}</span>
                    </div>
                </div>
             </div>

             {/* Level Progress Indicator */}
             <div className="mt-6 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Next Milestone</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-slate-800">{CURRENT_USER.points.toLocaleString()}</span>
                            <span className="text-xs font-medium text-slate-500">/ {CURRENT_USER.nextLevelPoints.toLocaleString()} XP</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-xs font-bold text-indigo-600">{Math.floor(progressPercent)}%</span>
                    </div>
                </div>
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.4)]"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
                <p className="text-xs text-slate-400 mt-2 font-medium flex items-center gap-1">
                    <Target size={12} />
                    {CURRENT_USER.nextLevelPoints - CURRENT_USER.points} XP needed for Level {CURRENT_USER.level + 1}
                </p>
             </div>

             <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white p-4 rounded-2xl text-center border border-slate-100 shadow-sm">
                   <span className="block text-2xl font-bold text-indigo-600">{CURRENT_USER.points.toLocaleString()}</span>
                   <span className="text-xs text-slate-400 uppercase font-bold tracking-wide">Total XP</span>
                </div>
                <div className="bg-white p-4 rounded-2xl text-center border border-slate-100 shadow-sm">
                   <span className="block text-2xl font-bold text-orange-500">{CURRENT_USER.streak}</span>
                   <span className="text-xs text-slate-400 uppercase font-bold tracking-wide">Day Streak</span>
                </div>
             </div>
          </div>
       </div>

       {/* Active Missions Section */}
       <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg shadow-slate-200/50 border border-white/60 p-6">
          <div className="flex items-center justify-between mb-4">
             <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Target className="text-indigo-600" size={20} /> Active Missions
             </h3>
             <Link to="/" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View Dashboard</Link>
          </div>
          <div className="space-y-3">
             {MOCK_MISSIONS.slice(0, 3).map(mission => (
                <div key={mission.id} className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-white/80 shadow-sm">
                   <div className={`p-2 rounded-full ${mission.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {mission.completed ? <CheckCircle2 size={16} /> : <div className="w-4 h-4 rounded-full border-2 border-current" />}
                   </div>
                   <div className="flex-1">
                      <p className={`text-sm font-medium ${mission.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                         {mission.title}
                      </p>
                      <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden">
                         <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${(mission.progress / mission.total) * 100}%` }}></div>
                      </div>
                   </div>
                   <span className="text-xs font-bold text-indigo-600">+{mission.reward}pts</span>
                </div>
             ))}
          </div>
       </div>

       {/* Badge Collection Grid */}
       <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg shadow-slate-200/50 border border-white/60 p-6">
          <div className="flex items-center justify-between mb-4">
             <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Award className="text-purple-600" size={20} /> Badge Collection
             </h3>
             <Link to="/badges" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">See All</Link>
          </div>
          
          {CURRENT_USER.badges.length > 0 ? (
             <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {CURRENT_USER.badges.map(badge => (
                   <div key={badge.id} className="flex flex-col items-center gap-2 p-3 bg-white/50 rounded-xl border border-white/80 shadow-sm group hover:scale-105 transition-transform">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${badge.color} shadow-sm`}>
                         {badge.icon}
                      </div>
                      <span className="text-[10px] text-center font-bold text-slate-600 leading-tight line-clamp-2">
                         {badge.name}
                      </span>
                   </div>
                ))}
                <Link to="/badges" className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 hover:bg-slate-100 transition-colors">
                   <span className="text-xs font-bold text-slate-400">View All</span>
                </Link>
             </div>
          ) : (
             <div className="text-center py-8 text-slate-500 text-sm">
                No badges earned yet. Keep contributing!
             </div>
          )}
       </div>

       {/* Navigation Menu */}
       <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg shadow-slate-200/50 border border-white/60 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
             <h3 className="font-bold text-slate-800">Dossier Access</h3>
          </div>
          <div className="divide-y divide-slate-100">
             {menuItems.map((item) => (
                <Link 
                   key={item.path} 
                   to={item.path}
                   className="flex items-center justify-between p-4 hover:bg-white/80 transition-colors group"
                >
                   <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.bg} ${item.color}`}>
                         <item.icon size={20} />
                      </div>
                      <div>
                         <p className="font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">{item.label}</p>
                         <p className="text-xs text-slate-500">{item.desc}</p>
                      </div>
                   </div>
                   <ChevronRight size={18} className="text-slate-400 group-hover:text-indigo-600" />
                </Link>
             ))}
          </div>
       </div>

       {/* Logout Button */}
       <button className="w-full bg-white/70 backdrop-blur-md text-red-500 font-bold p-4 rounded-2xl shadow-sm border border-white/60 flex items-center justify-center gap-2 hover:bg-red-50 hover:border-red-100 transition-colors">
          <LogOut size={20} /> Abort Mission (Sign Out)
       </button>
    </div>
  );
};

export default Profile;