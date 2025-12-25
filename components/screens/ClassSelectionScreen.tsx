
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, FunctionSquare, Shapes, BarChart2, TrendingUp, Calculator, Lightbulb, Sparkles, Edit3, Plus, School, BookOpen, GraduationCap, Loader2, Binary, Sigma, Box, Circle, Triangle, Ruler, Scale, Divide, FileText, BrainCircuit, Trophy, ArrowRight, Timer } from 'lucide-react';

interface Props {
  onNext: (grade: number, topics: string[]) => void;
  onBack: () => void;
  isGenerating: boolean;
}

interface Topic {
  id: string;
  label: string;
  subLabel: string;
  icon: React.ElementType;
  isReview?: boolean; // Flag to style exam reviews differently
}

type EducationLevel = 'primary' | 'middle' | 'high';

// Standard Exam Review Topics to append to all grades
const STANDARD_EXAMS: Topic[] = [
    { id: 'review-mid-1', label: 'Ôn tập Giữa Học kỳ 1', subLabel: 'Tổng hợp kiến thức SGK', icon: FileText, isReview: true },
    { id: 'review-end-1', label: 'Ôn tập Cuối Học kỳ 1', subLabel: 'Đề thi thử & Tổng hợp', icon: FileText, isReview: true },
    { id: 'review-mid-2', label: 'Ôn tập Giữa Học kỳ 2', subLabel: 'Tổng hợp kiến thức SGK', icon: FileText, isReview: true },
    { id: 'review-end-2', label: 'Ôn tập Cuối Học kỳ 2', subLabel: 'Đề thi thử & Tổng hợp', icon: FileText, isReview: true },
];

const SPECIAL_EXAMS: Record<number, Topic> = {
  9: { id: 'review-grade-10', label: 'Ôn thi vào lớp 10', subLabel: 'Luyện đề tuyển sinh THPT', icon: Trophy, isReview: true },
  12: { id: 'review-grad', label: 'Ôn thi Tốt nghiệp THPT', subLabel: 'Luyện đề THPT Quốc gia', icon: Trophy, isReview: true }
};

// Full Curriculum Data Mapping based on KNTT Textbook PDF
const CURRICULUM_DATA: Record<number, Topic[]> = {
  // --- TIỂU HỌC ---
  1: [
    { id: 'g1-num', label: 'Số tự nhiên 0-100', subLabel: 'Đếm, đọc, viết, so sánh', icon: Calculator },
    { id: 'g1-calc', label: 'Phép cộng & trừ', subLabel: 'Trong phạm vi 100', icon: Plus },
    { id: 'g1-geo', label: 'Hình học phẳng', subLabel: 'Vuông, Tròn, Tam giác', icon: Shapes },
    { id: 'g1-meas', label: 'Đo lường cơ bản', subLabel: 'Độ dài (cm), Thời gian', icon: Ruler },
  ],
  2: [
    { id: 'g2-num', label: 'Số đến 1000', subLabel: 'Cấu tạo số, so sánh', icon: Calculator },
    { id: 'g2-calc', label: 'Phép cộng trừ nhớ', subLabel: 'Phạm vi 100 & 1000', icon: Plus },
    { id: 'g2-mul-div', label: 'Nhân & Chia', subLabel: 'Bảng cửu chương 2-5', icon: Divide },
    { id: 'g2-geo', label: 'Hình học', subLabel: 'Tứ giác, Khối trụ/cầu', icon: Shapes },
    { id: 'g2-meas', label: 'Đại lượng', subLabel: 'kg, lít, km, ngày-giờ', icon: Scale },
  ],
  3: [
    { id: 'g3-num', label: 'Số đến 100.000', subLabel: 'Tính nhẩm & Làm tròn', icon: Calculator },
    { id: 'g3-calc', label: 'Phép tính nâng cao', subLabel: 'Nhân chia số nhiều chữ số', icon: Divide },
    { id: 'g3-geo', label: 'Hình phẳng', subLabel: 'Chu vi, Diện tích Chữ nhật/Vuông', icon: Box },
    { id: 'g3-meas', label: 'Đo lường', subLabel: 'mm, g, ml, nhiệt độ', icon: Ruler },
    { id: 'g3-stat', label: 'Thống kê', subLabel: 'Bảng số liệu, Khả năng xảy ra', icon: BarChart2 },
  ],
  4: [
    { id: 'g4-num', label: 'Số tự nhiên lớp', subLabel: 'Hàng triệu, Dãy số', icon: Calculator },
    { id: 'g4-calc', label: '4 Phép tính', subLabel: 'Tính chất giao hoán/kết hợp', icon: FunctionSquare },
    { id: 'g4-frac', label: 'Phân số', subLabel: 'Khái niệm & Phép tính', icon: Divide },
    { id: 'g4-geo', label: 'Hình học', subLabel: 'Góc, Bình hành, Thoi', icon: Shapes },
    { id: 'g4-avg', label: 'Trung bình cộng', subLabel: 'Bài toán lời văn', icon: TrendingUp },
  ],
  5: [
    { id: 'g5-dec', label: 'Số thập phân', subLabel: 'Cấu tạo & 4 Phép tính', icon: Calculator },
    { id: 'g5-perc', label: 'Tỉ số phần trăm', subLabel: 'Ứng dụng thực tế', icon: TrendingUp },
    { id: 'g5-geo', label: 'Hình học', subLabel: 'Tam giác, Hình thang, Hình tròn', icon: Triangle },
    { id: 'g5-meas', label: 'Diện tích & Thể tích', subLabel: 'Hình hộp, Lập phương', icon: Box },
    { id: 'g5-motion', label: 'Chuyển động đều', subLabel: 'Vận tốc, Quãng đường, Thời gian', icon: Timer },
  ],
  
  // --- THCS ---
  6: [
    { id: 'g6-nat', label: 'Số tự nhiên', subLabel: 'Lũy thừa, Chia hết, ƯCLN, BCNN', icon: Binary },
    { id: 'g6-int', label: 'Số nguyên', subLabel: 'Số âm, Phép tính số nguyên', icon: Calculator },
    { id: 'g6-frac', label: 'Phân số & Thập phân', subLabel: 'Tính toán & Làm tròn', icon: Divide },
    { id: 'g6-geo', label: 'Hình học trực quan', subLabel: 'Tam giác đều, Lục giác, Hình thang cân', icon: Shapes },
    { id: 'g6-stat', label: 'Thống kê & Xác suất', subLabel: 'Biểu đồ tranh/cột', icon: BarChart2 },
  ],
  7: [
    { id: 'g7-rat', label: 'Số hữu tỉ & Số thực', subLabel: 'Căn bậc hai, Giá trị tuyệt đối', icon: Calculator },
    { id: 'g7-geo', label: 'Góc & Đường thẳng', subLabel: 'Song song, Tam giác bằng nhau', icon: Triangle },
    { id: 'g7-solid', label: 'Hình khối', subLabel: 'Hộp chữ nhật, Lăng trụ đứng', icon: Box },
    { id: 'g7-alg', label: 'Biểu thức đại số', subLabel: 'Đa thức một biến', icon: FunctionSquare },
    { id: 'g7-prob', label: 'Xác suất', subLabel: 'Biến cố ngẫu nhiên', icon: Lightbulb },
  ],
  8: [
    { id: 'g8-alg', label: 'Đa thức', subLabel: 'Hằng đẳng thức, Phân tích đa thức', icon: FunctionSquare },
    { id: 'g8-frac', label: 'Phân thức đại số', subLabel: 'Cộng trừ nhân chia', icon: Divide },
    { id: 'g8-func', label: 'Hàm số bậc nhất', subLabel: 'Đồ thị y = ax + b', icon: TrendingUp },
    { id: 'g8-geo', label: 'Tứ giác', subLabel: 'Thang cân, Bình hành, Thoi, Vuông', icon: Shapes },
    { id: 'g8-thales', label: 'Định lý Thalès', subLabel: 'Tam giác đồng dạng', icon: Triangle },
    { id: 'g8-stat', label: 'Phân tích dữ liệu', subLabel: 'Biểu đồ & Xác suất', icon: BarChart2 },
  ],
  9: [
    { id: 'g9-sys', label: 'Hệ phương trình', subLabel: 'Bậc nhất hai ẩn', icon: FunctionSquare },
    { id: 'g9-ineq', label: 'Bất phương trình', subLabel: 'Bậc nhất một ẩn', icon: Scale },
    { id: 'g9-sqrt', label: 'Căn bậc hai/ba', subLabel: 'Biến đổi căn thức', icon: Calculator },
    { id: 'g9-quad', label: 'Hàm số y = ax²', subLabel: 'Phương trình bậc hai, Vi-ét', icon: TrendingUp },
    { id: 'g9-trig', label: 'Hệ thức lượng', subLabel: 'Tam giác vuông, Sin Cos Tan', icon: Triangle },
    { id: 'g9-circle', label: 'Đường tròn', subLabel: 'Góc, Tiếp tuyến, Nội tiếp', icon: Circle },
    { id: 'g9-solid', label: 'Hình không gian', subLabel: 'Trụ, Nón, Cầu', icon: Box },
  ],

  // --- THPT ---
  10: [
    { id: 'g10-set', label: 'Mệnh đề & Tập hợp', subLabel: 'Logic toán học', icon: Binary },
    { id: 'g10-ineq', label: 'Bất phương trình', subLabel: 'Hệ BPT bậc nhất 2 ẩn', icon: Scale },
    { id: 'g10-func', label: 'Hàm số bậc hai', subLabel: 'Đồ thị Parabol', icon: TrendingUp },
    { id: 'g10-vec', label: 'Vectơ', subLabel: 'Tổng hiệu, Tích vô hướng', icon: ArrowLeft },
    { id: 'g10-trig', label: 'Hệ thức lượng', subLabel: 'Định lý Sin, Cosin', icon: Triangle },
    { id: 'g10-stat', label: 'Thống kê', subLabel: 'Số đặc trưng, Xác suất', icon: BarChart2 },
  ],
  11: [
    { id: 'g11-trig', label: 'Lượng giác', subLabel: 'Hàm số & Phương trình', icon: Triangle },
    { id: 'g11-seq', label: 'Dãy số', subLabel: 'Cấp số cộng, Cấp số nhân', icon: Binary },
    { id: 'g11-lim', label: 'Giới hạn & Liên tục', subLabel: 'Giới hạn dãy/hàm', icon: TrendingUp },
    { id: 'g11-exp', label: 'Mũ & Logarit', subLabel: 'Hàm số & Phương trình', icon: Calculator },
    { id: 'g11-deriv', label: 'Đạo hàm', subLabel: 'Quy tắc tính & Tiếp tuyến', icon: FunctionSquare },
    { id: 'g11-geo', label: 'Quan hệ vuông góc', subLabel: 'Đường thẳng, Mặt phẳng', icon: Box },
    { id: 'g11-prob', label: 'Xác suất', subLabel: 'Biến cố hợp/giao/độc lập', icon: Lightbulb },
  ],
  12: [
    { id: 'g12-app', label: 'Ứng dụng đạo hàm', subLabel: 'Đơn điệu, Cực trị, Tiệm cận', icon: TrendingUp },
    { id: 'g12-vec', label: 'Vectơ không gian', subLabel: 'Hệ tọa độ Oxyz', icon: Box },
    { id: 'g12-stat', label: 'Thống kê', subLabel: 'Độ phân tán dữ liệu ghép nhóm', icon: BarChart2 },
    { id: 'g12-int', label: 'Nguyên hàm Tích phân', subLabel: 'Diện tích, Thể tích', icon: Sigma },
    { id: 'g12-geo', label: 'Phương pháp tọa độ', subLabel: 'Mặt phẳng, Đường thẳng, Mặt cầu', icon: Circle },
    { id: 'g12-prob', label: 'Xác suất', subLabel: 'XS có điều kiện, Công thức Bayes', icon: Lightbulb },
  ]
};

export const ClassSelectionScreen: React.FC<Props> = ({ onNext, onBack, isGenerating }) => {
  const [educationLevel, setEducationLevel] = useState<EducationLevel>('high');
  const [selectedGrade, setSelectedGrade] = useState<number>(11);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [customTopicInput, setCustomTopicInput] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);

  const levels: { id: EducationLevel; label: string; icon: React.ElementType; grades: number[] }[] = [
    { id: 'primary', label: 'Tiểu học', icon: BookOpen, grades: [1, 2, 3, 4, 5] },
    { id: 'middle', label: 'THCS', icon: School, grades: [6, 7, 8, 9] },
    { id: 'high', label: 'THPT', icon: GraduationCap, grades: [10, 11, 12] },
  ];

  // Effect to update topics when grade changes
  useEffect(() => {
    const baseTopics = CURRICULUM_DATA[selectedGrade] || [];
    
    // Construct topic list with Exams
    let allTopics = [...baseTopics, ...STANDARD_EXAMS];
    
    // Add special exams for grade 9 and 12
    if (SPECIAL_EXAMS[selectedGrade]) {
        allTopics = [...allTopics, SPECIAL_EXAMS[selectedGrade]];
    }
    
    setTopics(allTopics);
    
    // Auto select first 3 regular topics by default
    if (baseTopics.length >= 3) {
      setSelectedTopics(baseTopics.slice(0, 3).map(t => t.id));
    } else {
      setSelectedTopics(baseTopics.map(t => t.id));
    }
  }, [selectedGrade]);

  const handleLevelChange = (level: EducationLevel) => {
    setEducationLevel(level);
    const levelData = levels.find(l => l.id === level);
    if (levelData && !levelData.grades.includes(selectedGrade)) {
        setSelectedGrade(levelData.grades[0]);
    }
  };

  const toggleTopic = (id: string) => {
    if (selectedTopics.includes(id)) {
      setSelectedTopics(selectedTopics.filter(t => t !== id));
    } else {
      setSelectedTopics([...selectedTopics, id]);
    }
  };

  const selectAllTopics = () => {
    if (selectedTopics.length === topics.length) {
      setSelectedTopics([]);
    } else {
      setSelectedTopics(topics.map(t => t.id));
    }
  };

  const handleAddTopic = () => {
    if (!customTopicInput.trim()) return;
    const newId = `custom-${Date.now()}`;
    const newTopic: Topic = {
      id: newId,
      label: customTopicInput,
      subLabel: 'Chủ đề tự chọn',
      icon: Sparkles
    };
    setTopics([...topics, newTopic]);
    setSelectedTopics([...selectedTopics, newId]);
    setCustomTopicInput('');
  };

  const currentLevelData = levels.find(l => l.id === educationLevel);

  const handleCreatePath = () => {
    const selectedTopicLabels = topics
        .filter(t => selectedTopics.includes(t.id))
        .map(t => t.label);
    onNext(selectedGrade, selectedTopicLabels);
  };

  return (
    <div className="bg-primary-surface dark:bg-dark-bg min-h-screen font-display text-gray-900 dark:text-gray-100 transition-colors flex flex-col pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-primary-surface/90 dark:bg-dark-bg/95 backdrop-blur-md border-b border-teal-100 dark:border-gray-800">
        <div className="flex items-center p-4 justify-between max-w-5xl mx-auto w-full">
          <button onClick={onBack} className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-teal-100 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeft />
          </button>
          <div className="flex flex-col items-center">
            <h2 className="text-lg font-bold leading-tight">Thiết lập lộ trình</h2>
            <div className="flex gap-1 mt-1">
              <div className="w-8 h-1 bg-primary rounded-full"></div>
              <div className="w-2 h-1 bg-teal-200 dark:bg-gray-700 rounded-full"></div>
              <div className="w-2 h-1 bg-teal-200 dark:bg-gray-700 rounded-full"></div>
            </div>
          </div>
          <div className="size-10"></div>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 pt-6">
        <div className="mb-4 text-center md:text-left">
          <h2 className="text-[28px] font-bold leading-tight mb-2">Chọn lớp học của bạn</h2>
          <p className="text-teal-800/70 dark:text-gray-400 text-base font-normal">
             Hãy cho AI biết bạn đang học lớp mấy để chúng tôi chuẩn bị lộ trình phù hợp.
          </p>
        </div>

        {/* Education Level Tabs */}
        <div className="flex p-1.5 bg-white dark:bg-dark-surface border border-teal-100 dark:border-gray-700 rounded-xl mb-6 shadow-sm max-w-lg mx-auto md:mx-0">
          {levels.map((level) => {
            const Icon = level.icon;
            const isActive = educationLevel === level.id;
            return (
              <button
                key={level.id}
                onClick={() => handleLevelChange(level.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${
                  isActive 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'} />
                {level.label}
              </button>
            )
          })}
        </div>

        {/* Horizontal Class Selector (Filtered) */}
        <div className="w-full overflow-x-auto no-scrollbar pb-2 px-1 mb-6">
          <div className="flex gap-3 w-max mx-auto md:mx-0">
            {currentLevelData?.grades.map((grade) => {
              const isSelected = selectedGrade === grade;
              return (
                <button 
                  key={grade} 
                  onClick={() => setSelectedGrade(grade)}
                  className={`relative flex h-14 min-w-[80px] shrink-0 items-center justify-center rounded-2xl transition-all shadow-sm
                    ${isSelected 
                      ? 'bg-white dark:bg-dark-surface border-2 border-primary text-teal-900 dark:text-white font-bold scale-105 shadow-md z-10' 
                      : 'bg-white dark:bg-dark-surface border border-teal-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-primary/50'
                    }`}
                >
                  <span className="isSelected ? 'text-lg' : 'text-base font-medium'">Lớp {grade}</span>
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-1 border-2 border-white dark:border-dark-bg shadow-sm">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-px w-full bg-teal-200/50 dark:bg-gray-800 mb-6"></div>

        {/* Topics */}
        <div className="mb-5 flex justify-between items-end">
          <div>
            <h3 className="text-2xl font-bold leading-tight mb-1">Chủ đề & Ôn thi</h3>
            <p className="text-sm text-teal-800/70 dark:text-gray-400">Nội dung Lớp {selectedGrade}</p>
          </div>
          <button 
            onClick={selectAllTopics}
            className="text-sm font-medium text-teal-700 dark:text-primary hover:underline pb-1"
          >
            {selectedTopics.length === topics.length ? 'Bỏ chọn' : 'Chọn tất cả'}
          </button>
        </div>

        {topics.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <Sparkles className="w-10 h-10 mb-2 opacity-50" />
              <p>Chưa có dữ liệu cho lớp này</p>
           </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
              {topics.map((topic) => {
                const isSelected = selectedTopics.includes(topic.id);
                const Icon = topic.icon;
                const isReview = topic.isReview;
                
                return (
                  <div 
                    key={topic.id}
                    onClick={() => toggleTopic(topic.id)}
                    className={`relative flex flex-col items-start p-4 rounded-2xl cursor-pointer transition-all duration-200
                      ${isSelected 
                        ? (isReview ? 'bg-orange-50 border-2 border-orange-400 dark:bg-orange-900/10' : 'bg-white dark:bg-dark-surface border-2 border-primary shadow-sm') 
                        : (isReview ? 'bg-orange-50/50 border border-orange-200 dark:border-orange-800/30' : 'bg-white/60 dark:bg-dark-surface border border-transparent dark:border-gray-700 hover:bg-white hover:shadow-md')
                      }`}
                  >
                      <div className="flex justify-between w-full mb-3">
                        <div className={`p-2 rounded-lg ${isSelected ? (isReview ? 'bg-orange-200 text-orange-900' : 'bg-primary/20 text-teal-900') : (isReview ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300')}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        {isSelected ? (
                          <div className={isReview ? 'text-orange-500' : 'text-primary'}><Check className="w-5 h-5 fill-current" /></div>
                        ) : (
                          <div className={`w-5 h-5 rounded-full border-2 ${isReview ? 'border-orange-200' : 'border-gray-300 dark:border-gray-600'}`}></div>
                        )}
                      </div>
                      <span className={`text-lg font-bold leading-tight ${isReview ? 'text-orange-900 dark:text-orange-100' : ''}`}>{topic.label}</span>
                      <span className={`text-xs mt-1 truncate w-full ${isReview ? 'text-orange-700 dark:text-orange-200' : 'text-gray-500 dark:text-gray-400'}`}>{topic.subLabel}</span>
                  </div>
                );
              })}
          </div>
        )}

        {/* Add Custom Topic */}
        <div className="mt-4 mb-2 max-w-lg">
           <h3 className="text-lg font-bold leading-tight mb-3">Chủ đề khác?</h3>
           <div className="relative flex items-center shadow-sm rounded-2xl bg-white dark:bg-dark-surface border border-teal-100 dark:border-gray-700 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Edit3 className="text-gray-400 w-5 h-5" />
              </div>
              <input 
                className="block w-full p-4 pl-12 pr-20 text-sm text-gray-900 bg-transparent border-none rounded-2xl focus:ring-0 placeholder-gray-400 dark:text-white" 
                placeholder="Nhập chủ đề bạn muốn học thêm..." 
                type="text"
                value={customTopicInput}
                onChange={(e) => setCustomTopicInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTopic();
                }}
              />
              <button 
                onClick={handleAddTopic}
                disabled={!customTopicInput.trim()}
                className="absolute right-2.5 bottom-2.5 bg-primary/10 hover:bg-primary hover:text-white text-teal-800 font-medium rounded-lg text-sm px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                 <Plus className="w-4 h-4" />
                 Thêm
              </button>
           </div>
        </div>
        
        <div className="h-10"></div>
      </div>

       <div className="fixed bottom-0 left-0 md:left-64 right-0 w-full p-4 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-lg border-t border-teal-100 dark:border-gray-800 z-20">
         <div className="max-w-md mx-auto">
            <button 
            onClick={handleCreatePath}
            disabled={selectedTopics.length < 1 || isGenerating}
            className={`relative flex w-full items-center justify-center gap-2 rounded-xl p-4 transition-all active:scale-[0.98] shadow-lg overflow-hidden
                ${selectedTopics.length < 1 || isGenerating
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-primary text-teal-950 shadow-primary/30 hover:bg-primary-dark hover:text-white'}`}
            >
             {/* Background Pulse for AI Awareness */}
             {!isGenerating && selectedTopics.length > 0 && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
             )}

            {isGenerating ? (
                <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-lg font-bold leading-tight">Đang phân tích dữ liệu...</span>
                </>
            ) : (
                <>
                <BrainCircuit className="w-5 h-5" />
                <span className="text-lg font-bold leading-tight">Tạo lộ trình tối ưu (AI)</span>
                </>
            )}
            </button>
            <p className="text-[10px] text-center text-teal-800/60 dark:text-gray-500 mt-2 font-medium">
               * AI sẽ tự động phân tích lịch sử học tập để điều chỉnh độ khó bài học.
            </p>
         </div>
      </div>
    </div>
  );
};
