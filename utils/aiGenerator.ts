
import { GoogleGenAI, SchemaType, Type } from "@google/genai";
import { UserProfile, LearningUnit, GameActivity } from "../types";

// Initialize Gemini
// Initialize Gemini Helper
const getApiKey = () => localStorage.getItem('GEMINI_API_KEY') || "";

const MODELS = ['gemini-3-flash-preview', 'gemini-3-pro-preview', 'gemini-2.5-flash'];

const generateContentWithFallback = async (prompt: string, schema: any, systemInstruction: string, temperature: number) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("MISSING_API_KEY");
  
  const ai = new GoogleGenAI({ apiKey });
  let lastError: any = null;

  for (const model of MODELS) {
    try {
      console.log(`Attempting with model: ${model}`);
      return await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          systemInstruction,
          temperature
        }
      });
    } catch (error) {
      console.warn(`Model ${model} failed:`, error);
      lastError = error;
    }
  }
  throw lastError;
};

const MATH_FORMATTING_RULES = `
QUY TẮC HIỂN THỊ CÔNG THỨC TOÁN HỌC (QUAN TRỌNG):
1. LUÔN hiển thị công thức toán học dưới dạng ký hiệu Unicode đẹp mắt hoặc HTML đơn giản.
2. KHÔNG dùng LaTeX ($$, $).
3. CÁCH VIẾT:
   - Phân số: dùng a/b hoặc <sup>a</sup>/<sub>b</sub>
   - Mũ: x² (Unicode) hoặc x<sup>2</sup> (HTML)
   - Chỉ số dưới: aₙ (Unicode) hoặc a<sub>n</sub> (HTML)
   - Căn: √x
   - Các ký hiệu: ± × ÷ ≤ ≥ ≠ ≈ ∞ ∈ ∪ ∩ ∅ π Δ Σ ∫
4. ĐỊNH DẠNG:
   - Với các biểu thức phức tạp, hãy dùng thẻ HTML để trình bày rõ ràng.
`;

export const generateLearningPath = async (
  user: UserProfile, 
  topics: string[]
): Promise<LearningUnit[]> => {
  
  // --- 1. PHÂN TÍCH DỮ LIỆU LỊCH SỬ (ADVANCED LOGIC) ---
  const history = user.history || [];
  let performanceContext = "";
  let adjustedLevel = user.proficiencyLevel || 2; // Default Average

  // --- 1.1 Calculate Recent Performance ---
  if (history.length > 0) {
      // Tính điểm trung bình 5 bài gần nhất để xác định phong độ hiện tại
      const recentHistory = history.slice(0, 5);
      const recentAvg = recentHistory.reduce((acc, h) => acc + (h.score / h.totalQuestions), 0) / (recentHistory.length || 1);

      // Điều chỉnh Level dựa trên phong độ thực tế
      if (recentAvg < 0.5) adjustedLevel = Math.max(1, adjustedLevel - 1); 
      else if (recentAvg > 0.85) adjustedLevel = Math.min(4, adjustedLevel + 1);

      performanceContext = `
      THỐNG KÊ LỊCH SỬ HỌC TẬP:
      - Điểm trung bình gần đây: ${(recentAvg * 10).toFixed(1)}/10.
      - Level được điều chỉnh: ${adjustedLevel}.
      `;
  } else {
      performanceContext = "Học sinh mới, tạo lộ trình khởi động dựa trên đánh giá đầu vào.";
  }

  // --- 2. EXTRACT NUMEROLOGY PROFILE (10 Fields) ---
  const numProfile = user.numerologyProfile;
  const numerologyContext = numProfile ? `
    HỒ SƠ THẦN SỐ HỌC (QUAN TRỌNG - Hãy áp dụng vào cách đặt câu hỏi và giải thích):
    1. Tổng quan: ${numProfile.overview}
    2. Phong cách học: ${numProfile.learningStyle}
    3. Năng lực tập trung: ${numProfile.aptitude}
    4. Động lực học: ${numProfile.motivation}
    5. Cách tiếp cận toán: ${numProfile.mathApproach}
    6. Điểm mạnh: ${numProfile.strengths.join(", ")}
    7. Thách thức: ${numProfile.challenges.join(", ")}
    8. Phương pháp hiệu quả: ${numProfile.effectiveMethod}
    9. Môi trường lý tưởng: ${numProfile.environment}
    10. Khuyến nghị chung: ${numProfile.conclusion}
  ` : "Không có dữ liệu thần số học, sử dụng phong cách mặc định.";

  // --- 3. USER SELF-ASSESSMENT DATA ---
  const assessmentContext = `
    ĐÁNH GIÁ NĂNG LỰC TỪ NGƯỜI DÙNG:
    - Học lực tự đánh giá (1-4): ${user.proficiencyLevel || "Chưa rõ"}
    - Thói quen/Đặc điểm (Tags): ${user.assessmentTags?.join(", ") || "Không có"}
    - Ghi chú thêm từ học sinh/phụ huynh: "${user.assessmentNotes || "Không có"}"
  `;

  // --- 4. Construct the Prompt ---
  const prompt = `
    Đóng vai một chuyên gia giáo dục toán học AI & Phân tích dữ liệu hành vi. 
    Nhiệm vụ: Tạo lộ trình học tập SIÊU CÁ NHÂN HÓA cho học sinh này.
    
    THÔNG TIN CƠ BẢN:
    - Lớp: ${user.grade}
    - Chủ đề mong muốn: ${topics.join(", ")}

    ${numerologyContext}

    ${assessmentContext}

    ${performanceContext}
    
    ${MATH_FORMATTING_RULES}

    YÊU CẦU LOGIC TẠO BÀI HỌC:
    1. **Thích ứng theo Thần số học**:
       - Nếu "Phong cách học" là hình ảnh/trực quan (Số 3, 5): Dùng emoji, hình tượng trong câu hỏi.
       - Nếu "Cách tiếp cận" là Logic/Phân tích (Số 1, 4, 7): Câu hỏi cần chặt chẽ, đi thẳng vấn đề.
       - Nếu "Động lực" là giúp đỡ/kết nối (Số 2, 6, 9): Đặt bài toán vào ngữ cảnh giúp đỡ bạn bè, cộng đồng.
    2. **Thích ứng theo Đánh giá**:
       - Nếu Tags có "Sợ số học" hoặc "Tính toán chậm": Bắt đầu bằng câu hỏi trắc nghiệm dễ, giải thích cực kỳ chi tiết, khích lệ nhiều.
       - Nếu Tags có "Thích giải đố": Thêm dạng câu hỏi tư duy logic (fill-in-blank).
       - Nếu Ghi chú có yêu cầu cụ thể (VD: "Yếu hình học"): Ưu tiên tạo bài về chủ đề đó trước.
    3. **Cấu trúc bài học**:
       - Level ${adjustedLevel} (1: Cơ bản, 4: Nâng cao).
       - 5-10 câu hỏi/bài.
       - Đa dạng loại câu hỏi (Trắc nghiệm, Đúng/Sai, Điền từ).

    YÊU CẦU CẤU TRÚC JSON OUTPUT:
    {
      "units": [
        {
          "topicId": "string",
          "title": "Tên bài học hấp dẫn (VD: Chinh phục Hình học...)",
          "description": "Mô tả ngắn gọn, động viên",
          "totalXp": number,
          "durationMinutes": number,
          "questions": [ ... ]
        }
      ]
    }
  `;

  // 5. Define Response Schema
  const schema = {
    type: Type.OBJECT,
    properties: {
      units: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            topicId: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            totalXp: { type: Type.NUMBER },
            durationMinutes: { type: Type.NUMBER },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["multiple-choice", "true-false", "fill-in-blank"] },
                  content: { type: Type.STRING },
                  options: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    nullable: true 
                  },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  difficulty: { type: Type.STRING, enum: ["easy", "medium", "hard"] }
                },
                required: ["id", "type", "content", "correctAnswer", "explanation", "difficulty"]
              }
            }
          },
          required: ["topicId", "title", "description", "questions", "totalXp", "durationMinutes"]
        }
      }
    },
    required: ["units"]
  };

  try {
    const response = await generateContentWithFallback(
      prompt,
      schema,
      "You are a Hyper-Personalized AI Tutor. Analyze the full student profile including Numerology and Assessment to create the perfect curriculum.",
      0.7
    );

    const jsonText = response.text; 
    
    if (!jsonText) throw new Error("No data returned from AI");

    const parsedData = JSON.parse(jsonText);
    
    const processedUnits: LearningUnit[] = parsedData.units.map((unit: any, index: number) => ({
      ...unit,
      id: `unit-${Date.now()}-${index}`,
      status: index === 0 ? 'active' : 'locked', 
      level: adjustedLevel // Use the calculated level based on history
    }));

    return processedUnits;

  } catch (error) {
    console.error("AI Generation Error:", error);
    return [];
  }
};

// Generate Challenge Unit (Harder, More Questions)
export const generateChallengeUnit = async (
  user: UserProfile,
  currentUnit: LearningUnit
): Promise<LearningUnit | null> => {
  
  const nextLevel = (currentUnit.level || 1) + 1;

  const prompt = `
    Đóng vai một chuyên gia giáo dục toán học AI. Học sinh đã hoàn thành xuất sắc bài học "${currentUnit.title}".
    Hãy tạo một PHIÊN BẢN NÂNG CAO (Level ${nextLevel}) cho bài học này để thử thách học sinh.

    THÔNG TIN ĐẦU VÀO:
    - Chủ đề: ${currentUnit.title}
    - Lớp: ${user.grade}
    - Cấp độ mới: Khó hơn, chuyên sâu hơn.
    
    ${MATH_FORMATTING_RULES}

    YÊU CẦU CỤ THỂ:
    1. Tạo 1 Learning Unit mới vẫn giữ chủ đề cũ nhưng tên gọi thể hiện sự nâng cao (VD: "... - Thử thách", "... - Nâng cao").
    2. SỐ LƯỢNG CÂU HỎI: Từ 10 đến 15 câu.
    3. ĐỘ KHÓ: 20% Trung bình, 80% Khó/Vận dụng cao.
    4. Tăng XP thưởng và thời gian làm bài.
    5. Ngôn ngữ: Tiếng Việt.

    OUTPUT JSON FORMAT ONLY (Single Unit object structure).
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      topicId: { type: Type.STRING },
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      totalXp: { type: Type.NUMBER },
      durationMinutes: { type: Type.NUMBER },
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["multiple-choice", "true-false", "fill-in-blank"] },
            content: { type: Type.STRING },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              nullable: true 
            },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ["easy", "medium", "hard"] }
          },
          required: ["id", "type", "content", "correctAnswer", "explanation", "difficulty"]
        }
      }
    },
    required: ["topicId", "title", "description", "questions", "totalXp", "durationMinutes"]
  };

  try {
    const response = await generateContentWithFallback(
      prompt,
      schema,
      "You are a tough but fair AI Math Coach. Follow math formatting rules strictly.",
      0.8
    );

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data returned");

    const parsedUnit = JSON.parse(jsonText);

    return {
      ...parsedUnit,
      id: currentUnit.id, 
      status: 'active',
      level: nextLevel
    };

  } catch (error) {
    console.error("Challenge Generation Error", error);
    return null;
  }
};

// Generate Comprehensive Test (20 questions, Mixed Types, Progressive Difficulty)
export const generateComprehensiveTest = async (user: UserProfile): Promise<LearningUnit | null> => {
  const historyStats = user.history || [];
  const weakAreas = historyStats.filter(h => (h.score / h.totalQuestions) < 0.6).map(h => h.unitTitle).join(", ");
  const strongAreas = historyStats.filter(h => (h.score / h.totalQuestions) >= 0.8).map(h => h.unitTitle).join(", ");
  
  // Collect topics from current learning path to ensure coverage
  const pathTopics = user.learningPath ? user.learningPath.map(u => u.title).join(", ") : user.selectedTopics?.join(", ") || "Toán tổng hợp";

  const prompt = `
    Bạn là AI Giáo viên Toán cao cấp. Hãy tạo một BÀI KIỂM TRA TỔNG HỢP (Final Exam) cho học sinh này.
    
    HỒ SƠ HỌC SINH:
    - Lớp: ${user.grade}
    - Các chủ đề đã học trong lộ trình: ${pathTopics}
    - Điểm yếu cần khắc phục (nếu có): ${weakAreas || "Chưa có dữ liệu, hãy kiểm tra kiến thức nền tảng."}
    - Điểm mạnh (nếu có): ${strongAreas}

    ${MATH_FORMATTING_RULES}

    YÊU CẦU ĐỀ THI:
    1. SỐ LƯỢNG: Đúng 20 câu hỏi.
    2. CẤU TRÚC ĐỘ KHÓ (Tăng dần):
       - 5 câu đầu: Dễ (Khởi động, kiến thức cơ bản).
       - 10 câu giữa: Trung bình (Vận dụng).
       - 5 câu cuối: Khó (Vận dụng cao, tư duy logic).
    3. HÌNH THỨC ĐA DẠNG:
       - Phải có đủ 3 loại: 'multiple-choice', 'true-false', 'fill-in-blank'.
    4. NỘI DUNG: Bao phủ các chủ đề trong lộ trình, nhưng tập trung xoáy sâu vào các phần học sinh còn yếu (nếu có).
    5. Tên bài: "Kiểm tra Tổng hợp Kiến thức".
    6. Ngôn ngữ: Tiếng Việt.

    OUTPUT JSON FORMAT ONLY.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      topicId: { type: Type.STRING },
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      totalXp: { type: Type.NUMBER },
      durationMinutes: { type: Type.NUMBER },
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["multiple-choice", "true-false", "fill-in-blank"] },
            content: { type: Type.STRING },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              nullable: true 
            },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ["easy", "medium", "hard"] }
          },
          required: ["id", "type", "content", "correctAnswer", "explanation", "difficulty"]
        }
      }
    },
    required: ["topicId", "title", "description", "questions", "totalXp", "durationMinutes"]
  };

  try {
    const response = await generateContentWithFallback(
      prompt,
      schema,
      "You are a precise Exam Creator AI. You create balanced, progressive difficulty tests. Follow math formatting rules strictly.",
      0.7
    );

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data returned");

    const parsedUnit = JSON.parse(jsonText);

    return {
      ...parsedUnit,
      id: `exam-${Date.now()}`,
      status: 'active',
      level: 99 // Special level identifier for Exam
    };
  } catch (error) {
    console.error("Exam Generation Error", error);
    return null;
  }
};

export const generateEntertainmentContent = async (user: UserProfile): Promise<GameActivity[]> => {
  // Extract context from user profile
  const grade = user.grade;
  const topics = user.learningPath?.map(u => u.title).slice(0, 3).join(", ") || "Toán tư duy cơ bản";
  const numerologyTrait = user.numerologyProfile?.title || "Sáng tạo";
  const mathStyle = user.numerologyProfile?.mathApproach || "Logic";

  const prompt = `
    Bạn là một nhà thiết kế Game Giáo Dục AI (Gamification Expert).
    Hãy tạo ra 4-5 hoạt động giải trí toán học (Trò chơi, Câu đố, Thử thách) cho học sinh này.

    HỒ SƠ NGƯỜI CHƠI:
    - Lớp: ${grade}
    - Tính cách (Thần số học): ${numerologyTrait} - Thích ${mathStyle}
    - Chủ đề đang học: ${topics}

    ${MATH_FORMATTING_RULES}

    YÊU CẦU NỘI DUNG:
    1. Vui vẻ, hài hước, mang tính tích cực.
    2. Phù hợp với kiến thức Lớp ${grade}.
    3. QUAN TRỌNG: Tất cả hoạt động đều phải có một CÂU HỎI hoặc NHIỆM VỤ cụ thể mà học sinh có thể nhập đáp án vào ô trống.
    4. Đối với 'challenge' (thử thách thực tế), hãy đặt câu hỏi về kết quả của thử thách (Ví dụ: "Bạn đếm được bao nhiêu hình tròn?", "Kết quả phép tính cuối cùng là gì?").
    5. Cung cấp đáp án (answer) ngắn gọn, chính xác (số hoặc từ đơn) để hệ thống tự động chấm điểm.

    CHI TIẾT LOẠI HÌNH:
    - 'puzzle': Câu đố vui, đố mẹo toán học.
    - 'game': Trò chơi tư duy nhỏ (dạng text).
    - 'challenge': Thử thách thực tế (đo đạc, tìm kiếm) nhưng kết thúc bằng một câu hỏi kiểm tra.

    OUTPUT JSON FORMAT ONLY.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      activities: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["game", "puzzle", "challenge"] },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ["Dễ", "Vừa", "Khó"] },
            duration: { type: Type.STRING },
            xpReward: { type: Type.NUMBER },
            interactiveContent: { type: Type.STRING, description: "Nội dung chính: Câu hỏi đố, luật chơi, hoặc hướng dẫn thử thách. PHẢI CÓ CÂU HỎI CUỐI CÙNG." },
            answer: { type: Type.STRING, description: "Đáp án CHÍNH XÁC cho câu hỏi (số hoặc từ ngắn) để chấm điểm." },
            hint: { type: Type.STRING, nullable: true },
            funFact: { type: Type.STRING, description: "Sự thật thú vị liên quan đến chủ đề" }
          },
          required: ["id", "type", "title", "description", "difficulty", "duration", "xpReward", "interactiveContent", "answer", "funFact"]
        }
      }
    },
    required: ["activities"]
  };

  try {
     const response = await generateContentWithFallback(
      prompt,
      schema,
      "You are a fun and creative Gamification Master for kids. Follow math formatting rules strictly.",
      0.85
    );

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data returned");
    const parsed = JSON.parse(jsonText);
    return parsed.activities;

  } catch (error) {
    console.error("Game Generation Error", error);
    // Fallback static data if AI fails
    return [
      {
        id: "fallback-1",
        type: "puzzle",
        title: "Bí mật con số 0",
        description: "Tại sao con số 0 lại quan trọng đến thế?",
        difficulty: "Dễ",
        duration: "2 phút",
        xpReward: 50,
        interactiveContent: "Cái gì không có bắt đầu, không có kết thúc, và cũng chẳng có gì ở giữa? (Nhập tên hình học)",
        answer: "Hình tròn",
        hint: "Hình dáng của nó giống cái nhẫn.",
        funFact: "Số 0 được phát minh bởi người Ấn Độ cổ đại!"
      }
    ];
  }
};
