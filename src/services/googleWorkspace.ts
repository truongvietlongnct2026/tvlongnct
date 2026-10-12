import { getAccessToken } from './googleAuth';

export const SPREADSHEET_ID = '1JV1jfDCuE-bD5L119fNyH2qAWG7TV6eLR3vphAkK2cY';
export const DRIVE_FOLDER_ID = '1gtZYI73lDQCUy7qUHfhtgpAG1Vifh1M_';

export interface StudentProfile {
  fullName: string;
  nickname: string;
  className: string;
  school: string;
  email?: string;
  registeredAt?: string;
  currentLevel?: string;
}

export interface DriveExamFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
  webContentLink?: string;
  size?: string;
  thumbnailLink?: string;
}

export interface TestSubmissionRecord {
  nickname: string;
  fullName: string;
  className: string;
  school: string;
  testTitle: string;
  timeSpent: string;
  score: number;
  level: string;
  commonMistakes: string;
  submittedAt: string;
  proctoringStatus?: string;
}

/**
 * Fetch list of PDF files from the designated Google Drive folder
 */
export async function fetchDriveExamFiles(): Promise<DriveExamFile[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Chưa đăng nhập Google để truy cập Drive');
  }

  // Query files where parent is the designated folder and not in trash
  const query = `'${DRIVE_FOLDER_ID}' in parents and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    query
  )}&fields=files(id,name,mimeType,modifiedTime,webViewLink,webContentLink,size,thumbnailLink)&orderBy=modifiedTime desc&pageSize=100`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Lỗi truy xuất Drive: ${response.statusText}`);
  }

  const data = await response.json();
  const files: DriveExamFile[] = data.files || [];
  return files;
}

/**
 * Fetch all registered nicknames from Google Sheets to verify nickname uniqueness
 */
export async function fetchRegisteredNicknames(): Promise<string[]> {
  const token = await getAccessToken();
  if (!token) return [];

  try {
    // Read columns from Sheet1 (typically column C or B has nickname)
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/A1:Z500`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.warn('Could not read sheet to check nicknames, falling back to local list');
      return [];
    }

    const data = await response.json();
    const rows: string[][] = data.values || [];
    if (rows.length <= 1) return [];

    // Find nickname column index
    const header = rows[0].map((h) => (h || '').toString().toLowerCase());
    let nickColIdx = header.findIndex((h) => h.includes('nick') || h.includes('biệt danh'));
    if (nickColIdx === -1) {
      // Default to column index 2 (Họ tên: 1, Nickname: 2)
      nickColIdx = 2;
    }

    const nicknames: string[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[nickColIdx]) {
        nicknames.push(row[nickColIdx].trim().toLowerCase());
      }
    }
    return nicknames;
  } catch (err) {
    console.error('Error fetching nicknames from Google Sheets:', err);
    return [];
  }
}

/**
 * Save new student registration to Google Sheet
 */
export async function saveStudentRegistrationToSheet(
  student: StudentProfile
): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Chưa có quyền ghi vào Google Sheets. Vui lòng đăng nhập Google.');
  }

  const timestamp = new Date().toLocaleString('vi-VN');
  const values = [
    [
      timestamp,
      student.fullName,
      student.nickname,
      student.className,
      student.school,
      student.email || 'Học sinh',
      'Đã đăng ký',
    ],
  ];

  const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const response = await fetch(appendUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values,
    }),
  });

  if (!response.ok) {
    const errorInfo = await response.json().catch(() => ({}));
    throw new Error(
      errorInfo.error?.message || `Không thể lưu vào Google Sheets (${response.status})`
    );
  }

  return true;
}

/**
 * Save student exam test results to Google Sheet
 * Requirements:
 * - Thời gian làm bài
 * - Số điểm
 * - Các sai lầm hay mắc phải
 * - Cấp độ đánh giá
 */
export async function saveTestResultToSheet(
  record: TestSubmissionRecord
): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Chưa có quyền ghi Google Sheets. Vui lòng kết nối tài khoản.');
  }

  const values = [
    [
      record.submittedAt,
      record.nickname,
      record.fullName,
      record.className,
      record.school,
      record.testTitle,
      record.timeSpent,
      record.score,
      record.level,
      record.commonMistakes,
      record.proctoringStatus || 'Chế độ thi thử (100% Nghiêm túc)',
    ],
  ];

  const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const response = await fetch(appendUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values,
    }),
  });

  if (!response.ok) {
    const errorInfo = await response.json().catch(() => ({}));
    throw new Error(
      errorInfo.error?.message || `Không thể gửi kết quả lên Google Sheets (${response.status})`
    );
  }

  return true;
}
