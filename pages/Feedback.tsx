import React, { useState } from 'react';
import { ShieldCheck, Send, Check, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type TemplateType = 'Start/Stop' | 'NPS' | '4L' | 'Open';
type TargetType = 'Company General' | 'My Direct Manager' | 'HR Team' | 'My Team';

const Feedback: React.FC = () => {
   const { t } = useTranslation();
   const [template, setTemplate] = useState<TemplateType>('NPS');
   const [target, setTarget] = useState<TargetType>('Company General');
   const [npsScore, setNpsScore] = useState<number | null>(null);
   const [submitted, setSubmitted] = useState(false);

   // Form fields
   const [startDoing, setStartDoing] = useState('');
   const [stopDoing, setStopDoing] = useState('');
   const [continueDoing, setContinueDoing] = useState('');
   const [liked, setLiked] = useState('');
   const [learned, setLearned] = useState('');
   const [lacked, setLacked] = useState('');
   const [longedFor, setLongedFor] = useState('');
   const [openComment, setOpenComment] = useState('');

   const handleSubmit = () => {
      // Simulate submission
      setSubmitted(true);
   };

   const resetForm = () => {
      setSubmitted(false);
      setNpsScore(null);
      setStartDoing('');
      setStopDoing('');
      setContinueDoing('');
      setLiked('');
      setLearned('');
      setLacked('');
      setLongedFor('');
      setOpenComment('');
   };

   if (submitted) {
      return (
         <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
               <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check size={40} className="text-green-600" />
               </div>
               <h2 className="text-2xl font-bold text-slate-800 mb-2">{t('feedback.submitSuccess')}</h2>
               <p className="text-slate-500 mb-6">
                  {t('feedback.submitSuccessDesc')}
               </p>
               <button
                  onClick={resetForm}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
               >
                  {t('feedback.submitAnother')}
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className="max-w-2xl mx-auto px-4 py-4 md:py-8">
         <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800">{t('feedback.title')}</h2>
            <p className="text-slate-500 mt-2">{t('feedback.description')}</p>
         </div>

         <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
            {/* Privacy Notice */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex gap-3 items-start">
               <ShieldCheck className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
               <p className="text-sm text-blue-800">
                  {t('feedback.privacyNotice')}
               </p>
            </div>

            <div className="space-y-6">
               {/* Target Selection */}
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">{t('feedback.targetLabel')}</label>
                  <div className="grid grid-cols-2 gap-2">
                     {(['Company General', 'My Direct Manager', 'HR Team', 'My Team'] as TargetType[]).map(t => (
                        <button
                           key={t}
                           onClick={() => setTarget(t)}
                           className={`p-3 rounded-xl text-sm font-medium border transition-all ${target === t
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-300'
                              }`}
                        >
                           {t}
                        </button>
                     ))}
                  </div>
               </div>

               {/* Template Selection */}
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">{t('feedback.templateLabel')}</label>
                  <div className="flex flex-wrap gap-2">
                     {(['Start/Stop', 'NPS', '4L', 'Open'] as TemplateType[]).map(t => (
                        <button
                           key={t}
                           onClick={() => setTemplate(t)}
                           className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${template === t
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                              }`}
                        >
                           {t}
                        </button>
                     ))}
                  </div>
               </div>

               {/* NPS Template */}
               {template === 'NPS' && (
                  <div className="space-y-4">
                     <label className="block text-sm font-bold text-slate-700">
                        {t('feedback.npsQuestion')}
                     </label>
                     <div className="flex justify-between gap-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                           <button
                              key={num}
                              onClick={() => setNpsScore(num)}
                              className={`w-8 h-10 sm:w-10 sm:h-12 rounded text-sm font-bold transition-colors ${npsScore === num
                                 ? 'bg-indigo-600 text-white'
                                 : 'bg-slate-50 hover:bg-indigo-100 border border-slate-200 text-slate-600'
                                 }`}
                           >
                              {num}
                           </button>
                        ))}
                     </div>
                     <div className="flex justify-between text-xs text-slate-400">
                        <span>{t('feedback.npsNotLikely')}</span>
                        <span>{t('feedback.npsVeryLikely')}</span>
                     </div>
                  </div>
               )}

               {/* Start/Stop/Continue Template */}
               {template === 'Start/Stop' && (
                  <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                           🚀 Start Doing
                        </label>
                        <textarea
                           rows={2}
                           value={startDoing}
                           onChange={(e) => setStartDoing(e.target.value)}
                           placeholder="What should we start doing?"
                           className="w-full rounded-xl border-slate-200 focus:border-indigo-500 p-3 text-sm"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                           🛑 Stop Doing
                        </label>
                        <textarea
                           rows={2}
                           value={stopDoing}
                           onChange={(e) => setStopDoing(e.target.value)}
                           placeholder="What should we stop doing?"
                           className="w-full rounded-xl border-slate-200 focus:border-indigo-500 p-3 text-sm"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                           ✅ Continue Doing
                        </label>
                        <textarea
                           rows={2}
                           value={continueDoing}
                           onChange={(e) => setContinueDoing(e.target.value)}
                           placeholder="What should we continue doing?"
                           className="w-full rounded-xl border-slate-200 focus:border-indigo-500 p-3 text-sm"
                        />
                     </div>
                  </div>
               )}

               {/* 4L Template */}
               {template === '4L' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                           💚 Liked
                        </label>
                        <textarea
                           rows={3}
                           value={liked}
                           onChange={(e) => setLiked(e.target.value)}
                           placeholder="What did you like?"
                           className="w-full rounded-xl border-slate-200 focus:border-indigo-500 p-3 text-sm"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                           📚 Learned
                        </label>
                        <textarea
                           rows={3}
                           value={learned}
                           onChange={(e) => setLearned(e.target.value)}
                           placeholder="What did you learn?"
                           className="w-full rounded-xl border-slate-200 focus:border-indigo-500 p-3 text-sm"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                           ⚠️ Lacked
                        </label>
                        <textarea
                           rows={3}
                           value={lacked}
                           onChange={(e) => setLacked(e.target.value)}
                           placeholder="What was missing?"
                           className="w-full rounded-xl border-slate-200 focus:border-indigo-500 p-3 text-sm"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                           ✨ Longed For
                        </label>
                        <textarea
                           rows={3}
                           value={longedFor}
                           onChange={(e) => setLongedFor(e.target.value)}
                           placeholder="What did you wish for?"
                           className="w-full rounded-xl border-slate-200 focus:border-indigo-500 p-3 text-sm"
                        />
                     </div>
                  </div>
               )}

               {/* Open/Comments */}
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                     {template === 'Open' ? 'Your Feedback' : 'Additional Comments'}
                  </label>
                  <textarea
                     rows={4}
                     value={openComment}
                     onChange={(e) => setOpenComment(e.target.value)}
                     placeholder="Share your thoughts honestly..."
                     className="w-full rounded-xl border-slate-200 focus:border-indigo-500 p-4 text-sm"
                  />
               </div>

               <button
                  onClick={handleSubmit}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 transition-colors"
               >
                  <Send size={18} /> {t('feedback.submitAnonymously')}
               </button>
            </div>
         </div>
      </div>
   );
};

export default Feedback;
