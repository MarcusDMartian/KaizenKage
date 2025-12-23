import React, { useState, useMemo } from 'react';
import { Trophy, Medal, Crown, Filter, Users } from 'lucide-react';
import EmptyState from './EmptyState';

interface LeaderboardProps {
  users: any[];
  sortBy: string;
  limit?: number;
  showTeamFilter?: boolean;
  currentUser?: any;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ users, sortBy, limit, showTeamFilter = false, currentUser }) => {
  const [selectedTeam, setSelectedTeam] = useState('all');

  // Derive unique teams from props
  const teams = useMemo(() => {
    return Array.from(new Set(users.map(u => u.team))).sort();
  }, [users]);

  // Filter users based on selected team
  const filteredUsers = useMemo(() => {
    if (!showTeamFilter || selectedTeam === 'all') return users;
    return users.filter(u => u.team === selectedTeam);
  }, [users, selectedTeam, showTeamFilter]);

  // Sort users descending
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0));
  }, [filteredUsers, sortBy]);

  const displayUsers = limit ? sortedUsers.slice(0, limit) : sortedUsers;

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown size={24} className="text-yellow-500 fill-yellow-500 drop-shadow-sm" />;
      case 1:
        return <Medal size={24} className="text-slate-400 fill-slate-300 drop-shadow-sm" />;
      case 2:
        return <Medal size={24} className="text-amber-700 fill-amber-600 drop-shadow-sm" />;
      default:
        return <span className="text-slate-500 font-bold w-6 text-center">{index + 1}</span>;
    }
  };

  const getRowStyle = (index: number, isCurrentUser: boolean) => {
    let classes = "flex items-center p-4 rounded-xl border transition-all shadow-sm ";

    if (isCurrentUser) {
      classes += "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-900/30 ring-1 ring-indigo-500/50 ";
    } else {
      switch (index) {
        case 0: classes += 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-100 dark:border-yellow-900/30 '; break;
        case 1: classes += 'bg-slate-50 dark:bg-slate-700/10 border-slate-200 dark:border-slate-700/30 '; break;
        case 2: classes += 'bg-amber-50 dark:bg-amber-700/10 border-amber-100 dark:border-amber-700/30 '; break;
        default: classes += 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 '; break;
      }
    }
    return classes;
  };

  return (
    <div className="w-full space-y-3">
      {/* Internal Team Filter */}
      {showTeamFilter && users.length > 0 && (
        <div className="flex justify-end mb-2">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-colors hover:border-indigo-300">
            <Filter size={14} className="text-slate-400" />
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="text-sm text-slate-600 dark:text-slate-300 bg-transparent border-none focus:ring-0 cursor-pointer pr-8 outline-none"
            >
              <option value="all">All Teams</option>
              {teams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* User Rows */}
      {displayUsers.length > 0 ? (
        displayUsers.map((user, index) => {
          const isCurrentUser = user.id === currentUser?.id;

          return (
            <div
              key={user.id}
              className={getRowStyle(index, isCurrentUser)}
            >
              {/* Rank */}
              <div className="w-12 flex-shrink-0 flex items-center justify-center">
                {getRankIcon(index)}
              </div>

              {/* User Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative">
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-700 shadow-sm" />
                  {index === 0 && (
                    <div className="absolute -top-2 -right-1">
                      <Trophy size={14} className="text-yellow-600 fill-yellow-400" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate flex items-center gap-2">
                    {user.name}
                    {isCurrentUser && <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">YOU</span>}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="truncate">{user.team}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded-[4px] border border-indigo-100 dark:border-indigo-800/50 text-[10px]">
                      Lvl {user.level}
                    </span>
                  </div>
                </div>
              </div>

              {/* Badges (Desktop Only) */}
              <div className="hidden sm:flex gap-1 mx-4">
                {user.badges && user.badges.slice(0, 3).map((badge: any) => (
                  <div key={badge.id} title={badge.name} className={`w-6 h-6 rounded flex items-center justify-center text-xs ${badge.color}`}>
                    {badge.icon}
                  </div>
                ))}
              </div>

              {/* Points */}
              <div className="text-right">
                <p className="font-bold text-indigo-900 dark:text-indigo-400">{(user[sortBy] || 0).toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 font-medium uppercase">{sortBy === 'points' ? 'XP' : sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}</p>
              </div>
            </div>
          );
        })
      ) : (
        <div className="p-8">
          <EmptyState
            icon={Users}
            title="No Operatives Ranked"
            message="The data feed for this filter is currently silent. Reconfigure search parameters or wait for mission logs."
          />
        </div>
      )}
    </div>
  );
};

export default Leaderboard;