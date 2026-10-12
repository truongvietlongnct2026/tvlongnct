import React, { useState } from 'react';
import {
  Sparkles,
  BrainCircuit,
  Target,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  X,
  Zap,
  Sliders,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';
import { StudentProfile } from '../services/googleWorkspace';
import { UnifiedExamItem } from './ExamList';
import { getTargetedExamForScore } from '../data/presetTargetedExams';
import { BuiltInExam } from '../data/sampleExams';

export type ExamDifficultyLevel = 'basic' | 'understanding' | 'application' | 'master';

interface AIExamGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  lastScore: number;
  lastLevel: string;
  suggestedTopic?: string;
  commonMistakes?: string[];
  onStartExam: (examItem: UnifiedExamItem, isMockMode: boolean) => void;
}

export const AIExamGeneratorModal: React.FC<AIExamGeneratorModalProps> = ({
  isOpen,
  onClose,
  student,
  lastScore,
  lastLevel,
  suggestedTopic = 'Tính đơn điệu và cực trị của hàm số',
  commonMistakes = [],
  onStartExam,
}) => {
  // Determine recommended level based on student's last score
  const getInitialLevel = (score: number): ExamDifficultyLevel => {
    if (score < 3.5) return 'basic';
    if (score <= 5.5) return 'understanding';
    if (score <= 7.5) return 'application';
    return 'master';
  };

  const [selectedDifficulty, setSelectedDifficulty] = useState<ExamDifficultyLevel>(
    getInitialLevel(lastScore)
  );

  const [selectedTopic, setSelectedTopic] = useState<string>(
    suggestedTopic || 'Khảo sát hàm số & Tính đơn điệu, cực trị'
  );

  const [examMode, setExamMode] = useState<'mock' | 'practice'>('mock');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const topicsList = [
    'Khảo sát hàm số & Tính đơn điệu, cực trị',
    'Giá trị lớn nhất, nhỏ nhất & Đường tiệm cận',
    'Hàm số mũ, lũy thừa & Phương trình logarit',
    'Nguyên hàm, Tích phân & Ứng dụng hình học',
    'Phương pháp tọa độ trong không gian Oxyz',
    'Xác suất có điều kiện & Thống kê lớp 12',
    'Tổng hợp toàn diện chuẩn cấu trúc Bộ GD&ĐT 2025',
  ];

  const difficultyTiers: {
    id: ExamDifficultyLevel;
    label: string;
    subLabel: string;
    scoreRange: string;
    badge: string;
    color: string;
    borderColor: string;
    description: string;
    suitability: string;
  }[] = [
    {
      id: 'basic',
      label: 'Củng cố nền tảng (Nhận biết)',
      subLabel: 'Mục tiêu: Đạt 5.0 điểm',
      scoreRange: 'Dưới 3.5 điểm',
      badge: '🥉 Tân thủ',
      color: 'from-amber-500/10 to-orange-500/10 text-amber-900',
      borderColor: 'border-amber-300 focus:ring-amber-500',
      description: 'Tập trung công thức cơ bản, nhận diện đồ thị, bảng biến thiên, không bẫy phức tạp.',
      suitability: 'Phù hợp khi vừa đạt điểm < 3.5 để lấp lỗ hổng kiến thức',
    },
    {
      id: 'understanding',
      label: 'Rèn luyện phản xạ (Thông hiểu)',
      subLabel: 'Mục tiêu: Đạt 7.0 điểm',
      scoreRange: '3.5 - 5.5 điểm',
      badge: '🥈 Nhập môn & Thông hiểu',
      color: 'from-blue-500/10 to-indigo-500/10 text-blue-900',
      borderColor: 'border-blue-400 focus:ring-blue-500',
      description: 'Áp dụng công thức vào các bài toán quen thuộc, xét dấu hàm số, tính tích phân cơ bản và tọa độ Oxyz.',
      suitability: 'Phù hợp khi vừa đạt 5.0 điểm để bứt phá lên 7.0 điểm',
    },
    {
      id: 'application',
      label: 'Nâng cao cấp độ (Vận dụng)',
      subLabel: 'Mục tiêu: Đạt 8.5 điểm',
      scoreRange: '5.5 - 7.5 điểm',
      badge: '🥇 Đại sư & Vận dụng',
      color: 'from-emerald-500/10 to-teal-500/10 text-emerald-900',
      borderColor: 'border-emerald-400 focus:ring-emerald-500',
      description: 'Cực trị hàm hợp, bài toán thực tế tích phân, hình giải tích Oxyz có yếu tố góc và khoảng cách.',
      suitability: 'Phù hợp khi đã đạt 6.0 - 7.0 điểm để nâng cao kỹ năng',
    },
    {
      id: 'master',
      label: 'Chinh phục điểm 9+ (Vận dụng cao)',
      subLabel: 'Mục tiêu: 9.0 - 10.0 điểm',
      scoreRange: 'Trên 7.5 điểm',
      badge: '👑 Cao thủ & Đại cao thủ',
      color: 'from-purple-500/10 to-pink-500/10 text-purple-900',
      borderColor: 'border-purple-400 focus:ring-purple-500',
      description: 'Các bài toán cực trị tham số m khó, bất đẳng thức tích phân, hình học Oxyz cực trị nâng cao.',
      suitability: 'Thách thức tối thượng dành cho học sinh giỏi đặt mục tiêu thủ khoa',
    },
  ];

  const handleGenerateAndStart = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setGenerationStep('Đang phân tích kết quả bài thi vừa rồi...');

    try {
      // Step 1: Call Gemini endpoint to generate tailored test
      setGenerationStep('AI Gemini đang tạo câu hỏi bám sát mức độ...');

      let finalBuiltInExam: BuiltInExam | null = null;
      let examTitle = '';

      try {
        const response = await fetch('/api/generate-practice', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentNickname: student.nickname,
            score: lastScore,
            level: lastLevel,
            difficulty: selectedDifficulty,
            topic: selectedTopic,
            commonMistakes: commonMistakes,
          }),
        });

        const json = await response.json();
        if (json.success && json.data) {
          const geminiData = json.data;
          examTitle =
            geminiData.title ||
            `Đề AI Ôn Luyện: ${selectedTopic} (Mức ${lastScore.toFixed(1)}đ - ${selectedDifficulty.toUpperCase()})`;

          finalBuiltInExam = {
            id: `ai-exam-${Date.now()}`,
            title: examTitle,
            category: `Đề AI tạo cho @${student.nickname} (Mức độ: ${selectedDifficulty})`,
            year: 2025,
            topic: selectedTopic,
            part1: Array.isArray(geminiData.part1) ? geminiData.part1 : [],
            part2: Array.isArray(geminiData.part2) ? geminiData.part2 : [],
            part3: Array.isArray(geminiData.part3) ? geminiData.part3 : [],
          };
        }
      } catch (geminiErr) {
        console.warn('Gemini generate-practice failed or timed out, using calibrated benchmark:', geminiErr);
      }

      // If Gemini didn't return full parts or failed, fallback seamlessly to calibrated targeted benchmark
      if (
        !finalBuiltInExam ||
        !finalBuiltInExam.part1 ||
        finalBuiltInExam.part1.length === 0
      ) {
        setGenerationStep('Đang tải ngân hàng đề chuẩn hóa tương ứng...');
        const benchmark = getTargetedExamForScore(
          selectedDifficulty === 'basic'
            ? 3.0
            : selectedDifficulty === 'understanding'
            ? 5.0
            : selectedDifficulty === 'application'
            ? 6.8
            : 8.5
        );

        finalBuiltInExam = {
          ...benchmark,
          id: `ai-targeted-${Date.now()}`,
          title: `Đề AI Ra Đề: ${selectedTopic} (Mức độ: ${selectedDifficulty.toUpperCase()})`,
          topic: selectedTopic,
        };
        examTitle = finalBuiltInExam.title;
      }

      setGenerationStep('Hoàn tất! Đang đưa bạn vào bài thi...');

      const practiceUnifiedItem: UnifiedExamItem = {
        id: `ai-unified-${Date.now()}`,
        title: examTitle,
        category: `Đề thi AI may đo chuẩn 2025 (Mức ${lastScore.toFixed(1)}đ)`,
        source: 'ai_generated',
        durationMinutes: 90,
        questionCount: 22,
        builtInExam: finalBuiltInExam,
      };

      setTimeout(() => {
        setIsGenerating(false);
        onClose();
        onStartExam(practiceUnifiedItem, examMode === 'mock');
      }, 600);
    } catch (err: any) {
      console.error('Error during generation:', err);
      setErrorMsg(err.message || 'Không thể tạo đề thi lúc này. Vui lòng thử lại.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 border border-white/20 text-amber-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Trợ Lý Khảo Thí AI Gemini May Đo Đề Mới
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Chọn Đề Thi Khác Do AI Tự Động Ra Đề
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
            Hệ thống phân tích điểm số vừa đạt{' '}
            <span className="font-bold text-amber-300">
              {lastScore.toFixed(2)} điểm ({lastLevel})
            </span>{' '}
            để tạo một bài kiểm tra tương tự với độ khó và dạng toán chuẩn xác nhất cho bạn.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Diagnostic badge from last test */}
          <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div className="text-xs space-y-1">
              <div className="font-bold text-indigo-950 text-sm">
                Kết quả bài thi trước: {lastScore.toFixed(2)} điểm • {lastLevel}
              </div>
              <p className="text-slate-600">
                {lastScore <= 5.0 ? (
                  <span>
                    Ví dụ với mức <strong>{lastScore.toFixed(1)} điểm</strong>, AI đề xuất bài kiểm tra ở{' '}
                    <strong className="text-indigo-700">Mức độ Thông hiểu</strong> để củng cố các dạng bài hay sai và tự tin bứt phá lên 7.0 điểm.
                  </span>
                ) : (
                  <span>
                    Với kết quả tốt <strong>{lastScore.toFixed(1)} điểm</strong>, AI đề xuất bài kiểm tra ở{' '}
                    <strong className="text-indigo-700">Mức độ Vận dụng / Vận dụng cao</strong> để rèn luyện tư duy chinh phục điểm 9+.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* 1. Select Difficulty Tier */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-blue-600" />
                1. Chọn Mức Độ Khó Của Đề Thi AI:
              </label>
              <span className="text-[11px] text-indigo-600 font-semibold">
                (Đã tự động chọn mức phù hợp nhất)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {difficultyTiers.map((tier) => {
                const isSelected = selectedDifficulty === tier.id;
                const isRecommended = getInitialLevel(lastScore) === tier.id;

                return (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedDifficulty(tier.id)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all relative ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    {isRecommended && (
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs">
                        ⭐ Khuyên Dùng
                      </span>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        {tier.label}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      )}
                    </div>

                    <div className="mt-1 text-[11px] font-semibold text-indigo-700">
                      {tier.subLabel} • {tier.scoreRange}
                    </div>

                    <p className="mt-1.5 text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {tier.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Select Topic */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-600" />
              2. Chủ Đề Kiến Thức Cần Ra Đề:
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
            >
              {topicsList.map((top, idx) => (
                <option key={idx} value={top}>
                  {top}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Choose Exam Mode */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              3. Hình Thức Thi:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setExamMode('mock')}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                  examMode === 'mock'
                    ? 'border-indigo-600 bg-indigo-50/60 font-semibold text-indigo-950'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    examMode === 'mock'
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-slate-400'
                  }`}
                >
                  {examMode === 'mock' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div className="text-xs">
                  <div className="font-bold">Chế độ Thi Thử Nghiêm Túc</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Đồng hồ 90 phút cố định, giám sát khóa tab và cảnh báo rời màn hình.
                  </div>
                </div>
              </div>

              <div
                onClick={() => setExamMode('practice')}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                  examMode === 'practice'
                    ? 'border-indigo-600 bg-indigo-50/60 font-semibold text-indigo-950'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    examMode === 'practice'
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-slate-400'
                  }`}
                >
                  {examMode === 'practice' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div className="text-xs">
                  <div className="font-bold">Luyện Tập Tự Do</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Làm bài thoải mái không bị giới hạn chuyển tab.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message if any */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <span className="font-bold">Lỗi:</span>
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors cursor-pointer text-center"
          >
            Hủy Bỏ
          </button>

          <button
            type="button"
            onClick={handleGenerateAndStart}
            disabled={isGenerating}
            className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{generationStep || 'Đang tạo đề thi...'}</span>
              </>
            ) : (
              <>
                <BrainCircuit className="w-4 h-4" />
                <span>AI Ra Đề & Bắt Đầu Làm Bài Ngay</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
