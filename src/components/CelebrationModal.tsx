import React, { useEffect } from 'react';
import { fireSpectacularConfetti, playVictorySound } from '../utils/celebrationEffects';
import { calculateLevelFromScore } from '../data/sampleExams';
import {
  Trophy,
  Award,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
  X,
  Share2,
} from 'lucide-react';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentNickname: string;
  score: number;
  newLevel: string;
  previousLevel?: string;
  isLevelUp: boolean;
  isHighScore: boolean;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  onClose,
  studentNickname,
  score,
  newLevel,
  previousLevel,
  isLevelUp,
  isHighScore,
}) => {
  useEffect(() => {
    if (isOpen) {
      fireSpectacularConfetti();
      playVictorySound();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const newLevelInfo = calculateLevelFromScore(score);
  const prevLevelInfo = previousLevel
    ? calculateLevelFromScore(
        previousLevel === 'Đại cao thủ'
          ? 9
          : previousLevel === 'Cao thủ'
          ? 7.5
          : previousLevel === 'Đại sư'
          ? 6
          : previousLevel === 'Nhập môn'
          ? 4
          : 2
      )
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl shadow-2xl border-2 border-indigo-500/40 overflow-hidden text-center p-6 sm:p-8 animate-scale-up">
        {/* Glowing Background Radial Highlights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Floating Trophy Badge with Aura */}
        <div className="relative inline-block my-2">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-3xl blur-xl opacity-60 animate-pulse" />
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-600 flex items-center justify-center text-5xl sm:text-6xl shadow-2xl border-4 border-white/20 mx-auto">
            {newLevelInfo.badge}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1.5 mt-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            {isLevelUp ? 'THĂNG HẠNG CẤP ĐỘ MỚI!' : 'ĐIỂM SỐ XUẤT SẮC!'}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
            Chúc Mừng @{studentNickname}! 🎉
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            {isLevelUp
              ? `Bạn đã xuất sắc vượt qua các thử thách và vươn lên cấp độ mới!`
              : `Bạn đã hoàn thành bài thi với thành tích cực kỳ ấn tượng!`}
          </p>
        </div>

        {/* Level Progression Indicator Card */}
        <div className="my-6 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-left space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
            <span>Tiến trình cấp bậc:</span>
            <span className="font-bold text-amber-300 text-sm">
              {score.toFixed(2)} / 10.0 Điểm
            </span>
          </div>

          {/* Level Transition Pill */}
          <div className="flex items-center justify-center gap-3 py-2 bg-slate-900/60 rounded-xl border border-white/10">
            {prevLevelInfo && isLevelUp ? (
              <>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 text-slate-400 text-xs">
                  <span>{prevLevelInfo.badge}</span>
                  <span>{prevLevelInfo.level}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-400" />
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs shadow-md">
                  <span>{newLevelInfo.badge}</span>
                  <span>{newLevelInfo.level}</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-sm shadow-md">
                <span>{newLevelInfo.badge}</span>
                <span>Cấp độ: {newLevelInfo.level}</span>
              </div>
            )}
          </div>

          <p className="text-center text-[11px] text-slate-300 italic">
            "{newLevelInfo.description}"
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={onClose}
            className="w-full py-3 px-6 rounded-2xl font-bold text-sm bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02]"
          >
            <Trophy className="w-4 h-4" />
            <span>Xem Chi Tiết Bài Làm & Lời Giải</span>
          </button>
        </div>
      </div>
    </div>
  );
};
