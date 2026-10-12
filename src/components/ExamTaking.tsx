import React, { useState, useEffect, useRef } from 'react';
import { UnifiedExamItem } from './ExamList';
import { StudentProfile } from '../services/googleWorkspace';
import {
  Clock,
  Send,
  AlertTriangle,
  CheckCircle2,
  Maximize2,
  ExternalLink,
  ChevronLeft,
  FileText,
  HelpCircle,
  Sparkles,
  ArrowRight,
  X,
  SplitSquareVertical,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Lock,
  Minimize2,
} from 'lucide-react';

export interface StudentAnswers {
  part1: Record<number, 'A' | 'B' | 'C' | 'D'>;
  part2: Record<number, Record<'a' | 'b' | 'c' | 'd', boolean | null>>;
  part3: Record<number, string>;
}

// Synthesize an alert sound using Web Audio API to notify the student upon returning
function playProctorAlertSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
    osc.frequency.setValueAtTime(440, ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // Audio context not allowed or failed
  }
}

interface ExamTakingProps {
  exam: UnifiedExamItem;
  student: StudentProfile;
  onBack: () => void;
  onSubmit: (answers: StudentAnswers, timeSpentSeconds: number, violationCount: number) => void;
  isSubmitting: boolean;
  initialMockMode?: boolean;
}

export const ExamTaking: React.FC<ExamTakingProps> = ({
  exam,
  student,
  onBack,
  onSubmit,
  isSubmitting,
  initialMockMode = true,
}) => {
  // 90 minutes = 5400 seconds
  const TOTAL_SECONDS = 90 * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(TOTAL_SECONDS);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'part1' | 'part2' | 'part3'>('all');
  const [activeViewMode, setActiveViewMode] = useState<'split' | 'pdf_only' | 'sheet_only'>('split');

  // Mock Exam Mode & Proctoring State
  const [isMockExamMode, setIsMockExamMode] = useState<boolean>(initialMockMode);
  const [violationCount, setViolationCount] = useState<number>(0);
  const [lastViolationTime, setLastViolationTime] = useState<string>('');
  const [showViolationModal, setShowViolationModal] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [toastWarning, setToastWarning] = useState<string | null>(null);

  // Answers State
  const [answers, setAnswers] = useState<StudentAnswers>({
    part1: {},
    part2: {
      1: { a: null, b: null, c: null, d: null },
      2: { a: null, b: null, c: null, d: null },
      3: { a: null, b: null, c: null, d: null },
      4: { a: null, b: null, c: null, d: null },
    },
    part3: {},
  });

  // Countdown Timer
  useEffect(() => {
    if (!isTimerActive) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit when time runs out
          handleTriggerSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerActive]);

  // Tab-switching, Window Blur & Keyboard Proctoring Listener
  useEffect(() => {
    if (!isMockExamMode) return;

    const recordViolation = (reason: string) => {
      const nowTime = new Date().toLocaleTimeString('vi-VN');
      setLastViolationTime(nowTime);
      setViolationCount((prev) => {
        const next = prev + 1;
        setShowViolationModal(true);
        playProctorAlertSound();
        return next;
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordViolation('Rời khỏi tab thi');
      }
    };

    const handleWindowBlur = () => {
      // In Mock Exam mode, window blur triggers proctoring warning
      if (document.hidden) return; // avoid duplicate with visibilitychange
      recordViolation('Mất tiêu điểm cửa sổ làm bài');
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Bài thi thử 90 phút đang diễn ra. Bạn có chắc chắn muốn rời khỏi?';
      return e.returnValue;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent copy/paste shortcuts or developer console in Mock Mode
      if (
        (e.ctrlKey || e.metaKey) &&
        ['c', 'v', 'u', 's', 'p'].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        setToastWarning('⚠️ Chế độ thi thử nghiêm túc: Phím tắt sao chép bị vô hiệu hóa.');
        setTimeout(() => setToastWarning(null), 3000);
      }
      if (e.key === 'F12') {
        e.preventDefault();
        setToastWarning('⚠️ Chế độ thi thử nghiêm túc: Phím chức năng bị khóa.');
        setTimeout(() => setToastWarning(null), 3000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMockExamMode]);

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
        }
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  };

  const timeSpentSeconds = TOTAL_SECONDS - secondsRemaining;

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Helper calculation of completed questions
  const part1DoneCount = Object.keys(answers.part1).length;
  let part2DoneCount = 0;
  for (let q = 1; q <= 4; q++) {
    const qAns = answers.part2[q];
    if (qAns && qAns.a !== null && qAns.b !== null && qAns.c !== null && qAns.d !== null) {
      part2DoneCount++;
    }
  }
  const part3DoneCount = Object.values(answers.part3).filter((v) => (v || '').trim() !== '').length;
  const totalDoneCount = part1DoneCount + part2DoneCount + part3DoneCount;
  const totalQuestions = 22; // 12 + 4 + 6

  // Handlers for Part 1
  const handleSelectPart1 = (qNum: number, opt: 'A' | 'B' | 'C' | 'D') => {
    setAnswers((prev) => ({
      ...prev,
      part1: {
        ...prev.part1,
        [qNum]: opt,
      },
    }));
  };

  // Handlers for Part 2
  const handleSelectPart2 = (
    qNum: number,
    sub: 'a' | 'b' | 'c' | 'd',
    value: boolean
  ) => {
    setAnswers((prev) => ({
      ...prev,
      part2: {
        ...prev.part2,
        [qNum]: {
          ...(prev.part2[qNum] || { a: null, b: null, c: null, d: null }),
          [sub]: value,
        },
      },
    }));
  };

  // Handlers for Part 3
  const handleInputPart3 = (qNum: number, val: string) => {
    setAnswers((prev) => ({
      ...prev,
      part3: {
        ...prev.part3,
        [qNum]: val,
      },
    }));
  };

  const handleTriggerSubmit = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = () => {
    setIsTimerActive(false);
    setShowConfirmModal(false);
    onSubmit(answers, timeSpentSeconds, violationCount);
  };

  // Is urgent time (< 10 mins)
  const isUrgent = secondsRemaining < 600;

  return (
    <div
      className="min-h-screen bg-slate-100 flex flex-col select-none relative"
      onContextMenu={(e) => {
        if (isMockExamMode) {
          e.preventDefault();
          setToastWarning('⛔ Chế độ thi thử nghiêm túc: Chuột phải đã bị khóa để đảm bảo công bằng.');
          setTimeout(() => setToastWarning(null), 3500);
        }
      }}
    >
      {/* Toast Warning Banner */}
      {toastWarning && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/90 text-amber-300 border border-amber-400/40 shadow-xl backdrop-blur-md text-xs font-bold flex items-center gap-2 animate-bounce">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>{toastWarning}</span>
        </div>
      )}
      {/* Top Fixed Control Bar */}
      <div className="sticky top-0 z-30 bg-slate-900 text-white shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Back & Exam Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => {
                if (
                  confirm(
                    'Bạn có chắc chắn muốn rời khỏi bài kiểm tra? Tiến trình hiện tại sẽ không được lưu.'
                  )
                ) {
                  onBack();
                }
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold truncate text-slate-100">
                  {exam.title}
                </h1>
                {isMockExamMode && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    <Lock className="w-3 h-3 text-rose-400" /> Thi Thử Khóa Tab
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <span className="font-semibold text-sky-400">@{student.nickname}</span>
                <span>•</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded-md font-bold text-slate-200">
                  {totalDoneCount}/{totalQuestions} câu hoàn thành ({Math.round((totalDoneCount / totalQuestions) * 100)}%)
                </span>
                {isMockExamMode && violationCount > 0 && (
                  <span className="text-rose-400 font-bold flex items-center gap-0.5">
                    <ShieldAlert className="w-3 h-3" />
                    {violationCount} lần rời tab
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Countdown Timer, Fullscreen & Submit */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Proctoring Status Pill */}
            {isMockExamMode && (
              <div
                title="Giám thị ảo đang theo dõi việc chuyển tab & rời màn hình"
                className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                  violationCount === 0
                    ? 'bg-emerald-950/70 text-emerald-300 border-emerald-600/40'
                    : 'bg-rose-950/80 text-rose-300 border-rose-600/60 animate-pulse'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Giám thị ảo: {violationCount === 0 ? 'Nghiêm túc 100%' : `${violationCount} vi phạm`}</span>
              </div>
            )}

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Bật toàn màn hình (Khuyên dùng)'}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* View Mode Toggle for Mobile & Desktop */}
            <div className="hidden sm:flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-semibold">
              <button
                onClick={() => setActiveViewMode('split')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeViewMode === 'split' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Chia đôi
              </button>
              <button
                onClick={() => setActiveViewMode('pdf_only')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeViewMode === 'pdf_only' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Xem đề PDF
              </button>
              <button
                onClick={() => setActiveViewMode('sheet_only')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeViewMode === 'sheet_only' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Phiếu làm bài
              </button>
            </div>

            {/* Fixed 90-Minute Countdown Badge */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl font-mono text-sm sm:text-base font-black border transition-all ${
                isUrgent
                  ? 'bg-rose-950 text-rose-300 border-rose-500 shadow-lg shadow-rose-950/50 animate-pulse'
                  : 'bg-slate-800 text-amber-300 border-slate-700 shadow-inner'
              }`}
            >
              <Clock className={`w-4 h-4 ${isUrgent ? 'text-rose-400' : 'text-amber-400'}`} />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleTriggerSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-900/40 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Nộp bài</span>
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-800/80 h-1 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${(totalDoneCount / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Workspace (Dual Pane) */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANE: PDF Viewer / Exam Paper */}
        {(activeViewMode === 'split' || activeViewMode === 'pdf_only') && (
          <div
            className={`${
              activeViewMode === 'pdf_only' ? 'lg:col-span-12' : 'lg:col-span-7'
            } bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-6.5rem)]`}
          >
            {/* PDF Viewer Header */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-700">
                  {exam.source === 'drive' ? 'File Đề PDF Từ Google Drive' : 'Đề Khảo Sát Toán Học'}
                </span>
              </div>
              {exam.pdfUrl && (
                <a
                  href={exam.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                >
                  <span>Mở tab mới</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* PDF Embedded Frame or Built-in questions reader */}
            <div className="flex-1 bg-slate-100 overflow-y-auto">
              {exam.source === 'drive' && exam.pdfUrl ? (
                <iframe
                  src={exam.pdfUrl}
                  title="PDF Exam View"
                  className="w-full h-full min-h-[500px] border-0"
                  allow="autoplay"
                />
              ) : exam.builtInExam ? (
                /* Rich reader for built-in or AI exam */
                <div className="p-6 space-y-8 bg-white max-w-3xl mx-auto">
                  <div className="text-center pb-4 border-b border-slate-200">
                    <h2 className="text-base font-bold text-slate-900 uppercase">
                      BỘ GIÁO DỤC VÀ ĐÀO TẠO • KỲ THI TỐT NGHIỆP THPT 2025
                    </h2>
                    <p className="text-sm font-semibold text-blue-700 mt-1">
                      {exam.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Thời gian làm bài: 90 phút (Không kể thời gian phát đề)
                    </p>
                  </div>

                  {/* Section 1 Content */}
                  <div>
                    <div className="mb-4 pb-2 border-b-2 border-blue-600">
                      <h3 className="font-bold text-slate-900 text-sm">
                        PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn (12 câu)
                      </h3>
                      <p className="text-xs text-slate-500 italic">
                        Thí sinh trả lời từ câu 1 đến câu 12. Mỗi câu hỏi chỉ chọn một phương án.
                      </p>
                    </div>

                    <div className="space-y-6">
                      {exam.builtInExam.part1.map((q) => (
                        <div key={q.id} className="text-sm space-y-2">
                          <p className="font-medium text-slate-900">
                            <span className="font-bold text-blue-700">Câu {q.id}:</span> {q.question}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                            {Object.entries(q.options).map(([key, opt]) => (
                              <div
                                key={key}
                                onClick={() => handleSelectPart1(q.id, key as any)}
                                className={`p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                                  answers.part1[q.id] === key
                                    ? 'bg-blue-50 border-blue-500 font-bold text-blue-900'
                                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <span className="font-bold mr-1.5 text-blue-600">{key}.</span>
                                {opt}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 2 Content */}
                  <div>
                    <div className="mb-4 pb-2 border-b-2 border-indigo-600">
                      <h3 className="font-bold text-slate-900 text-sm">
                        PHẦN II. Câu trắc nghiệm đúng sai (4 câu)
                      </h3>
                      <p className="text-xs text-slate-500 italic">
                        Thí sinh trả lời từ câu 1 đến câu 4. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn đúng hoặc sai.
                      </p>
                    </div>

                    <div className="space-y-6">
                      {exam.builtInExam.part2.map((q) => (
                        <div key={q.id} className="text-sm space-y-2">
                          <p className="font-medium text-slate-900">
                            <span className="font-bold text-indigo-700">Câu {q.id}:</span> {q.question}
                          </p>
                          <div className="space-y-1.5 pl-4">
                            {q.subItems.map((sub) => {
                              const currVal = answers.part2[q.id]?.[sub.key];
                              return (
                                <div
                                  key={sub.key}
                                  className="flex items-center justify-between p-2 rounded-lg border border-slate-200 text-xs gap-3"
                                >
                                  <span>
                                    <span className="font-bold mr-1 text-indigo-600">
                                      {sub.key})
                                    </span>
                                    {sub.content}
                                  </span>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleSelectPart2(q.id, sub.key, true)}
                                      className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer ${
                                        currVal === true
                                          ? 'bg-emerald-600 text-white'
                                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                      }`}
                                    >
                                      Đúng
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSelectPart2(q.id, sub.key, false)}
                                      className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer ${
                                        currVal === false
                                          ? 'bg-rose-600 text-white'
                                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                      }`}
                                    >
                                      Sai
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 3 Content */}
                  <div>
                    <div className="mb-4 pb-2 border-b-2 border-teal-600">
                      <h3 className="font-bold text-slate-900 text-sm">
                        PHẦN III. Câu trắc nghiệm trả lời ngắn (6 câu)
                      </h3>
                      <p className="text-xs text-slate-500 italic">
                        Thí sinh trả lời từ câu 1 đến câu 6. Điền kết quả số vào ô trả lời.
                      </p>
                    </div>

                    <div className="space-y-6">
                      {exam.builtInExam.part3.map((q) => (
                        <div key={q.id} className="text-sm space-y-2">
                          <p className="font-medium text-slate-900">
                            <span className="font-bold text-teal-700">Câu {q.id}:</span> {q.question}
                          </p>
                          <div className="flex items-center gap-3 pl-4">
                            <span className="text-xs text-slate-500 font-semibold">Đáp án:</span>
                            <input
                              type="text"
                              placeholder="Nhập giá trị..."
                              value={answers.part3[q.id] || ''}
                              onChange={(e) => handleInputPart3(q.id, e.target.value)}
                              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 w-40 font-mono font-bold"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <p>Màn hình đề thi PDF</p>
                  {exam.pdfUrl && (
                    <a
                      href={exam.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600"
                    >
                      <span>Xem file PDF gốc</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* RIGHT PANE: Digital Answer Sheet (Phiếu Làm Bài Trắc Nghiệm 2025) */}
        {(activeViewMode === 'split' || activeViewMode === 'sheet_only') && (
          <div
            className={`${
              activeViewMode === 'sheet_only' ? 'lg:col-span-12' : 'lg:col-span-5'
            } bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-6.5rem)]`}
          >
            {/* Answer Sheet Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Phiếu Trả Lời Trắc Nghiệm
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-slate-200">
                  {totalDoneCount}/22 câu đã làm
                </span>
              </div>
              <div className="text-[11px] text-slate-300">
                Theo định dạng cấu trúc đề thi tốt nghiệp THPT năm 2025
              </div>
            </div>

            {/* Answer Sheet Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
              {/* PHẦN 1: TRẮC NGHIỆM KHÁCH QUAN (12 CÂU) */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                      Phần I. Trắc nghiệm khách quan
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Gồm 12 câu; học sinh chọn đáp án A, B, C, D
                    </p>
                  </div>
                  <span className="text-xs font-bold text-blue-600">
                    {part1DoneCount}/12
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((qNum) => {
                    const currentSelected = answers.part1[qNum];
                    return (
                      <div
                        key={qNum}
                        className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 shadow-2xs"
                      >
                        <span className="text-xs font-bold text-slate-700 w-8">
                          Câu {qNum}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleSelectPart1(qNum, opt)}
                              className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                                currentSelected === opt
                                  ? 'bg-blue-600 text-white shadow-xs scale-105'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PHẦN 2: TRẮC NGHIỆM ĐÚNG SAI (4 CÂU, MỖI CÂU 4 Ý) */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                      Phần 2: Trắc nghiệm đúng, sai
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Gồm 4 câu; mỗi câu gồm 4 ý. Chọn Đúng hoặc Sai cho mỗi ý
                    </p>
                  </div>
                  <span className="text-xs font-bold text-indigo-600">
                    {part2DoneCount}/4
                  </span>
                </div>

                <div className="space-y-3">
                  {[1, 2, 3, 4].map((qNum) => {
                    const qAns = answers.part2[qNum] || { a: null, b: null, c: null, d: null };
                    return (
                      <div
                        key={qNum}
                        className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-2"
                      >
                        <div className="text-xs font-bold text-slate-800">
                          Câu {qNum}:
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {(['a', 'b', 'c', 'd'] as const).map((subKey) => {
                            const val = qAns[subKey];
                            return (
                              <div
                                key={subKey}
                                className="flex items-center justify-between px-2 py-1.5 rounded-md bg-slate-50 border border-slate-200"
                              >
                                <span className="text-xs font-bold text-slate-700">
                                  Ý {subKey})
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleSelectPart2(qNum, subKey, true)}
                                    className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                                      val === true
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                    }`}
                                  >
                                    Đ
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSelectPart2(qNum, subKey, false)}
                                    className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                                      val === false
                                        ? 'bg-rose-600 text-white'
                                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                    }`}
                                  >
                                    S
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PHẦN 3: TRẢ LỜI NGẮN (6 CÂU) */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                      Phần 3: Trả lời ngắn
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Gồm 6 câu; Học sinh chọn câu rồi nhập đáp án
                    </p>
                  </div>
                  <span className="text-xs font-bold text-teal-600">
                    {part3DoneCount}/6
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[1, 2, 3, 4, 5, 6].map((qNum) => (
                    <div
                      key={qNum}
                      className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-2"
                    >
                      <span className="text-xs font-bold text-slate-700 w-14">
                        Câu {qNum}:
                      </span>
                      <input
                        type="text"
                        placeholder="Nhập đáp án..."
                        value={answers.part3[qNum] || ''}
                        onChange={(e) => handleInputPart3(qNum, e.target.value)}
                        className="flex-1 px-2.5 py-1 text-xs font-mono font-bold rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit CTA Bottom */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTriggerSubmit}
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Hoàn Thành & Nộp Bài Chấm Điểm</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal Before Submit */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Xác nhận nộp bài thi?
              </h3>

              <div className="text-xs text-slate-600 space-y-2 mb-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex justify-between">
                  <span>Thời gian đã làm:</span>
                  <span className="font-bold text-slate-800">
                    {Math.floor(timeSpentSeconds / 60)} phút {timeSpentSeconds % 60} giây
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Phần I (Trắc nghiệm):</span>
                  <span className="font-bold text-blue-600">{part1DoneCount}/12 câu</span>
                </div>
                <div className="flex justify-between">
                  <span>Phần 2 (Đúng / Sai):</span>
                  <span className="font-bold text-indigo-600">{part2DoneCount}/4 câu</span>
                </div>
                <div className="flex justify-between">
                  <span>Phần 3 (Trả lời ngắn):</span>
                  <span className="font-bold text-teal-600">{part3DoneCount}/6 câu</span>
                </div>
                {totalDoneCount < totalQuestions && (
                  <div className="pt-2 border-t border-slate-200 text-amber-700 font-semibold">
                    ⚠️ Bạn vẫn còn {totalQuestions - totalDoneCount} câu chưa điền đáp án!
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-500 mb-6">
                Sau khi nộp, hệ thống sẽ sử dụng AI Gemini để chấm điểm tự động, đưa ra lời giải chi tiết, phân tích lỗi sai và gửi kết quả về Google Sheets.
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Tiếp tục làm bài
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  Xác nhận nộp bài
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Proctoring Warning Modal when tab blur/switching is detected */}
      {showViolationModal && isMockExamMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-rose-500 overflow-hidden text-center p-6 sm:p-7 space-y-4 animate-scale-up">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-9 h-9 animate-bounce" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-800 mb-2">
                🚨 CẢNH BÁO GIÁM THỊ ẢO
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Phát Hiện Rời Khỏi Màn Hình Làm Bài!
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Hệ thống thi thử nghiêm túc phát hiện bạn vừa chuyển sang tab khác hoặc thu nhỏ cửa sổ trình duyệt.
              </p>
              {lastViolationTime && (
                <div className="mt-1 text-[11px] font-mono font-bold text-rose-700 bg-rose-50 inline-block px-2.5 py-0.5 rounded-md border border-rose-200">
                  Thời điểm ghi nhận: {lastViolationTime}
                </div>
              )}
            </div>

            {/* Violation Meter */}
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-2 text-left">
              <div className="flex justify-between items-center font-bold">
                <span>Số lần cảnh báo vi phạm:</span>
                <span className="text-rose-700 font-black text-sm">{violationCount} / 3 lần quy định</span>
              </div>

              {/* Progress dots */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <div className={`h-2 rounded-full ${violationCount >= 1 ? 'bg-rose-500' : 'bg-slate-200'}`} />
                <div className={`h-2 rounded-full ${violationCount >= 2 ? 'bg-rose-600' : 'bg-slate-200'}`} />
                <div className={`h-2 rounded-full ${violationCount >= 3 ? 'bg-rose-800 animate-pulse' : 'bg-slate-200'}`} />
              </div>

              <p className="text-[11px] text-rose-700/90 leading-tight pt-1">
                {violationCount >= 3
                  ? '⚠️ Bạn đã vi phạm từ 3 lần trở lên! Biên bản thi sẽ ghi rõ hành vi này gửi trực tiếp lên Google Sheets của giáo viên.'
                  : '* Quy chế phòng thi thử: Nghiêm cấm mở tab khác, tra cứu tài liệu hoặc thu nhỏ cửa sổ để đảm bảo đánh giá đúng thực lực.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowViolationModal(false);
                // Attempt to re-enter fullscreen
                try {
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
                  }
                } catch {
                  // ignored
                }
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm shadow-lg shadow-rose-600/30 transition-all cursor-pointer hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Tôi Cam Kết Tiếp Tục Làm Bài Nghiêm Túc</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
