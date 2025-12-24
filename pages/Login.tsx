import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, User, Loader2, ArrowRight, Building2, CheckCircle, Plus } from 'lucide-react';
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
    const [foundOrgs, setFoundOrgs] = useState<any[]>([]);
    const [selectedOrgId, setSelectedOrgId] = useState<string>('');
    const [wantsNewOrg, setWantsNewOrg] = useState(false);
    const [joinRequestSent, setJoinRequestSent] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const resetState = () => {
        setStep(1);
        setOrgName('');
        setFoundOrgs([]);
        setSelectedOrgId('');
        setWantsNewOrg(false);
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
                setFoundOrgs(data.organizations || []);
                // If orgs exist, default to selecting the first one unless they choose to create
                if (data.organizations?.length > 0) {
                    setSelectedOrgId(data.organizations[0].id);
                }
            }

            // Pre-fill org name from domain
            const domain = data.domain;
            const companyName = domain.split('.')[0];
            setOrgName(companyName.charAt(0).toUpperCase() + companyName.slice(1));

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
            if (selectedOrgId && !wantsNewOrg) {
                // Join Request
                await joinRequest({ email, password, name, orgId: selectedOrgId });
                // With our change, the account IS created, but we show the pending message
                setJoinRequestSent(true);
            } else {
                // Create Org
                if (!orgName.trim()) {
                    setError('Organization name is required');
                    setLoading(false);
                    return;
                }
                const res = await registerOrg({ email, password, name, orgName });
                // If they created an org, they are SUPERADMIN and isActive:true (default in register-org)
                // Actually let's check backend register-org
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
                            <h2 className="text-2xl font-bold text-white mb-2">Đã gửi yêu cầu!</h2>
                            <p className="text-white/80 mb-6">
                                Yêu cầu tham gia tổ chức của bạn đã được gửi đi.
                                Bạn có thể đăng nhập ngay bây giờ để kiểm tra trạng thái phê duyệt.
                            </p>
                            <button
                                onClick={() => { setIsLogin(true); resetState(); }}
                                className="w-full bg-white text-indigo-600 font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-slate-50 transition-all"
                            >
                                Đi đến Đăng nhập
                            </button>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold text-white text-center mb-2">
                                {isLogin ? 'Chào mừng quay trở lại' : (step === 1 ? 'Tạo tài khoản' : (foundOrgs.length > 0 && !wantsNewOrg ? 'Tham gia tổ chức' : 'Thiết lập tổ chức'))}
                            </h1>
                            <p className="text-white/70 text-center mb-8">
                                {isLogin
                                    ? 'Đăng nhập để tiếp tục hành trình của bạn'
                                    : (step === 1
                                        ? 'Tham gia cộng đồng Kaizen ngay hôm nay'
                                        : (foundOrgs.length > 0 && !wantsNewOrg
                                            ? `Chúng tôi tìm thấy các tổ chức cho @${email.split('@')[1]}`
                                            : `Tạo không gian làm việc mới cho @${email.split('@')[1]}`
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
                                    <div className="space-y-4">
                                        {foundOrgs.length > 0 && (
                                            <div className="space-y-3">
                                                <label className="block text-white/80 text-sm mb-1 text-center">Chúng tôi tìm thấy các tổ chức sau:</label>
                                                {foundOrgs.map(org => (
                                                    <button
                                                        key={org.id}
                                                        type="button"
                                                        onClick={() => { setSelectedOrgId(org.id); setWantsNewOrg(false); }}
                                                        className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${selectedOrgId === org.id && !wantsNewOrg
                                                            ? 'bg-white text-indigo-900 border-white shadow-xl'
                                                            : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Building2 size={20} />
                                                            <span className="font-bold">{org.name}</span>
                                                        </div>
                                                        {selectedOrgId === org.id && !wantsNewOrg && <CheckCircle size={18} className="text-indigo-600" />}
                                                    </button>
                                                ))}

                                                <div className="relative py-2 flex items-center gap-4">
                                                    <div className="flex-1 h-px bg-white/20"></div>
                                                    <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Hoặc</span>
                                                    <div className="flex-1 h-px bg-white/20"></div>
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => setWantsNewOrg(true)}
                                            className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${wantsNewOrg
                                                ? 'bg-white text-indigo-900 border-white shadow-xl'
                                                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                                                }`}
                                        >
                                            <Plus size={20} />
                                            <div className="text-left">
                                                <span className="font-bold block">Tạo tổ chức mới</span>
                                                <span className="text-xs opacity-70">Thiết lập workspace riêng cho team của bạn</span>
                                            </div>
                                        </button>

                                        {wantsNewOrg && (
                                            <div className="pt-2">
                                                <label className="block text-white/80 text-sm mb-2">Tên tổ chức</label>
                                                <div className="relative">
                                                    <Building2 size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                                                    <input
                                                        type="text"
                                                        value={orgName}
                                                        onChange={(e) => setOrgName(e.target.value)}
                                                        placeholder="Ví dụ: Công ty TNHH Kaizen"
                                                        className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full ${foundOrgs.length > 0 && selectedOrgId && !wantsNewOrg ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-white hover:bg-white/90 text-indigo-600'} text-white font-bold py-3 rounded-xl shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2`}
                                >
                                    {loading ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <>
                                            {isLogin
                                                ? 'Đăng nhập'
                                                : (step === 1
                                                    ? 'Tiếp tục'
                                                    : (selectedOrgId && !wantsNewOrg ? 'Yêu cầu tham gia' : 'Kích hoạt tổ chức')
                                                )
                                            }
                                            <ArrowRight size={20} />
                                        </>
                                    )}
                                    {/* Fix button text color for non-emerald state */}
                                    <style>{`
                                        button[type="submit"]:not(.bg-emerald-500) {
                                            color: ${isLogin || step === 1 || wantsNewOrg ? '#4f46e5' : 'white'};
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
