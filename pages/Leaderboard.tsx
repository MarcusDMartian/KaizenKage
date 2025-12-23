import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import Leaderboard from '../components/Leaderboard';
import { getLeaderboard as apiGetLeaderboard, getCurrentUser as apiGetCurrentUser, User } from '../services/apiService';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LeaderboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<'month' | 'quarter' | 'all'>('month');
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    try {
      const [usersData, userData] = await Promise.all([
        apiGetLeaderboard(period),
        apiGetCurrentUser()
      ]);
      setUsers(usersData);
      setCurrentUser(userData);
    } catch (error) {
      console.error('Failed to load leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Determine sort key
  const getSortKey = () => {
    switch (period) {
      case 'month': return 'monthlyPoints';
      case 'quarter': return 'quarterlyPoints';
      default: return 'totalPoints';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-0 pb-24">
      <div className="bg-indigo-900 rounded-2xl p-8 text-white mb-8 relative overflow-hidden shadow-lg">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Trophy size={180} />
        </div>

        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Trophy className="text-yellow-400" fill="currentColor" /> Hall of Fame
          </h2>
          <p className="text-indigo-200">Recognizing our top contributors and continuous improvers.</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">

        {/* Period Toggles */}
        <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg overflow-auto max-w-full">
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${period === 'month' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
          >
            This Month
          </button>
          <button
            onClick={() => setPeriod('quarter')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${period === 'quarter' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
          >
            This Quarter
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${period === 'all' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Leaderboard Component */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 size={32} className="animate-spin text-indigo-600" />
        </div>
      ) : (
        <Leaderboard
          users={users}
          sortBy={getSortKey()}
          showTeamFilter={true}
          currentUser={currentUser}
        />
      )}

    </div>
  );
};

export default LeaderboardPage;
