import React, { useState, useEffect } from 'react';
import {
  StudentProfile,
  DriveExamFile,
  fetchDriveExamFiles,
  DRIVE_FOLDER_ID,
  SPREADSHEET_ID,
} from '../services/googleWorkspace';
import { BuiltInExam, SAMPLE_EXAMS, calculateLevelFromScore } from '../data/sampleExams';
import { AIExamGeneratorModal } from './AIExamGeneratorModal';
import {
  FolderOpen,
  FileText,
  Clock,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Award,
  BookOpen,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Flame,
  TrendingUp,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Eye,
  AlertCircle,
  X,
  CreditCard,
  BrainCircuit,
} from 'lucide-react';

export interface UnifiedExamItem {
  id: string;
  title: string;
  category: string;
  source: 'drive' | 'builtin' | 'ai_generated';
  pdfUrl?: string;
  driveFileId?: string;
  modifiedTime?: string;
  durationMinutes: number;
  questionCount: number;
  builtInExam?: BuiltInExam;
}

interface ExamListProps {
  student: StudentProfile;
  isGoogleConnected: boolean;
  onConnectGoogle: () => void;
  onSelectExam: (exam: UnifiedExamItem, isMockMode?: boolean) => void;
  aiGeneratedExams: UnifiedExamItem[];
  submissionHistory: { [examId: string]: { score: number; level: string; date: string } };
  onOpenProfile?: () => void;
  onOpenFlashcards?: () => void;
}

export const ExamList: React.FC<ExamListProps> = ({
  student,
  isGoogleConnected,
  onConnectGoogle,
  onSelectExam,
  aiGeneratedExams,
  submissionHistory,
  onOpenProfile,
  onOpenFlashcards,
}) => {
  const [driveFiles, setDriveFiles] = useState<DriveExamFile[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [filterSource, setFilterSource] = useState<'all' | 'drive' | 'ai_generated' | 'builtin'>('all');

  // Mock Exam Modal State
  const [selectedMockExam, setSelectedMockExam] = useState<UnifiedExamItem | null>(null);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showAIGeneratorModal, setShowAIGeneratorModal] = useState<boolean>(false);

  const handleOpenMockModal = (exam: UnifiedExamItem) => {
    setSelectedMockExam(exam);
    setShowRulesModal(true);
  };

  const handleStartConfirmedMockExam = () => {
    if (!selectedMockExam) return;
    setShowRulesModal(false);
    // Request fullscreen if possible for proctored mode
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {
      // Ignored
    }
    onSelectExam(selectedMockExam, true);
  };

  const studentLevel = student.currentLevel || 'Tân thủ';
  const levelDetails = calculateLevelFromScore(
    studentLevel === 'Đại cao thủ'
      ? 9
      : studentLevel === 'Cao thủ'
      ? 7.5
      : studentLevel === 'Đại sư'
      ? 6.0
      : studentLevel === 'Nhập môn'
      ? 4.0
      : 2.0
  );

  const syncDrive = async () => {
    if (!isGoogleConnected) {
      onConnectGoogle();
      return;
    }

    try {
      setIsLoadingDrive(true);
      setDriveError(null);
      const files = await fetchDriveExamFiles();
      setDriveFiles(files);
      setLastSyncTime(new Date());
    } catch (err: any) {
      console.error('Error fetching drive files:', err);
      setDriveError(err.message || 'Không thể đồng bộ danh sách từ Google Drive');
    } finally {
      setIsLoadingDrive(false);
    }
  };

  useEffect(() => {
    if (isGoogleConnected) {
      syncDrive();
    }
  }, [isGoogleConnected]);

  // Combine Drive files and built-in sample exams
  const combinedExams: UnifiedExamItem[] = [];

  // 1. AI-generated practice tests
  aiGeneratedExams.forEach((exam) => combinedExams.push(exam));

  // 2. Drive PDF files
  driveFiles.forEach((file) => {
    const previewUrl = `https://drive.google.com/file/d/${file.id}/preview`;
    combinedExams.push({
      id: file.id,
      title: file.name.replace(/\.[^/.]+$/, ''),
      category: 'Đề thi từ Google Drive',
      source: 'drive',
      pdfUrl: previewUrl,
      driveFileId: file.id,
      modifiedTime: file.modifiedTime,
      durationMinutes: 90,
      questionCount: 22,
    });
  });

  // 3. Built-in standard exams
  SAMPLE_EXAMS.forEach((exam) => {
    combinedExams.push({
      id: exam.id,
      title: exam.title,
      category: exam.category,
      source: 'builtin',
      pdfUrl: exam.pdfUrl,
      durationMinutes: 90,
      questionCount: 22,
      builtInExam: exam,
    });
  });

  // Filtered exams
  const displayedExams = combinedExams.filter((e) => {
    if (filterSource === 'all') return true;
    return e.source === filterSource;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Student Profile & Level Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 text-white shadow-2xl p-6 sm:p-9 overflow-hidden border border-white/10">
        {/* Soft glowing mesh circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md text-sky-200 border border-white/15">
                👨‍🎓 {student.fullName}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 backdrop-blur-md text-slate-300 border border-white/10">
                Lớp {student.className} • {student.school}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Xin chào, <span className="text-sky-300">@{student.nickname}</span>! 👋
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Hãy chọn một bài kiểm tra bên dưới để bắt đầu phòng thi 90 phút. Sau khi nộp bài, AI Gemini sẽ phân tích điểm số, chỉ rõ lỗi sai và tự động gửi kết quả về Google Sheets.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-2.5">
              {onOpenProfile && (
                <button
                  type="button"
                  onClick={onOpenProfile}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer backdrop-blur-md shadow-xs hover:scale-[1.02]"
                >
                  <TrendingUp className="w-4 h-4 text-sky-300" />
                  <span>Hồ Sơ & Tiến Độ Recharts</span>
                </button>
              )}

              {onOpenFlashcards && (
                <button
                  type="button"
                  onClick={onOpenFlashcards}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-400/20 transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <CreditCard className="w-4 h-4 text-slate-950" />
                  <span>Ôn Nhanh Lý Thuyết (Flashcard 12)</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-slate-950 text-white font-extrabold">
                    Mới
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowAIGeneratorModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-black shadow-md shadow-indigo-500/25 transition-all cursor-pointer hover:scale-[1.02]"
              >
                <BrainCircuit className="w-4 h-4 text-amber-300" />
                <span>AI Ra Đề Theo Mức Điểm</span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-white/20 text-white font-extrabold">
                  AI
                </span>
              </button>
            </div>
          </div>

          {/* Current Rank Badge Card */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl p-5 rounded-3xl border border-white/20 shadow-lg shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-300 flex items-center justify-center text-3xl shadow-md shrink-0">
              {levelDetails.badge}
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-amber-300 font-extrabold">Cấp độ hiện tại</div>
              <div className="text-xl font-black text-white">{studentLevel}</div>
              <p className="text-[11px] text-slate-300 mt-1 max-w-[200px] leading-tight">
                {levelDetails.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mock Exam Spotlight Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-7 shadow-xl border border-rose-500/30 overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>Chế Độ Thi Thử Quốc Gia 2025 • Giám Thị Ảo</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Mô Phỏng Phòng Thi Tốt Nghiệp THPT Nghiêm Túc
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Trải nghiệm áp lực phòng thi thật với đồng hồ đếm ngược 90 phút cố định, tự động khóa thao tác ngoài trang, giám sát chuyển tab/rời màn hình và ghi nhận biên bản vi phạm về Google Sheets.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-bold text-slate-300">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>90 phút cố định</span>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Khóa chuyển tab</span>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Cảnh báo rời phòng</span>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Ghi biên bản Sheets</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col gap-2">
            <button
              onClick={() => {
                const target = combinedExams[0];
                if (target) handleOpenMockModal(target);
              }}
              className="py-3 px-5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-rose-900/40 hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Vào Thi Thử Đề Chuẩn 90p</span>
            </button>
            {onOpenFlashcards && (
              <button
                type="button"
                onClick={onOpenFlashcards}
                className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold border border-white/15 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5 text-amber-300" />
                <span>Ôn flashcard công thức trước khi thi</span>
              </button>
            )}
            <p className="text-[10px] text-center text-slate-400">
              Chuẩn cấu trúc Bộ GD&ĐT 2025
            </p>
          </div>
        </div>
      </div>

      {/* Google Drive Sync Controls Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-sky-400 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Thư mục đề thi Google Drive của giáo viên
              </h2>
              <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-slate-100 text-slate-600">
                1gtZYI73l...
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Hệ thống tự động quét và thêm đề PDF mới bất cứ khi nào bạn tải lên Google Drive.
              {lastSyncTime && (
                <span className="ml-1 text-slate-400">
                  (Đã quét: {lastSyncTime.toLocaleTimeString('vi-VN')})
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href={`https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <span>Mở Drive</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={syncDrive}
            disabled={isLoadingDrive}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDrive ? 'animate-spin' : ''}`} />
            <span>{isLoadingDrive ? 'Đang đồng bộ...' : 'Đồng bộ từ Drive'}</span>
          </button>
        </div>
      </div>

      {driveError && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start justify-between gap-3">
          <div>
            <span className="font-bold">Lưu ý kết nối Drive:</span> {driveError}.
            <div className="mt-0.5 text-slate-600">
              Bạn vẫn có thể luyện tập các đề thi mẫu chuẩn THPT 2025 có sẵn bên dưới.
            </div>
          </div>
          <button
            onClick={onConnectGoogle}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors"
          >
            Kết nối Google
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/60 text-xs font-bold">
          <button
            type="button"
            onClick={() => setFilterSource('all')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterSource === 'all'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả đề ({combinedExams.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterSource('drive')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterSource === 'drive'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📁 Google Drive ({driveFiles.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterSource('ai_generated')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterSource === 'ai_generated'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ✨ AI May Đo ({aiGeneratedExams.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterSource('builtin')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterSource === 'builtin'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📘 Đề Chuẩn 2025 ({SAMPLE_EXAMS.length})
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Hiển thị <span className="font-bold text-slate-800">{displayedExams.length}</span> đề ôn tập
        </div>
      </div>

      {/* Modern Exam Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedExams.map((exam) => {
          const history = submissionHistory[exam.id];

          return (
            <div
              key={exam.id}
              className={`rounded-3xl border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl flex flex-col justify-between overflow-hidden group bg-white ${
                exam.source === 'ai_generated'
                  ? 'border-indigo-200 ring-2 ring-indigo-500/20'
                  : exam.source === 'drive'
                  ? 'border-emerald-200/80 hover:border-emerald-400'
                  : 'border-slate-200/90 hover:border-indigo-300'
              }`}
            >
              {/* Colorful Top Accent Line */}
              <div
                className={`h-1.5 w-full ${
                  exam.source === 'ai_generated'
                    ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
                    : exam.source === 'drive'
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                }`}
              />

              <div className="p-6">
                {/* Badges */}
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      exam.source === 'ai_generated'
                        ? 'bg-indigo-100/80 text-indigo-800'
                        : exam.source === 'drive'
                        ? 'bg-emerald-100/80 text-emerald-800'
                        : 'bg-blue-100/70 text-blue-800'
                    }`}
                  >
                    {exam.source === 'ai_generated' ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        Đề AI May Đo Riêng
                      </>
                    ) : exam.source === 'drive' ? (
                      <>
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        PDF Google Drive
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        Đề Chuẩn THPT 2025
                      </>
                    )}
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-bold bg-slate-100 px-2.5 py-0.5 rounded-full">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {exam.durationMinutes} phút
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2 mb-3 group-hover:text-indigo-600 transition-colors">
                  {exam.title}
                </h3>

                {/* Exam specs pill tags */}
                <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold text-slate-600 mb-4">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                    12 Trắc nghiệm
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                    4 Đúng / Sai
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                    6 Trả lời ngắn
                  </span>
                </div>

                {/* Modified time */}
                {exam.modifiedTime && (
                  <p className="text-[11px] text-slate-400 mb-3">
                    Ngày tải lên: {new Date(exam.modifiedTime).toLocaleDateString('vi-VN')}
                  </p>
                )}

                {/* History status badge */}
                {history && (
                  <div className="mb-2 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs flex items-center justify-between">
                    <span className="text-emerald-800 font-bold flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Điểm cao nhất:
                    </span>
                    <span className="font-black text-emerald-900 text-sm">
                      {history.score.toFixed(2)}đ ({history.level})
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 space-y-2">
                <button
                  type="button"
                  onClick={() => handleOpenMockModal(exam)}
                  className="w-full py-3 px-4 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md bg-gradient-to-r from-rose-600 via-rose-700 to-amber-700 hover:from-rose-500 hover:to-amber-600 text-white hover:scale-[1.01]"
                >
                  <Lock className="w-4 h-4 text-amber-200" />
                  <span>Vào Thi Thử (90 Phút Khóa Tab)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectExam(exam, false)}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Luyện tập tự do (Không khóa tab)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mock Exam Rules Modal */}
      {showRulesModal && selectedMockExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-rose-900 via-slate-900 to-indigo-950 text-white p-6 relative">
              <button
                type="button"
                onClick={() => setShowRulesModal(false)}
                className="absolute top-5 right-5 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-500/30 text-rose-300 border border-rose-500/40 mb-2">
                <Lock className="w-3.5 h-3.5" />
                <span>Quy Chế Phòng Thi Thử 90 Phút Chuẩn THPT</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                {selectedMockExam.title}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Thí sinh: <span className="font-bold text-sky-300">{student.fullName}</span> (@{student.nickname})
              </p>
            </div>

            {/* Rules Content */}
            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-black text-sm text-amber-900 block">
                    Đọc kỹ quy định trước khi mở bài thi
                  </span>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Hệ thống thi thử được thiết kế để rèn luyện tâm lý phòng thi thật cho kỳ thi Tốt nghiệp THPT 2025.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-black flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Đồng hồ đếm ngược 90 phút cố định</span>
                    <span className="text-slate-500 text-[11px]">
                      Thời gian đếm lùi liên tục, không thể tạm dừng. Khi hết 90 phút, hệ thống tự động thu bài và chấm điểm.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 font-black flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Khóa chuyển tab & Giám sát rời màn hình</span>
                    <span className="text-slate-500 text-[11px]">
                      Giám thị ảo phát hiện ngay khi bạn chuyển tab, mở cửa sổ khác hoặc thu nhỏ trình duyệt. Cảnh báo kèm âm thanh sẽ kích hoạt lập tức.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 font-black flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Vô hiệu hóa chuột phải & phím sao chép</span>
                    <span className="text-slate-500 text-[11px]">
                      Chống sao chép nội dung câu hỏi để đảm bảo tính công bằng và trung thực học thuật.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 font-black flex items-center justify-center shrink-0">
                    4
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Ghi biên bản gửi về Google Sheets</span>
                    <span className="text-slate-500 text-[11px]">
                      Số lần vi phạm rời màn hình sẽ được ghi nhận vào cột đánh giá kết quả gửi trực tiếp cho giáo viên.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 pt-0 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowRulesModal(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleStartConfirmedMockExam}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-black shadow-lg shadow-rose-600/25 transition-all cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.02]"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Tôi Đồng Ý & Bắt Đầu Thi (90p)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Exam Generator Modal */}
      <AIExamGeneratorModal
        isOpen={showAIGeneratorModal}
        onClose={() => setShowAIGeneratorModal(false)}
        student={student}
        lastScore={
          Object.values(submissionHistory).length > 0
            ? Object.values(submissionHistory)[Object.values(submissionHistory).length - 1].score
            : 5.0
        }
        lastLevel={studentLevel}
        onStartExam={(examItem, isMock) => {
          onSelectExam(examItem, isMock);
        }}
      />
    </div>
  );
};
