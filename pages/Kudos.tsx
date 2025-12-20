import React, { useState } from 'react';
import { Heart, Send, Sparkles, UserPlus, Search } from 'lucide-react';
import { MOCK_KUDOS } from '../constants';
import { generateRefinedText } from '../services/geminiService';

const Kudos: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'send'>('feed');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAIWrite = async () => {
    if (!message) return;
    setLoading(true);
    const refined = await generateRefinedText(message, 'kudos');
    setMessage(refined);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col px-4 pt-2 md:px-0">
       {/* Mobile Toggle Switch */}
       <div className="md:hidden flex bg-slate-100 p-1 rounded-xl mb-6">
          <button 
             onClick={() => setActiveTab('feed')}
             className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'feed' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
          >
             Wow Wall
          </button>
          <button 
             onClick={() => setActiveTab('send')}
             className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'send' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
          >
             Send Kudos
          </button>
       </div>

       <div className="grid md:grid-cols-3 gap-8 items-start">
          {/* Send Kudos Form (Hidden on mobile unless active) */}
          <div className={`${activeTab === 'send' ? 'block' : 'hidden'} md:block md:col-span-1 md:sticky md:top-24`}>
             <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-12 h-12 bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center">
                      <Heart size={24} fill="currentColor" />
                   </div>
                   <div>
                      <h3 className="font-bold text-slate-800 text-lg">Send Kudos</h3>
                      <p className="text-xs text-slate-500 font-medium">Make someone's day!</p>
                   </div>
                </div>

                <div className="space-y-5">
                   <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Who to?</label>
                      <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:border-rose-400 bg-slate-50 active:scale-[0.98] transition-all">
                         <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                            <UserPlus size={18} />
                         </div>
                         <span className="text-sm font-medium text-slate-400">Select colleague...</span>
                      </div>
                   </div>

                   <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Core Value</label>
                      <div className="flex flex-wrap gap-2">
                         {['Kaizen', 'Collaboration', 'Ownership', 'Customer'].map(val => (
                            <button key={val} className="text-xs font-medium border border-slate-200 px-3 py-2 rounded-lg bg-white active:bg-rose-50 active:text-rose-600 active:border-rose-200 transition-colors">
                               {val}
                            </button>
                         ))}
                      </div>
                   </div>

                   <div className="relative">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                      <textarea 
                         rows={5}
                         value={message}
                         onChange={(e) => setMessage(e.target.value)}
                         placeholder="Write something nice..."
                         className="w-full rounded-xl border-slate-200 focus:border-rose-500 focus:ring-rose-500 text-base p-3 bg-slate-50"
                      />
                      <button 
                         onClick={handleAIWrite}
                         disabled={loading || !message}
                         className="absolute bottom-3 right-3 text-rose-500 bg-rose-50 p-2 rounded-lg transition-colors disabled:opacity-50"
                         title="AI Polish"
                      >
                         <Sparkles size={18} className={loading ? "animate-spin" : ""} />
                      </button>
                   </div>

                   <button className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-rose-200 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]">
                      <Send size={20} /> Send Kudos
                   </button>
                </div>
             </div>
          </div>

          {/* Feed (Hidden on mobile unless active) */}
          <div className={`${activeTab === 'feed' ? 'block' : 'hidden'} md:block md:col-span-2 space-y-6 pb-20`}>
             <div className="flex items-center justify-between sticky top-[60px] md:top-0 bg-slate-50/90 backdrop-blur-sm z-10 py-2">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800">Wow Wall</h2>
                <div className="relative">
                   <select className="appearance-none bg-white border border-slate-200 text-sm font-medium rounded-full pl-4 pr-8 py-2 shadow-sm">
                      <option>Global</option>
                      <option>My Team</option>
                   </select>
                   <Search size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                </div>
             </div>

             <div className="space-y-4">
                {MOCK_KUDOS.map(kudos => (
                   <div key={kudos.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                      <div className="flex items-start justify-between relative z-10 mb-3">
                         <div className="flex items-center gap-3">
                            <div className="relative">
                               <img src={kudos.sender.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="" />
                               <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                                  <div className="bg-indigo-100 p-0.5 rounded-full">
                                     <Send size={10} className="text-indigo-600" />
                                  </div>
                               </div>
                            </div>
                            <div className="h-0.5 w-6 bg-slate-100 rounded-full"></div>
                            <img src={kudos.receiver.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="" />
                         </div>
                         <span className="bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg">
                            {kudos.coreValue}
                         </span>
                      </div>

                      <div className="relative z-10">
                         <p className="text-slate-800 text-base leading-relaxed">
                            "{kudos.message}"
                         </p>
                         <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-50">
                            <p className="text-xs text-slate-500">
                               <span className="font-bold text-slate-900">{kudos.sender.name}</span> → <span className="font-bold text-slate-900">{kudos.receiver.name}</span>
                            </p>
                            <button className="flex items-center gap-1.5 text-slate-400 active:text-rose-500 transition-colors bg-slate-50 px-2 py-1 rounded-full">
                               <Heart size={16} />
                               <span className="text-xs font-bold">{kudos.likes}</span>
                            </button>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
};

export default Kudos;