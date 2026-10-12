import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * API: Grade test submission and analyze mistakes with Gemini
 */
app.post('/api/grade', async (req, res) => {
  try {
    const { testTitle, answers, timeSpent, standardQuestions } = req.body;

    const prompt = `
Bạn là chuyên gia khảo thí và chấm thi môn Toán THPT Quốc Gia hàng đầu Việt Nam.
Hãy chấm điểm bài thi của học sinh theo cấu trúc định dạng đề thi tốt nghiệp THPT 2025 môn Toán.

Thông tin bài thi:
- Tên đề thi: "${testTitle || 'Đề kiểm tra Toán học THPT'}"
- Thời gian học sinh làm bài: ${timeSpent || 'Chưa xác định'}
- Bài làm của học sinh:
${JSON.stringify(answers, null, 2)}

${standardQuestions ? `Thông tin câu hỏi và đáp án tham chiếu:\n${JSON.stringify(standardQuestions, null, 2)}` : 'Đề bài gồm: Phần I (12 câu trắc nghiệm khách quan A/B/C/D), Phần II (4 câu đúng/sai, mỗi câu có 4 ý a,b,c,d), Phần III (6 câu trả lời ngắn).'}

Quy chế tính điểm chuẩn:
- Phần I (12 câu): Mỗi câu trả lời đúng được 0.25 điểm. Tối đa 3.0 điểm.
- Phần II (4 câu):
  + Chọn đúng 1 ý: 0.1 điểm
  + Chọn đúng 2 ý: 0.25 điểm
  + Chọn đúng 3 ý: 0.50 điểm
  + Chọn đúng cả 4 ý: 1.00 điểm
  Tối đa 4.0 điểm.
- Phần III (6 câu): Mỗi câu trả lời đúng được 0.5 điểm. Tối đa 3.0 điểm.
Tổng điểm tối đa: 10.0 điểm.

Thang đánh giá cấp độ:
- Dưới 3.5 điểm: "Tân thủ"
- Từ 3.5 đến 5.0 điểm: "Nhập môn"
- Từ 5.01 đến 7.0 điểm: "Đại sư"
- Từ 7.01 đến 8.0 điểm: "Cao thủ"
- Trên 8.0 điểm: "Đại cao thủ"

Hãy trả về kết quả dưới định dạng JSON hợp lệ (không kèm markdown ngoài JSON):
{
  "totalScore": 6.75,
  "level": "Đại sư",
  "summary": "Nhận xét tổng quan về bài làm của học sinh, điểm mạnh và điểm yếu",
  "commonMistakes": [
    "Mô tả chi tiết sai lầm 1 (ví dụ: Quên xét dấu hệ số a khi tìm tiệm cận)",
    "Mô tả chi tiết sai lầm 2 (ví dụ: Nhầm công thức nguyên hàm hàm số lượng giác)"
  ],
  "part1Results": [
    {
      "questionNumber": 1,
      "studentAnswer": "A",
      "correctAnswer": "A",
      "isCorrect": true,
      "solution": "Lời giải chi tiết câu 1..."
    }
  ],
  "part2Results": [
    {
      "questionNumber": 1,
      "items": [
        { "sub": "a", "studentAnswer": true, "correctAnswer": true, "isCorrect": true },
        { "sub": "b", "studentAnswer": false, "correctAnswer": false, "isCorrect": true },
        { "sub": "c", "studentAnswer": true, "correctAnswer": false, "isCorrect": false },
        { "sub": "d", "studentAnswer": false, "correctAnswer": true, "isCorrect": false }
      ],
      "correctCount": 2,
      "score": 0.25,
      "solution": "Lời giải chi tiết từng ý câu 1 phần II..."
    }
  ],
  "part3Results": [
    {
      "questionNumber": 1,
      "studentAnswer": "4",
      "correctAnswer": "4",
      "isCorrect": true,
      "solution": "Lời giải chi tiết câu 1 phần III..."
    }
  ],
  "suggestedTopic": "Chủ đề cần ôn tập ngay (ví dụ: Tính đơn điệu và cực trị của hàm số)"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const resultText = response.text || '{}';
    const parsed = JSON.parse(resultText);
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error grading with Gemini:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Không thể chấm điểm bài làm với Gemini',
    });
  }
});

/**
 * API: Generate custom practice exam targeted to student's exact score level
 */
app.post('/api/generate-practice', async (req, res) => {
  try {
    const { studentNickname, score, level, difficulty, topic, commonMistakes } = req.body;

    const cognitiveLevelGuidance =
      difficulty === 'basic' || (score !== undefined && score < 3.5)
        ? 'MỨC ĐỘ YÊU CẦU: NHẬN BIẾT & CỦNG CỐ CƠ BẢN (Dành cho học sinh dưới 3.5 điểm). Tập trung vào định nghĩa, công thức trực tiếp, nhận dạng đồ thị và bảng biến thiên. Không dùng bài toán suy luận phức tạp hay biến đổi nhiều bước.'
        : difficulty === 'understanding' || (score !== undefined && score <= 5.5)
        ? 'MỨC ĐỘ YÊU CẦU: THÔNG HIỂU (Dành cho học sinh mức 3.5 - 5.5 điểm). Ví dụ học sinh đạt 5.0 điểm thì các câu hỏi phải tập trung ở mức độ THÔNG HIỂU: giải phương trình/bất phương trình cơ bản, tính diện tích hình phẳng, tích phân cơ bản, cực trị hàm số tường minh, tìm tọa độ hình học Oxyz quen thuộc. Giúp học sinh khắc phục lỗi sai tính toán và nắm chắc phương pháp.'
        : difficulty === 'application' || (score !== undefined && score <= 7.5)
        ? 'MỨC ĐỘ YÊU CẦU: VẬN DỤNG (Dành cho học sinh mức 5.5 - 7.5 điểm). Đề bài có yếu tố suy luận trung bình, cực trị hàm hợp f(u), toán thực tế tối ưu, góc và khoảng cách trong không gian.'
        : 'MỨC ĐỘ YÊU CẦU: VẬN DỤNG CAO (Dành cho học sinh trên 7.5 điểm hướng tới điểm 9+). Bài toán biện luận tham số m, hàm trị tuyệt đối, cực trị Oxyz phức tạp, tích phân hàm ẩn.';

    const prompt = `
Bạn là chuyên gia khảo thí môn Toán THPT Quốc Gia hàng đầu Việt Nam.
Học sinh có nickname: "${studentNickname || 'Học sinh'}", vừa hoàn thành bài kiểm tra đạt ${score ?? 5.0} điểm (Cấp độ: "${level || 'Nhập môn'}").
Chủ đề cần kiểm tra / ôn luyện: "${topic || 'Khảo sát hàm số & Tính đơn điệu, cực trị'}".
Những sai lầm học sinh đã mắc phải ở bài thi vừa rồi: ${Array.isArray(commonMistakes) ? commonMistakes.join('; ') : (commonMistakes || 'Chưa rõ')}.

${cognitiveLevelGuidance}

YÊU CẦU ĐẶC BIỆT:
Hãy thiết kế một đề kiểm tra / ôn luyện MỚI TINH, được may đo RIÊNG theo đúng mức độ năng lực hiện tại (${score ?? 5.0} điểm) của học sinh để giúp học sinh khắc phục các sai lầm vừa mắc phải và bứt phá nâng cao cấp độ!
Đề thi theo chuẩn cấu trúc mới nhất 2025 gồm:
1. Phần I: 12 câu trắc nghiệm nhiều phương án (mỗi câu có 4 đáp án A, B, C, D)
2. Phần II: 4 câu trắc nghiệm Đúng/Sai (mỗi câu gồm 4 ý a, b, c, d)
3. Phần III: 6 câu trắc nghiệm trả lời ngắn (kết quả là số hoặc giá trị ngắn gọn)

Mỗi câu hỏi cần có nội dung khoa học, chính xác, kèm phương án/ý đúng sai, đáp án đúng và lời giải chi tiết để học sinh đối chiếu sau khi làm xong.

Trả về kết quả định dạng JSON chuẩn (không kèm markdown ngoài JSON):
{
  "title": "Đề Khảo Sát Tự Động AI: ${topic || 'Khảo sát hàm số'} (Mức ${score ?? 5.0}đ)",
  "targetLevel": "${level || 'Nhập môn'}",
  "targetScore": ${score ?? 5.0},
  "part1": [
    {
      "id": 1,
      "question": "Nội dung câu hỏi...",
      "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "correctAnswer": "A",
      "solution": "Lời giải chi tiết...",
      "tip": "Mẹo tránh sai lầm..."
    }
  ],
  "part2": [
    {
      "id": 1,
      "question": "Nội dung câu hỏi Phần II... Xét tính đúng sai:",
      "subItems": [
        { "key": "a", "content": "Khẳng định a...", "isCorrect": true },
        { "key": "b", "content": "Khẳng định b...", "isCorrect": false },
        { "key": "c", "content": "Khẳng định c...", "isCorrect": true },
        { "key": "d", "content": "Khẳng định d...", "isCorrect": false }
      ],
      "solution": "Lời giải chi tiết...",
      "tip": "Lưu ý..."
    }
  ],
  "part3": [
    {
      "id": 1,
      "question": "Nội dung câu hỏi yêu cầu điền số...",
      "correctAnswer": "5",
      "solution": "Lời giải...",
      "tip": "Lưu ý..."
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const resultText = response.text || '{}';
    const parsed = JSON.parse(resultText);
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error generating practice exam with Gemini:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Không thể tạo đề ôn luyện với Gemini',
    });
  }
});

/**
 * API: Predict Target Score and generate AI Advice based on scoreHistory
 */
app.post('/api/predict-target-score', async (req, res) => {
  try {
    const { scoreHistory, studentNickname, currentLevel, commonMistakes } = req.body;

    const historySummary = Array.isArray(scoreHistory) && scoreHistory.length > 0
      ? scoreHistory.map((h: any, idx: number) => `Lần ${h.attempt || idx + 1}: ${h.score} điểm (${h.level || 'Chưa rõ'}), Đề: "${h.examTitle || 'Thi thử'}", Ngày: ${h.date || 'Gần đây'}`).join('\n')
      : 'Chưa có nhiều bài thi (bắt đầu từ bài đầu tiên)';

    const prompt = `
Bạn là Cố Vấn Học Tập & Chuyên Gia Khảo Thí Môn Toán THPT Quốc Gia hàng đầu.
Nhiệm vụ của bạn: Dựa vào toàn bộ dữ liệu lịch sử điểm số (scoreHistory) của học sinh, hãy phân tích đà tiến bộ (momentum/trend) và:
1. Dự đoán ĐIỂM SỐ MỤC TIÊU (Target Score) cho lần thi tiếp theo (thang điểm 10.0, làm tròn 1 chữ số thập phân).
2. Đưa ra LỜI KHUYÊN CHI TIẾT CỦA AI về các phần kiến thức Toán 12 trọng tâm cần tập trung nhất để đạt được mục tiêu đó.

Dữ liệu học sinh:
- Biệt danh: "${studentNickname || 'Học sinh'}"
- Cấp bậc hiện tại: "${currentLevel || 'Chưa xác định'}"
- Lịch sử làm bài (scoreHistory):
${historySummary}
- Các lỗi thường gặp gần đây: ${Array.isArray(commonMistakes) && commonMistakes.length > 0 ? commonMistakes.join('; ') : 'Chưa ghi nhận lỗi cụ thể'}

Quy tắc tính Target Score thực tế:
- Nếu điểm số đang tăng dần (đà tiến bộ dương): Target Score = Điểm gần nhất + khoảng 0.5 đến 1.2 điểm (tùy tốc độ tăng, tối đa 10.0).
- Nếu điểm dao động hoặc chững lại: Target Score = Điểm gần nhất + 0.5 điểm (mục tiêu củng cố và bứt phá ngưỡng).
- Nếu mới chỉ có 1 bài: Target Score = Điểm hiện tại + 0.8 đến 1.0 điểm.
- Xác định rõ khoảng điểm mục tiêu (ví dụ "6.5 - 7.0 điểm").
- Đánh giá đà tiến bộ (ví dụ: "Bứt phá vượt bậc", "Tiến bộ đều đặn", "Ổn định cần cú hích").

Phần kiến thức trọng tâm cần tập trung:
- Chỉ rõ 3 chủ đề Toán 12 cụ thể phù hợp mức điểm hiện tại và mục tiêu (ví dụ: "Cực trị hàm số chứa tham số m", "Ứng dụng tích phân tính diện tích", "Khoảng cách trong không gian Oxyz", "Xác suất cổ điển và có điều kiện").
- Với mỗi chủ đề, nêu rõ: Mức độ quan trọng, Lý do cần tập trung, và Kế hoạch hành động cụ thể (Action plan).
- Đưa ra lời khuyên chiến thuật làm bài 90 phút (Tactical advice) và 1 thông điệp truyền cảm hứng (Motivation).

YÊU CẦU TRẢ VỀ ĐỊNH DẠNG JSON DUY NHẤT theo mẫu sau:
{
  "targetScore": 7.0,
  "targetScoreRange": "6.8 - 7.2",
  "momentumStatus": "Đang bứt phá tích cực",
  "momentumScore": "+1.2 điểm qua các lần thi",
  "feasibilityPercent": 85,
  "progressAnalysis": "Phân tích cụ thể đà tiến bộ...",
  "keyFocusAreas": [
    {
      "topic": "Tên chủ đề Toán 12 cụ thể",
      "importance": "Cốt lõi (+0.8 điểm)",
      "why": "Lý do vì sao học sinh cần tập trung vào phần này...",
      "recommendedActions": [
        "Hành động cụ thể 1...",
        "Hành động cụ thể 2..."
      ]
    }
  ],
  "tacticalAdvice": "Chiến thuật phân bổ thời gian và mẹo làm bài...",
  "motivationMessage": "Lời nhắn động viên tinh thần..."
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const resultText = response.text || '{}';
    const parsed = JSON.parse(resultText);
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error predicting target score with Gemini:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Không thể dự đoán điểm số mục tiêu với Gemini',
    });
  }
});

// Setup Vite middleware in dev or static files in production
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
