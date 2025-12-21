import React, { useState, useEffect } from 'react';
import { ShoppingBag, Wallet, History, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, XCircle, Package } from 'lucide-react';
import { Reward, PointTransaction, RedemptionRequest } from '../types';
import {
   getRewards,
   getTransactions,
   getCurrentUser,
   updateUserPoints,
   addTransaction,
   updateRewardStock,
   addRedemption,
   getRedemptions,
   generateId
} from '../services/storageService';
import RedeemModal from '../components/RedeemModal';

const Rewards: React.FC = () => {
   const [rewards, setRewards] = useState<Reward[]>([]);
   const [transactions, setTransactions] = useState<PointTransaction[]>([]);
   const [redemptions, setRedemptions] = useState<RedemptionRequest[]>([]);
   const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isProcessing, setIsProcessing] = useState(false);
   const [redeemSuccess, setRedeemSuccess] = useState(false);
   const [activeSection, setActiveSection] = useState<'catalog' | 'history'>('catalog');

   const currentUser = getCurrentUser();

   useEffect(() => {
      setRewards(getRewards());
      setTransactions(getTransactions());
      setRedemptions(getRedemptions());
   }, []);

   const handleRedeemClick = (reward: Reward) => {
      setSelectedReward(reward);
      setIsModalOpen(true);
      setRedeemSuccess(false);
   };

   const handleConfirmRedeem = () => {
      if (!selectedReward) return;

      setIsProcessing(true);

      // Simulate processing delay
      setTimeout(() => {
         // Deduct points
         updateUserPoints(-selectedReward.cost);

         // Add transaction
         addTransaction({
            id: generateId(),
            description: `Redeemed: ${selectedReward.name}`,
            amount: -selectedReward.cost,
            type: 'spend',
            date: 'Just now'
         });

         // Update stock
         updateRewardStock(selectedReward.id, selectedReward.stock - 1);

         // Create redemption request
         addRedemption({
            id: generateId(),
            rewardId: selectedReward.id,
            rewardName: selectedReward.name,
            rewardImage: selectedReward.image,
            pointsCost: selectedReward.cost,
            status: 'pending',
            requestedAt: new Date().toLocaleDateString()
         });

         // Refresh data
         setRewards(getRewards());
         setTransactions(getTransactions());
         setRedemptions(getRedemptions());
         setIsProcessing(false);
         setRedeemSuccess(true);
      }, 1500);
   };

   const handleCloseModal = () => {
      setIsModalOpen(false);
      setSelectedReward(null);
      setRedeemSuccess(false);
   };

   const getStatusIcon = (status: string) => {
      switch (status) {
         case 'fulfilled':
            return <CheckCircle2 size={16} className="text-green-600" />;
         case 'approved':
            return <Package size={16} className="text-blue-600" />;
         case 'rejected':
            return <XCircle size={16} className="text-red-500" />;
         default:
            return <Clock size={16} className="text-amber-500" />;
      }
   };

   const getStatusColor = (status: string) => {
      switch (status) {
         case 'fulfilled':
            return 'bg-green-100 text-green-700';
         case 'approved':
            return 'bg-blue-100 text-blue-700';
         case 'rejected':
            return 'bg-red-100 text-red-700';
         default:
            return 'bg-amber-100 text-amber-700';
      }
   };

   return (
      <div className="max-w-6xl mx-auto space-y-10 px-4 md:px-0">
         {/* Wallet Header */}
         <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div>
                  <p className="text-slate-400 font-medium mb-1 flex items-center gap-2">
                     <Wallet size={18} /> Your Balance
                  </p>
                  <h2 className="text-4xl font-bold text-white tracking-tight">{currentUser.points.toLocaleString()} pts</h2>
               </div>
               <div className="flex gap-3">
                  <button
                     onClick={() => setActiveSection(activeSection === 'catalog' ? 'history' : 'catalog')}
                     className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all border border-white/10"
                  >
                     {activeSection === 'catalog' ? 'View History' : 'View Catalog'}
                  </button>
               </div>
            </div>
         </div>

         {activeSection === 'catalog' ? (
            <>
               {/* Reward Catalog Section */}
               <section>
                  <div className="flex items-center gap-2 mb-6">
                     <ShoppingBag className="text-slate-700" />
                     <h3 className="text-xl font-bold text-slate-800">Reward Catalog</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                     {rewards.map(reward => (
                        <div key={reward.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all group">
                           <div className="h-40 w-full overflow-hidden relative">
                              <img src={reward.image} alt={reward.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              {reward.stock === 0 ? (
                                 <span className="absolute top-2 right-2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                                    Out of Stock
                                 </span>
                              ) : reward.stock < 10 && (
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
                                 <span className="font-bold text-indigo-600">{reward.cost.toLocaleString()} pts</span>
                                 <button
                                    onClick={() => handleRedeemClick(reward)}
                                    disabled={currentUser.points < reward.cost || reward.stock === 0}
                                    className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${currentUser.points >= reward.cost && reward.stock > 0
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
                     <h3 className="text-xl font-bold text-slate-800">Recent Transactions</h3>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                     {transactions.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                           {transactions.slice(0, 5).map(transaction => (
                              <div key={transaction.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                 <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === 'earn' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'
                                       }`}>
                                       {transaction.type === 'earn' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                    </div>
                                    <div>
                                       <p className="font-medium text-slate-800">{transaction.description}</p>
                                       <p className="text-xs text-slate-500">{transaction.date}</p>
                                    </div>
                                 </div>
                                 <span className={`font-bold ${transaction.type === 'earn' ? 'text-emerald-600' : 'text-slate-900'
                                    }`}>
                                    {transaction.type === 'earn' ? '+' : ''}{transaction.amount.toLocaleString()}
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
            </>
         ) : (
            <>
               {/* Redemption History Section */}
               <section>
                  <div className="flex items-center gap-2 mb-6">
                     <Package className="text-slate-700" />
                     <h3 className="text-xl font-bold text-slate-800">Redemption History</h3>
                  </div>

                  <div className="space-y-4">
                     {redemptions.length > 0 ? (
                        redemptions.map(redemption => (
                           <div key={redemption.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
                              <img
                                 src={redemption.rewardImage}
                                 alt={redemption.rewardName}
                                 className="w-16 h-16 rounded-lg object-cover"
                              />
                              <div className="flex-1">
                                 <h4 className="font-bold text-slate-800">{redemption.rewardName}</h4>
                                 <p className="text-sm text-slate-500">Requested: {redemption.requestedAt}</p>
                              </div>
                              <div className="text-right">
                                 <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${getStatusColor(redemption.status)}`}>
                                    {getStatusIcon(redemption.status)}
                                    {redemption.status.charAt(0).toUpperCase() + redemption.status.slice(1)}
                                 </span>
                                 <p className="text-sm font-bold text-slate-600 mt-1">-{redemption.pointsCost} pts</p>
                              </div>
                           </div>
                        ))
                     ) : (
                        <div className="bg-white rounded-xl border border-slate-100 p-8 text-center text-slate-500">
                           No redemptions yet. Start redeeming rewards!
                        </div>
                     )}
                  </div>

                  {/* All Transactions */}
                  <div className="mt-10">
                     <div className="flex items-center gap-2 mb-6">
                        <History className="text-slate-700" />
                        <h3 className="text-xl font-bold text-slate-800">All Transactions</h3>
                     </div>

                     <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                        {transactions.length > 0 ? (
                           <div className="divide-y divide-slate-100">
                              {transactions.map(transaction => (
                                 <div key={transaction.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                       <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === 'earn' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'
                                          }`}>
                                          {transaction.type === 'earn' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                       </div>
                                       <div>
                                          <p className="font-medium text-slate-800">{transaction.description}</p>
                                          <p className="text-xs text-slate-500">{transaction.date}</p>
                                       </div>
                                    </div>
                                    <span className={`font-bold ${transaction.type === 'earn' ? 'text-emerald-600' : 'text-slate-900'
                                       }`}>
                                       {transaction.type === 'earn' ? '+' : ''}{transaction.amount.toLocaleString()}
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
                  </div>
               </section>
            </>
         )}

         {/* Redeem Modal */}
         <RedeemModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onConfirm={handleConfirmRedeem}
            reward={selectedReward}
            userPoints={currentUser.points}
            isProcessing={isProcessing}
            success={redeemSuccess}
         />
      </div>
   );
};

export default Rewards;
