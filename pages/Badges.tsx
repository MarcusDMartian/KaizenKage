import React, { useState, useEffect } from 'react';
import { Award, Lock, Check, Loader2 } from 'lucide-react';
import { getCurrentUser as apiGetCurrentUser, getBadges as apiGetBadges, User, Badge } from '../services/apiService';
import { useTranslation } from 'react-i18next';
import EmptyState from '../components/EmptyState';

const Badges: React.FC = () => {
   const { t } = useTranslation();
   const [currentUser, setCurrentUser] = useState<User | null>(null);
   const [badges, setBadges] = useState<Badge[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      loadData();
   }, []);

   const loadData = async () => {
      try {
         const [badgesData, userData] = await Promise.all([
            apiGetBadges(),
            apiGetCurrentUser()
         ]);
         setBadges(badgesData);
         setCurrentUser(userData);
      } catch (error) {
         console.error('Failed to load badges:', error);
      } finally {
         setLoading(false);
      }
   };

   if (loading || !currentUser) {
      return (
         <div className="min-h-[50vh] flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-indigo-600" />
         </div>
      );
   }

   const unlockedBadgeCount = badges.filter(b => b.unlocked).length;
   const progressPercentage = badges.length > 0 ? (unlockedBadgeCount / badges.length) * 100 : 0;

   return (
      <div className="max-w-5xl mx-auto space-y-8 px-4 md:px-0 pb-24">
         {/* Header Section */}
         <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <Award size={200} />
            </div>
            <div className="relative z-10">
               <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <Award className="text-yellow-300" fill="currentColor" /> {t('badges.title')}
               </h2>
               <p className="text-indigo-100 max-w-xl">
                  {t('badges.description')}
               </p>

               <div className="mt-6 max-w-md">
                  <div className="flex justify-between text-sm font-medium mb-2 text-indigo-100">
                     <span>{t('badges.unlockedCount')}</span>
                     <span>{unlockedBadgeCount} / {badges.length}</span>
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
            {badges.length === 0 ? (
               <div className="col-span-full">
                  <EmptyState
                     icon={Award}
                     title="Award Chamber Empty"
                     message="No badges have been defined for the platform yet. Check back soon for new achievements!"
                  />
               </div>
            ) : (
               badges.map((badge) => {
                  const isUnlocked = badge.unlocked;

                  return (
                     <div
                        key={badge.id}
                        className={`relative group rounded-xl p-6 border transition-all duration-300 ${isUnlocked
                           ? 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1'
                           : 'bg-slate-50 border-slate-200 opacity-70 hover:opacity-100'
                           }`}
                     >
                        {!isUnlocked && (
                           <div className="absolute top-3 right-3 text-slate-400">
                              <Lock size={16} />
                           </div>
                        )}

                        <div className="flex justify-center mb-4">
                           <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-sm transition-transform duration-300 ${isUnlocked
                              ? `${badge.color || 'bg-indigo-100'} group-hover:scale-110`
                              : 'bg-slate-200 text-slate-400 grayscale'
                              }`}>
                              {badge.icon}
                           </div>
                        </div>

                        <div className="text-center">
                           <h3 className={`font-bold mb-1 ${isUnlocked ? 'text-slate-800' : 'text-slate-500'}`}>
                              {badge.name}
                           </h3>
                           <p className="text-xs text-slate-500 leading-relaxed font-medium">
                              {badge.description}
                           </p>
                        </div>

                        <div className="mt-4 flex justify-center">
                           <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${isUnlocked
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-200 text-slate-500'
                              }`}>
                              {isUnlocked ? t('badges.unlocked') : t('badges.locked')}
                           </span>
                        </div>
                     </div>
                  );
               })
            )}
         </div>
      </div>
   );
};

export default Badges;
