
import React, { useState, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { 
  ClipboardList, Activity, Send, Loader2, Plus, 
  TrendingUp, AlertTriangle, Moon, Calendar,
  BarChart3, Brain, RotateCcw, Edit2, Trash2, Save, Sparkles,
  FlaskConical, Dna, Atom, BookOpen, Battery, Smile, Zap, Link2, Info, MessageSquare
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatDialog } from '../components/ChatDialog';

interface Props {
  onSaveResult: (result: string) => void;
}

type Mode = 'MANUAL' | 'PREDICTION' | 'ASSESSMENT' | 'DAILY' | 'MENTAL';

// --- Types ---
interface DailyLog {
  id: string;
  date: string; // YYYY-MM-DD
  mood: number;   // 1-5
  sleep: number;  // 1-5
  stress: number; // 1-5
  note: string;
}

// --- Mock Initial Data ---
const INITIAL_LOGS: DailyLog[] = [
  { id: '1', date: '2025-11-15', mood: 3, sleep: 4, stress: 2, note: '平靜的一天' },
  { id: '2', date: '2025-11-16', mood: 2, sleep: 2, stress: 4, note: '工作壓力大，睡不好' },
  { id: '3', date: '2025-11-17', mood: 4, sleep: 5, stress: 2, note: '補眠後感覺好多了' },
  { id: '4', date: '2025-11-18', mood: 3, sleep: 3, stress: 3, note: '普通的週一' },
];

export const ScienceView: React.FC<Props> = ({ onSaveResult }) => {
  const [mode, setMode] = useState<Mode>('MANUAL'); // Default to the accessible one
  const [isLoading, setIsLoading] = useState(false);
  
  // --- State: User Manual (New Accessible Feature) ---
  const [manualForm, setManualForm] = useState({
    traits: '',     // simple keywords like "lazy, creative"
    drain: '',      // what drains energy
    recharge: ''    // what recharges energy
  });
  const [manualResult, setManualResult] = useState<string | null>(null);

  // --- State: Life Assessment ---
  const [selfForm, setSelfForm] = useState({
    age: '',
    background: '',
    career: '',
    habits: ''
  });
  const [selfResult, setSelfResult] = useState<string | null>(null);

  // --- State: Daily Log ---
  const [logs, setLogs] = useState<DailyLog[]>(INITIAL_LOGS);
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logForm, setLogForm] = useState({
    mood: 3,
    sleep: 3,
    stress: 3,
    note: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dailyAnalysis, setDailyAnalysis] = useState<string | null>(null);
  const [activeChatResult, setActiveChatResult] = useState<string | null>(null);

  // --- State: Mental Health ---
  const [mentalInput, setMentalInput] = useState('');
  const [mentalResult, setMentalResult] = useState<string | null>(null);

  // --- State: Scientific Prediction ---
  const [predictForm, setPredictForm] = useState({
    mbti: '',
    decisionStyle: 50, // 0 (Pure Logic) - 100 (Pure Intuition)
    chaosLevel: 5,     // 1-10
    target: ''
  });
  const [predictResult, setPredictResult] = useState<string | null>(null);

  // --- Actions: User Manual ---
  const runUserManualGen = async () => {
    if (!manualForm.traits || !manualForm.drain || isLoading) return;
    setIsLoading(true);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("No API Key");
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        請為這位用戶撰寫一份幽默、通俗易懂的「人類使用說明書」(Personal User Manual)。
        將用戶視為一個「高科技生物產品」，用產品經理或工程師的口吻介紹。
        避免艱深的術語，用生活化的比喻讓一般人也能秒懂自己。

        用戶輸入參數：
        - 產品關鍵字/特質: ${manualForm.traits}
        - 耗電原因 (什麼讓他心累): ${manualForm.drain}
        - 充電方式 (如何恢復): ${manualForm.recharge}

        說明書結構 (Markdown格式):
        1. **【產品型號與名稱】**: 根據特質取一個有趣的名字 (例如: "焦慮型高產能機器人 V2.0")。
        2. **【核心功能 (Specs)】**: 他的強項是什麼？
        3. **【電池與續航 (Battery)】**: 警告使用者什麼行為會導致斷電，以及正確的充電協議。
        4. **【故障排除 (Troubleshooting)】**: 當此產品情緒崩潰或當機時，該如何「重啟」？
        5. **【最佳運行環境】**: 適合放在什麼樣的環境或人群中。
        6. **【保固條款】**: 一句給用戶的溫暖或幽默的自我接納建議。

        請用繁體中文回答，風格輕鬆有趣。
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      setManualResult(response.text || "說明書列印失敗");
      onSaveResult(response.text || "說明書列印失敗");

    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Actions: Life Assessment ---
  const runLifeAssessment = async () => {
    if (!selfForm.age || !selfForm.career || isLoading) return;
    setIsLoading(true);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("No API Key");
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        請扮演一位結合心理學、社會學與行為科學的資深分析師。
        基於以下用戶資料，生成一份嚴謹的「科學人生評估報告」。
        
        資料：
        - 年齡: ${selfForm.age}
        - 成長背景: ${selfForm.background}
        - 教育與職業: ${selfForm.career}
        - 生活習慣: ${selfForm.habits}

        請嚴格按照以下三個科學維度進行分析 (請使用 Markdown 格式排版):

        ### 1. 機率與統計學原理 (Probability & Statistics)
        *   **群體定位**：根據用戶的年齡與背景，參考人口統計數據，分析其所屬群體的普遍生命歷程特徵。
        *   **趨勢預測**：識別該階段最常見的機遇與風險。

        ### 2. 行為科學原理 (Behavioral Science)
        *   **習慣迴路**：分析用戶的職業與習慣，明確指出哪些是通往目標的「增強因子」，哪些是「風險因子」。
        *   **預測模型**：若維持現狀，未來 5 年最可能的發展軌跡。

        ### 3. 系統論原理 (Systems Theory)
        *   **支持系統**：評估其社會支持網絡的韌性。
        *   **反脆弱性**：評估用戶應對外部衝擊的能力。

        請用繁體中文回答，語氣客觀、理性、數據驅動。
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const text = response.text || "無法生成報告";
      setSelfResult(text);
      onSaveResult(text);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Actions: Daily Log ---
  const saveLogEntry = () => {
    if (editingId) {
      // Update existing entry
      const updatedLogs = logs.map(log => 
        log.id === editingId 
          ? { 
              ...log, 
              date: logDate, 
              mood: logForm.mood, 
              sleep: logForm.sleep, 
              stress: logForm.stress, 
              note: logForm.note 
            } 
          : log
      ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setLogs(updatedLogs);
      setEditingId(null); 
    } else {
      // Create new entry
      const newEntry: DailyLog = {
        id: Date.now().toString(),
        date: logDate,
        mood: logForm.mood,
        sleep: logForm.sleep,
        stress: logForm.stress,
        note: logForm.note
      };
      const updatedLogs = [...logs, newEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setLogs(updatedLogs);
    }
    
    // Reset Form
    setLogForm({ mood: 3, sleep: 3, stress: 3, note: '' });
    setLogDate(new Date().toISOString().split('T')[0]);
  };

  const handleEditLog = (log: DailyLog) => {
    setEditingId(log.id);
    setLogDate(log.date);
    setLogForm({
      mood: log.mood,
      sleep: log.sleep,
      stress: log.stress,
      note: log.note
    });
    // Smooth scroll to form
    document.querySelector('.daily-form-container')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteLog = (id: string) => {
    if (window.confirm('確定要刪除這條記錄嗎？')) {
      setLogs(prev => prev.filter(l => l.id !== id));
      if (editingId === id) {
        handleClearForm();
      }
    }
  };

  const handleClearForm = () => {
    setEditingId(null);
    setLogForm({ mood: 3, sleep: 3, stress: 3, note: '' });
    setLogDate(new Date().toISOString().split('T')[0]);
  };

  const analyzeDailyLogs = async () => {
    if (logs.length < 3 || isLoading) return;
    setIsLoading(true);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("No API Key");
      const ai = new GoogleGenAI({ apiKey });

      const dataStr = JSON.stringify(logs.slice(-14));
      const prompt = `
        這是一份用戶的「每日自我評估」數據 (JSON格式)。
        包含：日期、心情(1-5)、睡眠品質(1-5)、壓力水平(1-5)與筆記。
        數據: ${dataStr}
        
        請進行「多變量時間序列分析」(Multivariate Time Series Analysis)：
        1. **趨勢識別**: 分析心情、睡眠與壓力的波動週期。
        2. **相關性矩陣**: 找出變量間的因果關係（例如：睡眠品質 < 3 時，是否導致次日壓力 > 4？）。
        3. **異常檢測**: 指出數據中的異常點及其可能原因（參考筆記內容）。
        4. **科學建議**: 基於行為科學，提供改善生活質量的具體微習慣 (Micro-habits)。
        
        請用繁體中文回答，包含圖表式的總結。
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      setDailyAnalysis(response.text || "分析失敗");
      onSaveResult(response.text || "分析失敗");
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Actions: Mental Health ---
  const runMentalAnalysis = async () => {
    if (!mentalInput.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("No API Key");
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        用戶輸入了一段關於內心感受的描述。請提供「初步的、非診斷性的心理健康分析」。
        描述: "${mentalInput}"
        
        任務:
        1. **狀態識別**: 溫和指出可能反映的心理狀態 (如焦慮、倦怠)。
        2. **認知重構**: 提供一個不同的視角來看待當前的困擾。
        3. **正念練習**: 推薦一個簡單的當下可做的練習 (如呼吸法)。

        請用繁體中文回答，語氣溫暖、支持、不帶評判。
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      setMentalResult(response.text || "無法分析");
    } catch (e: any) {
       setMentalResult(`分析錯誤: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Actions: Scientific Prediction ---
  const runScientificPrediction = async () => {
    if (!predictForm.target.trim() || !predictForm.mbti || isLoading) return;
    setIsLoading(true);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("No API Key");
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        你是一位「科學算命師」(Scientific Fortune Teller)。這是一種基於邏輯、博弈論 (Game Theory)、混沌理論 (Chaos Theory) 與行為經濟學的預測實驗。
        
        輸入參數：
        - 人格模型 (MBTI/特質): ${predictForm.mbti}
        - 決策風格: ${predictForm.decisionStyle}% 直覺 (vs 邏輯)
        - 生活熵值 (Entropy/Chaos): ${predictForm.chaosLevel}/10
        - 觀測目標 (預測問題): "${predictForm.target}"

        請生成一份「科學預言報告」 (Scientific Prophecy Report)，繁體中文，Markdown格式：

        1.  **初始條件分析 (Initial Conditions)**: 簡述用戶的性格與決策參數如何影響該問題。
        2.  **博弈論策略 (Game Theoretic Strategy)**: 分析此情境下的參與者（用戶vs環境/他人），並指出「納什均衡點」(Nash Equilibrium) 或最佳策略。
        3.  **概率演算 (Probability Calculation)**: 根據現有變量，估算成功或理想結果的發生機率（給出一個百分比範圍）。
        4.  **混沌係數 (Chaos Factor)**: 指出一個微小但可能導致結果翻轉的「蝴蝶效應」變因。
        5.  **最終預測 (The Projection)**: 基於線性回歸邏輯的未來推演。

        語氣：冷靜、分析性強、帶有一點量子物理學家的神秘感。
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      setPredictResult(response.text || "運算失敗");
      onSaveResult(response.text || "運算失敗");

    } catch (e: any) {
      setPredictResult(`運算錯誤: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSlider = (label: string, value: number, setValue: (v: number) => void, icon: any, colorClass: string) => (
    <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2 text-stone-700 font-medium">
          {icon}
          <span>{label}</span>
        </div>
        <span className={`text-lg font-bold ${colorClass}`}>{value}/5</span>
      </div>
      <input 
        type="range" min="1" max="5" step="1"
        value={value}
        onChange={(e) => setValue(parseInt(e.target.value))}
        className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-800"
      />
      <div className="flex justify-between text-xs text-stone-400 mt-1 px-1">
        <span>低</span>
        <span>高</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#FEFCE8]">
      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-200 bg-white/50 backdrop-blur-md overflow-x-auto">
         <button 
          onClick={() => setMode('MANUAL')}
          className={`flex-1 py-4 min-w-[100px] flex items-center justify-center gap-2 text-sm font-medium transition-all whitespace-nowrap
            ${mode === 'MANUAL' ? 'text-amber-800 border-b-2 border-amber-600 bg-amber-50/50' : 'text-stone-400'}`}
        >
          <BookOpen size={18} /> 個人說明書
        </button>
        <button 
          onClick={() => setMode('PREDICTION')}
          className={`flex-1 py-4 min-w-[100px] flex items-center justify-center gap-2 text-sm font-medium transition-all whitespace-nowrap
            ${mode === 'PREDICTION' ? 'text-indigo-800 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-stone-400'}`}
        >
          <FlaskConical size={18} /> 科學算命
        </button>
        <button 
          onClick={() => setMode('ASSESSMENT')}
          className={`flex-1 py-4 min-w-[100px] flex items-center justify-center gap-2 text-sm font-medium transition-all whitespace-nowrap
            ${mode === 'ASSESSMENT' ? 'text-blue-800 border-b-2 border-blue-600 bg-blue-50/50' : 'text-stone-400'}`}
        >
          <ClipboardList size={18} /> 人生評估
        </button>
        <button 
          onClick={() => setMode('DAILY')}
          className={`flex-1 py-4 min-w-[100px] flex items-center justify-center gap-2 text-sm font-medium transition-all whitespace-nowrap
            ${mode === 'DAILY' ? 'text-green-800 border-b-2 border-green-600 bg-green-50/50' : 'text-stone-400'}`}
        >
          <Activity size={18} /> 每日記錄
        </button>
        <button 
          onClick={() => setMode('MENTAL')}
          className={`flex-1 py-4 min-w-[100px] flex items-center justify-center gap-2 text-sm font-medium transition-all whitespace-nowrap
            ${mode === 'MENTAL' ? 'text-purple-800 border-b-2 border-purple-600 bg-purple-50/50' : 'text-stone-400'}`}
        >
          <Brain size={18} /> 心理調適
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24">
        <div className="max-w-3xl mx-auto">

          {/* MODE: USER MANUAL (Accessible/Fun) */}
          {mode === 'MANUAL' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                 <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                        <BookOpen size={120} className="text-amber-900" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                           <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                             <Smile size={24} />
                           </div>
                           <h2 className="text-2xl font-bold text-stone-800 serif">個人使用說明書</h2>
                        </div>
                        <p className="text-stone-500 text-sm mb-6">
                           覺得「科學算命」太複雜？<br/>我們把您當成一台高科技產品，幫您寫一份簡單好懂的操作手冊。
                        </p>

                        <div className="space-y-4 mb-6">
                           <div>
                              <label className="flex items-center gap-2 text-sm font-bold text-stone-600 mb-1">
                                 <Sparkles size={14} /> 產品特質 (您是什麼樣的人？)
                              </label>
                              <input 
                                type="text" 
                                value={manualForm.traits}
                                onChange={e => setManualForm({...manualForm, traits: e.target.value})}
                                placeholder="例如: 懶惰但聰明, 容易焦慮的完美主義者, 喜歡貓..."
                                className="w-full p-3 bg-amber-50/50 rounded-xl border border-amber-200 outline-none focus:ring-2 focus:ring-amber-200"
                              />
                           </div>
                           <div>
                              <label className="flex items-center gap-2 text-sm font-bold text-stone-600 mb-1">
                                 <Zap size={14} /> 耗電原因 (什麼事讓您心累？)
                              </label>
                              <input 
                                type="text" 
                                value={manualForm.drain}
                                onChange={e => setManualForm({...manualForm, drain: e.target.value})}
                                placeholder="例如: 太多社交, 開無意義的會, 肚子餓..."
                                className="w-full p-3 bg-amber-50/50 rounded-xl border border-amber-200 outline-none focus:ring-2 focus:ring-amber-200"
                              />
                           </div>
                           <div>
                              <label className="flex items-center gap-2 text-sm font-bold text-stone-600 mb-1">
                                 <Battery size={14} /> 充電方式 (如何恢復能量？)
                              </label>
                              <input 
                                type="text" 
                                value={manualForm.recharge}
                                onChange={e => setManualForm({...manualForm, recharge: e.target.value})}
                                placeholder="例如: 睡覺, 喝珍奶, 一個人發呆..."
                                className="w-full p-3 bg-amber-50/50 rounded-xl border border-amber-200 outline-none focus:ring-2 focus:ring-amber-200"
                              />
                           </div>
                        </div>

                        <button 
                          onClick={runUserManualGen}
                          disabled={isLoading || !manualForm.traits}
                          className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-lg shadow-lg
                            ${isLoading || !manualForm.traits
                              ? 'bg-stone-100 text-stone-300 cursor-not-allowed' 
                              : 'bg-amber-900 text-white hover:bg-amber-800 hover:scale-[1.02]'}`}
                        >
                          {isLoading ? <Loader2 className="animate-spin" /> : <BookOpen size={20} />}
                          {isLoading ? '正在撰寫說明書...' : '生成我的使用說明書'}
                        </button>
                    </div>
                 </div>

                 {manualResult && (
                    <div className="bg-white p-8 rounded-2xl border border-amber-100 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center gap-2 mb-6 border-b border-stone-100 pb-4 relative">
                           <BookOpen className="text-amber-600" size={24} />
                           <h3 className="font-serif font-bold text-xl text-stone-800">用戶使用手冊 (User Manual)</h3>
                           <button 
                              onClick={() => setActiveChatResult(manualResult)}
                              className="absolute top-0 right-0 p-2 bg-amber-50 text-amber-900 rounded-full hover:bg-amber-100 transition-colors"
                          >
                              <MessageSquare size={18} />
                          </button>
                        </div>
                        <div className="markdown-body text-stone-700 leading-relaxed font-serif">
                           <ReactMarkdown>{manualResult}</ReactMarkdown>
                        </div>
                    </div>
                 )}
              </div>
          )}

           {/* MODE: SCIENTIFIC PREDICTION */}
           {mode === 'PREDICTION' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                 <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                        <Dna size={120} className="text-indigo-900" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                           <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                             <Atom size={24} />
                           </div>
                           <h2 className="text-2xl font-bold text-stone-800 serif">科學算命實驗室</h2>
                        </div>
                        
                        {/* Relationship Explanation Box */}
                        <div className="bg-indigo-50/80 p-4 rounded-xl border border-indigo-100 mb-6 text-sm text-indigo-900 flex gap-3 leading-relaxed">
                           <div className="mt-0.5 flex-shrink-0"><Info size={18} /></div>
                           <div>
                               <span className="font-bold block mb-1 text-indigo-700">說明書與算命的關係？</span>
                               <p className="text-indigo-800/80">
                                 「個人使用說明書」定義了您的 <span className="font-bold text-indigo-700">核心參數</span>（您是誰，出廠設定）；<br/>
                                 「科學算命」則是將這些參數代入特定的 <span className="font-bold text-indigo-700">環境變量</span>（發生的事），運算出這一場博弈的最終結局。
                               </p>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                           <div>
                              <div className="flex justify-between items-end mb-1">
                                 <label className="block text-xs font-bold text-stone-500">人格參數 (MBTI/特質)</label>
                                 {manualForm.traits && (
                                    <button 
                                      onClick={() => setPredictForm(prev => ({...prev, mbti: manualForm.traits}))}
                                      className="text-[10px] text-amber-700 bg-amber-100/80 hover:bg-amber-200 font-bold px-2 py-1 rounded-md flex items-center gap-1 transition-colors"
                                      title="使用個人說明書中的特質"
                                    >
                                      <Link2 size={10} />
                                      引用說明書特質
                                    </button>
                                 )}
                              </div>
                              <input 
                                type="text" 
                                value={predictForm.mbti}
                                onChange={e => setPredictForm({...predictForm, mbti: e.target.value})}
                                placeholder="例如: INTJ, 完美主義, 冒險家..."
                                className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-indigo-200"
                              />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-stone-500 mb-1">觀測目標 (預測問題)</label>
                              <input 
                                type="text" 
                                value={predictForm.target}
                                onChange={e => setPredictForm({...predictForm, target: e.target.value})}
                                placeholder="例如: 這份投資會獲利嗎？我該創業嗎？"
                                className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-indigo-200"
                              />
                           </div>
                        </div>

                        <div className="mb-6">
                           <div className="flex justify-between mb-2">
                             <label className="text-xs font-bold text-stone-500">決策風格模型</label>
                             <span className="text-xs text-indigo-600 font-bold">
                               {predictForm.decisionStyle < 50 ? `邏輯偏重 ${100-predictForm.decisionStyle}%` : `直覺偏重 ${predictForm.decisionStyle}%`}
                             </span>
                           </div>
                           <input 
                             type="range" min="0" max="100" step="10"
                             value={predictForm.decisionStyle}
                             onChange={e => setPredictForm({...predictForm, decisionStyle: parseInt(e.target.value)})}
                             className="w-full h-2 bg-gradient-to-r from-blue-300 to-purple-300 rounded-lg appearance-none cursor-pointer"
                           />
                           <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                              <span>純粹理性 (Logic)</span>
                              <span>第六感 (Intuition)</span>
                           </div>
                        </div>

                        <div className="mb-8">
                           <div className="flex justify-between mb-2">
                             <label className="text-xs font-bold text-stone-500">生活熵值 (Entropy / Chaos)</label>
                             <span className="text-xs text-red-600 font-bold">Level {predictForm.chaosLevel}</span>
                           </div>
                           <input 
                             type="range" min="1" max="10" step="1"
                             value={predictForm.chaosLevel}
                             onChange={e => setPredictForm({...predictForm, chaosLevel: parseInt(e.target.value)})}
                             className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                           />
                           <p className="text-[10px] text-stone-400 mt-1 text-right">當前生活的混亂與隨機程度</p>
                        </div>

                        <button 
                          onClick={runScientificPrediction}
                          disabled={isLoading || !predictForm.target}
                          className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-lg shadow-lg
                            ${isLoading || !predictForm.target
                              ? 'bg-stone-100 text-stone-300 cursor-not-allowed' 
                              : 'bg-indigo-900 text-white hover:bg-indigo-800 hover:scale-[1.02]'}`}
                        >
                          {isLoading ? <Loader2 className="animate-spin" /> : <FlaskConical size={20} />}
                          {isLoading ? '正在進行蒙地卡羅模擬...' : '啟動預測模型'}
                        </button>
                    </div>
                 </div>

                 {predictResult && (
                    <div className="bg-white p-8 rounded-2xl border border-indigo-100 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center gap-2 mb-6 border-b border-stone-100 pb-4 relative">
                           <Dna className="text-indigo-600" size={24} />
                           <h3 className="font-serif font-bold text-xl text-stone-800">科學預言報告</h3>
                           <button 
                              onClick={() => setActiveChatResult(predictResult)}
                              className="absolute top-0 right-0 p-2 bg-indigo-50 text-indigo-900 rounded-full hover:bg-indigo-100 transition-colors"
                          >
                              <MessageSquare size={18} />
                          </button>
                        </div>
                        <div className="markdown-body text-stone-700 leading-relaxed font-serif">
                           <ReactMarkdown>{predictResult}</ReactMarkdown>
                        </div>
                    </div>
                 )}
              </div>
           )}
          
          {/* MODE: ASSESSMENT */}
          {mode === 'ASSESSMENT' && (
             <div className="space-y-6 animate-in fade-in duration-500">
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                  <h2 className="text-xl font-bold text-stone-800 mb-4 serif">科學人生評估</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="block text-xs font-bold text-stone-500 mb-1">年齡</label>
                         <input 
                           type="number" 
                           value={selfForm.age} 
                           onChange={e => setSelfForm({...selfForm, age: e.target.value})}
                           className="w-full p-3 bg-stone-50 rounded-lg border border-stone-200 outline-none focus:ring-2 focus:ring-blue-200"
                           placeholder="例如: 28"
                         />
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-stone-500 mb-1">職業 / 教育</label>
                         <input 
                           type="text" 
                           value={selfForm.career} 
                           onChange={e => setSelfForm({...selfForm, career: e.target.value})}
                           className="w-full p-3 bg-stone-50 rounded-lg border border-stone-200 outline-none focus:ring-2 focus:ring-blue-200"
                           placeholder="例如: 軟體工程師 / 碩士"
                         />
                       </div>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-stone-500 mb-1">成長背景簡述</label>
                       <textarea 
                         value={selfForm.background}
                         onChange={e => setSelfForm({...selfForm, background: e.target.value})}
                         className="w-full p-3 bg-stone-50 rounded-lg border border-stone-200 outline-none focus:ring-2 focus:ring-blue-200 h-20 resize-none"
                         placeholder="例如: 在大家庭長大，父母管教嚴格..."
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-stone-500 mb-1">主要生活習慣</label>
                       <textarea 
                         value={selfForm.habits}
                         onChange={e => setSelfForm({...selfForm, habits: e.target.value})}
                         className="w-full p-3 bg-stone-50 rounded-lg border border-stone-200 outline-none focus:ring-2 focus:ring-blue-200 h-20 resize-none"
                         placeholder="例如: 經常熬夜，有運動習慣，喜歡閱讀..."
                       />
                    </div>
                    <button 
                      onClick={runLifeAssessment}
                      disabled={isLoading || !selfForm.age}
                      className="w-full bg-stone-800 text-white py-3 rounded-xl font-medium hover:bg-stone-700 transition-colors flex items-center justify-center gap-2"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={18}/> : <BarChart3 size={18}/>}
                      生成科學評估報告
                    </button>
                  </div>
                </div>
                {selfResult && (
                  <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm markdown-body text-stone-700 relative">
                    <button 
                        onClick={() => setActiveChatResult(selfResult)}
                        className="absolute top-4 right-4 p-2 bg-stone-100 text-stone-900 rounded-full hover:bg-stone-200 transition-colors"
                    >
                        <MessageSquare size={18} />
                    </button>
                    <ReactMarkdown>{selfResult}</ReactMarkdown>
                  </div>
                )}
                {activeChatResult && (
                  <ChatDialog initialContext={activeChatResult} onClose={() => setActiveChatResult(null)} />
                )}
             </div>
          )}

          {/* MODE: DAILY */}
          {mode === 'DAILY' && (
             <div className="space-y-8 animate-in fade-in duration-500 daily-form-container">
                {/* Input Form */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden" id="daily-log-form">
                  <div className={`absolute top-0 left-0 w-1 h-full ${editingId ? 'bg-orange-400' : 'bg-green-400'}`}></div>
                  <div className="flex justify-between items-center mb-6">
                     <h2 className="text-xl font-bold text-stone-800 serif">
                       {editingId ? '修改記錄' : '今日狀態'}
                     </h2>
                     <input 
                       type="date" 
                       value={logDate}
                       onChange={e => setLogDate(e.target.value)}
                       className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-1 text-sm text-stone-600 outline-none"
                     />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {renderSlider('心情', logForm.mood, (v)=>setLogForm({...logForm, mood: v}), <TrendingUp size={16}/>, 'text-yellow-600')}
                    {renderSlider('睡眠', logForm.sleep, (v)=>setLogForm({...logForm, sleep: v}), <Moon size={16}/>, 'text-indigo-600')}
                    {renderSlider('壓力', logForm.stress, (v)=>setLogForm({...logForm, stress: v}), <AlertTriangle size={16}/>, 'text-red-600')}
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-bold text-stone-500 mb-1">簡短筆記</label>
                    <textarea 
                      value={logForm.note}
                      onChange={e => setLogForm({...logForm, note: e.target.value})}
                      className="w-full p-3 bg-stone-50 rounded-lg border border-stone-200 outline-none focus:ring-2 focus:ring-green-200 h-20 resize-none"
                      placeholder="發生了什麼特別的事？"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={saveLogEntry}
                      className={`flex-1 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2
                        ${editingId 
                          ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                          : 'bg-stone-800 hover:bg-stone-700 text-white'}
                      `}
                    >
                      {editingId ? <Save size={18} /> : <Plus size={18} />}
                      {editingId ? '更新記錄' : '記錄今天'}
                    </button>
                    
                    {editingId && (
                        <button 
                          onClick={() => handleDeleteLog(editingId)}
                          className="px-4 py-3 rounded-xl font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center"
                          title="刪除此記錄"
                        >
                          <Trash2 size={18} />
                        </button>
                    )}
                    
                    <button 
                      onClick={handleClearForm}
                      className="px-6 py-3 rounded-xl font-medium text-stone-500 bg-stone-100 hover:bg-stone-200 hover:text-stone-700 transition-colors flex items-center gap-2"
                      title={editingId ? "放棄修改" : "重置表單"}
                    >
                      <RotateCcw size={18} />
                      {editingId ? '取消' : '清空'}
                    </button>
                  </div>
                </div>
                
                {/* Log History */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-stone-700">歷史記錄 ({logs.length})</h3>
                    <button 
                      onClick={analyzeDailyLogs}
                      disabled={logs.length < 3 || isLoading}
                      className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors
                        ${logs.length < 3 ? 'bg-stone-100 text-stone-400' : 'bg-green-100 text-green-700 hover:bg-green-200'}
                      `}
                    >
                      <Brain size={12} /> AI 趨勢分析
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {logs.slice().reverse().map(log => (
                      <div key={log.id} className={`bg-white p-4 rounded-xl border transition-colors flex items-start gap-4 group ${editingId === log.id ? 'border-orange-300 bg-orange-50' : 'border-stone-100 hover:border-stone-300'}`}>
                         <div className="min-w-[60px] text-center">
                            <div className="text-xs text-stone-400 font-bold uppercase">{new Date(log.date).toLocaleString('default', { month: 'short' })}</div>
                            <div className="text-lg font-bold text-stone-800">{new Date(log.date).getDate()}</div>
                         </div>
                         <div className="flex-1">
                            <div className="flex gap-4 text-xs text-stone-500 mb-1">
                              <span className="flex items-center gap-1"><TrendingUp size={12}/> 心情 {log.mood}</span>
                              <span className="flex items-center gap-1"><Moon size={12}/> 睡眠 {log.sleep}</span>
                              <span className="flex items-center gap-1"><AlertTriangle size={12}/> 壓力 {log.stress}</span>
                            </div>
                            <p className="text-stone-700 text-sm">{log.note || "無筆記"}</p>
                         </div>
                         <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button 
                             onClick={() => handleEditLog(log)}
                             className="p-2 text-stone-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                             title="修改"
                           >
                             <Edit2 size={14} />
                           </button>
                           <button 
                             onClick={() => handleDeleteLog(log.id)}
                             className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                             title="刪除"
                           >
                             <Trash2 size={14} />
                           </button>
                         </div>
                      </div>
                    ))}
                    {logs.length === 0 && (
                      <div className="text-center text-stone-400 py-8 text-sm">暫無記錄，開始記錄您的第一天吧。</div>
                    )}
                  </div>
                </div>

                {/* Analysis Result */}
                {dailyAnalysis && (
                   <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-green-400"></div>
                      <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                        <Brain size={18} className="text-green-600" /> 趨勢洞察
                      </h3>
                      <div className="markdown-body text-sm text-stone-700 leading-relaxed">
                        <ReactMarkdown>{dailyAnalysis}</ReactMarkdown>
                      </div>
                   </div>
                )}
             </div>
          )}

          {/* MODE: MENTAL */}
          {mode === 'MENTAL' && (
             <div className="space-y-6 animate-in fade-in duration-500">
                <div className="text-center mb-6">
                   <h2 className="text-xl font-bold text-stone-800 serif">心理調適室</h2>
                   <p className="text-stone-500 text-sm">在這裡，安全地釋放您的情緒與壓力。</p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                   <textarea 
                     value={mentalInput}
                     onChange={e => setMentalInput(e.target.value)}
                     className="w-full h-40 p-4 bg-stone-50 rounded-xl border-none outline-none resize-none text-stone-700 placeholder-stone-400 focus:ring-2 focus:ring-purple-100"
                     placeholder="現在感覺如何？寫下您的焦慮、困惑或任何想法..."
                   />
                   <div className="flex justify-end mt-4">
                      <button 
                        onClick={runMentalAnalysis}
                        disabled={isLoading || !mentalInput.trim()}
                        className="bg-stone-800 text-white px-6 py-2 rounded-xl font-medium hover:bg-stone-700 transition-colors flex items-center gap-2"
                      >
                        {isLoading ? <Loader2 className="animate-spin" size={16}/> : <Send size={16}/>}
                        獲得支持
                      </button>
                   </div>
                </div>

                {mentalResult && (
                   <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border border-purple-100 shadow-sm">
                      <h3 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
                        <Sparkles size={16} /> 心理分析回饋
                      </h3>
                      <div className="markdown-body text-stone-700 text-sm leading-relaxed">
                         <ReactMarkdown>{mentalResult}</ReactMarkdown>
                      </div>
                   </div>
                )}
             </div>
          )}

        </div>
      </div>
    </div>
  );
};
