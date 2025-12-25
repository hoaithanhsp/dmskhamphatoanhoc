
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, MoreVertical, Route, Calculator, Brain, LifeBuoy, Plus, Mic, Send, Lightbulb, Map, CheckCircle2, User, Bot, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { GoogleGenAI, Content } from "@google/genai";
import { UserProfile } from '../../types';

interface Props {
  user: UserProfile;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}


// Remove global instantiation
// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); 


export const ChatScreen: React.FC<Props> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Default to 'guide' or no selection. Let's default to null so user knows they can choose, or 'guide' as safe middle ground.
  const [supportMode, setSupportMode] = useState<'hint' | 'guide' | 'full'>('guide');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Initial Personalized Greeting
  useEffect(() => {
    if (messages.length === 0) {
      handleInitialGreeting();
    }
  }, []);

  const handleInitialGreeting = async () => {
    setIsLoading(true);
    try {
      const apiKey = localStorage.getItem('GEMINI_API_KEY');
      if (!apiKey) throw new Error("API Key not found");

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
        Bạn là Trợ lý Học tập AI (AI Tutor) thân thiện của ${user.name}.
        Hãy gửi một lời chào ngắn gọn, ấm áp (dưới 40 từ).
        Nhắc đến đặc điểm thần số học số ${user.numerologyNumber} (${user.numerologyProfile?.title}) của bạn ấy một cách khéo léo để động viên.
        Hỏi xem hôm nay bạn ấy cần giúp giải bài tập Toán nào không.
        Dùng emoji vui vẻ.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setMessages([{
        id: 'init-1',
        role: 'model',
        text: response.text || "Xin chào! Mình là AI Tutor đây. Hôm nay chúng ta cùng học toán nhé! 👋",
        timestamp: Date.now()
      }]);
    } catch (e) {
      setMessages([{
        id: 'init-err',
        role: 'model',
        text: `Chào ${user.name}! Mình là trợ lý AI của bạn. Hôm nay bạn muốn chinh phục bài toán nào? 🚀`,
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (textOverride?: string, supportLevel?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    // Use explicit supportLevel arg if present, otherwise use state
    const modeToUse = supportLevel || supportMode;

    // Add User Message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build History Context
      const history: Content[] = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // Construct System Instruction & Prompt
      const mathFormattingRules = `
        QUY TẮC TOÁN HỌC:
        - Dùng Unicode/HTML: x², a/b, √x, π, ≤, ≥.
        - KHÔNG dùng LaTeX ($$).
        - Trình bày từng bước rõ ràng.
      `;

      let prompt = textToSend;

      // Prefix instruction based on mode
      if (modeToUse === 'hint') prompt = `[CHẾ ĐỘ: GỢI Ý NHẸ] Hãy chỉ đưa ra gợi ý manh mối nhỏ, tuyệt đối KHÔNG giải hết bài. Khuyến khích học sinh tự suy nghĩ tiếp. Nội dung: ${textToSend}`;
      if (modeToUse === 'guide') prompt = `[CHẾ ĐỘ: HƯỚNG DẪN] Hãy chỉ nêu các bước thực hiện và phương pháp giải, KHÔNG tính ra đáp số cuối cùng ngay. Nội dung: ${textToSend}`;
      if (modeToUse === 'full') prompt = `[CHẾ ĐỘ: GIẢI CHI TIẾT] Hãy giải đầy đủ từng bước một cách cẩn thận và đưa ra đáp án chính xác cuối cùng. Nội dung: ${textToSend}`;

      const systemInstruction = `
        Bạn là Trợ lý Học tập AI siêu thông minh và thân thiện của học sinh ${user.name} (Lớp ${user.grade}).
        
        HỒ SƠ HỌC SINH:
        - Thần số học: Số ${user.numerologyNumber} - ${user.numerologyProfile?.title}.
        - Phong cách học: ${user.numerologyProfile?.learningStyle}.
        - Tính cách: ${user.numerologyProfile?.description}.

        NHIỆM VỤ:
        1. Giải đáp thắc mắc toán học chính xác tuyệt đối.
        2. Tương tác dựa trên tính cách:
           - Nếu học sinh là Số 4/7: Trả lời logic, ngắn gọn, đi thẳng vào vấn đề.
           - Nếu học sinh là Số 3/5: Trả lời vui vẻ, hài hước, dùng nhiều emoji.
           - Nếu học sinh là Số 2/6/9: Nhẹ nhàng, động viên, ân cần.
        3. ${mathFormattingRules}
        
        QUAN TRỌNG:
        - Tuân thủ nghiêm ngặt chế độ hỗ trợ được yêu cầu (Gợi ý/Hướng dẫn/Giải chi tiết).
        - Nếu câu hỏi không liên quan đến học tập, hãy khéo léo lái về chuyện học.
      `;

      const apiKey = localStorage.getItem('GEMINI_API_KEY');
      if (!apiKey) {
        setMessages(prev => [...prev, {
          id: `err-${Date.now()}`,
          role: 'model',
          text: "Bạn ơi, hình như chưa nhập API Key rồi! Vào cài đặt nhập giúp mình nhé. 🔑",
          timestamp: Date.now()
        }]);
        setIsLoading(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });

      // Call Gemini
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const aiResponseText = response.text || "Xin lỗi, mình đang gặp chút trục trặc. Bạn hỏi lại nhé?";

      // Add AI Message
      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: aiResponseText,
        timestamp: Date.now()
      }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'model',
        text: "Mạng đang yếu quá, bạn thử lại chút nữa nhé! 🤯",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-primary-surface dark:bg-dark-bg font-display h-screen flex flex-col overflow-hidden text-gray-900 dark:text-white transition-colors duration-200">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white/90 dark:bg-surface-dark/90 backdrop-blur-md sticky top-0 z-20 shadow-sm border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-teal-400 p-0.5">
              <div className="w-full h-full bg-white dark:bg-dark-bg rounded-full flex items-center justify-center">
                <Bot className="text-primary w-6 h-6" />
              </div>
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-dark-bg rounded-full"></span>
          </div>
          <div>
            <h2 className="text-base font-bold leading-tight">AI Tutor {user.name}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
              <Sparkles size={10} className="text-accent-yellow" />
              Thần số học: Số {user.numerologyNumber}
            </p>
          </div>
        </div>
        <button className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <MoreVertical size={20} />
        </button>
      </header>

      {/* Main Chat */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-48 scroll-smooth bg-gray-50 dark:bg-dark-bg relative">
        <div className="flex justify-center mb-6">
          <span className="bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wide">
            Hôm nay, {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {messages.map((msg) => {
          const isAI = msg.role === 'model';
          return (
            <div key={msg.id} className={`flex items-end gap-3 mb-4 ${isAI ? '' : 'justify-end'} animate-fade-in-up`}>
              {isAI && (
                <div className="relative shrink-0">
                  <div className="bg-white dark:bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-sm">
                    <Bot size={16} className="text-primary" />
                  </div>
                </div>
              )}

              <div className={`flex flex-col gap-1 max-w-[85%] ${isAI ? 'items-start' : 'items-end'}`}>
                <div className={`p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap math-formula
                    ${isAI
                    ? 'bg-white dark:bg-surface-dark text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-gray-700'
                    : 'bg-primary text-white rounded-br-none'
                  }`}
                  dangerouslySetInnerHTML={{ __html: msg.text }}
                >
                </div>
                <span className="text-[10px] text-gray-400 font-medium px-1">
                  {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {!isAI && (
                <div className="relative shrink-0">
                  <div className="bg-teal-100 dark:bg-teal-900 rounded-full w-8 h-8 flex items-center justify-center border border-teal-200 dark:border-teal-800">
                    <User size={16} className="text-teal-700 dark:text-teal-300" />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-end gap-3 mb-4 animate-pulse">
            <div className="bg-white dark:bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center border border-gray-200 dark:border-gray-700">
              <Bot size={16} className="text-primary" />
            </div>
            <div className="bg-white dark:bg-surface-dark p-3 rounded-2xl rounded-bl-none border border-gray-100 dark:border-gray-700 flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Footer Area */}
      <footer className="fixed bottom-0 left-0 md:left-64 right-0 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 p-3 pb-6 z-40">
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-2">

          {/* Support Mode Selector (Visible before asking) */}
          <div className="px-1">
            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider ml-1">Chọn mức độ hỗ trợ:</p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => setSupportMode('hint')}
                className={`flex-1 flex flex-col items-center justify-center gap-1 p-3 rounded-xl border transition-all min-w-[90px] ${supportMode === 'hint'
                    ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-400 dark:border-yellow-600 text-yellow-800 dark:text-yellow-100 shadow-sm ring-1 ring-yellow-400/50'
                    : 'bg-white dark:bg-surface-dark border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
              >
                <Lightbulb size={20} className={supportMode === 'hint' ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400'} />
                <span className="text-xs font-bold whitespace-nowrap">Gợi ý nhẹ</span>
              </button>

              <button
                onClick={() => setSupportMode('guide')}
                className={`flex-1 flex flex-col items-center justify-center gap-1 p-3 rounded-xl border transition-all min-w-[90px] ${supportMode === 'guide'
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600 text-blue-800 dark:text-blue-100 shadow-sm ring-1 ring-blue-400/50'
                    : 'bg-white dark:bg-surface-dark border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
              >
                <Map size={20} className={supportMode === 'guide' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'} />
                <span className="text-xs font-bold whitespace-nowrap">Hướng dẫn</span>
              </button>

              <button
                onClick={() => setSupportMode('full')}
                className={`flex-1 flex flex-col items-center justify-center gap-1 p-3 rounded-xl border transition-all min-w-[90px] ${supportMode === 'full'
                    ? 'bg-green-50 dark:bg-green-900/30 border-green-400 dark:border-green-600 text-green-800 dark:text-green-100 shadow-sm ring-1 ring-green-400/50'
                    : 'bg-white dark:bg-surface-dark border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
              >
                <CheckCircle2 size={20} className={supportMode === 'full' ? 'text-green-600 dark:text-green-400' : 'text-gray-400'} />
                <span className="text-xs font-bold whitespace-nowrap">Giải chi tiết</span>
              </button>
            </div>
          </div>

          {/* Input Row */}
          <div className="flex items-end gap-2">
            <button className="flex shrink-0 items-center justify-center rounded-full size-11 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Chụp ảnh (Sắp ra mắt)">
              <ImageIcon size={20} />
            </button>
            <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center px-4 py-2 focus-within:ring-2 focus-within:ring-primary/50 transition-shadow">
              <input
                className="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-900 dark:text-white placeholder-gray-400 py-1.5 p-0"
                placeholder={`Nhập câu hỏi (${supportMode === 'hint' ? 'Gợi ý' : supportMode === 'full' ? 'Giải chi tiết' : 'Hướng dẫn'})...`}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                disabled={isLoading}
              />
              <button className="ml-2 text-gray-400 hover:text-primary transition-colors">
                <Mic size={20} />
              </button>
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="flex shrink-0 items-center justify-center rounded-full size-11 bg-primary text-[#102221] hover:bg-primary-dark shadow-md hover:shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} className="ml-0.5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
