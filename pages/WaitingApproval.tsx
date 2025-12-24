import React from 'react';
import { Clock, LogOut, MessageSquare } from 'lucide-react';
import { logout } from '../services/apiService';
import { useNavigate } from 'react-router-dom';

const WaitingApproval: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-200/50 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-200/50 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-2xl relative z-10 text-center">
                <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Clock size={40} className="text-indigo-600 animate-pulse" />
                </div>

                <h1 className="text-2xl font-bold text-slate-800 mb-2">Đang chờ phê duyệt</h1>
                <p className="text-slate-600 mb-8">
                    Tài khoản của bạn đã được khởi tạo thành công. Vui lòng chờ quản trị viên của tổ chức phê duyệt để bắt đầu hành trình Kaizen của bạn.
                </p>

                <div className="space-y-4">
                    <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-start gap-4 text-left">
                        <MessageSquare className="text-indigo-600 shrink-0 mt-1" size={20} />
                        <div>
                            <p className="text-sm font-semibold text-indigo-900">Bạn cần hỗ trợ?</p>
                            <p className="text-xs text-indigo-700/70">Vui lòng liên hệ với bộ phận nhân sự hoặc quản trị viên hệ thống của công ty bạn.</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full py-4 px-6 bg-slate-800 text-white font-bold rounded-2xl shadow-lg hover:bg-slate-900 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        <LogOut size={20} />
                        Đăng xuất
                    </button>

                    <p className="text-xs text-slate-400 mt-4">
                        Chúng tôi sẽ thông báo cho bạn ngay khi tài khoản được kích hoạt.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WaitingApproval;
