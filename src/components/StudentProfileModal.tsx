import React, { useRef, useState } from 'react';
import { StudentProfile, SPREADSHEET_ID } from '../services/googleWorkspace';
import { ScoreProgressChart, ScoreHistoryPoint } from './ScoreProgressChart';
import { calculateLevelFromScore } from '../data/sampleExams';
import { exportElementToPdf } from '../utils/pdfExport';
import {
  X,
  User,
  GraduationCap,
  School,
  Calendar,
  ExternalLink,
  Award,
  TrendingUp,
  FileSpreadsheet,
  Download,
  FileDown,
} from 'lucide-react';

interface StudentProfileModalProps {
  student: StudentProfile;
  history: ScoreHistoryPoint[];
  isOpen: boolean;
  onClose: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  history,
  isOpen,
  onClose,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const currentLevel = student.currentLevel || 'Tân thủ';
  const levelInfo = calculateLevelFromScore(
    currentLevel === 'Đại cao thủ'
      ? 9
      : currentLevel === 'Cao thủ'
      ? 7.5
      : currentLevel === 'Đại sư'
      ? 6.0
      : currentLevel === 'Nhập môn'
      ? 4.0
      : 2.5
  );

  const handleExportPdf = async () => {
    if (!contentRef.current) return;
    try {
      setIsExporting(true);
      await exportElementToPdf(
        contentRef.current,
        `HoSo_TienDo_Toan12_${student.nickname}.pdf`
      );
    } catch (err: any) {
      alert('Không thể xuất file PDF: ' + (err.message || 'Lỗi không xác định'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-xl font-bold shadow-md">
              {levelInfo.badge}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  Hồ Sơ Học Sinh: {student.fullName}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-amber-300">
                  {currentLevel}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                @{student.nickname} • Lớp {student.className} • {student.school}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div ref={contentRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          {/* Quick info cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 block mb-1">Số lần thi</span>
              <span className="text-lg font-black text-slate-900">
                {history.length} bài
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 block mb-1">Cấp bậc</span>
              <span className="text-base font-bold text-indigo-700">
                {currentLevel}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 block mb-1">Đồng bộ Sheets</span>
              <a
                href={`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                <span>Xem bảng điểm</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 block mb-1">Ngày đăng ký</span>
              <span className="font-semibold text-slate-700">
                {student.registeredAt
                  ? new Date(student.registeredAt).toLocaleDateString('vi-VN')
                  : 'Hôm nay'}
              </span>
            </div>
          </div>

          {/* Recharts Line Chart Component */}
          <div>
            <ScoreProgressChart
              history={history}
              studentNickname={student.nickname}
              currentLevel={currentLevel}
            />
          </div>

          {/* Table of previous attempts */}
          {history.length > 0 && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Nhật ký bài kiểm tra
              </h4>
              <div className="divide-y divide-slate-200 text-xs">
                {history.map((item) => (
                  <div
                    key={item.attempt}
                    className="py-2.5 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-800 truncate">
                        Lần {item.attempt}: {item.examTitle}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {item.date} {item.timeSpent ? `• ${item.timeSpent}` : ''}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-blue-700 text-sm">
                        {item.score.toFixed(2)} điểm
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-blue-100 text-blue-800">
                        {item.level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang xuất PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>Tải Hồ Sơ & Biểu Đồ (PDF)</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Đóng hồ sơ
          </button>
        </div>
      </div>
    </div>
  );
};
