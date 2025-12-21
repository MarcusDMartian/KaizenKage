import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    ThumbsUp,
    MessageSquare,
    Bell,
    BellOff,
    Send,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { KaizenIdea, Comment } from '../types';
import {
    getIdeaById,
    voteIdea,
    addComment,
    toggleFollowIdea,
    getCurrentUser,
    generateId
} from '../services/storageService';

const IdeaDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [idea, setIdea] = useState<KaizenIdea | null>(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentUser = getCurrentUser();

    useEffect(() => {
        if (id) {
            const foundIdea = getIdeaById(id);
            setIdea(foundIdea || null);
            setLoading(false);
        }
    }, [id]);

    const handleVote = () => {
        if (!idea || !id) return;
        const added = voteIdea(id, currentUser.id);
        setIdea(prev => {
            if (!prev) return prev;
            const votedBy = prev.votedBy || [];
            return {
                ...prev,
                votes: added ? prev.votes + 1 : Math.max(0, prev.votes - 1),
                votedBy: added
                    ? [...votedBy, currentUser.id]
                    : votedBy.filter(uid => uid !== currentUser.id)
            };
        });
    };

    const handleFollow = () => {
        if (!idea || !id) return;
        const followed = toggleFollowIdea(id, currentUser.id);
        setIdea(prev => {
            if (!prev) return prev;
            const followedBy = prev.followedBy || [];
            return {
                ...prev,
                followedBy: followed
                    ? [...followedBy, currentUser.id]
                    : followedBy.filter(uid => uid !== currentUser.id)
            };
        });
    };

    const handleAddComment = async () => {
        if (!commentText.trim() || !id || !idea) return;

        setIsSubmitting(true);
        const newComment: Comment = {
            id: generateId(),
            userId: currentUser.id,
            userName: currentUser.name,
            userAvatar: currentUser.avatar,
            text: commentText.trim(),
            createdAt: 'Just now'
        };

        addComment(id, newComment);
        setIdea(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                comments: [...(prev.comments || []), newComment]
            };
        });
        setCommentText('');
        setIsSubmitting(false);
    };

    const hasVoted = idea?.votedBy?.includes(currentUser.id) || false;
    const isFollowing = idea?.followedBy?.includes(currentUser.id) || false;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Implemented': return <CheckCircle2 size={16} className="text-green-600" />;
            case 'Approved': return <CheckCircle2 size={16} className="text-blue-600" />;
            case 'In Review': return <Clock size={16} className="text-yellow-600" />;
            default: return <AlertCircle size={16} className="text-slate-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Implemented': return 'bg-green-100 text-green-700 border-green-200';
            case 'Approved': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'In Review': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
        );
    }

    if (!idea) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-8 text-center">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Idea not found</h2>
                <Link to="/ideas" className="text-indigo-600 font-medium hover:underline">
                    ← Back to Ideas
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-4 pb-24">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-xl bg-white border border-slate-100 shadow-sm hover:bg-slate-50 transition-colors"
                >
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <h1 className="text-xl font-bold text-slate-800 flex-1">Idea Detail</h1>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Title & Status */}
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <h2 className="text-xl font-bold text-slate-800 leading-tight">{idea.title}</h2>
                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${getStatusColor(idea.status)}`}>
                            {getStatusIcon(idea.status)}
                            {idea.status}
                        </span>
                    </div>

                    {/* Author */}
                    <div className="flex items-center gap-3">
                        <img src={idea.author.avatar} alt="" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                        <div>
                            <p className="font-medium text-slate-800">{idea.author.name}</p>
                            <p className="text-xs text-slate-500">{idea.author.team} • {idea.createdAt}</p>
                        </div>
                    </div>
                </div>

                {/* Problem & Proposal */}
                <div className="p-6 space-y-4">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Problem</p>
                        <p className="text-slate-700">{idea.problem}</p>
                    </div>

                    <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                        <p className="text-xs font-bold text-indigo-400 uppercase mb-2">Proposed Solution</p>
                        <p className="text-indigo-900">{idea.proposal}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 uppercase">Impact:</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${idea.impact === 'Speed' ? 'bg-blue-100 text-blue-700' :
                                idea.impact === 'Cost' ? 'bg-green-100 text-green-700' :
                                    idea.impact === 'Quality' ? 'bg-purple-100 text-purple-700' :
                                        'bg-orange-100 text-orange-700'
                            }`}>
                            {idea.impact}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleVote}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${hasVoted
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'
                                }`}
                        >
                            <ThumbsUp size={18} className={hasVoted ? 'fill-white' : ''} />
                            <span>{idea.votes}</span>
                        </button>

                        <button
                            onClick={handleFollow}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${isFollowing
                                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-200'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-amber-300'
                                }`}
                        >
                            {isFollowing ? <BellOff size={18} /> : <Bell size={18} />}
                            <span>{isFollowing ? 'Following' : 'Follow'}</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500">
                        <MessageSquare size={18} />
                        <span className="font-medium">{idea.comments?.length || 0}</span>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="font-bold text-slate-800 mb-4">Status Timeline</h3>
                <div className="space-y-3">
                    {['New', 'In Review', 'Approved', 'Implemented'].map((status, index) => {
                        const statusIndex = ['New', 'In Review', 'Approved', 'Implemented'].indexOf(idea.status);
                        const isComplete = index <= statusIndex;
                        const isCurrent = status === idea.status;

                        return (
                            <div key={status} className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isComplete
                                        ? isCurrent ? 'bg-indigo-600 text-white' : 'bg-green-500 text-white'
                                        : 'bg-slate-100 text-slate-400'
                                    }`}>
                                    {isComplete && !isCurrent ? <CheckCircle2 size={16} /> : <span className="text-xs font-bold">{index + 1}</span>}
                                </div>
                                <span className={`font-medium ${isComplete ? 'text-slate-800' : 'text-slate-400'}`}>
                                    {status}
                                </span>
                                {isCurrent && (
                                    <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold">Current</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Comments */}
            <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <MessageSquare size={18} className="text-indigo-600" />
                        Comments ({idea.comments?.length || 0})
                    </h3>
                </div>

                {/* Comment List */}
                <div className="divide-y divide-slate-100">
                    {idea.comments && idea.comments.length > 0 ? (
                        idea.comments.map(comment => (
                            <div key={comment.id} className="p-4 flex gap-3">
                                <img src={comment.userAvatar} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-slate-800 text-sm">{comment.userName}</span>
                                        <span className="text-xs text-slate-400">{comment.createdAt}</span>
                                    </div>
                                    <p className="text-sm text-slate-600">{comment.text}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-400">
                            No comments yet. Be the first to share your thoughts!
                        </div>
                    )}
                </div>

                {/* Add Comment */}
                <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <div className="flex gap-3">
                        <img src={currentUser.avatar} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
                        <div className="flex-1 flex gap-2">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                            />
                            <button
                                onClick={handleAddComment}
                                disabled={!commentText.trim() || isSubmitting}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IdeaDetail;
