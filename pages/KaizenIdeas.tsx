import React, { useState, useEffect } from 'react';
import { Plus, ThumbsUp, MessageSquare, Filter, Wand2, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { KaizenIdea } from '../types';
import { generateRefinedText } from '../services/geminiService';
import {
  getIdeas as apiGetIdeas,
  createIdea as apiCreateIdea,
  voteIdea as apiVoteIdea,
  getCurrentUser as apiGetCurrentUser,
} from '../services/apiService';
import { useTranslation } from 'react-i18next';
import { User, Idea as BackendIdea } from '../services/apiService';

const KaizenIdeas: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'all' | 'create'>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [filter, setFilter] = useState('Latest');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [problem, setProblem] = useState('');
  const [proposal, setProposal] = useState('');
  const [impact, setImpact] = useState<'Cost' | 'Quality' | 'Speed' | 'Safety'>('Quality');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ideasData, userData] = await Promise.all([
        apiGetIdeas(),
        apiGetCurrentUser()
      ]);
      setIdeas(ideasData);
      setCurrentUser(userData);
    } catch (error) {
      console.error('Failed to load ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.state && (location.state as any).mode === 'create') {
      setActiveTab('create');
    }
  }, [location.state]);

  const handleAIImprove = async (field: 'problem' | 'proposal') => {
    const text = field === 'problem' ? problem : proposal;
    if (!text) return;

    setIsGenerating(true);
    const refined = await generateRefinedText(text, 'kaizen');
    if (field === 'problem') setProblem(refined);
    else setProposal(refined);
    setIsGenerating(false);
  };

  const handleVote = async (ideaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiVoteIdea(ideaId);
      // Update local state or reload
      loadData();
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !problem.trim() || !proposal.trim()) return;
    setIsGenerating(true);

    try {
      await apiCreateIdea({
        title: title.trim(),
        problem: problem.trim(),
        proposal: proposal.trim(),
        impact: impact.toLowerCase()
      });

      // Reset form
      setTitle('');
      setProblem('');
      setProposal('');
      setImpact('Quality');
      setSubmitSuccess(true);

      // Reload ideas
      await loadData();

      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveTab('all');
      }, 2000);
    } catch (error) {
      console.error('Failed to submit idea:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getFilteredIdeas = () => {
    let filtered = [...ideas];
    switch (filter) {
      case 'Top Voted':
        return filtered.sort((a, b) => b.votes - a.votes);
      case 'Implemented':
        return filtered.filter(i => i.status === 'Implemented');
      case 'My Team':
        return filtered.filter(i => i.author.team === currentUser.team);
      default:
        return filtered;
    }
  };

  const filteredIdeas = getFilteredIdeas();

  if (loading || !currentUser) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pt-2 md:px-0">
      {/* Mobile Tab Switcher */}
      <div className="flex bg-slate-100 p-1 rounded-xl mb-6 sticky top-[60px] md:static z-10">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'all' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
        >
          Browse Ideas
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'create' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
        >
          Submit New
        </button>
      </div>

      {activeTab === 'all' ? (
        <div className="space-y-4 pb-20">
          {/* Filters - Horizontal Scroll */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
            {['Latest', 'Top Voted', 'Implemented', 'My Team'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap shadow-sm transition-all ${filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 active:bg-slate-50'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* List */}
          {filteredIdeas.length > 0 ? (
            filteredIdeas.map(idea => {
              const hasVoted = idea.votedBy?.includes(currentUser.id) || false;

              return (
                <div
                  key={idea.id}
                  onClick={() => navigate(`/ideas/${idea.id}`)}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3">
                      <div className={`mt-0.5 p-2 rounded-xl h-fit ${idea.impact === 'Speed' ? 'bg-blue-50 text-blue-600' :
                        idea.impact === 'Cost' ? 'bg-green-50 text-green-600' :
                          idea.impact === 'Safety' ? 'bg-orange-50 text-orange-600' :
                            'bg-emerald-50 text-emerald-600'
                        }`}>
                        <Filter size={18} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-base leading-tight group-hover:text-indigo-600 transition-colors">{idea.title}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md ${idea.status === 'Implemented' ? 'bg-green-100 text-green-700' :
                            idea.status === 'In Review' ? 'bg-yellow-100 text-yellow-700' :
                              idea.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                                'bg-slate-100 text-slate-600'
                            }`}>
                            {idea.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleVote(idea.id, e)}
                      className={`flex flex-col items-center rounded-lg p-2 min-w-[48px] transition-all ${hasVoted
                        ? 'bg-indigo-100 text-indigo-600'
                        : 'bg-slate-50 text-slate-500 hover:bg-indigo-50'
                        }`}
                    >
                      <ThumbsUp size={16} className={hasVoted ? 'fill-indigo-600' : ''} />
                      <span className="text-sm font-bold mt-1">{idea.votes}</span>
                    </button>
                  </div>

                  <div className="space-y-3 mt-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Problem</p>
                      <p className="text-sm text-slate-700 leading-snug line-clamp-2">{idea.problem}</p>
                    </div>
                    <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                      <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Proposal</p>
                      <p className="text-sm text-indigo-900 leading-snug line-clamp-2">{idea.proposal}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
                    <div className="flex items-center gap-2">
                      <img src={idea.author.avatar} alt="" className="w-5 h-5 rounded-full" />
                      <span className="text-xs font-bold text-slate-500">{idea.author.name}</span>
                      <span className="text-xs text-slate-300">•</span>
                      <span className="text-xs text-slate-400">{idea.createdAt}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-xs font-bold flex items-center gap-1">
                        <MessageSquare size={14} />
                        {idea.comments?.length || 0}
                      </span>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-slate-500">
              No ideas found for this filter.
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 animate-fade-in pb-24">
          {submitSuccess ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Idea Submitted!</h3>
              <p className="text-slate-500">You earned +50 XP</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="font-bold text-xl text-slate-800">New Proposal</h3>
                <p className="text-slate-500 text-sm">Share your improvement idea.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g., Automate client reporting"
                    className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 h-12 px-4 bg-slate-50 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Impact Type</label>
                    <div className="relative">
                      <select
                        value={impact}
                        onChange={(e) => setImpact(e.target.value as any)}
                        className="w-full rounded-xl border-slate-200 focus:border-indigo-500 h-12 px-4 bg-slate-50 appearance-none font-medium"
                      >
                        <option value="Cost">Cost Saving</option>
                        <option value="Quality">Quality Improvement</option>
                        <option value="Speed">Speed / Efficiency</option>
                        <option value="Safety">Safety</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={20} />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-slate-700">The Problem</label>
                    <button
                      onClick={() => handleAIImprove('problem')}
                      disabled={isGenerating || !problem}
                      className="text-xs font-bold flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-1.5 rounded-lg disabled:opacity-50"
                    >
                      {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                      AI Polish
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    placeholder="What is currently not working?"
                    className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 p-4 bg-slate-50 text-sm"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-slate-700">Your Solution</label>
                    <button
                      onClick={() => handleAIImprove('proposal')}
                      disabled={isGenerating || !proposal}
                      className="text-xs font-bold flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-1.5 rounded-lg disabled:opacity-50"
                    >
                      {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                      AI Polish
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                    placeholder="How should we fix it?"
                    className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 p-4 bg-slate-50 text-sm"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!title.trim() || !problem.trim() || !proposal.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-14 rounded-xl shadow-lg shadow-indigo-200 transition-transform active:scale-[0.98] text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Idea (+50 pts)
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default KaizenIdeas;