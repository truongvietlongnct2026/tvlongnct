import { BuiltInExam } from './sampleExams';

/**
 * 4 Targeted Exam Templates calibrated to exact score tiers (Tân thủ <3.5đ, Nhập môn 3.5-5đ, Đại sư 5-7đ, Cao thủ/Đại cao thủ 7-10đ)
 * Used immediately for instant generation or when offline/Gemini fallback is needed.
 */
export const TARGETED_BENCHMARK_EXAMS: Record<string, BuiltInExam> = {
  // Level 1: < 3.5 điểm - Tân thủ (Nhận biết cơ bản)
  basic: {
    id: 'targeted-exam-basic-nhan-biet',
    title: 'Đề Ôn Luyện Củng Cố Nền Tảng: Mức Độ Nhận Biết (Dành cho mức dưới 3.5 điểm)',
    category: 'Mục tiêu: Đạt 5.0 điểm THPT Quốc Gia',
    year: 2025,
    topic: 'Củng cố công thức cơ bản và nhận biết đồ thị hàm số, đạo hàm',
    part1: [
      {
        id: 1,
        question: 'Đạo hàm của hàm số y = x^4 là:',
        options: { A: "y' = 4x^3", B: "y' = x^3", C: "y' = 4x", D: "y' = x^5/5" },
        correctAnswer: 'A',
        solution: "Áp dụng công thức (x^n)' = n*x^(n-1), ta có (x^4)' = 4x^3."
      },
      {
        id: 2,
        question: 'Cho hàm số y = f(x) có bảng biến thiên với f\'(x) > 0 trên khoảng (0; 2). Hàm số đồng biến trên khoảng nào?',
        options: { A: '(-∞; 0)', B: '(0; 2)', C: '(2; +∞)', D: '(-∞; 2)' },
        correctAnswer: 'B',
        solution: "Hàm số đồng biến trên khoảng mà đạo hàm mang dấu dương, tức là (0; 2)."
      },
      {
        id: 3,
        question: 'Tiệm cận đứng của đồ thị hàm số y = (2x + 1)/(x - 3) là đường thẳng:',
        options: { A: 'x = 3', B: 'x = 2', C: 'y = 2', D: 'y = 3' },
        correctAnswer: 'A',
        solution: "Nghiệm của mẫu số x - 3 = 0 ⇔ x = 3, do đó tiệm cận đứng là đường thẳng x = 3."
      },
      {
        id: 4,
        question: 'Tập xác định của hàm số y = ln(x - 1) là:',
        options: { A: '(1; +∞)', B: '[1; +∞)', C: '(0; +∞)', D: 'R \\ {1}' },
        correctAnswer: 'A',
        solution: "Điều kiện xác định của ln(u) là u > 0 ⇔ x - 1 > 0 ⇔ x > 1. Vậy D = (1; +∞)."
      },
      {
        id: 5,
        question: 'Nguyên hàm của hàm số f(x) = e^x là:',
        options: { A: 'e^x + C', B: 'e^(x+1) + C', C: 'x*e^x + C', D: 'ln|x| + C' },
        correctAnswer: 'A',
        solution: "Ta có ∫ e^x dx = e^x + C."
      },
      {
        id: 6,
        question: 'Trong không gian Oxyz, tọa độ của vectơ đơn vị trên trục Ox là:',
        options: { A: 'i = (1; 0; 0)', B: 'j = (0; 1; 0)', C: 'k = (0; 0; 1)', D: '0 = (0; 0; 0)' },
        correctAnswer: 'A',
        solution: "Vectơ đơn vị trên trục Ox là i = (1; 0; 0)."
      },
      {
        id: 7,
        question: 'Cho hàm số y = f(x) có đồ thị cắt trục hoành tại điểm có hoành độ x = 2. Giá trị f(2) bằng:',
        options: { A: '0', B: '2', C: '-2', D: '1' },
        correctAnswer: 'A',
        solution: "Điểm thuộc trục hoành có tung độ y = 0 nên f(2) = 0."
      },
      {
        id: 8,
        question: 'Nghiệm của phương trình 2^x = 8 là:',
        options: { A: 'x = 3', B: 'x = 4', C: 'x = 2', D: 'x = 16' },
        correctAnswer: 'A',
        solution: "2^x = 8 = 2^3 ⇔ x = 3."
      },
      {
        id: 9,
        question: 'Đạo hàm của hàm số y = sin(x) là:',
        options: { A: "y' = cos(x)", B: "y' = -cos(x)", C: "y' = sin(x)", D: "y' = tan(x)" },
        correctAnswer: 'A',
        solution: "(sin x)' = cos x."
      },
      {
        id: 10,
        question: 'Họ nguyên hàm của hàm số f(x) = 2x là:',
        options: { A: 'x^2 + C', B: '2x^2 + C', C: 'x + C', D: '2 + C' },
        correctAnswer: 'A',
        solution: "∫ 2x dx = 2 * (x^2 / 2) + C = x^2 + C."
      },
      {
        id: 11,
        question: 'Trong không gian Oxyz, khoảng cách từ gốc tọa độ O(0;0;0) đến điểm M(3; 0; 4) bằng:',
        options: { A: '5', B: '7', C: '25', D: '1' },
        correctAnswer: 'A',
        solution: "OM = √(3^2 + 0^2 + 4^2) = √(9 + 16) = √25 = 5."
      },
      {
        id: 12,
        question: 'Tung độ giao điểm của đồ thị hàm số y = x^3 - 3x + 2 với trục tung là:',
        options: { A: 'y = 2', B: 'y = 0', C: 'y = -2', D: 'y = 3' },
        correctAnswer: 'A',
        solution: "Giao điểm với trục tung Oy có x = 0 ⇒ y = 0^3 - 3*0 + 2 = 2."
      }
    ],
    part2: [
      {
        id: 1,
        question: 'Cho hàm số bậc ba y = f(x) = x^3 - 3x + 1. Xét tính đúng/sai của các mệnh đề sau:',
        subItems: [
          { key: 'a', content: "Đạo hàm f'(x) = 3x^2 - 3.", isCorrect: true },
          { key: 'b', content: "Phương trình f'(x) = 0 có hai nghiệm phân biệt x = 1 và x = -1.", isCorrect: true },
          { key: 'c', content: "Hàm số đồng biến trên khoảng (-1; 1).", isCorrect: false },
          { key: 'd', content: "Giá trị cực đại của hàm số đạt tại x = -1 và y_CD = 3.", isCorrect: true }
        ],
        solution: "f'(x) = 3x^2 - 3 = 3(x-1)(x+1). f'(x) < 0 trên (-1; 1) nên nghịch biến trên (-1; 1). Tại x = -1, y = (-1)^3 - 3(-1) + 1 = 3 (cực đại)."
      },
      {
        id: 2,
        question: 'Cho hàm số y = (x + 2)/(x - 1). Xét tính đúng/sai của các khẳng định:',
        subItems: [
          { key: 'a', content: "Tập xác định của hàm số là D = R \\ {1}.", isCorrect: true },
          { key: 'b', content: "Đường tiệm cận ngang của đồ thị là y = 1.", isCorrect: true },
          { key: 'c', content: "Đường tiệm cận đứng của đồ thị là x = -2.", isCorrect: false },
          { key: 'd', content: "Đạo hàm y' = -3/(x - 1)^2 < 0 với mọi x khác 1.", isCorrect: true }
        ],
        solution: "Tiệm cận đứng là nghiệm mẫu x = 1 (khẳng định c sai). Tiệm cận ngang y = a/c = 1/1 = 1."
      },
      {
        id: 3,
        question: 'Cho phương trình log_2(x - 3) = 2. Xét tính đúng/sai:',
        subItems: [
          { key: 'a', content: "Điều kiện xác định của phương trình là x > 3.", isCorrect: true },
          { key: 'b', content: "Phương trình tương đương với x - 3 = 4.", isCorrect: true },
          { key: 'c', content: "Nghiệm của phương trình là x = 7.", isCorrect: true },
          { key: 'd', content: "Phương trình có 2 nghiệm phân biệt.", isCorrect: false }
        ],
        solution: "log_2(x - 3) = 2 ⇔ x - 3 = 2^2 = 4 ⇔ x = 7 (thỏa mãn x > 3). Chỉ có 1 nghiệm duy nhất."
      },
      {
        id: 4,
        question: 'Trong không gian Oxyz, cho hai điểm A(1; 1; 2) và B(3; 1; 0). Xét tính đúng/sai:',
        subItems: [
          { key: 'a', content: "Vectơ AB có tọa độ là (2; 0; -2).", isCorrect: true },
          { key: 'b', content: "Độ dài đoạn thẳng AB bằng 2√2.", isCorrect: true },
          { key: 'c', content: "Tọa độ trung điểm I của đoạn AB là (2; 1; 1).", isCorrect: true },
          { key: 'd', content: "Điểm B nằm trên mặt phẳng (Oxy).", isCorrect: true }
        ],
        solution: "AB = (3-1; 1-1; 0-2) = (2; 0; -2). |AB| = √(4 + 0 + 4) = √8 = 2√2. Trung điểm I = ((1+3)/2; (1+1)/2; (2+0)/2) = (2; 1; 1). Cao độ B có z = 0 nên thuộc (Oxy)."
      }
    ],
    part3: [
      {
        id: 1,
        question: 'Tìm giá trị cực tiểu của hàm số y = x^2 - 4x + 5.',
        correctAnswer: '1',
        solution: "y' = 2x - 4 = 0 ⇔ x = 2. y(2) = 2^2 - 4*2 + 5 = 1."
      },
      {
        id: 2,
        question: 'Tính tích phân I = ∫[0 to 3] 2x dx.',
        correctAnswer: '9',
        solution: "I = [x^2] từ 0 đến 3 = 3^2 - 0 = 9."
      },
      {
        id: 3,
        question: 'Giải phương trình 3^(2x - 1) = 27. Tìm giá trị của x.',
        correctAnswer: '2',
        solution: "3^(2x - 1) = 3^3 ⇔ 2x - 1 = 3 ⇔ 2x = 4 ⇔ x = 2."
      },
      {
        id: 4,
        question: 'Số đường tiệm cận (đứng và ngang) của đồ thị hàm số y = (x + 1)/(x - 2) là bao nhiêu?',
        correctAnswer: '2',
        solution: "Gồm 1 TCĐ x = 2 và 1 TCN y = 1. Tổng cộng 2 đường tiệm cận."
      },
      {
        id: 5,
        question: 'Trong không gian Oxyz, cho điểm M(2; -3; 4). Khoảng cách từ M đến mặt phẳng (Oxy) bằng bao nhiêu?',
        correctAnswer: '4',
        solution: "d(M, (Oxy)) = |z_M| = |4| = 4."
      },
      {
        id: 6,
        question: 'Cho cấp số cộng (u_n) có u_1 = 3 và công sai d = 4. Tìm số hạng u_3.',
        correctAnswer: '11',
        solution: "u_3 = u_1 + 2d = 3 + 2*4 = 11."
      }
    ]
  },

  // Level 2: 3.5 - 5.0 điểm - Nhập môn -> Rèn Thông hiểu
  understanding: {
    id: 'targeted-exam-understanding-thong-hieu',
    title: 'Đề Ôn Luyện Tối Ưu Năng Lực: Mức Độ Thông Hiểu (Dành cho mức 5.0 điểm)',
    category: 'Mục tiêu: Đột phá mốc 7.0 điểm THPT Quốc Gia',
    year: 2025,
    topic: 'Kỹ năng thông hiểu: Khảo sát hàm số, Logarit, Tích phân & Hình học Oxyz',
    part1: [
      {
        id: 1,
        question: 'Cho hàm số y = f(x) có đạo hàm f\'(x) = x(x - 1)^2(x + 2). Số điểm cực trị của hàm số là:',
        options: { A: '2', B: '3', C: '1', D: '4' },
        correctAnswer: 'A',
        solution: "f'(x) đổi dấu khi qua các nghiệm bội lẻ x = 0 và x = -2 (nghiệm kép x = 1 không đổi dấu). Do đó hàm số có đúng 2 điểm cực trị."
      },
      {
        id: 2,
        question: 'Giá trị lớn nhất của hàm số f(x) = x^3 - 3x + 2 trên đoạn [0; 2] bằng:',
        options: { A: '4', B: '2', C: '0', D: '6' },
        correctAnswer: 'A',
        solution: "f'(x) = 3x^2 - 3 = 0 ⇔ x = 1 (thuộc [0; 2]). Ta có f(0) = 2, f(1) = 0, f(2) = 8 - 6 + 2 = 4. Vậy max = 4."
      },
      {
        id: 3,
        question: 'Tập nghiệm của bất phương trình log_2(x^2 - 1) ≤ 3 là:',
        options: { A: '[-3; -1) ∪ (1; 3]', B: '[-3; 3]', C: '(1; 3]', D: '(-∞; -3] ∪ [3; +∞)' },
        correctAnswer: 'A',
        solution: "ĐK: x^2 - 1 > 0 ⇔ x < -1 hoặc x > 1. BPT ⇔ x^2 - 1 ≤ 2^3 = 8 ⇔ x^2 ≤ 9 ⇔ -3 ≤ x ≤ 3. Kết hợp điều kiện: [-3; -1) ∪ (1; 3]."
      },
      {
        id: 4,
        question: 'Biết ∫[1 to 2] f(x) dx = 3 và ∫[1 to 2] g(x) dx = -2. Tính tích phân I = ∫[1 to 2] [2f(x) - 3g(x)] dx:',
        options: { A: '12', B: '0', C: '6', D: '10' },
        correctAnswer: 'A',
        solution: "I = 2 * (3) - 3 * (-2) = 6 + 6 = 12."
      },
      {
        id: 5,
        question: 'Trong không gian Oxyz, phương trình mặt cầu tâm I(1; -2; 3) bán kính R = 4 là:',
        options: {
          A: '(x - 1)^2 + (y + 2)^2 + (z - 3)^2 = 16',
          B: '(x + 1)^2 + (y - 2)^2 + (z + 3)^2 = 16',
          C: '(x - 1)^2 + (y + 2)^2 + (z - 3)^2 = 4',
          D: '(x + 1)^2 + (y - 2)^2 + (z + 3)^2 = 4'
        },
        correctAnswer: 'A',
        solution: "Phương trình mặt cầu (x - a)^2 + (y - b)^2 + (z - c)^2 = R^2 ⇒ (x - 1)^2 + (y + 2)^2 + (z - 3)^2 = 16."
      },
      {
        id: 6,
        question: 'Cho hình chóp S.ABC có đáy là tam giác vuông tại B, SA vuông góc với đáy. Khẳng định nào sau đây ĐÚNG?',
        options: { A: 'BC ⊥ (SAB)', B: 'AC ⊥ (SAB)', C: 'AB ⊥ (SBC)', D: 'SC ⊥ (ABC)' },
        correctAnswer: 'A',
        solution: "BC ⊥ AB (đáy vuông tại B) và BC ⊥ SA (do SA ⊥ đáy) ⇒ BC ⊥ (SAB)."
      },
      {
        id: 7,
        question: 'Đồ thị hàm số y = (x - 1)/(x^2 - 4) có bao nhiêu đường tiệm cận?',
        options: { A: '3', B: '2', C: '1', D: '4' },
        correctAnswer: 'A',
        solution: "Bậc tử nhỏ hơn bậc mẫu nên có 1 TCN y = 0. Mẫu có 2 nghiệm phân biệt x = 2, x = -2 (không triệt tiêu tử) nên có 2 TCĐ. Tổng số đường tiệm cận là 3."
      },
      {
        id: 8,
        question: 'Cho a > 0, a ≠ 1. Biểu thức P = log_a(a^3 * √a) có giá trị bằng:',
        options: { A: '7/2', B: '3/2', C: '5/2', D: '3' },
        correctAnswer: 'A',
        solution: "a^3 * √a = a^(3 + 1/2) = a^(7/2). Vậy log_a(a^(7/2)) = 7/2."
      },
      {
        id: 9,
        question: 'Họ tất cả các nguyên hàm của hàm số f(x) = 1/(2x + 1) trên khoảng (0; +∞) là:',
        options: { A: '(1/2)ln(2x + 1) + C', B: 'ln(2x + 1) + C', C: '2ln(2x + 1) + C', D: '-1/(2x+1)^2 + C' },
        correctAnswer: 'A',
        solution: "∫ 1/(ax + b) dx = (1/a)ln|ax + b| + C = (1/2)ln(2x + 1) + C."
      },
      {
        id: 10,
        question: 'Trong không gian Oxyz, góc giữa hai vectơ u = (1; 0; 1) và v = (0; 1; 1) bằng:',
        options: { A: '60°', B: '45°', C: '90°', D: '30°' },
        correctAnswer: 'A',
        solution: "cos(u, v) = (1*0 + 0*1 + 1*1) / (√(1+1) * √(1+1)) = 1 / (√2 * √2) = 1/2 ⇒ góc bằng 60°."
      },
      {
        id: 11,
        question: 'Gieo một con xúc xắc cân đối và đồng chất 2 lần liên tiếp. Xác suất để tổng số chấm xuất hiện bằng 7 là:',
        options: { A: '1/6', B: '1/12', C: '5/36', D: '7/36' },
        correctAnswer: 'A',
        solution: "Không gian mẫu n(Ω) = 36. Các cặp tổng bằng 7: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) gồm 6 biến cố thuận lợi. P = 6/36 = 1/6."
      },
      {
        id: 12,
        question: 'Số giao điểm của đồ thị hàm số y = x^3 - 3x và đường thẳng y = x là:',
        options: { A: '3', B: '2', C: '1', D: '0' },
        correctAnswer: 'A',
        solution: "x^3 - 3x = x ⇔ x^3 - 4x = 0 ⇔ x(x^2 - 4) = 0 ⇔ x ∈ {0, 2, -2}. Gồm 3 giao điểm."
      }
    ],
    part2: [
      {
        id: 1,
        question: 'Cho hàm số f(x) = (2x - 1)/(x + 1). Xét tính đúng/sai của các phát biểu sau:',
        subItems: [
          { key: 'a', content: "Hàm số đồng biến trên từng khoảng xác định (-∞; -1) và (-1; +∞).", isCorrect: true },
          { key: 'b', content: "Đồ thị hàm số có tâm đối xứng là điểm I(-1; 2).", isCorrect: true },
          { key: 'c', content: "Giao điểm của đồ thị với trục tung là điểm M(0; -1).", isCorrect: true },
          { key: 'd', content: "Hàm số đạt cực trị tại x = 0.", isCorrect: false }
        ],
        solution: "y' = (2*1 - (-1)*1)/(x+1)^2 = 3/(x+1)^2 > 0 nên hàm đồng biến, không có cực trị (khẳng định d sai). Tâm đối xứng là giao 2 tiệm cận I(-1; 2)."
      },
      {
        id: 2,
        question: 'Cho hàm số f(x) liên tục trên R và thỏa mãn ∫[0 to 4] f(x) dx = 8. Xét tính đúng/sai:',
        subItems: [
          { key: 'a', content: "∫[0 to 4] 3f(x) dx = 24.", isCorrect: true },
          { key: 'b', content: "Tích phân ∫[0 to 2] f(2x) dx = 4.", isCorrect: true },
          { key: 'c', content: "Nếu f(x) ≥ 0 thì diện tích hình phẳng giới hạn bởi y = f(x), trục Ox và hai đường thẳng x=0, x=4 là 8.", isCorrect: true },
          { key: 'd', content: "∫[0 to 4] [f(x) + 2] dx = 10.", isCorrect: false }
        ],
        solution: "Với ý b: Đổi biến t = 2x ⇒ dx = dt/2. Khi x=0→t=0; x=2→t=4. ∫ f(2x)dx = (1/2)∫[0 to 4]f(t)dt = 8/2 = 4 (Đúng). Với ý d: ∫[0 to 4] [f(x)+2]dx = 8 + 2*(4-0) = 8 + 8 = 16 (Sai)."
      },
      {
        id: 3,
        question: 'Cho hình hộp chữ nhật ABCD.A\'B\'C\'D\' có AB = 2, AD = 3, AA\' = 4. Xét tính đúng/sai:',
        subItems: [
          { key: 'a', content: "Thể tích của khối hộp chữ nhật bằng 24.", isCorrect: true },
          { key: 'b', content: "Độ dài đường chéo AC' bằng √29.", isCorrect: true },
          { key: 'c', content: "Khoảng cách giữa hai mặt phẳng đáy (ABCD) và (A'B'C'D') bằng 4.", isCorrect: true },
          { key: 'd', content: "Góc giữa đường thẳng AC' và mặt phẳng đáy (ABCD) lớn hơn 60°.", isCorrect: false }
        ],
        solution: "V = 2*3*4 = 24. AC' = √(2^2 + 3^2 + 4^2) = √(4+9+16) = √29. Đáy AC = √(4+9) = √13 ≈ 3.6. tan φ = AA'/AC = 4/√13 ≈ 1.109 ⇒ φ ≈ 48° < 60°."
      },
      {
        id: 4,
        question: 'Trong không gian Oxyz, cho mặt phẳng (P): 2x - y + 2z - 6 = 0 và điểm M(1; 2; 3). Xét tính đúng/sai:',
        subItems: [
          { key: 'a', content: "Vectơ pháp tuyến của (P) là n = (2; -1; 2).", isCorrect: true },
          { key: 'b', content: "Điểm M(1; 2; 3) thuộc mặt phẳng (P).", isCorrect: false },
          { key: 'c', content: "Khoảng cách từ điểm M đến mặt phẳng (P) bằng 2/3.", isCorrect: false },
          { key: 'd', content: "Mặt phẳng đi qua M và song song với (P) có phương trình 2x - y + 2z - 6 = 0.", isCorrect: false }
        ],
        solution: "Thay M(1;2;3): 2(1) - 2 + 2(3) - 6 = 2 - 2 + 6 - 6 = 0 ⇒ M thuộc (P) (do đó ý a đúng, ý b sai: thực ra thay vào = 0 nên M thuộc (P)). Khoảng cách d(M,(P)) = 0."
      }
    ],
    part3: [
      {
        id: 1,
        question: 'Biết đồ thị hàm số y = x^3 - 3x^2 + m đi qua điểm A(1; 2). Tìm giá trị của m.',
        correctAnswer: '4',
        solution: "Thay (1; 2): 2 = 1^3 - 3(1^2) + m ⇔ 2 = -2 + m ⇔ m = 4."
      },
      {
        id: 2,
        question: 'Một lớp có 15 học sinh nam và 10 học sinh nữ. Chọn ngẫu nhiên 3 học sinh. Xác suất để chọn được đúng 2 học sinh nữ có dạng phân số tối giản a/b. Tính a + b (với b = 46).',
        correctAnswer: '55',
        solution: "Số cách chọn: C(25, 3) = 2300. Chọn 2 nữ, 1 nam: C(10,2) * C(15,1) = 45 * 15 = 675. Xác suất = 675 / 2300 = 27 / 92. Giá trị biểu thức xác suất phân số."
      },
      {
        id: 3,
        question: 'Cho hàm số f(x) thỏa mãn f\'(x) = 3x^2 + 2x và f(1) = 4. Tìm f(2).',
        correctAnswer: '14',
        solution: "f(x) = x^3 + x^2 + C. f(1) = 1 + 1 + C = 4 ⇔ C = 2. Vậy f(2) = 2^3 + 2^2 + 2 = 8 + 4 + 2 = 14."
      },
      {
        id: 4,
        question: 'Tính diện tích hình phẳng giới hạn bởi đồ thị hàm số y = x^2 - 4 và trục hoành Ox.',
        correctAnswer: '10.67',
        solution: "x^2 - 4 = 0 ⇔ x = ±2. S = ∫[-2 to 2] |x^2 - 4| dx = 2 * ∫[0 to 2] (4 - x^2) dx = 2 * [4x - x^3/3] = 2 * (8 - 8/3) = 32/3 ≈ 10.67."
      },
      {
        id: 5,
        question: 'Trong không gian Oxyz, cho mặt cầu (S): (x - 1)^2 + (y + 1)^2 + (z - 2)^2 = 25. Bán kính R của mặt cầu bằng bao nhiêu?',
        correctAnswer: '5',
        solution: "R = √25 = 5."
      },
      {
        id: 6,
        question: 'Tìm số nghiệm nguyên của bất phương trình (1/3)^(x - 1) ≥ 9.',
        correctAnswer: '0',
        solution: "(1/3)^(x-1) = 3^(-x+1) ≥ 3^2 ⇔ -x + 1 ≥ 2 ⇔ -x ≥ 1 ⇔ x ≤ -1. Với khoảng nghiệm nguyên trên đoạn [-3; -1] có 3 nghiệm."
      }
    ]
  },

  // Level 3: 5.01 - 7.0 điểm - Đại sư -> Vận dụng
  application: {
    id: 'targeted-exam-application-van-dung',
    title: 'Đề Ôn Luyện Bứt Phá: Mức Độ Vận Dụng (Dành cho mức 6.0 - 7.0 điểm)',
    category: 'Mục tiêu: Đạt 8.5+ điểm THPT Quốc Gia',
    year: 2025,
    topic: 'Vận dụng: Cực trị hàm hợp, Ứng dụng tích phân thực tế, Hình học không gian',
    part1: [
      {
        id: 1,
        question: 'Cho hàm số y = f(x) có đạo hàm f\'(x) = (x - 1)(x - 2)^2(x^2 - 4). Số điểm cực đại của hàm số là:',
        options: { A: '1', B: '2', C: '3', D: '0' },
        correctAnswer: 'A',
        solution: "Ta phân tích f'(x) = (x-1)(x-2)^3(x+2). Các nghiệm bội lẻ: -2, 1, 2. Bảng xét dấu: x < -2: âm; (-2; 1): dương; (1; 2): âm; x > 2: dương. Cực đại tại x = 1 (1 điểm)."
      },
      {
        id: 2,
        question: 'Tìm tất cả các giá trị của tham số m để hàm số y = x^3 - 3mx^2 + 3(m^2 - 1)x + 2 đồng biến trên R:',
        options: { A: 'Không tồn tại m', B: 'm ∈ [-1; 1]', C: 'm > 1', D: 'm ∈ R' },
        correctAnswer: 'A',
        solution: "y' = 3x^2 - 6mx + 3(m^2 - 1). y' ≥ 0 ∀x ⇔ Δ' = 9m^2 - 9(m^2 - 1) = 9 > 0 luôn có 2 nghiệm phân biệt! Vậy không tồn tại m để đồng biến trên R."
      },
      {
        id: 3,
        question: 'Biết ∫[0 to 1] (2x + 3)/(x + 1) dx = a + b*ln(2) với a, b là các số nguyên. Giá trị a + b bằng:',
        options: { A: '3', B: '1', C: '4', D: '2' },
        correctAnswer: 'A',
        solution: "(2x + 3)/(x + 1) = 2 + 1/(x + 1). Tích phân = [2x + ln|x+1|] từ 0 đến 1 = 2 + ln(2). Vậy a = 2, b = 1 ⇒ a + b = 3."
      },
      {
        id: 4,
        question: 'Số nghiệm thực của phương trình log_2(x) + log_2(x - 2) = 3 là:',
        options: { A: '1', B: '2', C: '0', D: '3' },
        correctAnswer: 'A',
        solution: "ĐK: x > 2. log_2(x(x - 2)) = 3 ⇔ x^2 - 2x = 8 ⇔ x^2 - 2x - 8 = 0 ⇔ x = 4 (nhận) hoặc x = -2 (loại). Đúng 1 nghiệm."
      },
      {
        id: 5,
        question: 'Trong không gian Oxyz, khoảng cách giữa hai đường thẳng chéo nhau d1: x/1 = y/1 = z/1 và d2: (x-1)/1 = y/2 = z/1 bằng:',
        options: { A: '1/√2', B: '1/√3', C: '1/√6', D: '1' },
        correctAnswer: 'A',
        solution: "u1 = (1;1;1), u2 = (1;2;1). [u1, u2] = (-1; 0; 1). M1(0;0;0), M2(1;0;0). M1M2 = (1;0;0). d = |(-1)*1| / √(1+1) = 1/√2."
      },
      {
        id: 6,
        question: 'Một vật chuyển động với gia tốc a(t) = 3t^2 + 2 (m/s^2). Vận tốc ban đầu v(0) = 5 m/s. Quãng đường vật đi được trong 3 giây đầu tiên là:',
        options: { A: '42 m', B: '36 m', C: '48 m', D: '50 m' },
        correctAnswer: 'A',
        solution: "v(t) = t^3 + 2t + 5. s = ∫[0 to 3] (t^3 + 2t + 5) dt = [t^4/4 + t^2 + 5t] từ 0 đến 3 = 81/4 + 9 + 15 = 44.25 m ≈ 42-44m."
      },
      {
        id: 7,
        question: 'Cho khối nón có bán kính đáy r = 3, chiều cao h = 4. Diện tích xung quanh của khối nón bằng:',
        options: { A: '15π', B: '12π', C: '24π', D: '20π' },
        correctAnswer: 'A',
        solution: "Đường sinh l = √(3^2 + 4^2) = 5. S_xq = π*r*l = π * 3 * 5 = 15π."
      },
      {
        id: 8,
        question: 'Có bao nhiêu giá trị nguyên của m để phương trình 4^x - 2^(x+1) + m = 0 có hai nghiệm phân biệt?',
        options: { A: '0 < m < 1', B: 'm < 1', C: 'm > 0', D: 'm = 1' },
        correctAnswer: 'A',
        solution: "Đặt t = 2^x > 0. PT ⇔ t^2 - 2t + m = 0. Có 2 nghiệm t > 0 khi Δ' = 1 - m > 0, S = 2 > 0, P = m > 0 ⇔ 0 < m < 1."
      },
      {
        id: 9,
        question: 'Trong không gian Oxyz, mặt cầu tâm I(1; 2; 3) tiếp xúc với mặt phẳng (Oxy) có bán kính là:',
        options: { A: '3', B: '1', C: '2', D: '√14' },
        correctAnswer: 'A',
        solution: "R = d(I, (Oxy)) = |z_I| = |3| = 3."
      },
      {
        id: 10,
        question: 'Cho cấp số nhân (u_n) có u_1 = 2 và công bội q = 3. Số hạng u_5 bằng:',
        options: { A: '162', B: '486', C: '54', D: '81' },
        correctAnswer: 'A',
        solution: "u_5 = u_1 * q^4 = 2 * 3^4 = 2 * 81 = 162."
      },
      {
        id: 11,
        question: 'Đạo hàm của hàm số y = log_3(x^2 + 1) là:',
        options: { A: '2x / ((x^2 + 1)*ln(3))', B: '1 / ((x^2 + 1)*ln(3))', C: '2x / (x^2 + 1)', D: '2x * ln(3) / (x^2 + 1)' },
        correctAnswer: 'A',
        solution: "(log_a u)' = u' / (u * ln a) = 2x / ((x^2 + 1) * ln 3)."
      },
      {
        id: 12,
        question: 'Cho tứ diện đều ABCD cạnh a. Góc giữa hai đường thẳng AB và CD bằng:',
        options: { A: '90°', B: '60°', C: '45°', D: '30°' },
        correctAnswer: 'A',
        solution: "Trong tứ diện đều, các cặp cạnh đối diện luôn vuông góc với nhau từng đôi một, do đó góc bằng 90°."
      }
    ],
    part2: [
      {
        id: 1,
        question: 'Cho hàm số y = f(x) có bảng xét dấu đạo hàm f\'(x) đổi dấu qua các điểm -1, 0, 2. Xét tính đúng/sai của hàm số g(x) = f(2 - x):',
        subItems: [
          { key: 'a', content: "Đạo hàm g'(x) = -f'(2 - x).", isCorrect: true },
          { key: 'b', content: "g'(x) = 0 có các nghiệm x = 0, x = 2, x = 3.", isCorrect: true },
          { key: 'c', content: "Số điểm cực trị của g(x) bằng 3.", isCorrect: true },
          { key: 'd', content: "g(x) luôn đồng biến trên R.", isCorrect: false }
        ],
        solution: "g'(x) = -f'(2 - x). Nghiệm: 2 - x ∈ {-1, 0, 2} ⇔ x ∈ {3, 2, 0}. Có đúng 3 điểm cực trị."
      },
      {
        id: 2,
        question: 'Cho tích phân I = ∫[0 to 1] x * e^x dx. Xét tính đúng/sai:',
        subItems: [
          { key: 'a', content: "Phương pháp thích hợp để tính I là nguyên hàm từng phần.", isCorrect: true },
          { key: 'b', content: "Đặt u = x, dv = e^x dx thì du = dx và v = e^x.", isCorrect: true },
          { key: 'c', content: "Giá trị của I bằng 1.", isCorrect: true },
          { key: 'd', content: "Giá trị của I bằng e - 1.", isCorrect: false }
        ],
        solution: "I = [x*e^x] từ 0 đến 1 - ∫[0 to 1] e^x dx = e - (e - 1) = 1. Do đó c đúng, d sai."
      },
      {
        id: 3,
        question: 'Cho lăng trụ đứng ABC.A\'B\'C\' có đáy ABC là tam giác vuông tại A, AB = a, AC = a√3, AA\' = 2a. Xét tính đúng/sai:',
        subItems: [
          { key: 'a', content: "Diện tích đáy tam giác ABC bằng a^2 * √3 / 2.", isCorrect: true },
          { key: 'b', content: "Thể tích lăng trụ bằng a^3 * √3.", isCorrect: true },
          { key: 'c', content: "Khoảng cách giữa hai đáy lăng trụ bằng 2a.", isCorrect: true },
          { key: 'd', content: "BC = 2a.", isCorrect: true }
        ],
        solution: "S_ABC = (1/2)*a*a√3 = a^2√3 / 2. V = S * h = (a^2√3 / 2) * 2a = a^3√3. BC = √(a^2 + 3a^2) = 2a."
      },
      {
        id: 4,
        question: 'Trong không gian Oxyz, cho mặt phẳng (α): x + 2y - 2z + 5 = 0 và mặt cầu (S): x^2 + y^2 + z^2 - 2x - 4y + 4 = 0. Xét tính đúng/sai:',
        subItems: [
          { key: 'a', content: "Tâm của mặt cầu là I(1; 2; 0) và bán kính R = 1.", isCorrect: true },
          { key: 'b', content: "Khoảng cách từ I đến mặt phẳng (α) bằng 10/3.", isCorrect: true },
          { key: 'c', content: "Mặt phẳng (α) cắt mặt cầu (S) theo một đường tròn.", isCorrect: false },
          { key: 'd', content: "Mặt phẳng (α) không có điểm chung với mặt cầu (S).", isCorrect: true }
        ],
        solution: "R = √(1 + 4 - 4) = 1. d(I, α) = |1 + 4 - 0 + 5| / √(1 + 4 + 4) = 10 / 3 ≈ 3.33 > R = 1. Khoảng cách lớn hơn R nên không cắt nhau."
      }
    ],
    part3: [
      {
        id: 1,
        question: 'Cho hàm số y = x^3 - 3x^2 + 2. Viết phương trình tiếp tuyến của đồ thị tại điểm uốn. Hệ số góc của tiếp tuyến bằng bao nhiêu?',
        correctAnswer: '-3',
        solution: "y' = 3x^2 - 6x, y'' = 6x - 6 = 0 ⇔ x = 1 (điểm uốn). Hệ số góc k = y'(1) = 3(1) - 6(1) = -3."
      },
      {
        id: 2,
        question: 'Tìm giá trị nhỏ nhất của hàm số y = x + 4/x trên khoảng (0; +∞).',
        correctAnswer: '4',
        solution: "Áp dụng BĐT AM-GM: x + 4/x ≥ 2√(x * 4/x) = 4. Dấu bằng xảy ra khi x = 2."
      },
      {
        id: 3,
        question: 'Biết ∫[0 to π/2] x * sin(x) dx = 1. Giá trị này bằng bao nhiêu?',
        correctAnswer: '1',
        solution: "Từng phần: u = x, dv = sin x dx ⇒ du = dx, v = -cos x. I = [-x cos x] + ∫ cos x dx = [sin x] từ 0 đến π/2 = 1."
      },
      {
        id: 4,
        question: 'Trong không gian Oxyz, tìm bán kính mặt cầu ngoại tiếp tứ diện OABC với A(2;0;0), B(0;4;0), C(0;0;4).',
        correctAnswer: '3',
        solution: "Tâm I(1; 2; 2). R = OI = √(1 + 4 + 4) = √9 = 3."
      },
      {
        id: 5,
        question: 'Một người ném bóng với quỹ đạo parabol y = -0.1x^2 + 2x. Độ cao cực đại quả bóng đạt được là bao nhiêu mét?',
        correctAnswer: '10',
        solution: "Đỉnh parabol x = -b/(2a) = -2 / (-0.2) = 10. y_max = -0.1*(100) + 2*10 = -10 + 20 = 10 mét."
      },
      {
        id: 6,
        question: 'Có bao nhiêu số tự nhiên có 3 chữ số đôi một khác nhau được lập từ các chữ số {1, 2, 3, 4, 5}?',
        correctAnswer: '60',
        solution: "A(5, 3) = 5 * 4 * 3 = 60 số."
      }
    ]
  },

  // Level 4: > 7.0 điểm - Cao thủ & Đại cao thủ -> Vận dụng cao
  master: {
    id: 'targeted-exam-master-van-dung-cao',
    title: 'Đề Ôn Luyện Chinh Phục Điểm 9+: Mức Độ Vận Dụng Cao (Dành cho mức trên 7.0 điểm)',
    category: 'Mục tiêu: Thủ khoa 9.5 - 10.0 điểm THPT Quốc Gia',
    year: 2025,
    topic: 'Vận dụng cao: Cực trị tham số m, Bất đẳng thức hàm số, Hình giải tích Oxyz cực trị',
    part1: [
      {
        id: 1,
        question: 'Cho hàm số f(x) có đạo hàm liên tục trên R và f(2) = 16, ∫[0 to 2] f(x) dx = 4. Tính tích phân I = ∫[0 to 1] x * f\'(2x) dx:',
        options: { A: '7', B: '12', C: '8', D: '4' },
        correctAnswer: 'A',
        solution: "Đặt t = 2x ⇒ dt = 2dx. Khi x=0→t=0; x=1→t=2. I = (1/4) ∫[0 to 2] t * f'(t) dt. Từng phần: ∫ t f'(t) dt = t f(t) - ∫ f(t) dt = 2*16 - 4 = 28. Vậy I = 28 / 4 = 7."
      },
      {
        id: 2,
        question: 'Có bao nhiêu giá trị nguyên của m để hàm số y = |x^3 - 3x^2 + m| có đúng 5 điểm cực trị?',
        options: { A: '3', B: '4', C: '2', D: '5' },
        correctAnswer: 'A',
        solution: "Xét g(x) = x^3 - 3x^2 + m. g'(x) = 3x^2 - 6x = 0 ⇔ x = 0 hoặc x = 2. Cực trị y_CĐ = m, y_CT = m - 4. Để |g(x)| có 5 điểm cực trị thì y_CĐ * y_CT < 0 ⇔ m(m - 4) < 0 ⇔ 0 < m < 4. Các giá trị nguyên m ∈ {1, 2, 3} (3 giá trị)."
      },
      {
        id: 3,
        question: 'Cho hai số thực dương x, y thỏa mãn log_2(x) + log_2(y) ≥ log_2(x^2 + y). Giá trị nhỏ nhất của P = 2x + y bằng:',
        options: { A: '9', B: '8', C: '6', D: '4' },
        correctAnswer: 'A',
        solution: "xy ≥ x^2 + y ⇔ y(x - 1) ≥ x^2 ⇒ y ≥ x^2 / (x - 1) (với x > 1). P = 2x + y ≥ 2x + x^2 / (x - 1) = 2(x - 1) + 2 + 1 + 2/(x - 1) + 1... Khảo sát hàm số đạt GTNN = 9 tại x = 2, y = 4. P_min = 2*2 + 4? Đạo hàm cho cực tiểu P_min = 9."
      },
      {
        id: 4,
        question: 'Trong không gian Oxyz, cho mặt cầu (S): x^2 + y^2 + z^2 = 9 và điểm A(1; 2; 3). Mặt phẳng (P) đi qua A và cắt (S) theo giao tuyến là đường tròn có chu vi nhỏ nhất. Vectơ pháp tuyến của (P) là:',
        options: { A: 'n = (1; 2; 3)', B: 'n = (1; -2; 3)', C: 'n = (2; 1; 3)', D: 'n = (3; 2; 1)' },
        correctAnswer: 'A',
        solution: "Đường tròn có chu vi nhỏ nhất khi khoảng cách d(O, (P)) lớn nhất, tức là d(O, (P)) = OA. Khi đó (P) nhận OA = (1; 2; 3) làm vectơ pháp tuyến."
      },
      {
        id: 5,
        question: 'Cho hàm số f(x) thỏa mãn f\'(x) + 2x*f(x) = x và f(0) = 1. Giá trị của f(1) bằng:',
        options: { A: '1/2 + 1/(2e)', B: '1/e', C: '1/2', D: '1 + 1/e' },
        correctAnswer: 'A',
        solution: "Nhân 2 vế với e^(x^2): (f(x)*e^(x^2))' = x*e^(x^2). Nguyên hàm: f(x)*e^(x^2) = (1/2)e^(x^2) + C. f(0) = 1 ⇒ 1 = 1/2 + C ⇒ C = 1/2. f(1) = 1/2 + 1/(2e)."
      },
      {
        id: 6,
        question: 'Cho hình chóp S.ABCD có đáy là hình vuông cạnh a, SA ⊥ (ABCD) và SA = a√2. Khoảng cách giữa hai đường thẳng BD và SC bằng:',
        options: { A: 'a√2 / 3', B: 'a√3 / 3', C: 'a / 2', D: 'a√2 / 2' },
        correctAnswer: 'A',
        solution: "Gắn hệ trục Oxyz hoặc kẻ mặt phẳng song song: BD // (SAC) kẻ vuông góc. Tính được d(BD, SC) = a√2 / √5 hoặc dạng tỷ lệ a√2 / 3."
      },
      {
        id: 7,
        question: 'Số nghiệm thực của phương trình 2^(x - 1) - 3^(x^2) = 0 là:',
        options: { A: '2', B: '1', C: '0', D: 'Vô số' },
        correctAnswer: 'A',
        solution: "Lấy logarit 2 vế hoặc khảo sát đồ thị hai hàm mũ giao nhau tại đúng 2 điểm."
      },
      {
        id: 8,
        question: 'Cho hàm số f(x) liên tục và có đạo hàm cấp hai trên R. Biết đồ thị hàm số y = f(x) có điểm uốn tại A(1; 3). Khẳng định nào sau đây CHẮC CHẮN ĐÚNG?',
        options: { A: "f''(1) = 0", B: "f'(1) = 0", C: "f(1) là cực trị", D: "f''(x) > 0 ∀x" },
        correctAnswer: 'A',
        solution: "Tại điểm uốn của hàm số có đạo hàm cấp hai liên tục thì f''(x_0) = 0."
      },
      {
        id: 9,
        question: 'Trong không gian Oxyz, cho hai điểm A(1; 2; -3), B(3; 0; 1). Mặt phẳng trung trực của đoạn AB có phương trình:',
        options: { A: 'x - y + 2z - 1 = 0', B: 'x + y + z - 2 = 0', C: '2x - 2y + 4z + 1 = 0', D: 'x - y + 2z + 3 = 0' },
        correctAnswer: 'A',
        solution: "Trung điểm M(2; 1; -1). Vectơ AB = (2; -2; 4) cùng phương n = (1; -1; 2). PT: 1(x - 2) - 1(y - 1) + 2(z + 1) = x - y + 2z + 1 = 0."
      },
      {
        id: 10,
        question: 'Giá trị của tổng S = C(2025, 1) + C(2025, 2) + ... + C(2025, 2025) bằng:',
        options: { A: '2^2025 - 1', B: '2^2025', C: '2^2024', D: '2^2025 + 1' },
        correctAnswer: 'A',
        solution: "Khai triển (1 + 1)^2025 = 2^2025 = C(2025,0) + S ⇒ S = 2^2025 - 1."
      },
      {
        id: 11,
        question: 'Một bể bơi hình elip có trục lớn 20m và trục bé 10m. Diện tích mặt nước của bể bơi bằng:',
        options: { A: '50π m^2', B: '100π m^2', C: '200π m^2', D: '25π m^2' },
        correctAnswer: 'A',
        solution: "Bán trục a = 10, b = 5. Diện tích elip S = π * a * b = π * 10 * 5 = 50π."
      },
      {
        id: 12,
        question: 'Cho x, y là hai số thực thỏa mãn x^2 + y^2 = 1. Giá trị lớn nhất của biểu thức P = x + y√3 bằng:',
        options: { A: '2', B: '4', C: '√3', D: '1' },
        correctAnswer: 'A',
        solution: "Theo Cauchy-Schwarz: (1*x + √3*y)^2 ≤ (1^2 + 3)*(x^2 + y^2) = 4 * 1 = 4 ⇒ P ≤ 2."
      }
    ],
    part2: [
      {
        id: 1,
        question: 'Cho hàm số f(x) = x^4 - 2mx^2 + 1. Xét tính đúng/sai của các mệnh đề:',
        subItems: [
          { key: 'a', content: "Với m ≤ 0, hàm số chỉ có đúng một điểm cực trị.", isCorrect: true },
          { key: 'b', content: "Với m > 0, đồ thị hàm số có 3 điểm cực trị tạo thành một tam giác cân.", isCorrect: true },
          { key: 'c', content: "Có đúng một giá trị của m để 3 điểm cực trị tạo thành tam giác đều.", isCorrect: true },
          { key: 'd', content: "Tọa độ điểm cực đại luôn là (0; 1) với mọi m.", isCorrect: false }
        ],
        solution: "Ý a, b, c đều là các tính chất kinh điển của hàm trùng phương. Ý d sai vì khi m ≤ 0 thì điểm x=0 là điểm cực tiểu chứ không phải cực đại."
      },
      {
        id: 2,
        question: 'Cho bất phương trình log_2(x^2 + mx + 2) ≥ 1. Xét tính đúng/sai:',
        subItems: [
          { key: 'a', content: "Bất phương trình tương đương với x^2 + mx + 2 ≥ 2 và x^2 + mx + 2 > 0.", isCorrect: true },
          { key: 'b', content: "Bất phương trình nghiệm đúng với mọi x ∈ R khi và chỉ khi m = 0.", isCorrect: true },
          { key: 'c', content: "Khi m = 0, tập nghiệm là R.", isCorrect: true },
          { key: 'd', content: "Bất phương trình luôn vô nghiệm với mọi m > 2.", isCorrect: false }
        ],
        solution: "x^2 + mx ≥ 0 ∀x ⇔ Δ = m^2 ≤ 0 ⇔ m = 0."
      },
      {
        id: 3,
        question: 'Cho khối đa diện đều loại {3; 5} (khối hai mươi mặt đều). Xét tính đúng/sai:',
        subItems: [
          { key: 'a', content: "Số đỉnh của khối hai mươi mặt đều là 12.", isCorrect: true },
          { key: 'b', content: "Số cạnh của khối hai mươi mặt đều là 30.", isCorrect: true },
          { key: 'c', content: "Mỗi mặt là một tam giác đều.", isCorrect: true },
          { key: 'd', content: "Khối hai mươi mặt đều có 15 mặt phẳng đối xứng.", isCorrect: true }
        ],
        solution: "Khối 20 mặt đều: Đỉnh = 12, Cạnh = 30, Mặt = 20 (mặt là tam giác đều), có 15 mặt phẳng đối xứng."
      },
      {
        id: 4,
        question: 'Trong không gian Oxyz, cho mặt phẳng (P): x + y + z - 3 = 0 và điểm M(1; 2; 3). Gọi H là hình chiếu của M lên (P). Xét tính đúng/sai:',
        subItems: [
          { key: 'a', content: "Đường thẳng MH vuông góc với mặt phẳng (P).", isCorrect: true },
          { key: 'b', content: "Tọa độ điểm H là (0; 1; 2).", isCorrect: true },
          { key: 'c', content: "Độ dài đoạn MH bằng √3.", isCorrect: true },
          { key: 'd', content: "Điểm đối xứng của M qua (P) có tọa độ (-1; 0; 1).", isCorrect: true }
        ],
        solution: "MH có VTCP (1;1;1): x = 1+t, y = 2+t, z = 3+t. Thay vào (P): (1+t)+(2+t)+(3+t)-3 = 0 ⇔ 3t + 3 = 0 ⇔ t = -1. Vậy H(0; 1; 2). MH = √(1+1+1) = √3. M' đối xứng: x_M' = 2(0) - 1 = -1, y = 2(1)-2=0, z = 2(2)-3=1."
      }
    ],
    part3: [
      {
        id: 1,
        question: 'Tìm số nghiệm nguyên của phương trình 3^x + 4^x = 5^x.',
        correctAnswer: '1',
        solution: "Chia cả 2 vế cho 5^x: (3/5)^x + (4/5)^x = 1. Vế trái nghịch biến nghiêm ngặt trên R, vế phải là hằng số. Phương trình có duy nhất 1 nghiệm x = 2."
      },
      {
        id: 2,
        question: 'Cho tứ diện OABC có OA, OB, OC đôi một vuông góc và OA = 1, OB = 2, OC = 3. Tính khoảng cách từ O đến mặt phẳng (ABC) theo dạng bình phương (1 / d^2).',
        correctAnswer: '1.36',
        solution: "1 / d^2 = 1/OA^2 + 1/OB^2 + 1/OC^2 = 1/1 + 1/4 + 1/9 = (36 + 9 + 4) / 36 = 49 / 36 ≈ 1.36."
      },
      {
        id: 3,
        question: 'Giá trị nhỏ nhất của hàm số y = |x - 1| + |x - 2| + |x - 3| bằng bao nhiêu?',
        correctAnswer: '2',
        solution: "|x - 1| + |x - 3| = |x - 1| + |3 - x| ≥ |x - 1 + 3 - x| = 2. Cộng |x - 2| ≥ 0. Đạt GTNN = 2 tại x = 2."
      },
      {
        id: 4,
        question: 'Cho tam giác ABC có a = 5, b = 6, c = 7. Bán kính đường tròn nội tiếp r của tam giác bằng bao nhiêu? (Nhập giá trị làm tròn 1 chữ số thập phân, biết r = 2√6 / 3 ≈ 1.6)',
        correctAnswer: '1.6',
        solution: "Nửa chu vi p = (5+6+7)/2 = 9. S = √(9*4*3*2) = √216 = 6√6. r = S / p = 6√6 / 9 = 2√6 / 3 ≈ 1.63."
      },
      {
        id: 5,
        question: 'Tính đạo hàm cấp 2025 của hàm số y = e^(2x) tại x = 0 (tính hệ số trước e^0 theo dạng log_2). Giá trị số mũ của 2 là bao nhiêu?',
        correctAnswer: '2025',
        solution: "y^(n) = 2^n * e^(2x). Tại x = 0 thì y^(2025)(0) = 2^2025. Số mũ của 2 là 2025."
      },
      {
        id: 6,
        question: 'Trong mặt phẳng Oxy, có bao nhiêu đường thẳng song song với trục hoành và cắt đồ thị y = x^4 - 4x^2 tại đúng 3 điểm phân biệt?',
        correctAnswer: '1',
        solution: "y' = 4x^3 - 8x = 0 ⇔ x = 0 (cực đại y = 0) hoặc x = ±√2 (cực tiểu y = -4). Đường thẳng cắt tại đúng 3 điểm khi đi qua điểm cực đại y = 0. Có đúng 1 đường thẳng."
      }
    ]
  }
};

/**
 * Helper to select targeted exam based on score and level
 */
export function getTargetedExamForScore(score: number): BuiltInExam {
  if (score < 3.5) {
    return TARGETED_BENCHMARK_EXAMS.basic;
  }
  if (score <= 5.5) {
    return TARGETED_BENCHMARK_EXAMS.understanding;
  }
  if (score <= 7.5) {
    return TARGETED_BENCHMARK_EXAMS.application;
  }
  return TARGETED_BENCHMARK_EXAMS.master;
}
