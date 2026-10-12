import { ScoreHistoryPoint } from '../components/ScoreProgressChart';

export interface FocusArea {
  topic: string;
  importance: string;
  why: string;
  recommendedActions: string[];
}

export interface TargetScorePrediction {
  targetScore: number;
  targetScoreRange: string;
  momentumStatus: string;
  momentumScore: string;
  feasibilityPercent: number;
  progressAnalysis: string;
  keyFocusAreas: FocusArea[];
  tacticalAdvice: string;
  motivationMessage: string;
  isAiLive?: boolean;
}

/**
 * Robust mathematical & pedagogical predictor based on scoreHistory
 */
export function computeTargetScore(
  history: ScoreHistoryPoint[],
  commonMistakes: string[] = []
): TargetScorePrediction {
  const data = history.length > 0 ? history : [];
  const scores = data.map((d) => d.score);

  if (scores.length === 0) {
    return {
      targetScore: 6.0,
      targetScoreRange: '5.5 - 6.5',
      momentumStatus: 'Khởi đầu hành trình ôn luyện',
      momentumScore: '+1.0 điểm xuất phát',
      feasibilityPercent: 90,
      progressAnalysis: 'Bạn chưa hoàn thành bài thi nào. Hãy hoàn thành đề kiểm tra đầu tiên để thiết lập điểm số chuẩn và kích hoạt phân tích AI.',
      keyFocusAreas: [
        {
          topic: 'Khảo sát hàm số & Tính đơn điệu, cực trị',
          importance: 'Cốt lõi (+1.5 điểm)',
          why: 'Chiếm tỷ trọng lớn nhất trong đề thi tốt nghiệp THPT (Phần I và Phần II).',
          recommendedActions: [
            'Nắm chắc bảng xét dấu đạo hàm y\' và định lý dấu tam thức bậc hai.',
            'Luyện 12 câu trắc nghiệm nhận biết & thông hiểu hàm số.',
          ],
        },
        {
          topic: 'Nguyên hàm & Tích phân cơ bản',
          importance: 'Nền tảng (+1.0 điểm)',
          why: 'Công thức bảng nguyên hàm cơ bản là câu hỏi cho điểm tuyệt đối nếu thuộc lý thuyết.',
          recommendedActions: [
            'Ôn tập Flashcard công thức nguyên hàm hàm đa thức, lượng giác, mũ.',
            'Tránh nhầm lẫn dấu giữa nguyên hàm sin(x) và cos(x).',
          ],
        },
        {
          topic: 'Hình học tọa độ Oxyz cơ bản',
          importance: 'Dễ lấy điểm (+1.0 điểm)',
          why: 'Các câu viết phương trình mặt phẳng, tìm tọa độ vector chiếm 4-5 câu dễ.',
          recommendedActions: [
            'Học thuộc công thức vector pháp tuyến và phương trình tổng quát mặt phẳng.',
          ],
        },
      ],
      tacticalAdvice: 'Làm chắc chắn 12 câu Phần I trong 20 phút đầu tiên để cầm trọn 3.0 điểm nền tảng.',
      motivationMessage: 'Vạn dặm khởi đầu từ bước chân đầu tiên. Hãy làm bài thi thử để xem năng lực ban đầu của bạn!',
    };
  }

  const latestScore = scores[scores.length - 1];
  const firstScore = scores[0];
  const count = scores.length;

  let delta = 0;
  let momentumStatus = 'Ổn định phong độ';
  let momentumScore = '+0.5 điểm';

  if (count >= 2) {
    const prevScore = scores[count - 2];
    const recentDelta = latestScore - prevScore;
    const totalDelta = latestScore - firstScore;

    if (recentDelta >= 1.0) {
      momentumStatus = 'Bứt phá vượt bậc 🔥';
      momentumScore = `+${recentDelta.toFixed(1)}đ so với lần trước`;
    } else if (recentDelta > 0) {
      momentumStatus = 'Đà tiến bộ tích cực 📈';
      momentumScore = `+${recentDelta.toFixed(1)}đ so với lần trước`;
    } else if (recentDelta === 0) {
      momentumStatus = 'Phong độ giữ vững 🛡️';
      momentumScore = `Giữ nguyên ${latestScore.toFixed(1)}đ`;
    } else {
      momentumStatus = 'Cần cú hích bứt phá ⚡';
      momentumScore = `${recentDelta.toFixed(1)}đ (Cần phục hồi)`;
    }
    delta = recentDelta;
  } else {
    momentumStatus = 'Thiết lập đà tăng trưởng 🚀';
    momentumScore = '+0.8đ mục tiêu bài tới';
  }

  // Calculate Target Score
  let target: number;
  if (latestScore < 3.5) {
    // Beginner: target to reach threshold 4.5 - 5.0
    target = Math.min(5.0, Number((latestScore + 1.2).toFixed(1)));
  } else if (latestScore < 5.0) {
    // Basic: target to reach threshold 5.5 - 6.2
    target = Number((latestScore + Math.max(0.7, delta > 0 ? delta * 0.6 + 0.5 : 0.7)).toFixed(1));
    target = Math.min(6.5, target);
  } else if (latestScore < 7.0) {
    // Master: target to reach Cao thủ (7.0 - 7.5)
    target = Number((latestScore + Math.max(0.6, delta > 0 ? delta * 0.5 + 0.5 : 0.6)).toFixed(1));
    target = Math.min(7.8, target);
  } else if (latestScore < 8.5) {
    // Advanced: target to reach 8.5 - 9.0
    target = Number((latestScore + Math.max(0.4, delta > 0 ? delta * 0.4 + 0.4 : 0.5)).toFixed(1));
    target = Math.min(9.2, target);
  } else {
    // High achiever: target 9.5 - 10.0
    target = Math.min(10.0, Number((latestScore + 0.3).toFixed(1)));
  }

  target = Number(target.toFixed(1));
  const lowRange = Math.max(0, Number((target - 0.3).toFixed(1)));
  const highRange = Math.min(10.0, Number((target + 0.4).toFixed(1)));
  const targetScoreRange = `${lowRange} - ${highRange}`;

  const feasibilityPercent = Math.min(95, Math.max(72, Math.round(85 + (delta > 0 ? 5 : -4) - (target > 8.5 ? 6 : 0))));

  // Progress Analysis narrative
  let progressAnalysis = '';
  if (count === 1) {
    progressAnalysis = `Qua bài thi đầu tiên đạt ${latestScore.toFixed(2)} điểm, bạn đã xác lập nền tảng vững chắc. Mục tiêu lần thi tiếp theo là nâng mức điểm lên ${target} điểm (${targetScoreRange}đ) bằng cách làm chắc chắn các câu thông hiểu.`;
  } else {
    const totalGrowth = latestScore - firstScore;
    if (totalGrowth > 0) {
      progressAnalysis = `Đà tiến bộ rất xuất sắc! Từ mốc ban đầu ${firstScore.toFixed(1)}đ, bạn đã bứt phá lên ${latestScore.toFixed(1)}đ (tăng +${totalGrowth.toFixed(1)} điểm sau ${count} lần thi). Với tốc độ này, mục tiêu ${target} điểm trong bài thi tới là hoàn toàn khả thi!`;
    } else {
      progressAnalysis = `Điểm số hiện tại đang ở mức ${latestScore.toFixed(1)} điểm sau ${count} bài thi. Đã đến lúc tập trung khắc phục các lỗ hổng kiến thức để tạo bước nhảy vọt lên ${target} điểm (${targetScoreRange}đ).`;
    }
  }

  // Generate tailored focus areas based on score level & mistakes
  const keyFocusAreas: FocusArea[] = [];

  if (latestScore < 4.0) {
    keyFocusAreas.push(
      {
        topic: 'Nhận biết & Thông hiểu Đồ thị Hàm số',
        importance: 'Cốt lõi (+1.5 điểm)',
        why: 'Chiếm 5-6 câu trắc nghiệm trực diện. Chỉ cần đọc bảng biến thiên, nhận diện tiệm cận đứng x = x0 và tiệm cận ngang y = y0.',
        recommendedActions: [
          'Học thuộc quy tắc xác định dấu của hệ số a, c, d từ giao điểm với trục tung và các tiệm cận.',
          'Luyện tập trắc nghiệm Phần I: Nhận dạng đồ thị bậc ba và phân thức hữu tỉ.',
        ],
      },
      {
        topic: 'Bảng Nguyên hàm cơ bản & Tích phân định nghĩa',
        importance: 'Trọng tâm (+1.0 điểm)',
        why: 'Các câu hỏi chỉ yêu cầu áp dụng trực tiếp công thức ∫x^n dx, ∫e^x dx, ∫sin x dx.',
        recommendedActions: [
          'Dùng Flashcard công thức Toán 12 để ôn lại 15 công thức nguyên hàm cơ bản.',
          'Tuyệt đối không để mất điểm ở câu hỏi định nghĩa tích phân Newton-Leibniz.',
        ],
      },
      {
        topic: 'Tọa độ Điểm và Vectơ trong không gian Oxyz',
        importance: 'Dễ kiếm điểm (+1.0 điểm)',
        why: 'Tính độ dài đoạn thẳng, tìm tọa độ trung điểm, trọng tâm và tích vô hướng.',
        recommendedActions: [
          'Thực hành ghi nhớ công thức tính khoảng cách d(A,B) = √[(xB-xA)² + (yB-yA)² + (zB-zA)²].',
          'Làm trọn vẹn 10 bài tập cơ bản về tọa độ vector trong 15 phút.',
        ],
      }
    );
  } else if (latestScore < 6.0) {
    keyFocusAreas.push(
      {
        topic: 'Cực trị hàm số & Giá trị lớn nhất / nhỏ nhất trên đoạn',
        importance: 'Bứt phá lên 6.5đ (+1.0 điểm)',
        why: 'Thường xuất hiện ở cả Phần I và Phần II (Đúng/Sai). Học sinh hay sai ở việc quên so sánh giá trị tại hai đầu mút [a; b].',
        recommendedActions: [
          'Nắm vững quy trình: Đạo hàm y\' → Giải y\' = 0 trên (a; b) → Tính y(a), y(b), y(xi) → Kết luận max/min.',
          'Chú ý điều kiện hàm số liên tục trên đoạn.',
        ],
      },
      {
        topic: 'Phương trình Mặt phẳng và Mặt cầu Oxyz',
        importance: 'Trọng tâm (+1.0 điểm)',
        why: 'Viết phương trình mặt phẳng đi qua 1 điểm và vuông góc với đường thẳng, hoặc mặt cầu có tâm và bán kính R.',
        recommendedActions: [
          'Thành thạo tìm vectơ pháp tuyến n = [u1, u2] bằng máy tính Casio hoặc tích có hướng.',
          'Học công thức khoảng cách từ điểm M0 đến mặt phẳng (P): |Ax0 + By0 + Cz0 + D| / √(A² + B² + C²).',
        ],
      },
      {
        topic: 'Khắc phục lỗi Đúng / Sai Phần II (4 câu đa ý)',
        importance: 'Chiến thuật quyết định (+1.2 điểm)',
        why: 'Phần II có thang điểm lũy tiến cực mạnh: Đúng 3 ý được 0.5đ, đúng cả 4 ý được trọn 1.0đ.',
        recommendedActions: [
          'Đọc kỹ từng mệnh đề a, b, c, d độc lập để không bị tâm lý dây chuyền.',
          'Kiểm tra lại câu điều kiện và tập xác định trước khi tích Đúng/Sai.',
        ],
      }
    );
  } else if (latestScore < 7.5) {
    keyFocusAreas.push(
      {
        topic: 'Ứng dụng Tích phân tính Diện tích & Thể tích tròn xoay',
        importance: 'Bứt phá lên 7.8đ (+1.0 điểm)',
        why: 'Câu hỏi vận dụng thường gắn với bài toán thực tế (cắt hình parabol, bồn chứa nước, cánh hoa trang trí).',
        recommendedActions: [
          'Nắm vững công thức diện tích S = ∫|f(x) - g(x)| dx và thể tích V = π∫[f(x)]² dx.',
          'Luyện kỹ năng tìm hoành độ giao điểm x1, x2 khi đề bài chưa cho cận tích phân.',
        ],
      },
      {
        topic: 'Bài toán Cực trị chứa tham số m & Tương giao hàm ẩn',
        importance: 'Trọng tâm nâng cao (+0.8 điểm)',
        why: 'Phân loại học sinh ở mức 7.0 - 8.0 điểm. Thường cho dưới dạng đồ thị đạo hàm f\'(x) hoặc bảng biến thiên hàm hợp f(u(x)).',
        recommendedActions: [
          'Luyện phương pháp cô lập tham số m: f(x) = m hoặc g(x) ≥ m.',
          'Nắm chắc phương pháp ghép trục hoặc xét hàm đạo hàm g\'(x) = u\'(x) · f\'(u(x)).',
        ],
      },
      {
        topic: 'Hình học Oxyz: Góc, Khoảng cách & Vị trí tương đối',
        importance: 'Cần củng cố (+0.8 điểm)',
        why: 'Phần III (Trả lời ngắn) thường có 2 câu Oxyz tính khoảng cách hoặc góc cần điền số chính xác.',
        recommendedActions: [
          'Thuộc công thức sin giữa đường thẳng và mặt phẳng, cos giữa 2 mặt phẳng.',
          'Ôn tập bài toán tìm hình chiếu vuông góc của điểm lên mặt phẳng.',
        ],
      }
    );
  } else {
    // Advanced 7.5 - 10
    keyFocusAreas.push(
      {
        topic: 'Bài toán Tối ưu hóa Thực tế & Max/Min Vận dụng cao',
        importance: 'Chinh phục 9.0+ (+0.8 điểm)',
        why: 'Cấu trúc đề 2025 chú trọng các bài toán thực tiễn (chi phí sản xuất nhỏ nhất, dung tích lớn nhất, quỹ đạo di chuyển).',
        recommendedActions: [
          'Thiết lập hàm số f(x) từ mô hình thực tế và tìm tập xác định thực tế (x > 0).',
          'Sử dụng bất đẳng thức AM-GM hoặc đạo hàm để tìm điểm cực trị tối ưu.',
        ],
      },
      {
        topic: 'Xác suất Có Điều kiện & Biến cố độc lập (Chương trình mới 2025)',
        importance: 'Trọng điểm 2025 (+0.6 điểm)',
        why: 'Đây là nội dung mới xuất hiện trong chương trình THPT 2025, câu hỏi trả lời ngắn thường kiểm tra P(A|B) và công thức xác suất toàn phần.',
        recommendedActions: [
          'Nắm chắc công thức Bayes: P(A|B) = P(A ∩ B) / P(B).',
          'Vẽ sơ đồ cây (Tree Diagram) để trực quan hóa các giai đoạn biến cố.',
        ],
      },
      {
        topic: 'Tối ưu độ chính xác Phần III (Trả lời ngắn)',
        importance: 'Quyết định điểm 9.0 - 10.0 (+1.0 điểm)',
        why: 'Phần III không có gợi ý trắc nghiệm, mỗi câu 0.5 điểm. Sai dấu hoặc làm tròn sai là mất toàn bộ điểm câu đó.',
        recommendedActions: [
          'Đọc kỹ yêu cầu làm tròn (làm tròn đến hàng phần mười hay phần trăm).',
          'Dành 10 phút cuối rà soát lại kết quả tính toán bằng máy tính cầm tay.',
        ],
      }
    );
  }

  // Add common mistake alert if available
  if (commonMistakes.length > 0) {
    keyFocusAreas[0].why += ` (Khắc phục lỗi: "${commonMistakes[0]}")`;
  }

  return {
    targetScore: target,
    targetScoreRange,
    momentumStatus,
    momentumScore,
    feasibilityPercent,
    progressAnalysis,
    keyFocusAreas,
    tacticalAdvice:
      latestScore < 5.0
        ? 'Dành 30 phút đầu tập trung hoàn thành trọn vẹn Phần I (12 câu nhận biết/thông hiểu). Không để mất điểm câu dễ.'
        : latestScore < 7.5
        ? 'Phân bổ 25 phút Phần I (cố gắng đúng 11-12/12 câu), 35 phút Phần II (chú ý kiểm tra mệnh đề phủ định), 25 phút Phần III và 5 phút soát lại số làm tròn.'
        : 'Tốc độ làm Phần I trong 15-20 phút, giải quyết nhanh các ý cơ bản Phần II; dành 45 phút cho các câu Vận dụng cao Phần II/III và kiểm tra kỹ lưỡng điều kiện nghiệm.',
    motivationMessage:
      latestScore < 5.0
        ? 'Mục tiêu 5+ đang rất gần! Hãy nắm chắc từng công thức cơ bản và bạn sẽ thấy điểm số bật tăng rõ rệt.'
        : latestScore < 7.5
        ? 'Đà bứt phá của bạn rất tuyệt vời. Kiên trì đào sâu vào các câu Vận dụng, danh hiệu Cao thủ chắc chắn thuộc về bạn!'
        : 'Bạn đang tiến rất sát mức điểm xuất sắc của kỳ thi THPT! Hãy giữ vững sự tập trung, cẩn thận đến từng con số.',
  };
}

/**
 * Fetch live personalized advice from Gemini API, falling back to local calculation
 */
export async function fetchAITargetScorePrediction(
  history: ScoreHistoryPoint[],
  studentNickname: string,
  currentLevel: string = 'Tân thủ',
  commonMistakes: string[] = []
): Promise<TargetScorePrediction> {
  const localFallback = computeTargetScore(history, commonMistakes);

  try {
    const res = await fetch('/api/predict-target-score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scoreHistory: history,
        studentNickname,
        currentLevel,
        commonMistakes,
      }),
    });

    if (!res.ok) {
      return localFallback;
    }

    const json = await res.json();
    if (json.success && json.data) {
      const d = json.data;
      return {
        targetScore: typeof d.targetScore === 'number' ? d.targetScore : localFallback.targetScore,
        targetScoreRange: d.targetScoreRange || localFallback.targetScoreRange,
        momentumStatus: d.momentumStatus || localFallback.momentumStatus,
        momentumScore: d.momentumScore || localFallback.momentumScore,
        feasibilityPercent: typeof d.feasibilityPercent === 'number' ? d.feasibilityPercent : localFallback.feasibilityPercent,
        progressAnalysis: d.progressAnalysis || localFallback.progressAnalysis,
        keyFocusAreas: Array.isArray(d.keyFocusAreas) && d.keyFocusAreas.length > 0 ? d.keyFocusAreas : localFallback.keyFocusAreas,
        tacticalAdvice: d.tacticalAdvice || localFallback.tacticalAdvice,
        motivationMessage: d.motivationMessage || localFallback.motivationMessage,
        isAiLive: true,
      };
    }
    return localFallback;
  } catch (err) {
    console.warn('Could not reach /api/predict-target-score, using algorithmic prediction:', err);
    return localFallback;
  }
}
