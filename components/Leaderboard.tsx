import React, { useState } from 'react';
import { Trophy, Medal, Crown, TrendingUp, Users, Search, Filter } from 'lucide-react';
import { User } from '../types';

interface LeaderboardProps {
  users: any[];
  sortBy: string;
  showTeamFilter?: boolean;
  currentUser?: User;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  users,
  sortBy,
  showTeamFilter = false,
  currentUser
}) => {
  const [teamFilter, setTeamFilter] = useState('All Teams');

  // Filter users
  const filteredUsers = users
    .filter(u => teamFilter === 'All Teams' || u.team === teamFilter)
    .sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0));

  // Get unique teams
  const teams = ['All Teams', ...Array.from(new Set(users.map(u => u.team))).filter(Boolean)];

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0: return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-600',
        icon: <Crown className="text-yellow-500" size={20} fill="currentColor" />
      };
      case 1: return {
        bg: 'bg-slate-100',
        text: 'text-slate-600',
        icon: <Medal className="text-slate-400" size={20} fill="currentColor" />
      };
      case 2: return {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        icon: <Medal className="text-orange-400" size={20} fill="currentColor" />
      };
      default: return {
        bg: 'bg-white',
        text: 'text-slate-400',
        icon: <span className="font-bold w-5 text-center">{index + 1}</span>
      };
    }
  };

  return (
    <div className="space-y-4">
      {/* Team Filter */}
      {showTeamFilter && (
        <div className="flex justify-end">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors hover:border-indigo-300">
            <Users size={16} className="text-slate-400" />
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="text-sm text-slate-600 bg-transparent border-none focus:ring-0 cursor-pointer pr-8 outline-none"
            >
              {teams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="space-y-2.5">
        {filteredUsers.map((user, index) => {
          const style = getRankStyle(index);
          const isCurrentUser = currentUser?.id === user.id;

          let classes = "group relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ";

          if (isCurrentUser) {
            classes += "border-indigo-500 bg-indigo-50/60 ring-1 ring-indigo-500/50 ";
          } else {
            switch (index) {
              case 0: classes += 'bg-yellow-50 border-yellow-100 '; break;
              case 1: classes += 'bg-slate-50 border-slate-200 '; break;
              case 2: classes += 'bg-orange-50 border-orange-100 '; break;
              default: classes += 'bg-white border-slate-100 hover:bg-slate-50 '; break;
            }
          }

          return (
            <div key={user.id} className={classes}>
              <div className="flex items-center gap-4 flex-1">
                {/* Rank Icon/Number */}
                <div className="flex-shrink-0">
                  {style.icon}
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm truncate flex items-center gap-2">
                      {user.name}
                      {isCurrentUser && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full border border-indigo-200">YOU</span>}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="truncate">{user.role}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-[4px] border border-indigo-100 text-[10px]">
                        {user.team}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Points */}
              <div className="text-right flex-shrink-0">
                <div className="flex flex-col items-end">
                  <p className="font-bold text-indigo-900">{(user[sortBy] || 0).toLocaleString()}</p>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <TrendingUp size={10} /> XP Gained
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-slate-500">No operatives found in this team.</p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;