/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { RegistrationModal } from './components/RegistrationModal';
import { ExamList, UnifiedExamItem } from './components/ExamList';
import { ExamTaking, StudentAnswers } from './components/ExamTaking';
import { ExamResult, GradingResponseData } from './components/ExamResult';
import { StudentProfileModal } from './components/StudentProfileModal';
import { CelebrationModal } from './components/CelebrationModal';
import { ScoreHistoryPoint } from './components/ScoreProgressChart';
import { MathFlashcardsView } from './components/MathFlashcardsView';
import {
  StudentProfile,
  TestSubmissionRecord,
  saveTestResultToSheet,
  SPREADSHEET_ID,
  DRIVE_FOLDER_ID,
} from './services/googleWorkspace';
import { initAuth, googleSignIn, logout, getAccessToken } from './services/googleAuth';
import { calculateLevelFromScore } from './data/sampleExams';

export default function App() {
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(() => {
    try {
      const saved = localStorage.getItem('toan12_current_student');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [registeredStudents, setRegisteredStudents] = useState<StudentProfile[]>(() => {
    try {
      const saved = localStorage.getItem('toan12_all_students');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean>(false);
  const [screen, setScreen] = useState<'list' | 'taking' | 'result' | 'flashcards'>('list');
  const [selectedExam, setSelectedExam] = useState<UnifiedExamItem | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [celebrationData, setCelebrationData] = useState<{
    isOpen: boolean;
    score: number;
    newLevel: string;
    previousLevel?: string;
    isLevelUp: boolean;
    isHighScore: boolean;
  } | null>(null);

  // Results State
  const [lastSubmissionAnswers, setLastSubmissionAnswers] = useState<StudentAnswers | null>(null);
  const [lastTimeSpent, setLastTimeSpent] = useState<number>(0);
  const [isMockMode, setIsMockMode] = useState<boolean>(true);
  const [lastViolationCount, setLastViolationCount] = useState<number>(0);
  const [lastIsMockExam, setLastIsMockExam] = useState<boolean>(true);
  const [gradeResult, setGradeResult] = useState<GradingResponseData | null>(null);
  const [isGrading, setIsGrading] = useState<boolean>(false);
  const [sheetSyncSuccess, setSheetSyncSuccess] = useState<boolean>(false);
  const [sheetSyncError, setSheetSyncError] = useState<string | null>(null);

  // AI Generated Practice Exams
  const [aiPracticeExams, setAiPracticeExams] = useState<UnifiedExamItem[]>(() => {
    try {
      const saved = localStorage.getItem('toan12_ai_exams');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Submission History for badges
  const [submissionHistory, setSubmissionHistory] = useState<{
    [examId: string]: { score: number; level: string; date: string };
  }>(() => {
    try {
      const saved = localStorage.getItem('toan12_sub_history');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Chronological Score History for Recharts Line Chart
  const [scoreHistory, setScoreHistory] = useState<ScoreHistoryPoint[]>(() => {
    try {
      const saved = localStorage.getItem('toan12_score_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Track Google Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setIsGoogleConnected(true);
      },
      () => {
        setIsGoogleConnected(false);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Save current student
  const handleStudentRegistered = (student: StudentProfile) => {
    setCurrentStudent(student);
    try {
      localStorage.setItem('toan12_current_student', JSON.stringify(student));
      setRegisteredStudents((prev) => {
        const filtered = prev.filter(
          (s) => s.nickname.toLowerCase() !== student.nickname.toLowerCase()
        );
        const updated = [...filtered, student];
        localStorage.setItem('toan12_all_students', JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    setCurrentStudent(null);
    try {
      localStorage.removeItem('toan12_current_student');
      await logout();
      setIsGoogleConnected(false);
    } catch (e) {
      console.error(e);
    }
    setScreen('list');
  };

  const handleConnectGoogle = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setIsGoogleConnected(true);
      }
    } catch (err) {
      console.error('Google sign in error:', err);
    }
  };

  const handleSelectExam = (exam: UnifiedExamItem, mockMode: boolean = true) => {
    setSelectedExam(exam);
    setIsMockMode(mockMode);
    setScreen('taking');
  };

  // Exam Submission Handler (AI Grading + Google Sheets Save + Leveling)
  const handleSubmitExam = async (
    answers: StudentAnswers,
    timeSpentSeconds: number,
    violationCount: number = 0
  ) => {
    if (!currentStudent || !selectedExam) return;

    setIsGrading(true);
    setLastSubmissionAnswers(answers);
    setLastTimeSpent(timeSpentSeconds);
    setLastViolationCount(violationCount);
    setLastIsMockExam(isMockMode);
    setSheetSyncSuccess(false);
    setSheetSyncError(null);

    const m = Math.floor(timeSpentSeconds / 60);
    const s = timeSpentSeconds % 60;
    const timeSpentFormatted = `${m} phút ${s} giây`;

    try {
      // 1. Send to server for Gemini AI Grading
      const response = await fetch('/api/grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testTitle: selectedExam.title,
          answers,
          timeSpent: timeSpentFormatted,
          standardQuestions: selectedExam.builtInExam || null,
        }),
      });

      const json = await response.json();
      if (!json.success || !json.data) {
        throw new Error(json.error || 'Lỗi khi gọi API chấm điểm Gemini');
      }

      const gradeData: GradingResponseData = json.data;
      setGradeResult(gradeData);

      // Determine level based on the strict rules:
      // < 3.5: Tân thủ, 3.5-5: Nhập môn, 5-7: Đại sư, 7-8: Cao thủ, > 8: Đại cao thủ
      const levelResult = calculateLevelFromScore(gradeData.totalScore).level;

      // Check level-up and high score celebration conditions
      const getTierRank = (lvl: string) => {
        if (lvl === 'Đại cao thủ') return 5;
        if (lvl === 'Cao thủ') return 4;
        if (lvl === 'Đại sư') return 3;
        if (lvl === 'Nhập môn') return 2;
        return 1;
      };

      const prevLevel = currentStudent.currentLevel || 'Tân thủ';
      const isLevelUp = getTierRank(levelResult) > getTierRank(prevLevel);
      const isHighScore = gradeData.totalScore >= 7.0;

      if (isLevelUp || isHighScore) {
        setCelebrationData({
          isOpen: true,
          score: gradeData.totalScore,
          newLevel: levelResult,
          previousLevel: prevLevel,
          isLevelUp,
          isHighScore,
        });
      }

      // Update student profile with new level
      const updatedStudent: StudentProfile = {
        ...currentStudent,
        currentLevel: levelResult,
      };
      setCurrentStudent(updatedStudent);
      localStorage.setItem('toan12_current_student', JSON.stringify(updatedStudent));

      // Save submission history
      const updatedHistory = {
        ...submissionHistory,
        [selectedExam.id]: {
          score: gradeData.totalScore,
          level: levelResult,
          date: new Date().toLocaleDateString('vi-VN'),
        },
      };
      setSubmissionHistory(updatedHistory);
      localStorage.setItem('toan12_sub_history', JSON.stringify(updatedHistory));

      // Append to chronological score history for Recharts progress chart
      const newScorePoint: ScoreHistoryPoint = {
        attempt: scoreHistory.length + 1,
        examTitle: selectedExam.title,
        score: gradeData.totalScore,
        level: levelResult,
        date: new Date().toLocaleDateString('vi-VN'),
        timeSpent: timeSpentFormatted,
      };
      const updatedScoreHistory = [...scoreHistory, newScorePoint];
      setScoreHistory(updatedScoreHistory);
      localStorage.setItem('toan12_score_history', JSON.stringify(updatedScoreHistory));

      // 2. Automatically save test results to Google Sheets
      const mistakesStr = Array.isArray(gradeData.commonMistakes)
        ? gradeData.commonMistakes.join('; ')
        : gradeData.commonMistakes || 'Không có';

      const proctoringStatus = isMockMode
        ? violationCount === 0
          ? 'Thi thử 90p: Nghiêm túc 100% (0 vi phạm)'
          : `Thi thử 90p: Đã rời màn hình ${violationCount} lần`
        : 'Luyện tập tự do (Không khóa tab)';

      const submissionRecord: TestSubmissionRecord = {
        submittedAt: new Date().toLocaleString('vi-VN'),
        nickname: currentStudent.nickname,
        fullName: currentStudent.fullName,
        className: currentStudent.className,
        school: currentStudent.school,
        testTitle: selectedExam.title,
        timeSpent: timeSpentFormatted,
        score: gradeData.totalScore,
        level: levelResult,
        commonMistakes: mistakesStr,
        proctoringStatus,
      };

      try {
        await saveTestResultToSheet(submissionRecord);
        setSheetSyncSuccess(true);
      } catch (sheetErr: any) {
        console.warn('Google Sheet auto sync failed:', sheetErr);
        setSheetSyncError(sheetErr.message || 'Chưa thể ghi vào Google Sheets');
      }

      setScreen('result');
    } catch (error: any) {
      console.error('Error grading test:', error);
      alert('Có lỗi xảy ra khi chấm bài với AI Gemini: ' + error.message);
    } finally {
      setIsGrading(false);
    }
  };

  // Retry sync to Google Sheet
  const handleRetrySheetSync = async () => {
    if (!currentStudent || !selectedExam || !gradeResult) return;
    try {
      const m = Math.floor(lastTimeSpent / 60);
      const s = lastTimeSpent % 60;
      const timeSpentFormatted = `${m} phút ${s} giây`;
      const levelResult = calculateLevelFromScore(gradeResult.totalScore).level;

      const submissionRecord: TestSubmissionRecord = {
        submittedAt: new Date().toLocaleString('vi-VN'),
        nickname: currentStudent.nickname,
        fullName: currentStudent.fullName,
        className: currentStudent.className,
        school: currentStudent.school,
        testTitle: selectedExam.title,
        timeSpent: timeSpentFormatted,
        score: gradeResult.totalScore,
        level: levelResult,
        commonMistakes: Array.isArray(gradeResult.commonMistakes)
          ? gradeResult.commonMistakes.join('; ')
          : gradeResult.commonMistakes || 'Không có',
      };

      await saveTestResultToSheet(submissionRecord);
      setSheetSyncSuccess(true);
      setSheetSyncError(null);
    } catch (err: any) {
      setSheetSyncError(err.message || 'Lỗi kết nối Google Sheets');
    }
  };

  // Add newly generated practice exam from AI
  const handleStartPracticeExam = (practiceExam: UnifiedExamItem, mockMode: boolean = true) => {
    setAiPracticeExams((prev) => {
      const updated = [practiceExam, ...prev];
      localStorage.setItem('toan12_ai_exams', JSON.stringify(updated));
      return updated;
    });
    setSelectedExam(practiceExam);
    setIsMockMode(mockMode);
    setScreen('taking');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <Header
        student={currentStudent}
        onLogout={handleLogout}
        isGoogleConnected={isGoogleConnected}
        onConnectGoogle={handleConnectGoogle}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        currentScreen={screen}
        onNavigateTo={(targetScreen) => setScreen(targetScreen)}
      />

      {/* Main Content Areas */}
      <main className="flex-1">
        {/* Step 1: Registration Modal if not registered */}
        {!currentStudent ? (
          <RegistrationModal
            onSuccess={handleStudentRegistered}
            existingRegisteredList={registeredStudents}
            isGoogleConnected={isGoogleConnected}
            onGoogleConnected={() => setIsGoogleConnected(true)}
          />
        ) : screen === 'flashcards' ? (
          /* Step Flashcards: Math 12 Formulas Study Module */
          <MathFlashcardsView
            onBack={() => setScreen('list')}
            onStartExam={() => setScreen('list')}
          />
        ) : screen === 'list' ? (
          /* Step 2: Exam List (Google Drive + Built-in + AI Practice) */
          <ExamList
            student={currentStudent}
            isGoogleConnected={isGoogleConnected}
            onConnectGoogle={handleConnectGoogle}
            onSelectExam={handleSelectExam}
            aiGeneratedExams={aiPracticeExams}
            submissionHistory={submissionHistory}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onOpenFlashcards={() => setScreen('flashcards')}
          />
        ) : screen === 'taking' && selectedExam ? (
          /* Step 3: Exam Taking (90-min countdown, PDF preview, Answer Sheet) */
          <ExamTaking
            exam={selectedExam}
            student={currentStudent}
            onBack={() => setScreen('list')}
            onSubmit={handleSubmitExam}
            isSubmitting={isGrading}
            initialMockMode={isMockMode}
          />
        ) : screen === 'result' && selectedExam && gradeResult ? (
          /* Step 4: Results, Mistakes Analysis, Leveling, Google Sheet sync, Gemini Practice, Recharts Progress */
          <ExamResult
            exam={selectedExam}
            student={currentStudent}
            gradeData={gradeResult}
            timeSpentFormatted={`${Math.floor(lastTimeSpent / 60)} phút ${lastTimeSpent % 60} giây`}
            sheetSyncSuccess={sheetSyncSuccess}
            sheetSyncError={sheetSyncError}
            onRetrySheetSync={handleRetrySheetSync}
            onBackToExamList={() => setScreen('list')}
            onStartPracticeExam={handleStartPracticeExam}
            scoreHistory={scoreHistory}
            isMockExam={lastIsMockExam}
            violationCount={lastViolationCount}
            onOpenFlashcards={() => setScreen('flashcards')}
          />
        ) : (
          <div className="p-8 text-center text-slate-500">Đang tải...</div>
        )}
      </main>

      {/* Student Profile & Progress Chart Modal */}
      {currentStudent && (
        <StudentProfileModal
          student={currentStudent}
          history={scoreHistory}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}

      {/* Level-Up & High Score Celebration Modal */}
      {celebrationData && currentStudent && (
        <CelebrationModal
          isOpen={celebrationData.isOpen}
          onClose={() => setCelebrationData(null)}
          studentNickname={currentStudent.nickname}
          score={celebrationData.score}
          newLevel={celebrationData.newLevel}
          previousLevel={celebrationData.previousLevel}
          isLevelUp={celebrationData.isLevelUp}
          isHighScore={celebrationData.isHighScore}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <p>
          Hệ Thống Luyện Thi & Khảo Sát Toán Học 12 • Tự động hóa với Google Drive, Google Sheets & AI Gemini
        </p>
      </footer>
    </div>
  );
}
