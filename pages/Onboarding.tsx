import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Lightbulb, Heart, Gift, Zap, Trophy } from 'lucide-react';
import { setOnboardingCompleted } from '../services/storageService';
import { useTranslation } from 'react-i18next';
import {
    getSavedUser,
    getOrgRoles,
    updateProfile,
    OrgRole
} from '../services/apiService';
import { Briefcase, Loader2 } from 'lucide-react';

const Onboarding: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [selectedRoleId, setSelectedRoleId] = useState<string>('');
    const [availableRoles, setAvailableRoles] = useState<OrgRole[]>([]);
    const [loadingRoles, setLoadingRoles] = useState(false);
    const [saving, setSaving] = useState(false);

    const user = getSavedUser();
    const isMember = user?.role === 'MEMBER';

    React.useEffect(() => {
        if (isMember && user?.organizationId) {
            setLoadingRoles(true);
            getOrgRoles(user.organizationId)
                .then(setAvailableRoles)
                .catch(err => console.error('Failed to load roles:', err))
                .finally(() => setLoadingRoles(false));
        }
    }, [isMember, user?.organizationId]);

    const baseSlides = [
        {
            icon: Lightbulb,
            color: 'from-indigo-500 to-purple-600',
            iconBg: 'bg-indigo-100 text-indigo-600',
            title: t('onboarding.welcome'),
            description: t('onboarding.welcomeDesc'),
            features: [
                'Submit improvement ideas',
                'Vote and comment on proposals',
                'Track implementation status'
            ]
        },
        {
            icon: Heart,
            color: 'from-rose-500 to-pink-600',
            iconBg: 'bg-rose-100 text-rose-600',
            title: t('onboarding.kudos'),
            description: t('onboarding.kudosDesc'),
            features: [
                'Send heartfelt recognition',
                'Highlight core values',
                'See appreciation on the Wow Wall'
            ]
        },
        {
            icon: Gift,
            color: 'from-emerald-500 to-teal-600',
            iconBg: 'bg-emerald-100 text-emerald-600',
            title: t('onboarding.rewards'),
            description: t('onboarding.rewardsDesc'),
            features: [
                'Daily & weekly missions',
                'Points for every action',
                'Exclusive reward catalog'
            ]
        },
        {
            icon: Trophy,
            color: 'from-amber-500 to-orange-600',
            iconBg: 'bg-amber-100 text-amber-600',
            title: t('onboarding.climb'),
            description: t('onboarding.climbDesc'),
            features: [
                'Unlock achievement badges',
                'Maintain activity streaks',
                'Rise on the leaderboard'
            ]
        }
    ];

    const slides = isMember ? [
        ...baseSlides,
        {
            icon: Briefcase,
            color: 'from-slate-800 to-indigo-900',
            iconBg: 'bg-indigo-100 text-indigo-600',
            title: 'Identify Your Role',
            description: 'Choose your specific role in the organization to personalize your experience.',
            isRoleSelection: true
        }
    ] : baseSlides;

    const handleNext = async () => {
        const currentSlideData = slides[currentSlide] as any;
        if (currentSlideData.isRoleSelection && !selectedRoleId) {
            alert('Please select a role to continue.');
            return;
        }

        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            if (isMember && selectedRoleId) {
                setSaving(true);
                try {
                    await updateProfile({ orgRoleId: selectedRoleId });
                    handleComplete();
                } catch (error) {
                    console.error('Failed to save role:', error);
                    alert('Failed to save your role. Please try again.');
                } finally {
                    setSaving(false);
                }
            } else {
                handleComplete();
            }
        }
    };

    const handlePrev = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    const handleComplete = () => {
        setOnboardingCompleted();
        navigate('/', { replace: true });
    };

    const handleSkip = () => {
        handleComplete();
    };

    const slide = slides[currentSlide] as any;
    const IconComponent = slide.icon;
    const isLastSlide = currentSlide === slides.length - 1;

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.color} transition-all duration-500`} />

            {/* Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-[10%] left-[-20%] w-[60%] h-[60%] bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-[10%] right-[-20%] w-[50%] h-[50%] bg-white/10 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 py-12">
                {!slide.isRoleSelection && (
                    <button
                        onClick={handleSkip}
                        className="absolute top-6 right-6 text-white/80 hover:text-white font-medium text-sm"
                    >
                        {t('onboarding.skip')}
                    </button>
                )}

                {/* Icon */}
                <div className={`w-24 h-24 rounded-3xl ${slide.iconBg} flex items-center justify-center mb-8 shadow-2xl`}>
                    <IconComponent size={48} />
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-4 tracking-tight">
                    {slide.title}
                </h1>

                {/* Description */}
                <p className="text-white/80 text-center max-w-md mb-8 text-lg">
                    {slide.description}
                </p>

                {/* Features or Role Selection */}
                {slide.isRoleSelection ? (
                    <div className="w-full max-w-md space-y-3 mb-8">
                        {loadingRoles ? (
                            <div className="flex justify-center p-8">
                                <Loader2 size={32} className="animate-spin text-white" />
                            </div>
                        ) : availableRoles.length === 0 ? (
                            <p className="text-white/60 text-center italic">No roles defined for your organization yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {availableRoles.map((role) => (
                                    <button
                                        key={role.id}
                                        onClick={() => setSelectedRoleId(role.id)}
                                        className={`w-full p-4 rounded-2xl border-2 transition-all flex flex-col items-start ${selectedRoleId === role.id
                                            ? 'bg-white text-indigo-900 border-white shadow-xl scale-[1.02]'
                                            : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                                            }`}
                                    >
                                        <span className="font-bold text-lg">{role.name}</span>
                                        {role.description && (
                                            <span className={`text-sm mt-1 ${selectedRoleId === role.id ? 'text-indigo-600' : 'text-white/60'}`}>
                                                {role.description}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3 mb-12">
                        {slide.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-3 text-white/90">
                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                    <Zap size={12} className="text-white" />
                                </div>
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Dots */}
                <div className="flex gap-2 mb-8">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-2 rounded-full transition-all ${index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40'
                                }`}
                        />
                    ))}
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-4 w-full max-w-sm">
                    {currentSlide > 0 && (
                        <button
                            onClick={handlePrev}
                            className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    )}

                    <button
                        onClick={handleNext}
                        disabled={saving || (slide.isRoleSelection && !selectedRoleId)}
                        className="flex-1 bg-white text-slate-800 font-bold py-4 rounded-2xl shadow-lg hover:bg-white/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {saving ? (
                            <Loader2 size={20} className="animate-spin text-indigo-600" />
                        ) : isLastSlide ? (
                            <>
                                {t('onboarding.getStarted')}
                                <Zap size={20} className="text-indigo-600" />
                            </>
                        ) : (
                            <>
                                {t('onboarding.next')}
                                <ChevronRight size={20} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
