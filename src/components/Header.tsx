import React from 'react';
import { StudentProfile } from '../services/googleWorkspace';
import { calculateLevelFromScore } from '../data/sampleExams';
import { LogOut, User, School, Sparkles, Database, CheckCircle2, AlertCircle, LineChart as ChartIcon, CreditCard, BookOpen } from 'lucide-react';

interface HeaderProps {
  student: StudentProfile | null;
  onLogout: () => void;
  isGoogleConnected: boolean;
  onConnectGoogle: () => void;
  onOpenProfile?: () => void;
  currentScreen?: 'list' | 'taking' | 'result' | 'flashcards';
  onNavigateTo?: (screen: 'list' | 'flashcards') => void;
}

export const Header: React.FC<HeaderProps> = ({
  student,
  onLogout,
  isGoogleConnected,
  onConnectGoogle,
  onOpenProfile,
  currentScreen = 'list',
  onNavigateTo,
}) => {
  const currentLevelInfo = student?.currentLevel
    ? calculateLevelFromScore(
        student.currentLevel === 'Đại cao thủ'
          ? 9
          : student.currentLevel === 'Cao thủ'
          ? 7.5
          : student.currentLevel === 'Đại sư'
          ? 6.0
          : student.currentLevel === 'Nhập môn'
          ? 4.0
          : 2.5
      )
    : null;

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigateTo && onNavigateTo('list')}
            className="flex items-center gap-3 text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 font-black text-xl tracking-tighter group-hover:scale-105 transition-transform">
              ∫
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-900 bg-clip-text text-transparent">
                  Toán 12 THPT
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                  ✨ Chuẩn 2025
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Khảo Sát Đề PDF Drive & Chấm Điểm Thông Minh AI Gemini
              </p>
            </div>
          </button>
        </div>

        {/* Center Nav for students */}
        {student && onNavigateTo && (
          <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60 text-xs font-bold">
            <button
              onClick={() => onNavigateTo('list')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                currentScreen === 'list'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Đề Thi & Thi Thử</span>
            </button>

            <button
              onClick={() => onNavigateTo('flashcards')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                currentScreen === 'flashcards'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-500" />
              <span>Flashcard Toán 12</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-500 text-white font-extrabold animate-pulse">
                Mới
              </span>
            </button>
          </nav>
        )}

        {/* Right Info */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Google Workspace status indicator */}
          <div className="flex items-center">
            {isGoogleConnected ? (
              <span
                title="Đã kết nối Google Drive & Sheets"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden md:inline">Drive & Sheets</span>
                <span className="text-[10px] font-bold text-emerald-700">ĐÃ KẾT NỐI</span>
              </span>
            ) : (
              <button
                onClick={onConnectGoogle}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Kết nối</span> Drive & Sheets
              </button>
            )}
          </div>

          {student ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onOpenProfile}
                title="Xem hồ sơ & biểu đồ tiến độ"
                className="group flex items-center gap-2.5 bg-white hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 py-1 px-3 rounded-2xl transition-all cursor-pointer text-left shadow-2xs hover:shadow-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
                  {student.nickname.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      @{student.nickname}
                    </span>
                    {student.currentLevel && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-amber-100 text-amber-800">
                        {currentLevelInfo?.badge} {student.currentLevel}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                    <span>{student.fullName}</span>
                    <span>•</span>
                    <span className="text-indigo-600 font-semibold flex items-center gap-0.5">
                      <ChartIcon className="w-3 h-3" />
                      Tiến độ
                    </span>
                  </div>
                </div>
              </button>

              <button
                onClick={onLogout}
                title="Đăng xuất"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-500 font-medium">
              Vui lòng đăng ký / đăng nhập để làm bài
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
