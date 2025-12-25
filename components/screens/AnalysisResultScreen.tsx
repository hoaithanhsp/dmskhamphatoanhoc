import React from 'react';
import { ArrowLeft, Calculator, Sparkles, BrainCircuit, BookOpen, Target, Brain, PenTool, Lightbulb, TrendingUp, AlertTriangle, Zap, Map, ArrowRight } from 'lucide-react';
import { UserProfile } from '../../types';

interface Props {
  user: UserProfile;
  onNext: () => void;
  onBack: () => void;
}

export const AnalysisResultScreen: React.FC<Props> = ({ user, onNext, onBack }) => {
  // Fallback data if profile is missing (though it should be calculated)
  const profile = user.numerologyProfile || {
    lifePathNumber: 7,
    title: "Nhà Tư Duy Phân Tích",
    overview: "Con sở hữu tư duy phân tích sắc bén và trực giác mạnh mẽ. Con thích tự mình khám phá nguyên lý của các bài toán hơn là học vẹt công thức.",
    learningStyle: "Tự học, nghiên cứu sâu",
    aptitude: "Tập trung cao độ khi làm việc độc lập",
    motivation: "Khám phá chân lý, hiểu bản chất vấn đề",
    mathApproach: "Logic, phân tích từng bước, tìm nguyên nhân gốc rễ",
    strengths: ["Nhạy bén với hình học không gian", "Tốc độ tính nhẩm nhanh"],
    challenges: ["Dễ mất kiên nhẫn", "Cần cải thiện trình bày"],
    effectiveMethod: "Đọc sách chuyên sâu, giải đố logic",
    environment: "Yên tĩnh, riêng tư, không bị làm phiền",
    conclusion: "Hãy tạo điều kiện cho con tự do khám phá tri thức theo cách riêng."
  };

  const AnalysisCard = ({ icon: Icon, title, content, colorClass = "text-teal-700 bg-teal-50" }: { icon: any, title: string, content: React.ReactNode, colorClass?: string }) => (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-white/50 hover:shadow-md transition-all duration-300 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-3 pb-2 border-b border-gray-100">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">{title}</h3>
      </div>
      <div className="text-sm text-gray-600 leading-relaxed font-medium flex-1">
        {content}
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-[#2dd4bf] to-[#0d9488] min-h-screen font-display antialiased text-slate-800 flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-0"></div>
      <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/20 rounded-full blur-3xl pointer-events-none z-0"></div>
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-8 pb-2">
        <button onClick={onBack} className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition-colors text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 text-white">
          <Calculator className="w-6 h-6 drop-shadow-sm" />
          <span className="font-bold text-sm tracking-tight drop-shadow-sm max-w-[200px] text-right leading-tight">KHÁM PHÁ TOÁN HỌC CÙNG ĐẶNG MINH SƠN</span>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="relative z-10 flex-1 w-full px-4 pb-32 overflow-y-auto no-scrollbar">
        <div className="text-center mb-6 mt-4">
          <h1 className="text-white text-2xl font-bold mb-1 leading-tight drop-shadow-sm">Kết quả phân tích <br/> cá nhân hóa</h1>
          <p className="text-teal-50 text-sm font-medium opacity-90">Hồ sơ Thần số học & Học tập</p>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-teal-900/10 mb-6 relative overflow-hidden">
           <div className="absolute -top-6 -right-6 text-teal-50 pointer-events-none opacity-50">
             <BrainCircuit size={160} strokeWidth={1} />
           </div>
           <div className="relative z-10 flex flex-col items-center text-center">
             <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-[11px] font-bold mb-4 tracking-wide uppercase border border-orange-100">
               <Sparkles className="w-3.5 h-3.5" />
               Số chủ đạo
             </div>
             <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-light to-primary-dark flex items-center justify-center text-white shadow-lg shadow-teal-500/30 mb-3 text-4xl font-bold">
               {profile.lifePathNumber}
             </div>
             <h2 className="text-slate-800 text-2xl font-bold leading-tight mb-2">{profile.title}</h2>
             <p className="text-slate-600 text-sm leading-relaxed max-w-md mx-auto">
               {profile.overview}
             </p>
           </div>
        </div>

        {/* Detailed Grid - 2 Columns x 5 Rows (roughly) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
            {/* 1. Phong cách học tập */}
            <AnalysisCard 
              icon={BookOpen} 
              title="Phong cách học tập" 
              content={profile.learningStyle} 
              colorClass="bg-blue-50 text-blue-600"
            />

            {/* 2. Khiếu năng lực tập trung */}
            <AnalysisCard 
              icon={Brain} 
              title="Năng lực tập trung" 
              content={profile.aptitude} 
              colorClass="bg-purple-50 text-purple-600"
            />

            {/* 3. Động lực học tập */}
            <AnalysisCard 
              icon={Target} 
              title="Động lực học tập" 
              content={profile.motivation} 
              colorClass="bg-red-50 text-red-600"
            />

            {/* 4. Cách tiếp cận bài toán */}
            <AnalysisCard 
              icon={PenTool} 
              title="Tiếp cận bài toán" 
              content={profile.mathApproach} 
              colorClass="bg-indigo-50 text-indigo-600"
            />

            {/* 5. Điểm mạnh nổi bật */}
            <AnalysisCard 
              icon={TrendingUp} 
              title="Điểm mạnh nổi bật" 
              content={
                <ul className="space-y-2">
                  {profile.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></div>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              }
              colorClass="bg-green-50 text-green-600"
            />

            {/* 6. Thách thức cần khắc phục */}
            <AnalysisCard 
              icon={AlertTriangle} 
              title="Thách thức" 
              content={
                <ul className="space-y-2">
                  {profile.challenges.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0"></div>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              }
              colorClass="bg-orange-50 text-orange-600"
            />

            {/* 7. Phương pháp học hiệu quả */}
            <AnalysisCard 
              icon={Lightbulb} 
              title="Phương pháp hiệu quả" 
              content={profile.effectiveMethod} 
              colorClass="bg-yellow-50 text-yellow-600"
            />

            {/* 8. Môi trường lý tưởng */}
            <AnalysisCard 
              icon={Map} 
              title="Môi trường lý tưởng" 
              content={profile.environment} 
              colorClass="bg-cyan-50 text-cyan-600"
            />
            
            {/* 9. Kết luận chung (Full width on mobile if desired, but keeping grid for consistency) */}
            <div className="md:col-span-2">
               <AnalysisCard 
                icon={Zap} 
                title="Khuyến nghị chung" 
                content={<span className="font-semibold text-teal-800">{profile.conclusion}</span>} 
                colorClass="bg-teal-100 text-teal-700"
              />
            </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 w-full z-20 px-6 pt-4 pb-8 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-[2rem] max-w-md mx-auto">
        <button 
          onClick={onNext}
          className="w-full flex cursor-pointer items-center justify-center rounded-2xl h-14 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] transition-all duration-200 text-white text-lg font-bold shadow-xl shadow-slate-900/20 group"
        >
          <span>Xem lộ trình học</span>
          <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};