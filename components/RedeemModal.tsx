import React from 'react';
import { X, Gift, AlertCircle, Check } from 'lucide-react';
import { Reward } from '../types';

interface RedeemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    reward: Reward | null;
    userPoints: number;
    isProcessing?: boolean;
    success?: boolean;
}

const RedeemModal: React.FC<RedeemModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    reward,
    userPoints,
    isProcessing = false,
    success = false
}) => {
    if (!isOpen || !reward) return null;

    const canAfford = userPoints >= reward.cost;
    const remainingPoints = userPoints - reward.cost;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={!isProcessing ? onClose : undefined}
            />

            {/* Modal */}
            <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                {success ? (
                    // Success State
                    <div className="p-8 text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check size={40} className="text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Redemption Successful!</h3>
                        <p className="text-slate-500 mb-6">Your request has been submitted.</p>
                        <button
                            onClick={onClose}
                            className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="relative">
                            <img
                                src={reward.image}
                                alt={reward.name}
                                className="w-full h-40 object-cover"
                            />
                            <button
                                onClick={onClose}
                                disabled={isProcessing}
                                className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors disabled:opacity-50"
                            >
                                <X size={18} className="text-slate-600" />
                            </button>
                            <div className="absolute bottom-3 left-3">
                                <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                    {reward.type}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">{reward.name}</h3>
                            {reward.description && (
                                <p className="text-sm text-slate-500 mb-4">{reward.description}</p>
                            )}

                            {/* Points Info */}
                            <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Your Points</span>
                                    <span className="font-bold text-slate-800">{userPoints.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Cost</span>
                                    <span className="font-bold text-red-500">-{reward.cost.toLocaleString()}</span>
                                </div>
                                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm">
                                    <span className="text-slate-500">After Redemption</span>
                                    <span className={`font-bold ${canAfford ? 'text-green-600' : 'text-red-500'}`}>
                                        {remainingPoints.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Stock Warning */}
                            {reward.stock < 5 && (
                                <div className="flex items-center gap-2 text-amber-600 text-sm mb-4">
                                    <AlertCircle size={16} />
                                    <span>Only {reward.stock} left in stock!</span>
                                </div>
                            )}

                            {/* Not enough points warning */}
                            {!canAfford && (
                                <div className="flex items-center gap-2 text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">
                                    <AlertCircle size={16} />
                                    <span>You need {(reward.cost - userPoints).toLocaleString()} more points</span>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    disabled={isProcessing}
                                    className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onConfirm}
                                    disabled={!canAfford || isProcessing || reward.stock === 0}
                                    className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? (
                                        <span className="animate-pulse">Processing...</span>
                                    ) : (
                                        <>
                                            <Gift size={18} />
                                            Redeem
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
        </div>
    );
};

export default RedeemModal;
