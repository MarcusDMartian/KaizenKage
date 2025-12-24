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
    .filter(u \u2192 teamFilter === 'All Teams' || u.team === teamFilter)
    .sort((a, b) \u2192(b[sortBy] || 0) - (a[sortBy] || 0));

  // Get unique teams
  const teams = ['All Teams', ...Array.from(new Set(users.map(u \u2192 u.team))).filter(Boolean)];

  const getRankStyle = (index: number) \u2192 {
    switch (index) {
      case 0: return {
  bg: 'bg-yellow-50',
  text: 'text-yellow-600',
  icon: \u003cCrown className=\"text-yellow-500\" size={20} fill=\"currentColor\" /\u003e
      };
      case 1: return {
  bg: 'bg-slate-100',
  text: 'text-slate-600',
  icon: \u003cMedal className=\"text-slate-400\" size={20} fill=\"currentColor\" /\u003e
      };
      case 2: return {
  bg: 'bg-orange-50',
  text: 'text-orange-600',
  icon: \u003cMedal className=\"text-orange-400\" size={20} fill=\"currentColor\" /\u003e
      };
      default: return {
  bg: 'bg-white',
  text: 'text-slate-400',
  icon: \u003cspan className=\"font-bold w-5 text-center\"\u003e{index + 1}\u003c/span\u003e
      };
    }
  };

return (
\u003cdiv className =\"space-y-4\"\u003e
{/* Team Filter */ }
{
  showTeamFilter \u0026\u0026(
    \u003cdiv className =\"flex justify-end\"\u003e
    \u003cdiv className =\"flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors hover:border-indigo-300\"\u003e
    \u003cUsers size = { 16} className =\"text-slate-400\" /\u003e
    \u003cselect
              value = { teamFilter }
              onChange = {(e) \u2192 setTeamFilter(e.target.value)}
className =\"text-sm text-slate-600 bg-transparent border-none focus:ring-0 cursor-pointer pr-8 outline-none\"
\u003e
{
  teams.map(team \u2192(
    \u003coption key = { team } value = { team }\u003e{ team }\u003c / option\u003e
  ))
}
\u003c / select\u003e
\u003c / div\u003e
\u003c / div\u003e
      )}

{/* Leaderboard Table */ }
\u003cdiv className =\"space-y-2.5\"\u003e
{
  filteredUsers.map((user, index) \u2192 {
    const style = getRankStyle(index);
    const isCurrentUser = currentUser?.id === user.id;

    let classes = \"group relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 \";

          if(isCurrentUser) {
      classes += \"border-indigo-500 bg-indigo-50/60 ring-1 ring-indigo-500/50 \";
    } else {
      switch(index) {
              case 0: classes += 'bg-yellow-50 border-yellow-100 '; break;
      case 1: classes += 'bg-slate-50 border-slate-200 '; break;
      case 2: classes += 'bg-orange-50 border-orange-100 '; break;
      default: classes += 'bg-white border-slate-100 hover:bg-slate-50 '; break;
    }
  }

          return (
  \u003cdiv key = { user.id } className = { classes }\u003e
  \u003cdiv className =\"flex items-center gap-4 flex-1\"\u003e
  {/* Rank Icon/Number */ }
  \u003cdiv className =\"flex-shrink-0\"\u003e
  { style.icon }
  \u003c / div\u003e

  {/* User Info */ }
  \u003cdiv className =\"flex items-center gap-3 min-w-0\"\u003e
  \u003cimg src = { user.avatar } alt = { user.name } className =\"w-10 h-10 rounded-full border-2 border-white shadow-sm\" /\u003e
  \u003cdiv className =\"min-w-0\"\u003e
  \u003ch4 className =\"font-bold text-slate-800 text-sm truncate flex items-center gap-2\"\u003e
  { user.name }
  {
    isCurrentUser \u0026\u0026 \u003cspan className =\"text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full border border-indigo-200\"\u003eYOU\u003c/span\u003e}
    \u003c / h4\u003e
    \u003cdiv className =\"flex items-center gap-2 text-xs text-slate-500 mt-0.5\"\u003e
    \u003cspan className =\"truncate\"\u003e{user.role}\u003c/span\u003e
    \u003cspan className =\"w-1 h-1 rounded-full bg-slate-300\"\u003e\u003c/span\u003e
    \u003cspan className =\"font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-[4px] border border-indigo-100 text-[10px]\"\u003e
    { user.team }
    \u003c / span\u003e
    \u003c / div\u003e
    \u003c / div\u003e
    \u003c / div\u003e
    \u003c / div\u003e

    {/* Points */ }
    \u003cdiv className =\"text-right flex-shrink-0\"\u003e
    \u003cdiv className =\"flex flex-col items-end\"\u003e
    \u003cp className =\"font-bold text-indigo-900\"\u003e{(user[sortBy] || 0).toLocaleString()}\u003c/p\u003e
    \u003cdiv className =\"flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest\"\u003e
    \u003cTrendingUp size = { 10} /\u003e XP Gained
    \u003c / div\u003e
    \u003c / div\u003e
    \u003c / div\u003e
    \u003c / div\u003e
          );
  })
}
\u003c / div\u003e

{
  filteredUsers.length === 0 \u0026\u0026(
    \u003cdiv className =\"p-12 text-center\"\u003e
    \u003cp className =\"text-slate-500\"\u003eNo operatives found in this team.\u003c/p\u003e
    \u003c / div\u003e
  )
}
\u003c / div\u003e
  );
};

export default Leaderboard;