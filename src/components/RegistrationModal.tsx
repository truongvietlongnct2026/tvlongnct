import React, { useState, useEffect } from 'react';
import {
  StudentProfile,
  saveStudentRegistrationToSheet,
  fetchRegisteredNicknames,
  SPREADSHEET_ID,
} from '../services/googleWorkspace';
import { googleSignIn, getAccessToken } from '../services/googleAuth';
import {
  User,
  GraduationCap,
  School,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  LogIn,
} from 'lucide-react';

interface RegistrationModalProps {
  onSuccess: (student: StudentProfile) => void;
  existingRegisteredList: StudentProfile[];
  isGoogleConnected: boolean;
  onGoogleConnected: () => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  onSuccess,
  existingRegisteredList,
  isGoogleConnected,
  onGoogleConnected,
}) => {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [className, setClassName] = useState('12A1');
  const [school, setSchool] = useState('');
  const [loginNickname, setLoginNickname] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [existingNicknames, setExistingNicknames] = useState<string[]>([]);

  useEffect(() => {
    // Collect local nicknames
    const localNicks = existingRegisteredList.map((s) => s.nickname.toLowerCase());
    setExistingNicknames(localNicks);

    // If connected to Google, also check Google Sheet nicknames
    async function loadSheetNicks() {
      try {
        const sheetNicks = await fetchRegisteredNicknames();
        setExistingNicknames((prev) => Array.from(new Set([...prev, ...sheetNicks])));
      } catch (err) {
        console.warn('Cannot fetch sheet nicknames:', err);
      }
    }
    loadSheetNicks();
  }, [existingRegisteredList, isGoogleConnected]);

  // Validate nickname duplicate in real time
  const isNicknameDuplicate = (nick: string) => {
    const clean = nick.trim().toLowerCase();
    if (!clean) return false;
    return existingNicknames.includes(clean);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setStatusMsg(null);

    const cleanNick = nickname.trim();
    const cleanName = fullName.trim();
    const cleanClass = className.trim();
    const cleanSchool = school.trim();

    if (!cleanName || !cleanNick || !cleanClass || !cleanSchool) {
      setErrorMsg('Vui lòng điền đầy đủ tất cả các trường thông tin.');
      return;
    }

    if (isNicknameDuplicate(cleanNick)) {
      setErrorMsg(
        `Nickname "${cleanNick}" đã tồn tại! Mỗi học sinh phải có 1 nickname riêng biệt, không được trùng lặp.`
      );
      return;
    }

    setIsLoading(true);
    setStatusMsg('Đang lưu thông tin học sinh...');

    const newStudent: StudentProfile = {
      fullName: cleanName,
      nickname: cleanNick,
      className: cleanClass,
      school: cleanSchool,
      registeredAt: new Date().toISOString(),
      currentLevel: 'Tân thủ',
    };

    try {
      // If user hasn't connected Google Workspace yet, prompt them to connect
      let token = await getAccessToken();
      if (!token) {
        setStatusMsg('Đang kết nối tài khoản Google để ghi dữ liệu vào Google Sheets...');
        const authRes = await googleSignIn();
        if (authRes) {
          onGoogleConnected();
          newStudent.email = authRes.user.email || undefined;
        }
      }

      setStatusMsg('Đang tự động đồng bộ vào Google Sheets...');
      await saveStudentRegistrationToSheet(newStudent);
      setStatusMsg('Đăng ký thành công! Đã lưu vào Google Sheets.');

      // Notify parent
      onSuccess(newStudent);
    } catch (err: any) {
      console.error('Registration error:', err);
      // Even if Google Sheets gives permission notice, save student profile locally and continue smoothly
      setStatusMsg('Đã ghi nhận thông tin học sinh. Đang chuyển vào phòng thi...');
      setTimeout(() => {
        onSuccess(newStudent);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const cleanNick = loginNickname.trim().toLowerCase();
    if (!cleanNick) {
      setErrorMsg('Vui lòng nhập nickname của bạn.');
      return;
    }

    const found = existingRegisteredList.find(
      (s) => s.nickname.toLowerCase() === cleanNick
    );

    if (found) {
      onSuccess(found);
    } else {
      setErrorMsg(
        `Không tìm thấy nickname "${loginNickname}". Vui lòng đăng ký mới hoặc kiểm tra lại chính tả.`
      );
    }
  };

  const handleConnectGoogleOnly = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      await googleSignIn();
      onGoogleConnected();
    } catch (err: any) {
      setErrorMsg('Kết nối Google thất bại: ' + (err.message || 'Lỗi không xác định'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-scale-up">
        {/* Header Banner with Math accents */}
        <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 p-7 text-white text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-sky-400/20 rounded-full blur-xl" />
          
          {/* Floating Math Symbols */}
          <span className="absolute top-4 left-6 text-2xl font-bold opacity-20 pointer-events-none select-none font-serif">∫</span>
          <span className="absolute bottom-4 right-8 text-2xl font-bold opacity-20 pointer-events-none select-none font-serif">√x</span>
          <span className="absolute top-6 right-16 text-lg font-bold opacity-20 pointer-events-none select-none font-serif">π</span>

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-lg mb-3 border border-white/30 shadow-inner">
            <GraduationCap className="w-7 h-7 text-amber-300 drop-shadow-xs" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Khảo Sát & Luyện Thi Toán 12
          </h2>
          <p className="text-xs text-indigo-100/90 mt-1.5 font-medium max-w-sm mx-auto">
            Học tập thông minh cùng AI Gemini • Chuẩn cấu trúc THPT 2025 • Đồng bộ Drive & Sheets
          </p>
        </div>

        {/* Modern Pill Tab Toggle */}
        <div className="p-3 bg-slate-50 border-b border-slate-100">
          <div className="flex bg-slate-200/70 p-1 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bước 1: Đăng Ký Học Sinh Mới
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đăng Nhập Bằng Nickname
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-7">
          {/* Target Sheet Info Badge */}
          <div className="mb-5 p-3 rounded-xl bg-blue-50/80 border border-blue-100 text-xs text-blue-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Đồng bộ tự động:</span> Thông tin đăng ký và kết quả làm bài sẽ tự động lưu vào{' '}
              <a
                href={`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-blue-700 underline inline-flex items-center gap-0.5"
              >
                Google Sheets của giáo viên
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {statusMsg && (
            <div className="mb-4 p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-700 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>{statusMsg}</span>
            </div>
          )}

          {mode === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Họ và tên */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên học sinh <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn An"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Nick name */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Nick name <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500 italic">
                    (Mỗi học sinh 1 nick name duy nhất)
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="an_toan12, sieusaotoan, ..."
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value.replace(/\s+/g, '_'))}
                    className={`w-full pl-8 pr-9 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 ${
                      isNicknameDuplicate(nickname)
                        ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30'
                        : nickname.trim().length > 2
                        ? 'border-emerald-400 focus:ring-emerald-500 bg-emerald-50/20'
                        : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {nickname.trim().length > 2 && (
                    <div className="absolute right-3 top-2.5">
                      {isNicknameDuplicate(nickname) ? (
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                  )}
                </div>
                {isNicknameDuplicate(nickname) && (
                  <p className="text-[11px] text-rose-600 mt-1">
                    ⚠️ Nickname này đã bị trùng! Vui lòng chọn nick name khác.
                  </p>
                )}
              </div>

              {/* Lớp & Trường */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lớp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="12A1, 12 Tin, ..."
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Trường <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <School className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="THPT Chuyên..."
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Google Sign-in button required by guideline */}
              {!isGoogleConnected && (
                <div className="pt-2">
                  <div className="text-[11px] text-slate-500 mb-1.5 text-center">
                    Hoặc liên kết nhanh với tài khoản Google để cấp quyền lưu trữ:
                  </div>
                  <button
                    type="button"
                    onClick={handleConnectGoogleOnly}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-slate-300 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-xs transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 48 48">
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      />
                    </svg>
                    <span>Sign in with Google (Đăng nhập Google)</span>
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || isNicknameDuplicate(nickname)}
                className="w-full mt-4 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang xử lý & lưu vào Sheets...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng Ký & Vào Làm Bài Thi</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nhập Nickname của bạn
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Nhập chính xác nickname đã đăng ký"
                    value={loginNickname}
                    onChange={(e) => setLoginNickname(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {existingRegisteredList.length > 0 && (
                <div>
                  <div className="text-[11px] text-slate-500 mb-1.5 font-medium">
                    Học sinh trên thiết bị này:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {existingRegisteredList.map((s) => (
                      <button
                        key={s.nickname}
                        type="button"
                        onClick={() => onSuccess(s)}
                        className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 font-medium border border-slate-200 transition-colors"
                      >
                        @{s.nickname} ({s.fullName})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng Nhập Vào Hệ Thống</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
