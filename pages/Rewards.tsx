import React from 'react';
import { ShoppingBag, Wallet, History, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { MOCK_REWARDS, MOCK_TRANSACTIONS, CURRENT_USER } from '../constants';

const Rewards: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Wallet Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg">
         <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
               <p className="text-slate-400 font-medium mb-1 flex items-center gap-2">
                  <Wallet size={18} /> Your Balance
               </p>
               <h2 className="text-4xl font-bold text-white tracking-tight">{CURRENT_USER.points.toLocaleString()} pts</h2>
            </div>
            <div className="flex gap-3">
               <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md shadow-amber-500/20 transition-all">
                  How to earn?
               </button>
            </div>
         </div>
      </div>

      {/* Reward Catalog Section */}
      <section>
          <div className="flex items-center gap-2 mb-6">
             <ShoppingBag className="text-slate-700" />
             <h3 className="text-xl font-bold text-slate-800">Reward Catalog</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {MOCK_REWARDS.map(reward => (
                <div key={reward.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all group">
                   <div className="h-40 w-full overflow-hidden relative">
                      <img src={reward.image} alt={reward.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {reward.stock < 10 && (
                         <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                            Low Stock: {reward.stock}
                         </span>
                      )}
                   </div>
                   <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                         <span className="text-[10px] font-bold uppercase text-slate-400 border border-slate-200 px-2 py-0.5 rounded">
                            {reward.type}
                         </span>
                      </div>
                      <h4 className="font-bold text-slate-800 mb-1">{reward.name}</h4>
                      
                      <div className="mt-4 flex items-center justify-between">
                         <span className="font-bold text-indigo-600">{reward.cost} pts</span>
                         <button 
                            disabled={CURRENT_USER.points < reward.cost}
                            className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                               CURRENT_USER.points >= reward.cost 
                               ? 'bg-slate-900 text-white hover:bg-slate-800' 
                               : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                         >
                            Redeem
                         </button>
                      </div>
                   </div>
                </div>
             ))}
          </div>
      </section>

      {/* Transaction History Section */}
      <section>
          <div className="flex items-center gap-2 mb-6">
             <History className="text-slate-700" />
             <h3 className="text-xl font-bold text-slate-800">Transaction History</h3>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
             {MOCK_TRANSACTIONS.length > 0 ? (
               <div className="divide-y divide-slate-100">
                 {MOCK_TRANSACTIONS.map(transaction => (
                   <div key={transaction.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                     <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                         transaction.type === 'earn' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'
                       }`}>
                         {transaction.type === 'earn' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                       </div>
                       <div>
                         <p className="font-medium text-slate-800">{transaction.description}</p>
                         <p className="text-xs text-slate-500">{transaction.date}</p>
                       </div>
                     </div>
                     <span className={`font-bold ${
                       transaction.type === 'earn' ? 'text-emerald-600' : 'text-slate-900'
                     }`}>
                       {transaction.type === 'earn' ? '+' : ''}{transaction.amount}
                     </span>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="p-8 text-center text-slate-500">
                 No transactions found.
               </div>
             )}
          </div>
      </section>
    </div>
  );
};

export default Rewards;
