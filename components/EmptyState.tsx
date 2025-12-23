import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    message: string;
    action?: {
        label: string;
        onClick: () => void;
        icon?: LucideIcon;
    };
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, message, action }) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <Icon size={40} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{title}</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8 font-medium">
                {message}
            </p>

            {action && (
                <button
                    onClick={action.onClick}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95"
                >
                    {action.icon && <action.icon size={18} />}
                    {action.label}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
