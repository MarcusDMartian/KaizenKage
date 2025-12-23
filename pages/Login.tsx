import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, User, Loader2, ArrowRight, Building2, CheckCircle } from 'lucide-react';
import { login, registerOrg, joinRequest, checkDomain } from '../services/apiService';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [step, setStep] = useState(1); // 1: User Info, 2: Org Info

    // User Data
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    // Org Data
    const [orgName, setOrgName] = useState('');
    const [foundOrg, setFoundOrg] = useState<any>(null);
    const [joinRequestSent, setJoinRequestSent] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const resetState = () => {
        setStep(1);
        setOrgName('');
        setFoundOrg(null);
        setJoinRequestSent(false);
        setError('');
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/', { replace: true });
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterStep1 = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim() || !email || !password) {
            setError('All fields are required');
            return;
        }

        // Validate corporate email (simple check for now, backend checks domain anyway)
        if (!email.includes('@')) {
            setError('Invalid email address');
            return;
        }

        setLoading(true);
        try {
            const data = await checkDomain(email);
            if (data.exists) {
                setFoundOrg(data.organization);
            } else {
                // Pre-fill org name from domain?
                // data.domain is like 'google.com'
                // maybe capitalize it
                const domain = data.domain;
                const companyName = domain.split('.')[0];
                setOrgName(companyName.charAt(0).toUpperCase() + companyName.slice(1));
            }
            setStep(2);
        } catch (err: any) {
            setError(err.message || 'Failed to check domain');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterStep2 = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (foundOrg) {
                // Join Request
                await joinRequest({ email, password, name, orgId: foundOrg.id });
                setJoinRequestSent(true);
            } else {
                // Create Org
                if (!orgName.trim()) {
                    setError('Organization name is required');
                    setLoading(false);
                    return;
                }
                await registerOrg({ email, password, name, orgName });
                navigate('/', { replace: true });
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600" />

            {/* Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-[10%] left-[-20%] w-[60%] h-[60%] bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-[10%] right-[-20%] w-[50%] h-[50%] bg-white/10 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 py-12">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                        <Zap size={28} className="text-white" />
                    </div>
                    <span className="text-2xl font-bold text-white">Kaizenkage</span>
                </div>

                {/* Card */}
                <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">

                    {joinRequestSent ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={32} className="text-emerald-300" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Request Sent!</h2>
                            <p className="text-white/80 mb-6">
                                Your request to join <span className="font-bold text-white">{foundOrg?.name}</span> has been sent.
                                Please wait for an administrator to approve your account.
                            </p>
                            <button
                                onClick={() => { setIsLogin(true); resetState(); }}
                                className="bg-white text-indigo-600 font-bold px-6 py-2 rounded-xl"
                            >
                                Back to Login
                            </button>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold text-white text-center mb-2">
                                {isLogin ? 'Welcome Back' : (step === 1 ? 'Create Account' : (foundOrg ? 'Join Organization' : 'Setup Organization'))}
                            </h1>
                            <p className="text-white/70 text-center mb-8">
                                {isLogin
                                    ? 'Sign in to continue your journey'
                                    : (step === 1
                                        ? 'Join the continuous improvement community'
                                        : (foundOrg
                                            ? `We found an organization for @${email.split('@')[1]}`
                                            : `Create a new workspace for @${email.split('@')[1]}`
                                        )
                                    )
                                }
                            </p>

                            {error && (
                                <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 mb-6 text-red-100 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={(e) => {
                                if (isLogin) handleLoginSubmit(e);
                                else if (step === 1) handleRegisterStep1(e);
                                else handleRegisterStep2(e);
                            }} className="space-y-5">

                                {(step === 1 || isLogin) && (
                                    <>
                                        {!isLogin && (
                                            <div>
                                                <label className="block text-white/80 text-sm mb-2">Full Name</label>
                                                <div className="relative">
                                                    <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                                                    <input
                                                        type="text"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        placeholder="Your name"
                                                        className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-white/80 text-sm mb-2">Email</label>
                                            <div className="relative">
                                                <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="your@email.com"
                                                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-white/80 text-sm mb-2">Password</label>
                                            <div className="relative">
                                                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                                                <input
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {!isLogin && step === 2 && (
                                    foundOrg ? (
                                        <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Building2 className="text-white" size={24} />
                                                <span className="text-xl font-bold text-white">{foundOrg.name}</span>
                                            </div>
                                            <p className="text-white/70 text-sm">
                                                This organization is already registered. You can request to join, and an administrator will review your request.
                                            </p>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-white/80 text-sm mb-2">Organization Name</label>
                                            <div className="relative">
                                                <Building2 size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                                                <input
                                                    type="text"
                                                    value={orgName}
                                                    onChange={(e) => setOrgName(e.target.value)}
                                                    placeholder="e.g. Acme Corp"
                                                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20"
                                                />
                                            </div>
                                        </div>
                                    )
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full ${foundOrg ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-white hover:bg-white/90 text-indigo-600'} text-white font-bold py-3 rounded-xl shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2`}
                                >
                                    {loading ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <>
                                            {isLogin
                                                ? 'Sign In'
                                                : (step === 1
                                                    ? 'Next'
                                                    : (foundOrg ? 'Request Access' : 'Create Organization')
                                                )
                                            }
                                            <ArrowRight size={20} />
                                        </>
                                    )}
                                    {/* Fix button text color for non-emerald state */}
                                    <style>{`
                                        button[type="submit"]:not(.bg-emerald-500) {
                                            color: ${isLogin || step === 1 || !foundOrg ? '#4f46e5' : 'white'};
                                        }
                                    `}</style>
                                </button>
                                {/* Hacky style due to dynamic class conflict, better to use discrete class assignment in JS above logic */}
                            </form>

                            <div className="mt-8 text-center">
                                <button
                                    onClick={() => {
                                        setIsLogin(!isLogin);
                                        resetState();
                                    }}
                                    className="text-white/70 hover:text-white transition-colors"
                                >
                                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                                    <span className="font-semibold text-white underline">
                                        {isLogin ? 'Sign Up' : 'Sign In'}
                                    </span>
                                </button>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Login;
