import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FLASHCARD_TOPICS,
  MATH_FLASHCARDS,
  MathFlashcard,
  FlashcardTopicId,
} from '../data/mathFlashcards';
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Play,
  Pause,
  CheckCircle2,
  Bookmark,
  Lightbulb,
  AlertTriangle,
  BookOpen,
  Sparkles,
  Search,
  Filter,
  Grid,
  CreditCard,
  HelpCircle,
  X,
  Volume2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MathFlashcardsViewProps {
  onBack: () => void;
  onStartExam?: () => void;
}

export const MathFlashcardsView: React.FC<MathFlashcardsViewProps> = ({
  onBack,
  onStartExam,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<FlashcardTopicId | 'all'>('all');
  const [filterMastery, setFilterMastery] = useState<'all' | 'learning' | 'mastered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'grid' | 'quiz'>('card');

  // Mastered IDs stored in localStorage
  const [masteredIds, setMasteredIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('toan12_mastered_flashcards');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Current Card Index & Flipped State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const autoPlayTimerRef = useRef<any>(null);

  // Quiz Mode State
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnsweredCount, setQuizAnsweredCount] = useState(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);
  const [quizIsAnswered, setQuizIsAnswered] = useState(false);

  // Save mastered IDs
  const toggleMastered = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setMasteredIds((prev) => {
      let next: string[];
      if (prev.includes(id)) {
        next = prev.filter((item) => item !== id);
      } else {
        next = [...prev, id];
        // Celebrate single mastery
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { y: 0.8 },
          colors: ['#10B981', '#34D399', '#6EE7B7'],
        });
      }
      localStorage.setItem('toan12_mastered_flashcards', JSON.stringify(next));
      return next;
    });
  };

  // Filtered Cards
  const filteredCards = useMemo(() => {
    let list = MATH_FLASHCARDS;

    // Filter by Topic
    if (selectedTopic !== 'all') {
      list = list.filter((c) => c.topicId === selectedTopic);
    }

    // Filter by Mastery
    if (filterMastery === 'mastered') {
      list = list.filter((c) => masteredIds.includes(c.id));
    } else if (filterMastery === 'learning') {
      list = list.filter((c) => !masteredIds.includes(c.id));
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.frontPrompt.toLowerCase().includes(q) ||
          c.formulaDisplay.toLowerCase().includes(q) ||
          c.topicName.toLowerCase().includes(q)
      );
    }

    return list;
  }, [selectedTopic, filterMastery, searchQuery, masteredIds]);

  // Keep index within bounds
  useEffect(() => {
    if (currentIndex >= filteredCards.length) {
      setCurrentIndex(0);
    }
    setIsFlipped(false);
    setShowHint(false);
  }, [filteredCards.length]);

  const currentCard: MathFlashcard | undefined = filteredCards[currentIndex];

  // Navigation handlers
  const handlePrev = () => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : filteredCards.length - 1));
  };

  const handleNext = () => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev < filteredCards.length - 1 ? prev + 1 : 0));
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setShowHint(false);
    if (filteredCards.length > 1) {
      const nextIdx = Math.floor(Math.random() * filteredCards.length);
      setCurrentIndex(nextIdx === currentIndex ? (nextIdx + 1) % filteredCards.length : nextIdx);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'card') return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((f) => !f);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === '1' && currentCard) {
        // Needs Review (unmaster)
        if (masteredIds.includes(currentCard.id)) {
          toggleMastered(currentCard.id);
        }
      } else if (e.key === '2' && currentCard) {
        // Mastered
        if (!masteredIds.includes(currentCard.id)) {
          toggleMastered(currentCard.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, currentCard, masteredIds, filteredCards.length]);

  // Auto-play slideshow effect
  useEffect(() => {
    if (isAutoPlay && filteredCards.length > 0) {
      autoPlayTimerRef.current = setInterval(() => {
        setIsFlipped((prev) => {
          if (!prev) {
            // Flip to back first
            return true;
          } else {
            // Move to next card
            handleNext();
            return false;
          }
        });
      }, 5000);
    } else {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    }

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isAutoPlay, filteredCards.length, currentIndex]);

  // Quiz Options Generation
  const quizOptions = useMemo(() => {
    if (!currentCard) return [];
    // Correct formula
    const correct = currentCard.formulaDisplay;
    // Pick 3 random distractor formulas from other flashcards
    const otherFormulas = MATH_FLASHCARDS.filter((c) => c.id !== currentCard.id).map(
      (c) => c.formulaDisplay
    );
    const shuffledOthers = [...otherFormulas].sort(() => 0.5 - Math.random()).slice(0, 3);
    const all = [correct, ...shuffledOthers].sort(() => 0.5 - Math.random());
    return all;
  }, [currentCard?.id]);

  const handleSelectQuizOption = (index: number) => {
    if (quizIsAnswered || !currentCard) return;
    setQuizSelectedOption(index);
    setQuizIsAnswered(true);
    setQuizAnsweredCount((c) => c + 1);

    const isCorrect = quizOptions[index] === currentCard.formulaDisplay;
    if (isCorrect) {
      setQuizScore((s) => s + 1);
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 },
      });
      // Also mark as mastered if not yet
      if (!masteredIds.includes(currentCard.id)) {
        toggleMastered(currentCard.id);
      }
    }
  };

  const handleNextQuizQuestion = () => {
    setQuizSelectedOption(null);
    setQuizIsAnswered(false);
    handleNext();
  };

  // Sound synthesis on card flip
  const playFlipSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Ignore audio failure
    }
  };

  const totalCardCount = MATH_FLASHCARDS.length;
  const masteredCount = MATH_FLASHCARDS.filter((c) => masteredIds.includes(c.id)).length;
  const masteryPercentage = Math.round((masteredCount / totalCardCount) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 animate-fade-in">
      {/* Top Header / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors mb-2 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Quay lại Danh sách Đề thi</span>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-indigo-500/20">
              🗂️
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Sổ Tay Flashcard Công Thức Toán 12
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  Chuẩn 2025
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Lật thẻ ghi nhớ nhanh lý thuyết, quy tắc đạo hàm, tích phân, không gian Oxyz và bẫy thi tốt nghiệp THPT.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {onStartExam && (
            <button
              onClick={onStartExam}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-1.5 hover:scale-105"
            >
              <span>Vào Làm Đề Thi Ngay</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress & Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Progress Card */}
        <div className="md:col-span-3 p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-sky-300 border border-white/10 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  Tiến độ ghi nhớ công thức
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {masteredCount} / {totalCardCount} công thức đã thuộc
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {masteryPercentage >= 100
                  ? 'Tuyệt vời! Bạn đã thuộc toàn bộ công thức Toán 12! 🎉'
                  : masteryPercentage >= 60
                  ? 'Tiến độ rất tốt! Hãy tiếp tục ôn những thẻ còn lại nhé!'
                  : 'Hãy lật thẻ và đánh dấu đã thuộc trước khi làm đề thi!'}
              </h2>
            </div>

            <div className="text-right shrink-0">
              <span className="text-3xl sm:text-4xl font-black text-amber-300">
                {masteryPercentage}%
              </span>
              <div className="text-[10px] text-slate-400 font-medium">Mức độ hoàn thành</div>
            </div>
          </div>

          {/* Progress track */}
          <div className="relative z-10 mt-4">
            <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 transition-all duration-500 shadow-sm"
                style={{ width: `${Math.max(masteryPercentage, 4)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-medium">
              <span>Cần ôn lại: {totalCardCount - masteredCount} thẻ</span>
              <span>Đã thuộc lòng: {masteredCount} thẻ</span>
            </div>
          </div>
        </div>

        {/* Quick View Mode Switcher */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between gap-3">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Chế độ ôn tập
          </div>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
            <button
              onClick={() => {
                setViewMode('card');
                setIsAutoPlay(false);
              }}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                viewMode === 'card'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Lật thẻ</span>
            </button>
            <button
              onClick={() => {
                setViewMode('grid');
                setIsAutoPlay(false);
              }}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                viewMode === 'grid'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Bảng tra</span>
            </button>
            <button
              onClick={() => {
                setViewMode('quiz');
                setIsAutoPlay(false);
              }}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                viewMode === 'quiz'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Thử tài</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Phím tắt:</span>
            <span className="font-semibold text-slate-700">Space, ← / →, 1, 2</span>
          </div>
        </div>
      </div>

      {/* Filter Topics Bar */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {FLASHCARD_TOPICS.map((topic) => {
            const count =
              topic.id === 'all'
                ? MATH_FLASHCARDS.length
                : MATH_FLASHCARDS.filter((c) => c.topicId === topic.id).length;
            const isSelected = selectedTopic === topic.id;

            return (
              <button
                key={topic.id}
                onClick={() => {
                  setSelectedTopic(topic.id);
                  setCurrentIndex(0);
                }}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 scale-[1.02]'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{topic.icon}</span>
                <span>{topic.name}</span>
                <span
                  className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Lọc theo:</span>
            <button
              onClick={() => setFilterMastery('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterMastery === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Tất cả ({filteredCards.length})
            </button>
            <button
              onClick={() => setFilterMastery('learning')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterMastery === 'learning'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              ⚡ Cần ôn lại
            </button>
            <button
              onClick={() => setFilterMastery('mastered')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterMastery === 'mastered'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              ✓ Đã thuộc ({masteredCount})
            </button>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm công thức, đạo hàm, tích phân..."
              className="w-full pl-9 pr-8 py-1.5 rounded-xl text-xs border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main View Area */}
      {filteredCards.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <div className="text-4xl">🔍</div>
          <h3 className="text-base font-bold text-slate-800">Không tìm thấy thẻ công thức nào phù hợp</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Hãy thử thay đổi từ khóa tìm kiếm hoặc bấm chọn "Tất cả công thức" để hiển thị đầy đủ.
          </p>
          <button
            onClick={() => {
              setSelectedTopic('all');
              setFilterMastery('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            Hiển thị toàn bộ công thức
          </button>
        </div>
      ) : viewMode === 'card' && currentCard ? (
        /* --- MODE 1: 3D FLIP CARD --- */
        <div className="space-y-6">
          {/* Card Meta & Control Bar */}
          <div className="flex items-center justify-between text-xs text-slate-600 px-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">
                Thẻ {currentIndex + 1} / {filteredCards.length}
              </span>
              <span className="text-slate-300">•</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {currentCard.topicName}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                {currentCard.difficulty}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShuffle}
                title="Xáo trộn thẻ ngẫu nhiên"
                className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                <Shuffle className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsAutoPlay((a) => !a)}
                title={isAutoPlay ? 'Tạm dừng tự động chuyển' : 'Tự động phát trình chiếu (5s)'}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  isAutoPlay
                    ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isAutoPlay ? 'Đang tự phát' : 'Tự động (5s)'}</span>
              </button>
            </div>
          </div>

          {/* Big Interactive 3D Card */}
          <div
            className="w-full min-h-[380px] sm:min-h-[440px] cursor-pointer select-none perspective-1000"
            onClick={() => {
              playFlipSound();
              setIsFlipped((f) => !f);
            }}
          >
            <div
              className={`w-full min-h-[380px] sm:min-h-[440px] rounded-3xl transition-transform duration-500 transform-style-3d relative shadow-xl hover:shadow-2xl border ${
                isFlipped ? 'rotate-y-180' : ''
              } ${
                masteredIds.includes(currentCard.id)
                  ? 'border-emerald-300 ring-2 ring-emerald-400/20'
                  : 'border-slate-200'
              }`}
            >
              {/* === CARD FRONT (QUESTION & PROMPT) === */}
              <div
                className={`absolute inset-0 rounded-3xl p-6 sm:p-9 flex flex-col justify-between backface-hidden bg-gradient-to-br from-white via-indigo-50/20 to-slate-50 ${
                  isFlipped ? 'pointer-events-none' : ''
                }`}
              >
                {/* Top Badge & Bookmark */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                      {currentCard.topicIcon}
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      MẶT TRƯỚC: CÂU HỎI GHI NHỚ
                    </span>
                  </div>

                  <button
                    onClick={(e) => toggleMastered(currentCard.id, e)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      masteredIds.includes(currentCard.id)
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        masteredIds.includes(currentCard.id)
                          ? 'text-emerald-600'
                          : 'text-slate-400'
                      }`}
                    />
                    <span>
                      {masteredIds.includes(currentCard.id) ? 'Đã thuộc thẻ này' : 'Chưa thuộc'}
                    </span>
                  </button>
                </div>

                {/* Card Center Content */}
                <div className="py-6 space-y-4 my-auto">
                  <h3 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                    {currentCard.title}
                  </h3>

                  <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-slate-800 text-sm sm:text-base leading-relaxed font-medium shadow-2xs">
                    {currentCard.frontPrompt}
                  </div>

                  {/* Hint Toggle */}
                  {currentCard.frontHint && (
                    <div>
                      {showHint ? (
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-2 animate-fade-in">
                          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Gợi ý nhớ nhanh: </span>
                            {currentCard.frontHint}
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowHint(true);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
                        >
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                          <span>Xem gợi ý nhanh</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Prompt to flip */}
                <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium">Nhấp vào thẻ hoặc bấm phím Space để lật</span>
                  <span className="inline-flex items-center gap-1 font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                    <span>Xem công thức</span>
                    <RotateCcw className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* === CARD BACK (DETAILED FORMULA & TRAPS) === */}
              <div
                className={`absolute inset-0 rounded-3xl p-6 sm:p-8 flex flex-col justify-between backface-hidden rotate-y-180 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white overflow-y-auto ${
                  !isFlipped ? 'pointer-events-none' : ''
                }`}
              >
                {/* Top Badge & Mark button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      MẶT SAU: CÔNG THỨC TOÁN CHUẨN
                    </span>
                  </div>

                  <button
                    onClick={(e) => toggleMastered(currentCard.id, e)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      masteredIds.includes(currentCard.id)
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {masteredIds.includes(currentCard.id) ? 'Đã thuộc lòng ✓' : 'Đánh dấu đã thuộc'}
                    </span>
                  </button>
                </div>

                {/* Formula Highlight Box */}
                <div className="py-3 space-y-3.5">
                  <div className="p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center shadow-lg">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-300 mb-1">
                      Công thức chính
                    </div>
                    <pre className="font-mono text-base sm:text-xl font-black text-amber-300 whitespace-pre-wrap leading-relaxed tracking-wide">
                      {currentCard.formulaDisplay}
                    </pre>
                  </div>

                  {/* Explanation & Variables */}
                  <div className="text-xs sm:text-sm text-slate-200 leading-relaxed space-y-1">
                    <div className="font-bold text-sky-300">Ý nghĩa và quy tắc giải:</div>
                    <p className="opacity-90">{currentCard.formulaExplanation}</p>
                  </div>

                  {/* Concrete Exam Example */}
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
                    <span className="font-bold text-emerald-400">Ví dụ áp dụng: </span>
                    <span className="font-mono">{currentCard.example}</span>
                  </div>

                  {/* High Alert Exam Pitfalls Box */}
                  <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5 shadow-md">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black text-amber-300 uppercase tracking-wide">
                        ⚠️ CẢNH BÁO BẪY THI TỐT NGHIỆP:
                      </span>{' '}
                      <span>{currentCard.examTrapWarning}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Back Button */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span>Nhấp thẻ để quay lại câu hỏi</span>
                  <span className="inline-flex items-center gap-1 font-bold text-sky-400">
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Lật lại</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Big Navigation & Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              onClick={handlePrev}
              className="py-3 px-5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 font-bold text-xs sm:text-sm text-slate-800 shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Thẻ trước (←)</span>
            </button>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (masteredIds.includes(currentCard.id)) {
                    toggleMastered(currentCard.id);
                  }
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                  !masteredIds.includes(currentCard.id)
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                Phím 1: Cần ôn lại
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!masteredIds.includes(currentCard.id)) {
                    toggleMastered(currentCard.id);
                  }
                }}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold border shadow-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  masteredIds.includes(currentCard.id)
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Phím 2: Đã thuộc</span>
              </button>
            </div>

            <button
              onClick={handleNext}
              className="py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/25 transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <span>Thẻ kế tiếp (→)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* --- MODE 2: FORMULA DIRECTORY / QUICK REFERENCE GRID --- */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Hiển thị danh sách {filteredCards.length} công thức tổng hợp</span>
            <span>Bấm vào thẻ để xem chi tiết bẫy thi và bài tập mẫu</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCards.map((card) => {
              const isMastered = masteredIds.includes(card.id);
              return (
                <div
                  key={card.id}
                  className={`p-5 rounded-3xl bg-white border transition-all hover:shadow-md space-y-3 ${
                    isMastered
                      ? 'border-emerald-300 ring-1 ring-emerald-400/20'
                      : 'border-slate-200/90'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 flex items-center gap-1">
                      <span>{card.topicIcon}</span>
                      <span>{card.topicName}</span>
                    </span>

                    <button
                      onClick={() => toggleMastered(card.id)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        isMastered
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          isMastered ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                      />
                      <span>{isMastered ? 'Đã nhớ' : 'Chưa nhớ'}</span>
                    </button>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{card.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{card.frontPrompt}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 text-white font-mono text-xs sm:text-sm font-bold text-center overflow-x-auto whitespace-pre-wrap text-amber-300">
                    {card.formulaDisplay}
                  </div>

                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-900">Giải thích: </span>
                    {card.formulaExplanation}
                  </div>

                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-[11px]">
                    <span className="font-bold text-rose-800">⚠️ Bẫy đề thi: </span>
                    {card.examTrapWarning}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* --- MODE 3: QUICK QUIZ CHALLENGE --- */
        currentCard && (
          <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
            <div className="flex items-center justify-between text-xs">
              <span className="px-3 py-1 rounded-full font-bold bg-indigo-50 text-indigo-700">
                Thử thách nhớ công thức ({currentIndex + 1}/{filteredCards.length})
              </span>
              <span className="font-bold text-slate-700">
                Điểm số: <span className="text-emerald-600 font-black">{quizScore}</span> / {quizAnsweredCount}
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold uppercase text-slate-400">Câu hỏi lý thuyết</div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {currentCard.frontPrompt}
              </h3>
            </div>

            {/* 4 Formula Options */}
            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-slate-500">
                Chọn công thức toán học chính xác:
              </div>
              {quizOptions.map((opt, idx) => {
                const isSelected = quizSelectedOption === idx;
                const isCorrect = opt === currentCard.formulaDisplay;
                let btnStyle = 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800';

                if (quizIsAnswered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-rose-50 border-rose-400 text-rose-950';
                  } else {
                    btnStyle = 'opacity-40 bg-slate-50 border-slate-200 text-slate-600';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={quizIsAnswered}
                    onClick={() => handleSelectQuizOption(idx)}
                    className={`w-full p-4 rounded-2xl border text-left font-mono text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-between gap-3 ${btnStyle}`}
                  >
                    <span className="whitespace-pre-wrap">{opt}</span>
                    {quizIsAnswered && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {quizIsAnswered && isSelected && !isCorrect && (
                      <X className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Result & Next */}
            {quizIsAnswered && (
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs sm:text-sm text-indigo-950 space-y-2 animate-fade-in">
                <div className="font-bold">
                  {quizOptions[quizSelectedOption!] === currentCard.formulaDisplay
                    ? '🎉 Chính xác! Bạn đã ghi nhớ rất tốt công thức này.'
                    : '❌ Chưa chính xác! Hãy đọc kỹ lưu ý bên dưới:'}
                </div>
                <p className="text-xs text-slate-600">{currentCard.formulaExplanation}</p>
                <div className="pt-2">
                  <button
                    onClick={handleNextQuizQuestion}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-md"
                  >
                    Câu tiếp theo →
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};
