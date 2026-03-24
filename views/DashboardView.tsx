
import React, { useState, useEffect } from 'react';
import { Sparkles, Sun, ArrowRight, CheckCircle2, Circle, Calendar, Loader2, Star, Heart, Briefcase, Coins, Compass, X, Ban, Zap, BookOpen, Activity, RotateCcw } from 'lucide-react';
import { AnalysisResults, ViewMode } from '../types';
import { GoogleGenAI } from '@google/genai';

interface Props {
  results: AnalysisResults;
  onViewChange: (mode: ViewMode) => void;
  onUpdateBirthInfo: (date: string, time: string) => void;
  onUpdateDailyGuidance: (guidance: string, dateStr: string) => void;
}

export const DashboardView: React.FC<Props> = ({ results, onViewChange, onUpdateBirthInfo, onUpdateDailyGuidance }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const getLocalTodayString = () => {
    const now = new Date();
    return now.toLocaleDateString('en-CA'); 
  };

  const todayStr = getLocalTodayString();
  
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [time, setTime] = useState(results.birthTime || '');

  useEffect(() => {
    if (results.birthDate) {
      const parts = results.birthDate.split('-');
      if (parts.length === 3) {
        setYear(parts[0]);
        setMonth(parts[1]);
        setDay(parts[2]);
      }
    }
  }, [results.birthDate]);

  const generateSeed = (birthDate: string, dateStr: string) => {
    const str = birthDate + dateStr;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; 
    }
    return Math.abs(hash);
  };

  const generateGuidance = async (overrideDate?: string, overrideTime?: string) => {
    const targetDate = overrideDate || results.birthDate;
    const targetTime = overrideTime || results.birthTime;
    if (!targetDate) return;

    setIsLoading(true);
    setError(null);
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) return;
      const ai = new GoogleGenAI({ apiKey });
      
      const stableSeed = generateSeed(targetDate, todayStr);

      const prompt = `
        你是一位極其嚴謹的八字命理大師。
        用戶生辰：${targetDate}，時間 ${targetTime || '未知'}。
        觀測日期（今日）：${todayStr}。

        任務：
        1. 嚴禁與昨日內容雷同。必須針對今日 (${todayStr}) 的流日干支進行獨立推演。
        2. 推算今日流日天干地支，分析與用戶日主的五行關係。
        
        請嚴格遵守以下輸出格式（不要使用 ** 符號加粗標籤，直接輸出內容）：

        [BASIS]
        (在這裡寫下今日流日干支與命理依據)
        
        [RATING]
        (1-5 數字)
        
        [QUOTE]
        (一句今日核心金句)
        
        [CAREER]
        (事業學業建議)
        
        [LOVE]
        (感情姻緣建議)
        
        [WEALTH]
        (財運投資建議)
        
        [HEALTH]
        (身心健康建議)
        
        [LUCK]
        (開運色與數字)
        
        [DO]
        (宜做的事)
        
        [DONT]
        (忌做的事)

        請用繁體中文回覆。
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          seed: stableSeed,
          temperature: 0.1, // 略微增加隨機性以確保每天內容不同
        }
      });

      if (response.text) {
        onUpdateDailyGuidance(response.text, todayStr);
      }
    } catch (e: any) {
      setError("連線受阻，請稍後重試");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (results.birthDate) {
      if (!results.dailyGuidance || results.dailyGuidanceDate !== todayStr) {
        generateGuidance();
      }
    }
  }, [results.birthDate, todayStr]);

  // 更強大的解析邏輯：尋找標籤，直到下一個標籤出現為止
  const parseContent = (tag: string) => {
    if (!results.dailyGuidance) return '';
    const text = results.dailyGuidance;
    
    // 移除 AI 可能加上的 Markdown 格式符號
    const cleanText = text.replace(/\*\*/g, '');
    
    // 正則表達式：尋找 [TAG] 到下一個 [ 或者字串結束
    const regex = new RegExp(`\\[${tag}\\]([\\s\\S]*?)(?=\\[|$)`);
    const match = cleanText.match(regex);
    
    if (match && match[1]) {
      // 移除可能殘留的 [END] 標籤
      return match[1].replace(/\[END\]/g, '').trim();
    }
    return '';
  };

  const handleSaveBirthInfo = () => {
    if (year && month && day) {
      const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      onUpdateBirthInfo(formattedDate, time);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full px-5 py-6 overflow-y-auto pb-24 bg-[#FEFCE8]">
      
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 animate-in zoom-in-95 p-8 border border-stone-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold serif flex items-center gap-2"><Calendar className="text-yellow-600" /> 設定生辰</h3>
              <X className="text-stone-300 cursor-pointer" onClick={() => setIsModalOpen(false)} />
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-2">
                <input type="number" placeholder="年" value={year} onChange={e=>setYear(e.target.value)} className="p-3 bg-stone-50 border rounded-xl text-center font-bold outline-none focus:ring-2 focus:ring-yellow-400" />
                <input type="number" placeholder="月" value={month} onChange={e=>setMonth(e.target.value)} className="p-3 bg-stone-50 border rounded-xl text-center font-bold outline-none focus:ring-2 focus:ring-yellow-400" />
                <input type="number" placeholder="日" value={day} onChange={e=>setDay(e.target.value)} className="p-3 bg-stone-50 border rounded-xl text-center font-bold outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
              <select value={time} onChange={e=>setTime(e.target.value)} className="w-full p-4 bg-stone-50 border rounded-xl font-medium outline-none focus:ring-2 focus:ring-yellow-400 appearance-none">
                <option value="">選擇時辰</option>
                <option value="00:00">子 (23-01)</option>
                <option value="02:00">丑 (01-03)</option>
                <option value="04:00">寅 (03-05)</option>
                <option value="06:00">卯 (05-07)</option>
                <option value="08:00">辰 (07-09)</option>
                <option value="10:00">巳 (09-11)</option>
                <option value="12:00">午 (11-13)</option>
                <option value="14:00">未 (13-15)</option>
                <option value="16:00">申 (15-17)</option>
                <option value="18:00">酉 (17-19)</option>
                <option value="20:00">戌 (19-21)</option>
                <option value="22:00">亥 (21-23)</option>
              </select>
              <button onClick={handleSaveBirthInfo} className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold text-lg active:scale-95 transition-transform shadow-lg">更新並推演</button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 p-4 bg-stone-900 rounded-[2rem] shadow-xl flex items-center justify-between text-white border border-stone-800">
        <div className="flex items-center gap-3 pl-1">
          <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center text-yellow-500 border border-yellow-500/20">
            <Sun size={20} className="animate-pulse" />
          </div>
          <span className="text-sm font-bold serif">{results.birthDate ? '今日流日氣場已就緒' : '請先解鎖生辰'}</span>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-yellow-600 text-white px-5 py-2 rounded-xl text-xs font-bold active:scale-95 flex items-center gap-1">
          {results.birthDate ? '修改生辰' : '立即設定'} <ArrowRight size={14} />
        </button>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4 px-1">
           <h2 className="text-2xl font-bold text-stone-900 serif">每日指引</h2>
           <div className="flex items-center gap-2">
              <button 
                onClick={() => generateGuidance()} 
                disabled={isLoading || !results.birthDate}
                className="p-2 text-stone-400 hover:text-stone-800 transition-colors"
                title="重新推演"
              >
                <RotateCcw size={16} className={isLoading ? 'animate-spin' : ''} />
              </button>
              <p className="text-[10px] text-stone-400 font-serif italic uppercase tracking-widest">
                {new Date().toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'long' })}
              </p>
           </div>
        </div>

        {!results.birthDate ? (
          <div className="bg-white rounded-[2rem] border border-stone-200 p-10 text-center shadow-sm">
             <Compass size={48} className="mx-auto text-stone-200 mb-4" />
             <p className="text-stone-400 text-sm serif italic mb-6">輸入生辰後，AI 將根據每日天干地支變動為您推演</p>
             <button onClick={() => setIsModalOpen(true)} className="bg-stone-900 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md">立即啟動</button>
          </div>
        ) : isLoading ? (
          <div className="bg-white rounded-[2rem] border border-stone-200 p-16 flex flex-col items-center justify-center">
             <Loader2 className="animate-spin text-yellow-600 mb-4" size={32} />
             <p className="text-sm text-stone-400 font-serif italic">正在觀測今日干支流轉...</p>
          </div>
        ) : results.dailyGuidance ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Top Quote & Rating */}
            <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden">
               <div className="bg-stone-900 p-6 text-center">
                  <div className="flex justify-center gap-1 mb-3">
                    {Array.from({length: 5}).map((_, i) => (
                      <Star 
                        key={i} 
                        size={18} 
                        className={i < (parseInt(parseContent('RATING')) || 3) ? 'text-yellow-400 fill-yellow-400' : 'text-stone-700'} 
                      />
                    ))}
                  </div>
                  <p className="text-white font-serif text-lg leading-relaxed px-4">
                    {parseContent('QUOTE') ? `「${parseContent('QUOTE')}」` : '正在感應今日命理金句...'}
                  </p>
               </div>
            </div>

            {/* Logic Basis Section */}
            <div className="bg-white p-5 rounded-[1.5rem] border border-stone-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-stone-400">
                <BookOpen size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">推演依據 (命理邏輯)</span>
              </div>
              <div className="text-xs text-stone-600 leading-relaxed font-serif bg-stone-50 p-4 rounded-xl border border-stone-100 italic whitespace-pre-line min-h-[40px]">
                {parseContent('BASIS') || '正在解析流日干支對應關係...'}
              </div>
            </div>

            {/* Detailed Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               {[
                 { tag: 'CAREER', label: '事業學業', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
                 { tag: 'LOVE', label: '感情姻緣', icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
                 { tag: 'WEALTH', label: '財運投資', icon: Coins, color: 'text-amber-600', bg: 'bg-amber-50' },
                 { tag: 'HEALTH', label: '身心健康', icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
                 { tag: 'LUCK', label: '開運密碼', icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' },
               ].map((item) => (
                 <div key={item.tag} className="bg-white p-5 rounded-[1.5rem] border border-stone-100 shadow-sm flex items-start gap-4 min-h-[100px]">
                    <div className={`${item.bg} ${item.color} p-3 rounded-2xl flex-shrink-0`}>
                      <item.icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">{item.label}</h4>
                      <p className="text-sm text-stone-700 font-serif leading-relaxed">
                        {parseContent(item.tag) || '推算中...'}
                      </p>
                    </div>
                 </div>
               ))}
            </div>

            {/* Dos & Don'ts */}
            <div className="grid grid-cols-2 gap-3">
               <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex items-center gap-3">
                 <CheckCircle2 className="text-green-600" size={20} />
                 <div>
                   <span className="text-[10px] font-bold text-green-700 block mb-0.5">宜</span>
                   <p className="text-xs text-green-900 font-bold">{parseContent('DO') || '順應天時'}</p>
                 </div>
               </div>
               <div className="bg-stone-100 border border-stone-200 p-4 rounded-2xl flex items-center gap-3">
                 <Ban className="text-stone-400" size={20} />
                 <div>
                   <span className="text-[10px] font-bold text-stone-500 block mb-0.5">忌</span>
                   <p className="text-xs text-stone-700 font-bold">{parseContent('DONT') || '急躁冒進'}</p>
                 </div>
               </div>
            </div>
          </div>
        ) : error ? (
           <div className="text-center py-10 bg-white rounded-3xl border border-red-50">
             <p className="text-red-500 text-sm mb-4">{error}</p>
             <button onClick={() => generateGuidance()} className="bg-stone-900 text-white px-6 py-2 rounded-xl text-xs flex items-center gap-2 mx-auto">
                <RotateCcw size={14} /> 重試推演
             </button>
           </div>
        ) : null}
      </div>

      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className="text-lg font-bold serif text-stone-800">分析清單</h3>
        <span className="text-[10px] font-bold text-stone-400">已解鎖: {Object.values(results).filter(v => typeof v === 'string' && v.length > 5).length}/4</span>
      </div>
      <div className="grid grid-cols-1 gap-3 mb-6">
        {[
          { key: 'bazi', label: '八字命盤', desc: '先天命局解析', mode: ViewMode.Metaphysics },
          { key: 'palm', label: '手相解讀', desc: '掌紋趨勢觀測', mode: ViewMode.Metaphysics },
        ].map(item => {
          const val = results[item.key as keyof AnalysisResults];
          const isDone = typeof val === 'string' && val.length > 10;
          return (
            <div key={item.key} onClick={() => onViewChange(item.mode)} className="bg-white p-5 rounded-2xl border border-stone-100 flex items-center justify-between shadow-sm active:scale-98 transition-transform cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDone ? 'bg-green-100 text-green-600' : 'bg-stone-50 text-stone-300'}`}>
                  {isDone ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                </div>
                <div>
                  <h4 className="font-bold text-stone-800 text-sm">{item.label}</h4>
                  <p className="text-[10px] text-stone-400 font-serif italic">{item.desc}</p>
                </div>
              </div>
              <ArrowRight size={14} className="text-stone-200" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
