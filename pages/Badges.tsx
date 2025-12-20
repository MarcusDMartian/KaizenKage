import React from 'react';
import { Award, Lock } from 'lucide-react';
import { MOCK_BADGES, CURRENT_USER } from '../constants';

const Badges: React.FC = () => {
  const unlockedBadgeIds = new Set(CURRENT_USER.badges.map(b => b.id));
  const progressPercentage = (unlockedBadgeIds.size / MOCK_BADGES.length) * 100;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Award size={200} />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
             <Award className="text-yellow-300" fill="currentColor" /> Badge Collection
          </h2>
          <p className="text-indigo-100 max-w-xl">
             Collect badges by contributing ideas, recognizing peers, and maintaining consistency. Show off your achievements!
          </p>
          
          <div className="mt-6 max-w-md">
             <div className="flex justify-between text-sm font-medium mb-2 text-indigo-100">
                <span>Total Unlocked</span>
                <span>{unlockedBadgeIds.size} / {MOCK_BADGES.length}</span>
             </div>
             <div className="h-3 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                <div 
                   className="h-full bg-yellow-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                   style={{ width: `${progressPercentage}%` }}
                />
             </div>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {MOCK_BADGES.map((badge) => {
          const isUnlocked = unlockedBadgeIds.has(badge.id);
          
          return (
            <div 
               key={badge.id} 
               className={`relative group rounded-xl p-6 border transition-all duration-300 ${
                  isUnlocked 
                  ? 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1' 
                  : 'bg-slate-50 border-slate-200 opacity-70 hover:opacity-100'
               }`}
            >
               {/* Badge Icon */}
               <div className="flex justify-center mb-4">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-sm transition-transform duration-300 ${
                     isUnlocked 
                     ? `${badge.color} group-hover:scale-110` 
                     : 'bg-slate-200 text-slate-400 grayscale'
                  }`}>
                     {badge.icon}
                  </div>
               </div>

               {/* Lock Overlay for locked badges */}
               {!isUnlocked && (
                  <div className="absolute top-3 right-3 text-slate-400">
                     <Lock size={16} />
                  </div>
               )}

               {/* Content */}
               <div className="text-center">
                  <h3 className={`font-bold mb-1 ${isUnlocked ? 'text-slate-800' : 'text-slate-500'}`}>
                     {badge.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                     {badge.description}
                  </p>
               </div>

               {/* Status Tag */}
               <div className="mt-4 flex justify-center">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                     isUnlocked 
                     ? 'bg-green-100 text-green-700' 
                     : 'bg-slate-200 text-slate-500'
                  }`}>
                     {isUnlocked ? 'Unlocked' : 'Locked'}
                  </span>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Badges;
