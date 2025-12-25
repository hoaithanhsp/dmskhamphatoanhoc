import React, { useState, useEffect } from 'react';
import { ScreenName, UserProfile, LearningUnit, QuizResult } from './types';
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { StudentInfoScreen } from './components/screens/StudentInfoScreen';
import { AssessmentScreen } from './components/screens/AssessmentScreen';
import { AnalysisResultScreen } from './components/screens/AnalysisResultScreen';
import { LearningPathScreen } from './components/screens/LearningPathScreen';
import { QuizScreen } from './components/screens/QuizScreen';
import { QuizResultScreen } from './components/screens/QuizResultScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { ParentReportScreen } from './components/screens/ParentReportScreen';
import { ChatScreen } from './components/screens/ChatScreen';
import { GameLibraryScreen } from './components/screens/GameLibraryScreen';
import { ClassSelectionScreen } from './components/screens/ClassSelectionScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { BottomNavigation } from './components/BottomNavigation';
import { SidebarNavigation } from './components/SidebarNavigation';
import { analyzeProfile } from './utils/numerology';
import { generateLearningPath, generateChallengeUnit, generateComprehensiveTest } from './utils/aiGenerator';
import { Loader2, Settings, Key, AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'math_genius_user_data_v3_son';
const API_KEY_STORAGE = 'user_api_key';

// --- COMPONENTS ---

const ApiKeyModal = ({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (key: string) => void }) => {
  const [key, setKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3-flash-preview');

  const models = [
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', desc: 'Tốc độ cao (Khuyên dùng)' },
    { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', desc: 'Thông minh hơn, chậm hơn' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Bản ổn định cũ' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-6 text-teal-700 border-b border-gray-100 pb-4">
          <Settings className="w-6 h-6" />
          <h2 className="text-xl font-bold">Cấu hình AI & API Key</h2>
        </div>

        {/* Model Selection */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-3">Chọn Model AI:</label>
          <div className="grid gap-3">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`flex items-center p-3 rounded-xl border-2 transition-all text-left ${selectedModel === model.id
                    ? 'border-teal-500 bg-teal-50 shadow-sm'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${selectedModel === model.id ? 'border-teal-500' : 'border-gray-300'
                  }`}>
                  {selectedModel === model.id && <div className="w-2 h-2 rounded-full bg-teal-500" />}
                </div>
                <div>
                  <div className={`font-bold text-sm ${selectedModel === model.id ? 'text-teal-900' : 'text-gray-700'}`}>
                    {model.name}
                  </div>
                  <div className="text-xs text-gray-500">{model.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* API Key Input */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Key className="w-4 h-4 text-gray-500" />
            <label className="block text-sm font-bold text-gray-700">Gemini API Key:</label>
          </div>

          <p className="text-xs text-gray-500 mb-2">
            Chưa có key? <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-bold">Lấy key tại đây</a>
          </p>
          <p className="text-[10px] text-gray-400 mb-3">
            Xem hướng dẫn: <a href="https://tinyurl.com/hdsdpmTHT" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">https://tinyurl.com/hdsdpmTHT</a>
          </p>

          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Dán API Key của bạn vào đây (AIza...)"
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none font-mono text-sm"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium text-sm"
          >
            Đóng
          </button>
          <button
            onClick={() => {
              if (key.trim()) onSave(key.trim());
            }}
            disabled={!key.trim()}
            className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 text-sm shadow-lg shadow-teal-900/20"
          >
            Lưu Cấu Hình
          </button>
        </div>
      </div>
    </div>
  );
};

const Header = ({ onOpenSettings, hasKey }: { onOpenSettings: () => void; hasKey: boolean }) => (
  <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
    <h1 className="text-lg font-bold text-teal-800 hidden md:block">KHÁM PHÁ TOÁN HỌC</h1>
    <span className="md:hidden text-sm font-bold text-teal-800">TOÁN HỌC AI</span>

    <button
      onClick={onOpenSettings}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${hasKey
          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          : 'bg-red-50 text-red-600 border border-red-200 animate-pulse hover:bg-red-100'
        }`}
    >
      <Settings size={18} />
      <span>{hasKey ? 'Cài đặt API Key' : 'Lấy API key để sử dụng app'}</span>
    </button>
  </header>
);

const Footer = () => (
  <footer className="bg-slate-800 text-slate-300 py-8 px-4 mt-auto border-t border-slate-700 no-print">
    <div className="max-w-5xl mx-auto text-center">
      <div className="mb-6 p-6 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 rounded-2xl border border-blue-500/20 backdrop-blur-sm">
        <p className="font-bold text-lg md:text-xl text-blue-200 mb-3 leading-relaxed">
          ĐĂNG KÝ KHOÁ HỌC THỰC CHIẾN VIẾT SKKN, TẠO APP DẠY HỌC, TẠO MÔ PHỎNG TRỰC QUAN <br className="hidden md:block" />
          <span className="text-yellow-400">CHỈ VỚI 1 CÂU LỆNH</span>
        </p>
        <a
          href="https://tinyurl.com/khoahocAI2025"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all transform hover:-translate-y-1 shadow-lg shadow-blue-900/50"
        >
          ĐĂNG KÝ NGAY
        </a>
      </div>

      <div className="space-y-2 text-sm md:text-base">
        <p className="font-medium text-slate-400">Mọi thông tin vui lòng liên hệ:</p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6">
          <a
            href="https://www.facebook.com/tranhoaithanhvicko/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-blue-400 transition-colors duration-200 flex items-center gap-2"
          >
            <span className="font-bold">Facebook:</span> tranhoaithanhvicko
          </a>
          <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-600"></div>
          <span className="hover:text-emerald-400 transition-colors duration-200 cursor-default flex items-center gap-2">
            <span className="font-bold">Zalo:</span> 0348296773
          </span>
        </div>
      </div>
    </div>
  </footer>
);

const ErrorBanner = ({ message }: { message: string }) => (
  <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4 rounded-r-lg shadow-sm flex items-start gap-3 animate-fade-in">
    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
    <div>
      <h3 className="text-red-800 font-bold text-sm">Đã xảy ra lỗi kết nối AI</h3>
      <p className="text-red-700 text-sm mt-1 font-mono break-all leading-relaxed">{message}</p>
    </div>
  </div>
);

// --- MAIN APP ---

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>(ScreenName.WELCOME);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeUnit, setActiveUnit] = useState<LearningUnit | null>(null);

  // Quiz State
  const [lastQuizResult, setLastQuizResult] = useState<QuizResult | null>(null);
  const [isReviewingQuiz, setIsReviewingQuiz] = useState(false);

  // API Key State
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) || '');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize state with lazy initializer to check localStorage first
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load save data", e);
    }
    // Default fallback if no save found - Updated for Đặng Minh Sơn
    return {
      name: 'ĐẶNG MINH SƠN',
      dob: '02/12/2009',
      grade: 11,
      numerologyNumber: 7,
      proficiencyLevel: 3,
      history: []
    };
  });

  // Effect: Save to LocalStorage whenever user changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }, [user]);

  // Effect: Determine initial screen
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.learningPath && parsed.learningPath.length > 0) {
        setCurrentScreen(ScreenName.LEARNING_PATH);
      }
    }

    // Check API Key
    if (!localStorage.getItem(API_KEY_STORAGE)) {
      setShowKeyModal(true);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    localStorage.setItem(API_KEY_STORAGE, key);
    setApiKey(key);
    setShowKeyModal(false);
    // Clear any previous error
    setErrorMsg(null);
  };

  const handleStudentInfoNext = () => {
    if (user.dob) {
      const analysis = analyzeProfile(user.name, user.dob);
      setUser(prev => ({
        ...prev,
        numerologyNumber: analysis.lifePathNumber,
        numerologyProfile: analysis
      }));
    }
    setCurrentScreen(ScreenName.ASSESSMENT);
  };

  const handleAssessmentNext = (proficiency: number) => {
    setUser(prev => ({ ...prev, proficiencyLevel: proficiency }));
    setCurrentScreen(ScreenName.ANALYSIS_RESULT);
  };

  const handleCreateLearningPath = async (grade: number, topics: string[]) => {
    setErrorMsg(null);
    setIsGenerating(true);
    const updatedUser = { ...user, grade, selectedTopics: topics };
    setUser(updatedUser);

    try {
      const learningPath = await generateLearningPath(updatedUser, topics);
      setUser(prev => ({
        ...prev,
        learningPath: learningPath
      }));
      setCurrentScreen(ScreenName.LEARNING_PATH);
    } catch (error: any) {
      console.error("Failed to generate path", error);
      setErrorMsg(error.message || "Unknown error occurred");
      setCurrentScreen(ScreenName.CLASS_SELECTION); // Stay here so user can retry
    } finally {
      setIsGenerating(false);
    }
  };

  // Upgrade/Challenge Unit Logic
  const handleUpgradeUnit = async (unit: LearningUnit) => {
    setErrorMsg(null);
    setIsGenerating(true);
    try {
      const newUnit = await generateChallengeUnit(user, unit);
      if (newUnit && user.learningPath) {
        const updatedPath = user.learningPath.map(u =>
          u.id === unit.id ? newUnit : u
        );
        setUser(prev => ({ ...prev, learningPath: updatedPath }));
        setActiveUnit(newUnit);
        setIsReviewingQuiz(false);
        setLastQuizResult(null);
        setCurrentScreen(ScreenName.QUIZ);
      }
    } catch (error: any) {
      console.error("Failed to generate challenge", error);
      setErrorMsg(error.message || "Failed to generate challenge");
      // Don't navigate away, just show error
    } finally {
      setIsGenerating(false);
    }
  };

  // Comprehensive Test Logic
  const handleComprehensiveTest = async () => {
    setErrorMsg(null);
    setIsGenerating(true);
    try {
      const examUnit = await generateComprehensiveTest(user);
      if (examUnit) {
        setActiveUnit(examUnit);
        setIsReviewingQuiz(false);
        setLastQuizResult(null);
        setCurrentScreen(ScreenName.QUIZ);
      }
    } catch (error: any) {
      console.error("Failed to generate exam", error);
      setErrorMsg(error.message || "Failed to generate exam");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuizFinish = (result: QuizResult) => {
    const finalResult: QuizResult = {
      ...result,
      timestamp: Date.now(),
      unitTitle: activeUnit?.title || "Bài học"
    };

    setLastQuizResult(finalResult);
    setIsReviewingQuiz(false);

    if (user.learningPath && activeUnit?.level !== 99) {
      const updatedPath = user.learningPath.map(u => {
        if (u.id === result.unitId) {
          const isPass = (result.score / result.totalQuestions) >= 0.5;
          return { ...u, status: isPass ? 'completed' : 'active' } as any;
        }
        return u;
      });

      setUser(prev => ({
        ...prev,
        learningPath: updatedPath,
        history: [finalResult, ...(prev.history || [])]
      }));
    } else {
      setUser(prev => ({
        ...prev,
        history: [finalResult, ...(prev.history || [])]
      }));
    }

    setCurrentScreen(ScreenName.QUIZ_RESULT);
  };

  const handleStartReview = () => {
    setIsReviewingQuiz(true);
    setCurrentScreen(ScreenName.QUIZ);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    // Note: We do NOT clear the API Key on logout, usually. Copied key is valuable.
    // Reset to defaults
    setUser({
      name: '',
      dob: '',
      grade: 11,
      numerologyNumber: 7,
      proficiencyLevel: 3,
      history: []
    });
    setCurrentScreen(ScreenName.WELCOME);
  };

  // Simple router function
  const renderScreen = () => {
    switch (currentScreen) {
      case ScreenName.WELCOME:
        return <WelcomeScreen onStart={() => setCurrentScreen(ScreenName.STUDENT_INFO)} />;
      case ScreenName.STUDENT_INFO:
        return <StudentInfoScreen user={user} setUser={setUser} onNext={handleStudentInfoNext} onBack={() => setCurrentScreen(ScreenName.WELCOME)} />;
      case ScreenName.ASSESSMENT:
        return <AssessmentScreen
          onNext={() => handleAssessmentNext(user.proficiencyLevel || 3)}
          onBack={() => setCurrentScreen(ScreenName.STUDENT_INFO)}
          setProficiency={(level) => setUser({ ...user, proficiencyLevel: level })}
        />;
      case ScreenName.ANALYSIS_RESULT:
        return <AnalysisResultScreen
          user={user}
          onNext={() => setCurrentScreen(ScreenName.CLASS_SELECTION)}
          onBack={() => setCurrentScreen(ScreenName.ASSESSMENT)}
        />;
      case ScreenName.CLASS_SELECTION:
        return (
          <ClassSelectionScreen
            onNext={handleCreateLearningPath}
            onBack={() => setCurrentScreen(ScreenName.ANALYSIS_RESULT)}
            isGenerating={isGenerating}
          />
        );
      case ScreenName.LEARNING_PATH:
        return <LearningPathScreen
          user={user}
          onStartQuiz={(unit) => {
            setActiveUnit(unit);
            setIsReviewingQuiz(false);
            setLastQuizResult(null);
            setCurrentScreen(ScreenName.QUIZ);
          }}
          onUpgradeUnit={handleUpgradeUnit}
          onBack={() => setCurrentScreen(ScreenName.CLASS_SELECTION)}
          onStartComprehensiveTest={handleComprehensiveTest}
        />;
      case ScreenName.QUIZ:
        return <QuizScreen
          unit={activeUnit}
          isReviewMode={isReviewingQuiz}
          existingAnswers={isReviewingQuiz ? lastQuizResult?.userAnswers : undefined}
          onFinish={handleQuizFinish}
          onBack={() => isReviewingQuiz ? setCurrentScreen(ScreenName.QUIZ_RESULT) : setCurrentScreen(ScreenName.LEARNING_PATH)}
        />;
      case ScreenName.QUIZ_RESULT:
        return <QuizResultScreen
          result={lastQuizResult}
          onReview={handleStartReview}
          onContinue={() => setCurrentScreen(ScreenName.LEARNING_PATH)}
        />;
      case ScreenName.PROFILE:
        return <ProfileScreen user={user} />;
      case ScreenName.PARENT_REPORT:
        return <ParentReportScreen user={user} />;
      case ScreenName.CHAT:
        return <ChatScreen />;
      case ScreenName.GAMES:
        return <GameLibraryScreen user={user} setUser={setUser} />;
      case ScreenName.SETTINGS:
        return <SettingsScreen user={user} onLogout={handleLogout} onBack={() => setCurrentScreen(ScreenName.PROFILE)} />;
      default:
        return <WelcomeScreen onStart={() => setCurrentScreen(ScreenName.STUDENT_INFO)} />;
    }
  };

  const isNavigable = [
    ScreenName.LEARNING_PATH,
    ScreenName.PROFILE,
    ScreenName.PARENT_REPORT,
    ScreenName.CHAT,
    ScreenName.GAMES,
    ScreenName.SETTINGS
  ].includes(currentScreen);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-display flex w-full">
      {/* Sidebar for Desktop */}
      {isNavigable && (
        <SidebarNavigation currentScreen={currentScreen} onNavigate={setCurrentScreen} user={user} />
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-h-screen relative overflow-hidden transition-all duration-300 ${isNavigable ? 'md:ml-64' : ''}`}>

        {/* Header with API Key Settings */}
        <Header onOpenSettings={() => setShowKeyModal(true)} hasKey={!!apiKey} />

        <div className="flex-1 w-full h-full overflow-y-auto no-scrollbar relative flex flex-col">
          {/* Error Banner */}
          {errorMsg && <ErrorBanner message={errorMsg} />}

          {/* Content */}
          <div className="flex-1">
            {renderScreen()}
          </div>

          {/* Footer */}
          <Footer />
        </div>

        {/* Loading Overlay */}
        {isGenerating && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-[60] flex flex-col items-center justify-center fixed">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-teal-100 border-t-primary animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-primary animate-pulse" />
              </div>
            </div>
            <p className="mt-4 text-teal-800 font-bold text-lg animate-pulse">AI đang xử lý...</p>
            <p className="text-sm text-gray-500">Đang chuẩn bị nội dung học tập</p>
          </div>
        )}

        {/* Bottom Navigation for Mobile */}
        {isNavigable && (
          <BottomNavigation currentScreen={currentScreen} onNavigate={setCurrentScreen} />
        )}
      </div>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        onSave={handleSaveApiKey}
      />
    </div>
  );
}