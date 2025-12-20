import React, { useState } from 'react';
import { ShieldCheck, Send } from 'lucide-react';

const Feedback: React.FC = () => {
  const [type, setType] = useState('NPS');
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
         <h2 className="text-2xl font-bold text-slate-800">Anonymous Feedback</h2>
         <p className="text-slate-500 mt-2">Your voice matters. Help us improve without revealing your identity.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
         <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex gap-3 items-start">
            <ShieldCheck className="text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-800">
               Your identity is hidden. This feedback is encrypted and only aggregated data is shown to leadership.
            </p>
         </div>

         <div className="space-y-6">
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">Who is this feedback for?</label>
               <select className="w-full rounded-lg border-slate-200 focus:border-indigo-500">
                  <option>Company General</option>
                  <option>My Direct Manager</option>
                  <option>HR Team</option>
               </select>
            </div>

            <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">Template</label>
               <div className="flex gap-2">
                  {['Start/Stop', 'NPS', 'Open'].map(t => (
                     <button 
                        key={t}
                        onClick={() => setType(t)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                           type === t ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                     >
                        {t}
                     </button>
                  ))}
               </div>
            </div>

            {type === 'NPS' && (
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-4">How likely are you to recommend working here?</label>
                  <div className="flex justify-between gap-1">
                     {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <button key={num} className="w-8 h-10 sm:w-10 sm:h-12 rounded bg-slate-50 hover:bg-indigo-100 border border-slate-200 text-slate-600 font-bold focus:bg-indigo-600 focus:text-white transition-colors">
                           {num}
                        </button>
                     ))}
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 mt-2">
                     <span>Not Likely</span>
                     <span>Very Likely</span>
                  </div>
               </div>
            )}

            <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">Comments</label>
               <textarea 
                  rows={4} 
                  placeholder="Share your thoughts honestly..."
                  className="w-full rounded-lg border-slate-200 focus:border-indigo-500"
               />
            </div>

            <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2">
               <Send size={18} /> Submit Anonymously
            </button>
         </div>
      </div>
    </div>
  );
};

export default Feedback;
