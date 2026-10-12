export interface ExamQuestionPart1 {
  id: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  solution: string;
}

export interface ExamQuestionPart2 {
  id: number;
  question: string;
  subItems: {
    key: 'a' | 'b' | 'c' | 'd';
    content: string;
    isCorrect: boolean;
  }[];
  solution: string;
}

export interface ExamQuestionPart3 {
  id: number;
  question: string;
  correctAnswer: string;
  solution: string;
}

export interface BuiltInExam {
  id: string;
  title: string;
  category: string;
  year: number;
  topic: string;
  pdfUrl?: string;
  isDriveFile?: boolean;
  part1: ExamQuestionPart1[];
  part2: ExamQuestionPart2[];
  part3: ExamQuestionPart3[];
}

export const SAMPLE_EXAMS: BuiltInExam[] = [
  {
    id: 'exam-thpt-2025-01',
    title: 'Đề Khảo Sát Toán 12 Chuẩn Cấu Trúc 2025 - Chuyên Đề Hàm Số & Cực Trị',
    category: 'Khảo sát chất lượng THPT 2025',
    year: 2025,
    topic: 'Tính đơn điệu và cực trị của hàm số',
    pdfUrl: 'https://docs.google.com/viewer?url=https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf&embedded=true',
    part1: [
      {
        id: 1,
        question: 'Cho hàm số y = f(x) có bảng biến thiên với f\'(x) > 0 trên (-∞; 1) và (3; +∞), f\'(x) < 0 trên (1; 3). Hàm số nghịch biến trên khoảng nào?',
        options: { A: '(-∞; 1)', B: '(1; 3)', C: '(3; +∞)', D: '(1; +∞)' },
        correctAnswer: 'B',
        solution: 'Vì f\'(x) < 0 trên khoảng (1; 3) nên hàm số y = f(x) nghịch biến trên khoảng (1; 3).'
      },
      {
        id: 2,
        question: 'Cho hàm số y = x^3 - 3x + 2. Điểm cực tiểu của hàm số là:',
        options: { A: 'x = 1', B: 'x = -1', C: 'x = 2', D: 'x = 0' },
        correctAnswer: 'A',
        solution: 'Ta có y\' = 3x^2 - 3 = 0 ⇔ x = ±1. Bảng xét dấu y\' đổi dấu từ âm sang dương khi qua x = 1, vậy x = 1 là điểm cực tiểu.'
      },
      {
        id: 3,
        question: 'Tiệm cận ngang của đồ thị hàm số y = (2x - 1)/(x + 3) là đường thẳng:',
        options: { A: 'y = 2', B: 'x = -3', C: 'y = -1/3', D: 'x = 2' },
        correctAnswer: 'A',
        solution: 'lim(x→±∞) y = lim(x→±∞) (2x - 1)/(x + 3) = 2. Vậy tiệm cận ngang là y = 2.'
      },
      {
        id: 4,
        question: 'Giá trị lớn nhất của hàm số f(x) = x^4 - 2x^2 + 3 trên đoạn [0; 2] bằng:',
        options: { A: '11', B: '3', C: '2', D: '19' },
        correctAnswer: 'A',
        solution: 'f\'(x) = 4x^3 - 4x = 0 ⇔ x = 0 hoặc x = 1 (trên [0; 2]). f(0) = 3, f(1) = 2, f(2) = 11. Vậy Max = 11 tại x = 2.'
      },
      {
        id: 5,
        question: 'Họ nguyên hàm của hàm số f(x) = 3x^2 + e^x là:',
        options: { A: 'x^3 + e^x + C', B: '6x + e^x + C', C: 'x^3 - e^x + C', D: '3x^3 + e^x + C' },
        correctAnswer: 'A',
        solution: '∫(3x^2 + e^x)dx = x^3 + e^x + C.'
      },
      {
        id: 6,
        question: 'Trong không gian Oxyz, toạ độ vectơ u = 2i - 3j + k là:',
        options: { A: '(2; -3; 1)', B: '(2; 3; 1)', C: '(-2; 3; -1)', D: '(2; -3; 0)' },
        correctAnswer: 'A',
        solution: 'Vectơ u = 2i - 3j + k tương ứng có toạ độ (2; -3; 1).'
      },
      {
        id: 7,
        question: 'Số phức liên hợp của z = 3 - 4i là:',
        options: { A: 'z = 3 + 4i', B: 'z = -3 + 4i', C: 'z = -3 - 4i', D: 'z = 4 - 3i' },
        correctAnswer: 'A',
        solution: 'Số phức liên hợp của a + bi là a - bi. Với z = 3 - 4i thì z̄ = 3 + 4i.'
      },
      {
        id: 8,
        question: 'Tập nghiệm của bất phương trình log2(x - 1) < 3 là:',
        options: { A: '(1; 9)', B: '(-∞; 9)', C: '(1; 8)', D: '(9; +∞)' },
        correctAnswer: 'A',
        solution: 'Điều kiện: x - 1 > 0 ⇔ x > 1. Bpt ⇔ x - 1 < 2^3 = 8 ⇔ x < 9. Kết hợp điều kiện ta được (1; 9).'
      },
      {
        id: 9,
        question: 'Khối lăng trụ có diện tích đáy B = 6 và chiều cao h = 4 có thể tích bằng:',
        options: { A: '24', B: '8', C: '12', D: '72' },
        correctAnswer: 'A',
        solution: 'Thể tích khối lăng trụ V = B.h = 6.4 = 24.'
      },
      {
        id: 10,
        question: 'Trong không gian Oxyz, phương trình mặt phẳng đi qua M(1; -2; 3) và có VTPT n = (2; 1; -1) là:',
        options: { A: '2x + y - z + 3 = 0', B: '2x + y - z - 3 = 0', C: 'x - 2y + 3z - 1 = 0', D: '2x - y + z - 7 = 0' },
        correctAnswer: 'A',
        solution: '2(x - 1) + 1(y + 2) - 1(z - 3) = 0 ⇔ 2x + y - z + 3 = 0.'
      },
      {
        id: 11,
        question: 'Cho cấp số cộng (un) có u1 = 2 và công sai d = 3. Số hạng u5 bằng:',
        options: { A: '14', B: '15', C: '17', D: '11' },
        correctAnswer: 'A',
        solution: 'u5 = u1 + 4d = 2 + 4.3 = 14.'
      },
      {
        id: 12,
        question: 'Gieo một con xúc xắc cân đối đồng chất. Xác suất xuất hiện mặt có số chấm chia hết cho 3 là:',
        options: { A: '1/3', B: '1/2', C: '1/6', D: '2/3' },
        correctAnswer: 'A',
        solution: 'Không gian mẫu n(Ω) = 6. Các mặt chia hết cho 3 là {3; 6} (2 trường hợp). Xác suất P = 2/6 = 1/3.'
      }
    ],
    part2: [
      {
        id: 1,
        question: 'Cho hàm số bậc ba y = f(x) = 2x^3 - 3x^2 - 12x + 1 có đồ thị (C). Xét tính đúng sai của các khẳng định sau:',
        subItems: [
          { key: 'a', content: 'Đạo hàm f\'(x) = 6x^2 - 6x - 12.', isCorrect: true },
          { key: 'b', content: 'Hàm số đồng biến trên khoảng (-1; 2).', isCorrect: false },
          { key: 'c', content: 'Điểm cực đại của hàm số là x = -1 và giá trị cực đại bằng 8.', isCorrect: true },
          { key: 'd', content: 'Phương trình f(x) = 0 có đúng 3 nghiệm phân biệt.', isCorrect: true }
        ],
        solution: 'f\'(x) = 6x^2 - 6x - 12. f\'(x)=0 ⇔ x = -1 hoặc x = 2. f\'(x) < 0 trên (-1; 2) nên hàm số nghịch biến trên (-1; 2) => b sai. Cực đại tại x = -1, f(-1) = 8 => c đúng. Cực tiểu tại x = 2, f(2) = -19. Do y_CĐ.y_CT = 8.(-19) < 0 nên pt f(x)=0 có 3 nghiệm phân biệt => d đúng.'
      },
      {
        id: 2,
        question: 'Cho hàm số y = (x^2 - 2x + 2)/(x - 1). Xét tính đúng sai của các khẳng định sau:',
        subItems: [
          { key: 'a', content: 'Tập xác định của hàm số là D = R \\ {1}.', isCorrect: true },
          { key: 'b', content: 'Đồ thị hàm số có tiệm cận đứng là đường thẳng x = 1.', isCorrect: true },
          { key: 'c', content: 'Đồ thị hàm số có tiệm cận xiên là y = x - 1.', isCorrect: true },
          { key: 'd', content: 'Hàm số đạt cực tiểu tại x = 0.', isCorrect: false }
        ],
        solution: 'Ta có y = x - 1 + 1/(x - 1). Tiệm cận xiên là y = x - 1, TCĐ là x = 1. y\' = 1 - 1/(x - 1)^2 = 0 ⇔ (x - 1)^2 = 1 ⇔ x = 2 hoặc x = 0. Cực đại tại x = 0 (f(0) = -2) và Cực tiểu tại x = 2 (f(2) = 2). Do đó d sai.'
      },
      {
        id: 3,
        question: 'Trong không gian Oxyz, cho mặt cầu (S): x^2 + y^2 + z^2 - 2x + 4y - 6z - 11 = 0 và mặt phẳng (P): 2x - 2y + z + 1 = 0.',
        subItems: [
          { key: 'a', content: 'Tâm của mặt cầu (S) là I(1; -2; 3).', isCorrect: true },
          { key: 'b', content: 'Bán kính của mặt cầu (S) là R = 5.', isCorrect: true },
          { key: 'c', content: 'Khoảng cách từ tâm I đến mặt phẳng (P) bằng 2.', isCorrect: false },
          { key: 'd', content: 'Mặt phẳng (P) cắt mặt cầu (S) theo giao tuyến là đường tròn có bán kính r = 3.', isCorrect: false }
        ],
        solution: 'Tâm I(1; -2; 3), bán kính R = √(1^2 + (-2)^2 + 3^2 - (-11)) = √(1+4+9+11) = √25 = 5. d(I, P) = |2(1) - 2(-2) + 3 + 1| / √(4+4+1) = |2 + 4 + 3 + 1| / 3 = 10/3 => c sai. r = √(R^2 - d^2) = √(25 - 100/9) = √(125/9) ≠ 3 => d sai.'
      },
      {
        id: 4,
        question: 'Một hộp chứa 5 quả cầu màu đỏ và 4 quả cầu màu xanh. Chọn ngẫu nhiên 3 quả cầu.',
        subItems: [
          { key: 'a', content: 'Số phần tử của không gian mẫu là C(9, 3) = 84.', isCorrect: true },
          { key: 'b', content: 'Xác suất để chọn được 3 quả cùng màu đỏ là 5/42.', isCorrect: true },
          { key: 'c', content: 'Xác suất để chọn được ít nhất 1 quả màu xanh là 37/42.', isCorrect: true },
          { key: 'd', content: 'Xác suất để trong 3 quả chọn được có đúng 2 quả màu đỏ bằng 10/21.', isCorrect: true }
        ],
        solution: 'n(Ω) = C_9^3 = 84. a) Đúng. b) P(3 đỏ) = C_5^3 / 84 = 10/84 = 5/42. Đúng. c) Biến cố đối không có quả xanh = 3 đỏ, P = 1 - 5/42 = 37/42. Đúng. d) P(2 đỏ, 1 xanh) = (C_5^2 * C_4^1)/84 = (10*4)/84 = 40/84 = 10/21. Đúng.'
      }
    ],
    part3: [
      {
        id: 1,
        question: 'Biết đường cong y = x^3 - 3x^2 + m cắt trục hoành tại 3 điểm phân biệt khi và chỉ khi a < m < b. Giá trị của biểu thức b - a bằng bao nhiêu?',
        correctAnswer: '4',
        solution: 'Xét f(x) = x^3 - 3x^2. f\'(x) = 3x^2 - 6x = 0 ⇔ x = 0 hoặc x = 2. Cực đại f(0) = 0, Cực tiểu f(2) = -4. Để đường cong cắt Ox tại 3 điểm thì -m phải nằm giữa -4 và 0: -4 < -m < 0 ⇔ 0 < m < 4. Vậy a = 0, b = 4 => b - a = 4.'
      },
      {
        id: 2,
        question: 'Cho hình chóp S.ABC có đáy ABC là tam giác vuông tại B, AB = 3, BC = 4. Cạnh bên SA vuông góc với đáy và SA = 5. Thể tích khối chóp S.ABC bằng bao nhiêu?',
        correctAnswer: '10',
        solution: 'Diện tích đáy S_ABC = 1/2 * AB * BC = 1/2 * 3 * 4 = 6. Thể tích V = 1/3 * SA * S_ABC = 1/3 * 5 * 6 = 10.'
      },
      {
        id: 3,
        question: 'Một người gửi tiết kiệm ngân hàng 100 triệu đồng với lãi suất 6%/năm theo hình thức lãi kép hàng năm. Sau ít nhất bao nhiêu năm thì người đó nhận được số tiền cả gốc lẫn lãi vượt quá 150 triệu đồng?',
        correctAnswer: '7',
        solution: 'Ta có 100 * (1 + 0.06)^n > 150 ⇔ 1.06^n > 1.5 ⇔ n > ln(1.5)/ln(1.06) ≈ 6.958. Vậy cần ít nhất 7 năm.'
      },
      {
        id: 4,
        question: 'Tìm số nghiệm nguyên của bất phương trình log_0.5(x - 2) ≥ -3.',
        correctAnswer: '8',
        solution: 'ĐK: x - 2 > 0 ⇔ x > 2. BPT ⇔ x - 2 ≤ (0.5)^(-3) = 8 ⇔ x ≤ 10. Vậy 2 < x ≤ 10. Các nghiệm nguyên là {3, 4, 5, 6, 7, 8, 9, 10}, gồm đúng 8 nghiệm.'
      },
      {
        id: 5,
        question: 'Cho tích phân I = ∫[0 to 2] (2x + 1) dx. Giá trị của I bằng bao nhiêu?',
        correctAnswer: '6',
        solution: 'I = [x^2 + x] từ 0 đến 2 = (4 + 2) - (0) = 6.'
      },
      {
        id: 6,
        question: 'Trong không gian Oxyz, cho hai điểm A(1; 2; -1) và B(3; 0; 3). Độ dài đoạn thẳng AB bằng bao nhiêu?',
        correctAnswer: '4.9',
        solution: 'AB = √((3-1)^2 + (0-2)^2 + (3-(-1))^2) = √(4 + 4 + 16) = √24 ≈ 4.9 (hoặc 2√6).'
      }
    ]
  }
];

export interface StudentLevelInfo {
  level: string;
  badge: string;
  color: string;
  minScore: number;
  maxScore: number;
  description: string;
}

export const STUDENT_LEVELS: StudentLevelInfo[] = [
  {
    level: 'Tân thủ',
    badge: '🥉',
    color: 'text-amber-700 bg-amber-50 border-amber-300',
    minScore: 0,
    maxScore: 3.49,
    description: 'Cần củng cố kiến thức nền tảng, định nghĩa và công thức cơ bản.'
  },
  {
    level: 'Nhập môn',
    badge: '🥈',
    color: 'text-blue-700 bg-blue-50 border-blue-300',
    minScore: 3.5,
    maxScore: 5.0,
    description: 'Đã nắm được các dạng toán cơ bản, cần rèn luyện phản xạ tính toán.'
  },
  {
    level: 'Đại sư',
    badge: '🥇',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-300',
    minScore: 5.01,
    maxScore: 7.0,
    description: 'Nắm vững kiến thức thông hiểu, tự tin giải các bài toán vận dụng vừa.'
  },
  {
    level: 'Cao thủ',
    badge: '💎',
    color: 'text-purple-700 bg-purple-50 border-purple-300',
    minScore: 7.01,
    maxScore: 8.0,
    description: 'Kỹ năng làm bài xuất sắc, làm chủ các dạng toán vận dụng và biến đổi nhanh.'
  },
  {
    level: 'Đại cao thủ',
    badge: '👑',
    color: 'text-rose-700 bg-rose-50 border-rose-300',
    minScore: 8.01,
    maxScore: 10.0,
    description: 'Đỉnh cao phong độ! Làm chủ mọi bài toán vận dụng cao và tối ưu thời gian.'
  }
];

export function calculateLevelFromScore(score: number): StudentLevelInfo {
  if (score < 3.5) return STUDENT_LEVELS[0];
  if (score <= 5.0) return STUDENT_LEVELS[1];
  if (score <= 7.0) return STUDENT_LEVELS[2];
  if (score <= 8.0) return STUDENT_LEVELS[3];
  return STUDENT_LEVELS[4];
}
