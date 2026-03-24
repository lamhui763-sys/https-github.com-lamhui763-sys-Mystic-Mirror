import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { AnalysisResults } from '../types';
import { Wind, Upload, Loader2, Compass, ArrowRight, X, Sparkles, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatDialog } from '../components/ChatDialog';

interface Props {
  onSaveResult: (result: string) => void;
  results: AnalysisResults;
}

const GOALS = [
  { id: 'WEALTH', label: '招財旺運', desc: '提升金錢流動與積累' },
  { id: 'RELATIONSHIP', label: '桃花姻緣', desc: '增進感情和諧與人緣' },
  { id: 'HEALTH', label: '健康安泰', desc: '平衡身心氣場' },
  { id: 'CAREER', label: '事業功名', desc: '催旺文昌與晉升運' },
];

export const FengShuiView: React.FC<Props> = ({ onSaveResult, results }) => {
  const [image, setImage] = useState<string | null>(null);
  const [goal, setGoal] = useState<string>('WEALTH');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyze = async () => {
    if (!image || isLoading) return;
    setIsLoading(true);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("No API Key");
      const ai = new GoogleGenAI({ apiKey });
      
      const selectedGoal = GOALS.find(g => g.id === goal)?.label;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: "你是一位現代與傳統兼修的風水大師。用戶會上傳一張室內環境的照片（如客廳、臥室、辦公室）。請運用「形家長眼法」與「理氣派」風水知識分析照片。重點識別：1. 財位與煞氣 2. 家具擺設的宜忌 3. 光線與氣流。針對用戶選擇的特定目標（如招財、桃花），提供3個具體、可執行的改善建議。請務必引用《陽宅三要》或《沈氏玄空學》等風水經典作為分析依據，確保每一項分析都有其學理來源。語氣專業、客觀且具建設性。請用繁體中文回答。"
        },
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: image.split(',')[1] } },
            { text: `這是我目前的房間照片。我的主要風水訴求是：${selectedGoal}。請分析環境氣場並給出佈局建議。` }
          ]
        }
      });

      const text = response.text || "無法分析環境。";
      setResult(text);
      onSaveResult(text);

    } catch (e: any) {
      console.error(e);
      setResult(`分析受阻: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 bg-[#FEFCE8]">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Controls */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-stone-800 text-white rounded-lg">
                <Wind size={20} />
              </div>
              <h1 className="text-2xl font-bold serif text-stone-900">AI 風水佈局</h1>
            </div>
            <p className="text-stone-500 text-sm">
              上傳空間照片，讓 AI 分析氣場流動，為您打造能量和諧的環境。
            </p>
          </div>

          {/* Image Upload */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden group
              ${image ? 'border-stone-800 bg-black' : 'border-stone-300 hover:bg-stone-50 hover:border-yellow-500'}
            `}
          >
             {image ? (
               <>
                 <img src={image} alt="Room" className="w-full h-full object-contain opacity-80" />
                 <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">更換照片</span>
                 </div>
               </>
             ) : (
               <div className="text-center text-stone-400 group-hover:text-stone-600">
                 <Upload className="mx-auto mb-2" size={32} />
                 <span className="font-medium">上傳空間照片</span>
                 <p className="text-xs mt-1 opacity-60">客廳 / 臥室 / 辦公桌</p>
               </div>
             )}
             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImage} />
          </div>

          {/* Goal Selection */}
          <div>
            <label className="text-sm font-bold text-stone-700 mb-3 block">您希望改善的運勢</label>
            <div className="grid grid-cols-2 gap-3">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGoal(g.id)}
                  className={`
                    p-3 rounded-xl text-left border transition-all relative overflow-hidden
                    ${goal === g.id 
                      ? 'bg-yellow-50 border-yellow-500 text-yellow-900 shadow-sm' 
                      : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'}
                  `}
                >
                  <div className="font-bold text-sm mb-0.5">{g.label}</div>
                  <div className="text-[10px] opacity-70">{g.desc}</div>
                  {goal === g.id && <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={analyze}
            disabled={!image || isLoading}
            className={`
              w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-lg
              ${!image || isLoading 
                ? 'bg-stone-100 text-stone-300 cursor-not-allowed' 
                : 'bg-stone-900 text-white hover:bg-stone-800 shadow-xl hover:scale-[1.02]'}
            `}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Compass size={20} />}
            {isLoading ? '堪輿運算中...' : '開始風水分析'}
          </button>
        </div>

        {/* Right Column: Results */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 h-full min-h-[400px] p-6 overflow-y-auto">
          {result ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="flex items-center gap-2 mb-6 pb-4 border-b border-stone-100 relative">
                 <Sparkles className="text-yellow-600" size={20} />
                 <h2 className="font-serif font-bold text-xl text-stone-800">風水佈局建議</h2>
                 <button 
                        onClick={() => setIsChatOpen(true)}
                        className="absolute top-0 right-0 p-2 bg-yellow-50 text-yellow-900 rounded-full hover:bg-yellow-100 transition-colors"
                    >
                        <MessageSquare size={18} />
                    </button>
               </div>
               <div className="markdown-body text-stone-700 leading-relaxed font-serif">
                 <ReactMarkdown>{result}</ReactMarkdown>
               </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-stone-300 space-y-4">
              <div className="w-24 h-24 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center">
                 <Compass size={40} className="opacity-20" />
              </div>
              <p className="text-sm font-serif text-center max-w-xs">
                風水是環境與人的和諧藝術。<br/>
                上傳照片，揭開空間能量的奧秘。
              </p>
            </div>
          )}
          {isChatOpen && result && (
            <ChatDialog initialContext={result} onClose={() => setIsChatOpen(false)} />
          )}
        </div>

      </div>
    </div>
  );
};