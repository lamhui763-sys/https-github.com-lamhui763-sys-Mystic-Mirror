
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { AnalysisResults } from '../types';
import { Hand, Eye, Calendar, Moon, Upload, Loader2, Sparkles, ChevronRight, History, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatDialog } from '../components/ChatDialog';

interface Props {
  onSaveResult: (type: keyof AnalysisResults, result: string) => void;
  results: AnalysisResults;
}

type Tab = 'PALM' | 'FACE' | 'BAZI' | 'DREAM';

export const MetaphysicsView: React.FC<Props> = ({ onSaveResult, results }) => {
  const [activeTab, setActiveTab] = useState<Tab>('PALM');
  const [isLoading, setIsLoading] = useState(false);
  const [inputData, setInputData] = useState<string>(''); // Text or Base64 Image
  const [preview, setPreview] = useState<string | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bazi State
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setInputData(base64.split(',')[1]);
        setPreview(base64);
        setResultText(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const getSystemPrompt = (tab: Tab): string => {
    switch(tab) {
      case 'PALM': return "你是一位精通東西方手相學的大師。請分析這張手相照片。重點解讀：1. 生命線 (健康與生命力) 2. 智慧線 (思維與才華) 3. 感情線 (情感與關係)。請務必引用《麻衣神相》或西方手相學經典作為分析依據，確保每一項分析都有其學理來源。請用溫和、神秘但充滿洞見的語氣，繁體中文回答。";
      case 'FACE': return "你是一位精通面相學的大師。請分析這張面相照片。重點解讀：三停五眼、十二宮（如官祿、財帛、遷移等）。請提供關於事業、財運和性格的深入分析。請務必引用《冰鑑》或《神相全編》作為分析依據，確保每一項分析都有其學理來源。請用繁體中文回答。";
      case 'BAZI': return "你是一位八字命理大師。根據提供的出生時間，排盤並分析其「四柱八字」。重點解讀：五行喜忌、本命元神強弱、以及未來十年的大運趨勢。如果使用者輸入的是農曆，請先進行轉換。請務必引用《三命通會》或《滴天髓》作為分析依據，確保每一項分析都有其學理來源。請用繁體中文回答。";
      case 'DREAM': return "你是一位精通周公解夢與心理分析的大師。請解析用戶描述的夢境。結合傳統吉凶預兆與現代心理投射，給出解釋與建議。請務必引用《周公解夢》或榮格心理學的夢境理論作為分析依據，確保每一項分析都有其學理來源。請用繁體中文回答。";
      default: return "";
    }
  };

  const analyze = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setResultText(null);

    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("No API Key");
        const ai = new GoogleGenAI({ apiKey });
        
        const prompt = getSystemPrompt(activeTab);
        let contents: any = { parts: [] };

        if (activeTab === 'BAZI') {
            contents.parts.push({ text: `出生日期: ${birthDate}, 出生時間: ${birthTime}。請進行八字分析。如果是特殊日期格式請自行解析。` });
        } else if (activeTab === 'DREAM') {
            contents.parts.push({ text: `夢境描述: ${inputData}` });
        } else {
            // Image based
            contents.parts.push({ 
                inlineData: { mimeType: 'image/jpeg', data: inputData } 
            });
            contents.parts.push({ text: "請分析這張照片。" });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            config: { systemInstruction: prompt },
            contents: contents
        });

        const text = response.text || "無法解讀，請重試。";
        setResultText(text);
        
        // Map Tab to result key
        const map: Record<Tab, keyof AnalysisResults> = {
            'PALM': 'palm', 'FACE': 'face', 'BAZI': 'bazi', 'DREAM': 'dream'
        };
        onSaveResult(map[activeTab], text);

    } catch (error: any) {
        setResultText(`解讀失敗: ${error.message}`);
    } finally {
        setIsLoading(false);
    }
  };

  const tabs: {id: Tab, label: string, icon: any}[] = [
      { id: 'PALM', label: '手相', icon: Hand },
      { id: 'FACE', label: '面相', icon: Eye },
      { id: 'BAZI', label: '八字', icon: Calendar },
      { id: 'DREAM', label: '解夢', icon: Moon },
  ];

  return (
    <div className="flex flex-col h-full bg-[#FEFCE8]">
      {/* Tab Header */}
      <div className="flex border-b border-stone-200 bg-white/50 backdrop-blur-md">
        {tabs.map(t => (
            <button
                key={t.id}
                onClick={() => { setActiveTab(t.id); setResultText(null); setInputData(''); setPreview(null); }}
                className={`flex-1 py-4 flex flex-col items-center gap-1 text-xs font-medium transition-all
                    ${activeTab === t.id ? 'text-yellow-700 border-b-2 border-yellow-600 bg-yellow-50/50' : 'text-stone-400 hover:text-stone-600'}
                `}
            >
                <t.icon size={20} />
                {t.label}
            </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Input Section */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="text-yellow-600" />
                    <h2 className="text-lg font-bold text-stone-800 serif">
                        {activeTab === 'PALM' && '上傳手掌照片'}
                        {activeTab === 'FACE' && '上傳面部照片'}
                        {activeTab === 'BAZI' && '輸入出生資訊'}
                        {activeTab === 'DREAM' && '描述您的夢境'}
                    </h2>
                </div>

                {(activeTab === 'PALM' || activeTab === 'FACE') && (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-stone-300 rounded-xl p-8 flex flex-col items-center justify-center text-stone-400 hover:bg-stone-50 hover:border-yellow-400 transition-all cursor-pointer h-64 relative overflow-hidden"
                    >
                        {preview ? (
                            <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                            <>
                                <Upload size={32} className="mb-2" />
                                <span className="text-sm">點擊上傳清晰照片</span>
                            </>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                    </div>
                )}

                {activeTab === 'BAZI' && (
                    <div className="space-y-5">
                        <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 mb-2">
                           <p className="text-[10px] text-stone-400 font-serif italic mb-2 uppercase tracking-widest">系統小提醒</p>
                           <p className="text-xs text-stone-600 leading-relaxed">您可以直接輸入日期，例如：「1990-05-20」或「1985年農曆八月十五」。AI 將自動為您解析。</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-stone-700 mb-2 flex items-center gap-2">
                                <Calendar size={14} className="text-stone-400" /> 出生日期
                            </label>
                            <input 
                                type="text" 
                                value={birthDate} 
                                onChange={e => setBirthDate(e.target.value)} 
                                placeholder="例如：1990-01-01 或 農曆八月初三"
                                className="w-full p-4 border border-stone-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-yellow-400 outline-none transition-all" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-stone-700 mb-2 flex items-center gap-2">
                                <Moon size={14} className="text-stone-400" /> 出生時間
                            </label>
                            <input 
                                type="text" 
                                value={birthTime} 
                                onChange={e => setBirthTime(e.target.value)} 
                                placeholder="例如：14:30 或 下午兩點左右"
                                className="w-full p-4 border border-stone-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-yellow-400 outline-none transition-all" 
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'DREAM' && (
                    <textarea 
                        value={inputData}
                        onChange={e => setInputData(e.target.value)}
                        placeholder="昨晚夢見了什麼？盡可能詳細描述..."
                        className="w-full h-48 p-4 border border-stone-200 rounded-lg bg-stone-50 resize-none focus:ring-2 focus:ring-yellow-400 outline-none"
                    />
                )}

                <button 
                    onClick={analyze}
                    disabled={isLoading || (activeTab === 'BAZI' && !birthDate) || (activeTab === 'DREAM' && !inputData) || ((activeTab === 'PALM' || activeTab === 'FACE') && !inputData)}
                    className={`w-full mt-6 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all text-lg shadow-md
                        ${isLoading ? 'bg-stone-100 text-stone-400' : 'bg-stone-900 text-white hover:bg-stone-700 active:scale-95'}
                    `}
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                    {isLoading ? '大師推算中...' : '開始解讀天機'}
                </button>
            </div>

            {/* Result Section */}
            {resultText && (
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
                    <h3 className="text-lg font-bold text-stone-800 serif mb-4 flex items-center gap-2">
                        <div className="w-1 h-6 bg-yellow-600 rounded-full"></div>
                        大師批註
                    </h3>
                    <button 
                        onClick={() => setIsChatOpen(true)}
                        className="absolute top-4 right-4 p-2 bg-yellow-50 text-yellow-900 rounded-full hover:bg-yellow-100 transition-colors"
                    >
                        <MessageSquare size={18} />
                    </button>
                    <div className="markdown-body text-stone-700 leading-relaxed font-serif">
                        <ReactMarkdown>{resultText}</ReactMarkdown>
                    </div>
                </div>
            )}
            {isChatOpen && resultText && (
                <ChatDialog initialContext={resultText} onClose={() => setIsChatOpen(false)} />
            )}

            {/* History / Previous Result Placeholder */}
             {!resultText && !isLoading && (
                 <div className="text-center text-stone-400 text-xs pt-8">
                    <History size={16} className="mx-auto mb-2 opacity-50" />
                    {activeTab === 'PALM' && results.palm && '您已存有手相記錄'}
                    {activeTab === 'FACE' && results.face && '您已存有面相記錄'}
                    {activeTab === 'BAZI' && results.bazi && '您已存有八字記錄'}
                    {activeTab === 'DREAM' && results.dream && '您已存有解夢記錄'}
                 </div>
             )}
        </div>
      </div>
    </div>
  );
};
