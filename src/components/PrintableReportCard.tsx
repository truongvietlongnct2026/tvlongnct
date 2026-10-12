import React from 'react';
import { StudentProfile, SPREADSHEET_ID } from '../services/googleWorkspace';
import { UnifiedExamItem } from './ExamList';
import { GradingResponseData } from './ExamResult';
import { ScoreProgressChart, ScoreHistoryPoint } from './ScoreProgressChart';
import { calculateLevelFromScore } from '../data/sampleExams';
import {
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  School,
  Calendar,
  FileSpreadsheet,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

interface PrintableReportCardProps {
  exam: UnifiedExamItem;
  student: StudentProfile;
  gradeData: GradingResponseData;
  timeSpentFormatted: string;
  scoreHistory: ScoreHistoryPoint[];
  isMockExam?: boolean;
  violationCount?: number;
}

export const PrintableReportCard = React.forwardRef<HTMLDivElement, PrintableReportCardProps>(
  ({ exam, student, gradeData, timeSpentFormatted, scoreHistory, isMockExam = true, violationCount = 0 }, ref) => {
    const levelInfo = calculateLevelFromScore(gradeData.totalScore);
    const currentDate = new Date().toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <div
        ref={ref}
        className="w-[800px] p-8 bg-white text-slate-900 border border-slate-300 shadow-lg mx-auto font-sans space-y-6"
        style={{ minHeight: '1120px' }}
      >
        {/* Official Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
              HỆ THỐNG KHẢO SÁT CHẤT LƯỢNG TOÁN 12 THPT • CHUẨN 2025
            </p>
            <h1 className="text-xl font-black uppercase text-blue-900 tracking-tight mt-1">
              PHIẾU BÁO ĐIỂM & ĐÁNH GIÁ NĂNG LỰC TOÁN HỌC
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Chấm thi tự động bằng AI Gemini • Đồng bộ Google Drive & Google Sheets
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              Mã hồ sơ: #{student.nickname.toUpperCase()}-{Date.now().toString().slice(-4)}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Ngày lập: {currentDate}</p>
          </div>
        </div>

        {/* Student & Exam Metadata Grid */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="space-y-1.5">
            <div>
              <span className="text-slate-500">Họ và tên thí sinh: </span>
              <span className="font-bold text-slate-900 text-sm">{student.fullName}</span>
            </div>
            <div>
              <span className="text-slate-500">Nickname hệ thống: </span>
              <span className="font-mono font-bold text-blue-700">@{student.nickname}</span>
            </div>
            <div>
              <span className="text-slate-500">Lớp: </span>
              <span className="font-semibold text-slate-800">{student.className}</span>
              <span className="text-slate-400 mx-2">•</span>
              <span className="text-slate-500">Trường: </span>
              <span className="font-semibold text-slate-800">{student.school}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div>
              <span className="text-slate-500">Bài kiểm tra: </span>
              <span className="font-bold text-slate-900 truncate block">{exam.title}</span>
            </div>
            <div>
              <span className="text-slate-500">Thời gian làm bài: </span>
              <span className="font-bold text-emerald-700">{timeSpentFormatted}</span>
              <span className="text-slate-400 text-[10px]"> (Quy định 90 phút)</span>
            </div>
            <div>
              <span className="text-slate-500">Kỷ luật phòng thi: </span>
              <span className={`font-bold ${violationCount === 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {isMockExam
                  ? violationCount === 0
                    ? 'Thi thử 90p: Nghiêm túc 100% (0 vi phạm)'
                    : `Thi thử 90p: Cảnh báo ${violationCount} lần rời màn hình`
                  : 'Luyện tập tự do'}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Trạng thái dữ liệu: </span>
              <span className="font-medium text-emerald-600">Đã lưu trữ trên Google Sheets</span>
            </div>
          </div>
        </div>

        {/* Big Score & Level Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex items-center justify-between gap-6 shadow-sm">
          <div>
            <div className="text-xs uppercase tracking-wider text-blue-200 font-semibold mb-1">
              Kết quả khảo sát tốt nghiệp THPT 2025
            </div>
            <div className="text-3xl font-black text-amber-300">
              {gradeData.totalScore.toFixed(2)} / 10.0 Điểm
            </div>
            <p className="text-xs text-slate-200 mt-1 max-w-md">
              {levelInfo.description}
            </p>
          </div>

          <div className="text-center px-6 py-3 rounded-xl bg-white/10 border border-white/20 shrink-0">
            <div className="text-3xl mb-1">{levelInfo.badge}</div>
            <div className="text-[11px] text-slate-300 font-medium uppercase">Cấp độ xếp hạng</div>
            <div className="text-lg font-black text-white">{levelInfo.level}</div>
          </div>
        </div>

        {/* Recharts Progress Chart Embedded */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-white">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-blue-600" />
            Biểu đồ đường thể hiện sự tiến bộ điểm số (Recharts)
          </h3>
          <div className="h-64">
            <ScoreProgressChart
              history={
                scoreHistory.length > 0
                  ? scoreHistory
                  : [
                      {
                        attempt: 1,
                        examTitle: exam.title,
                        score: gradeData.totalScore,
                        level: levelInfo.level,
                        date: 'Hiện tại',
                        timeSpent: timeSpentFormatted,
                      },
                    ]
              }
              studentNickname={student.nickname}
            />
          </div>
        </div>

        {/* AI Mistake Analysis & Recommendations */}
        <div className="space-y-3 p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
          <h4 className="font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Phân tích lỗi sai hay mắc phải từ AI Gemini:
          </h4>
          <div className="space-y-1.5 pl-2 text-slate-800">
            {gradeData.commonMistakes?.map((mistake, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="font-bold text-amber-700">{i + 1}.</span>
                <span>{mistake}</span>
              </div>
            ))}
          </div>

          {gradeData.suggestedTopic && (
            <div className="pt-2 border-t border-amber-200/60 text-indigo-900 font-semibold">
              🎯 Đề xuất rèn luyện: Chuyên đề "{gradeData.suggestedTopic}" ở mức độ {levelInfo.level}.
            </div>
          )}
        </div>

        {/* Footer Verification & Seal */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div>
            <p className="font-semibold text-slate-700">HỆ THỐNG LUYỆN THI TOÁN HỌC AI GEMINI</p>
            <p>Bản điện tử có giá trị lưu trữ và theo dõi học tập cá nhân.</p>
          </div>
          <div className="text-right">
            <div className="w-24 h-10 border-2 border-dashed border-slate-300 rounded flex items-center justify-center text-[10px] text-slate-400 font-mono">
              [ĐÃ XÁC THỰC]
            </div>
            <p className="mt-1 text-[10px] text-slate-400">Google Sheets ID: {SPREADSHEET_ID.slice(0, 8)}...</p>
          </div>
        </div>
      </div>
    );
  }
);

PrintableReportCard.displayName = 'PrintableReportCard';
