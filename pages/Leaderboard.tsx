import React, { useState } from 'react';
import { Trophy } from 'lucide-react';
import Leaderboard from '../components/Leaderboard';
import { MOCK_USERS } from '../constants';

const LeaderboardPage: React.FC = () => {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'all'>('month');

  // Determine sort key
  const getSortKey = () => {
    switch (period) {
      case 'month': return 'monthlyPoints';
      case 'quarter': return 'quarterlyPoints';
      default: return 'points';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
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
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        
        {/* Period Toggles */}
        <div className="flex bg-slate-100 p-1 rounded-lg overflow-auto max-w-full">
          <button 
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
              period === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            This Month
          </button>
          <button 
            onClick={() => setPeriod('quarter')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
              period === 'quarter' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            This Quarter
          </button>
          <button 
            onClick={() => setPeriod('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
              period === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Leaderboard Component */}
      <Leaderboard 
        users={MOCK_USERS} 
        sortBy={getSortKey()} 
        showTeamFilter={true}
      />

    </div>
  );
};

export default LeaderboardPage;
