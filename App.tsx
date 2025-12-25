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
import { Loader2, AlertTriangle } from 'lucide-react';

const STORAGE_KEY = 'math_genius_user_data_v3_son';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>(ScreenName.WELCOME);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeUnit, setActiveUnit] = useState<LearningUnit | null>(null);

  // Quiz State
  const [lastQuizResult, setLastQuizResult] = useState<QuizResult | null>(null);
  const [isReviewingQuiz, setIsReviewingQuiz] = useState(false);

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
      numerologyNumber: 7, // 02+12+2009 = 2+1+2+2+0+0+9 = 16 -> 1+6=7
      proficiencyLevel: 3,
      history: []
    };
  });

  // Effect: Save to LocalStorage whenever user changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }, [user]);

  // Effect: If user already has a learning path on load, go to Learning Path instead of Welcome (optional UX choice)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.learningPath && parsed.learningPath.length > 0) {
        setCurrentScreen(ScreenName.LEARNING_PATH);
      }
    }
  }, []);


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

  const handleAssessmentNext = (data: { proficiency: number, tags: string[], notes: string }) => {
    setUser(prev => ({
      ...prev,
      proficiencyLevel: data.proficiency,
      assessmentTags: data.tags,
      assessmentNotes: data.notes
    }));
    setCurrentScreen(ScreenName.ANALYSIS_RESULT);
  };

  const handleCreateLearningPath = async (grade: number, topics: string[]) => {
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
      setError(error.message || "Lỗi không xác định từ AI Service");
      // Don't change screen if error
    } finally {
      setIsGenerating(false);
    }
  };

  // Upgrade/Challenge Unit Logic
  const handleUpgradeUnit = async (unit: LearningUnit) => {
    setIsGenerating(true);
    try {
      const newUnit = await generateChallengeUnit(user, unit);
      if (newUnit && user.learningPath) {
        // Update the learning path with the new harder unit
        const updatedPath = user.learningPath.map(u =>
          u.id === unit.id ? newUnit : u
        );
        setUser(prev => ({ ...prev, learningPath: updatedPath }));

        // Immediately start the new unit
        setActiveUnit(newUnit);
        setIsReviewingQuiz(false);
        setLastQuizResult(null);
        setCurrentScreen(ScreenName.QUIZ);
      }
    } catch (error: any) {
      console.error("Failed to generate challenge", error);
      setError(error.message || "Lỗi tạo thử thách");
    } finally {
      setIsGenerating(false);
    }
  };

  // Comprehensive Test Logic
  const handleComprehensiveTest = async () => {
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
      setError(error.message || "Lỗi tạo bài thi");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuizFinish = (result: QuizResult) => {
    // Add timestamp and unit title to result for history
    const finalResult: QuizResult = {
      ...result,
      timestamp: Date.now(),
      unitTitle: activeUnit?.title || "Bài học"
    };

    setLastQuizResult(finalResult);
    setIsReviewingQuiz(false);

    // Update unit status in user profile if it's a regular unit
    if (user.learningPath && activeUnit?.level !== 99) {
      const updatedPath = user.learningPath.map(u => {
        if (u.id === result.unitId) {
          const isPass = (result.score / result.totalQuestions) >= 0.5;
          return { ...u, status: isPass ? 'completed' : 'active' } as any;
        }
        return u;
      });

      // Update User History
      setUser(prev => ({
        ...prev,
        learningPath: updatedPath,
        history: [finalResult, ...(prev.history || [])] // Add new result to start of history
      }));
    } else {
      // Just update history for comprehensive exams
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
          onNext={handleAssessmentNext}
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
            setLastQuizResult(null); // Reset result
            setCurrentScreen(ScreenName.QUIZ);
          }}
          onUpgradeUnit={handleUpgradeUnit}
          onBack={() => setCurrentScreen(ScreenName.CLASS_SELECTION)}
          onStartComprehensiveTest={handleComprehensiveTest}
          onSettings={() => setCurrentScreen(ScreenName.SETTINGS)}
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
        return <ChatScreen user={user} />;
      case ScreenName.GAMES:
        return <GameLibraryScreen user={user} setUser={setUser} />;
      case ScreenName.SETTINGS:
        return <SettingsScreen user={user} onLogout={handleLogout} onBack={() => setCurrentScreen(ScreenName.PROFILE)} />;
      default:
        return <WelcomeScreen onStart={() => setCurrentScreen(ScreenName.STUDENT_INFO)} />;
    }
  };

  // Check if navigation should be visible
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
      <div className={`flex-1 flex flex-col min-h-screen relative overflow-hidden transition-all duration-300 ${isNavigable ? 'md:ml-80' : ''}`}>

        {/* Render Screen (removed max-w-md constraint) */}
        <div className="flex-1 w-full h-full overflow-y-auto no-scrollbar relative">
          {renderScreen()}
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

        {/* Global API Key Modal Check */}
        {!localStorage.getItem('GEMINI_API_KEY') && (
          <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl max-w-md w-full shadow-2xl border border-teal-100 dark:border-teal-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

              <h3 className="font-bold text-xl mb-2 text-teal-900 dark:text-white relative z-10">Yêu cầu kích hoạt</h3>
              <p className="mb-6 text-sm text-gray-600 dark:text-gray-300 relative z-10 leading-relaxed">
                Ứng dụng cần <strong className="text-primary">Gemini API Key</strong> để hoạt động. Key của bạn được lưu an toàn trên trình duyệt này.
              </p>

              <div className="relative z-10 mb-6">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Nhập API Key</label>
                <input
                  className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg p-3 rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                  placeholder="AIza..."
                  onChange={(e) => {
                    localStorage.setItem('GEMINI_API_KEY_TEMP', e.target.value);
                  }}
                />
              </div>

              <div className="flex flex-col gap-3 relative z-10">
                <button onClick={() => {
                  const tempKey = localStorage.getItem('GEMINI_API_KEY_TEMP');
                  if (tempKey && tempKey.length > 10) {
                    localStorage.setItem('GEMINI_API_KEY', tempKey);
                    window.location.reload(); // Reload to clear modal state simply
                  } else {
                    alert("Vui lòng nhập API Key hợp lệ!");
                  }
                }} className="bg-primary hover:bg-primary-dark text-white py-3.5 px-4 rounded-xl font-bold transition-all shadow-lg shadow-teal-500/20 active:scale-[0.98]">
                  Kích hoạt ngay
                </button>

                <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-center text-xs text-gray-500 hover:text-primary mt-2">
                  Chưa có key? <span className="underline decoration-primary/50">Lấy API Key miễn phí tại đây (Google)</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}