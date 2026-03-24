
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { AnalysisResults } from '../types';
import { Star,  Component, Upload, Loader2, Sparkles, Orbit, FlaskConical, Scroll, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatDialog } from '../components/ChatDialog';

interface Props {
  onSaveResult: (result: string) => void;
  results: AnalysisResults;
}

type Tab = 'ASTRO' | 'TAROT' | 'ALCHEMY' | 'KABBALAH';

type TarotSpread = 'SINGLE' | 'THREE_CARDS' | 'CELTIC_CROSS' | 'RELATIONSHIP';

const TAROT_SPREADS: { id: TarotSpread, label: string, description: string }[] = [
    { id: 'SINGLE', label: '單張牌', description: '快速指引與當下啟示' },
    { id: 'THREE_CARDS', label: '聖三角 (三張牌)', description: '過去、現在、未來' },
    { id: 'CELTIC_CROSS', label: '凱爾特十字', description: '深度綜合分析' },
    { id: 'RELATIONSHIP', label: '關係牌陣', description: '探索雙方連結與發展' },
];

export const WesternView: React.FC<Props> = ({ onSaveResult, results }) => {
  const [activeTab, setActiveTab] = useState<Tab>('ASTRO');
  const [isLoading, setIsLoading] = useState(false);
  const [inputData, setInputData] = useState<string>('');
  const [inputText, setInputText] = useState<string>('');
  const [preview, setPreview] = useState<string | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);
  const [selectedSpread, setSelectedSpread] = useState<TarotSpread>('THREE_CARDS');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Specific state for Astrology
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');

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
      case 'ASTRO': return "你是一位精通西方占星術 (Astrology) 的大師。請根據用戶提供的出生資訊，繪製並解讀其本命星盤 (Natal Chart)。重點分析：太陽、月亮、上升星座 (Sun, Moon, Rising)，以及主要行星的相位與宮位。請務必引用托勒密《四書》(Tetrabiblos) 或現代占星經典作為分析依據，確保每一項分析都有其學理來源。請用優雅、神秘的西方神祕學語氣，繁體中文回答。";
      case 'TAROT': return "你是一位資深的塔羅牌 (Tarot) 占卜師，傳承自黃金黎明體系。如果用戶上傳牌面，請根據牌面與所選牌陣進行解讀；如果用戶未提供牌面，請模擬進行所選牌陣的抽牌並深度解讀。請務必結合亞瑟·愛德華·偉特 (A.E. Waite) 或克勞利 (Aleister Crowley) 的經典體系作為解讀依據，確保每一項分析都有其學理來源。請用繁體中文回答。";
      case 'ALCHEMY': return "你是一位煉金術士 (Alchemist)，精通心靈轉化與元素理論。請將用戶的問題視為「賤金屬轉化為黃金」的隱喻。運用煉金術的三原素 (硫、汞、鹽) 與四元素理論，分析用戶的精神狀態與轉化途徑。請務必引用帕拉塞爾蘇斯 (Paracelsus) 或赫爾墨斯主義 (Hermeticism) 的經典文獻作為分析依據，確保每一項分析都有其學理來源。請用繁體中文回答。";
      case 'KABBALAH': return "你是一位鑽研卡巴拉 (Kabbalah) 與西方魔法儀式的大師。請利用生命之樹 (Tree of Life) 的十大質點 (Sephiroth) 與路徑來解析用戶的生命課題。若涉及魔法，請介紹所羅門魔法或符號學的相關知識。請務必引用《光輝之書》(Zohar) 或《創造之書》(Sefer Yetzirah) 作為分析依據，確保每一項分析都有其學理來源。請用繁體中文回答。";
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

        if (activeTab === 'ASTRO') {
            contents.parts.push({ text: `出生日期: ${birthDate}, 時間: ${birthTime}, 地點: ${birthPlace}。請進行深度星盤分析。` });
        } else if (activeTab === 'TAROT') {
             const spreadLabel = TAROT_SPREADS.find(s => s.id === selectedSpread)?.label;
             if (inputData) {
                contents.parts.push({ inlineData: { mimeType: 'image/jpeg', data: inputData } });
                contents.parts.push({ text: `請使用「${spreadLabel}」牌陣解讀這張塔羅牌面。問題：${inputText || "無特定問題"}` });
             } else {
                contents.parts.push({ text: `請為我進行塔羅占卜，使用「${spreadLabel}」牌陣。我的問題是：${inputText}。請模擬抽牌並解讀。` });
             }
        } else {
            // Alchemy & Kabbalah
            contents.parts.push({ text: `我的疑問或狀況：${inputText}。請進行神祕學分析。` });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            config: { systemInstruction: prompt },
            contents: contents
        });

        const text = response.text || "星象模糊，無法讀取。";
        setResultText(text);
        onSaveResult(text);

    } catch (error: any) {
        setResultText(`儀式中斷: ${error.message}`);
    } finally {
        setIsLoading(false);
    }
  };

  const tabs: {id: Tab, label: string, icon: any}[] = [
      { id: 'ASTRO', label: '占星術', icon: Star },
      { id: 'TAROT', label: '塔羅牌', icon: Component }, // Component looks like cards
      { id: 'ALCHEMY', label: '煉金術', icon: FlaskConical },
      { id: 'KABBALAH', label: '魔法/卡巴拉', icon: Scroll },
  ];

  return (
    <div className="flex flex-col h-full bg-[#FEFCE8]">
      {/* Tab Header */}
      <div className="flex border-b border-stone-200 bg-white/50 backdrop-blur-md overflow-x-auto">
        {tabs.map(t => (
            <button
                key={t.id}
                onClick={() => { setActiveTab(t.id); setResultText(null); setInputData(''); setInputText(''); setPreview(null); setSelectedSpread('THREE_CARDS'); }}
                className={`flex-1 py-4 min-w-[80px] flex flex-col items-center gap-1 text-xs font-medium transition-all
                    ${activeTab === t.id ? 'text-indigo-900 border-b-2 border-indigo-900 bg-indigo-50/50' : 'text-stone-400 hover:text-stone-600'}
                `}
            >
                <t.icon size={20} />
                {t.label}
            </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
            
            {/* Header Info */}
            <div className="text-center mb-6">
                <div className="w-12 h-12 bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                    <Orbit className="text-white" size={24} />
                </div>
                <h2 className="text-xl font-bold serif text-stone-900">
                    {activeTab === 'ASTRO' && '西洋占星術 (Astrology)'}
                    {activeTab === 'TAROT' && '塔羅占卜 (Tarot)'}
                    {activeTab === 'ALCHEMY' && '煉金轉化 (Alchemy)'}
                    {activeTab === 'KABBALAH' && '卡巴拉與魔法 (Magick)'}
                </h2>
                <p className="text-xs text-stone-500 font-serif italic mt-1">
                    {activeTab === 'ASTRO' && '基於天體運行，推演人格與命運藍圖。'}
                    {activeTab === 'TAROT' && '透過原型符號與直覺，洞察當下與未來。'}
                    {activeTab === 'ALCHEMY' && '將靈魂的鉛轉化為金，探索內在神性。'}
                    {activeTab === 'KABBALAH' && '生命之樹的路徑探索，連結宇宙真理。'}
                </p>
            </div>

            {/* Input Section */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                
                {activeTab === 'ASTRO' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-500 mb-1">出生日期</label>
                            <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-500 mb-1">出生時間</label>
                                <input type="time" value={birthTime} onChange={e => setBirthTime(e.target.value)} className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-500 mb-1">出生城市</label>
                                <input type="text" placeholder="例如: 台北" value={birthPlace} onChange={e => setBirthPlace(e.target.value)} className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200" />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'TAROT' && (
                    <div className="space-y-6">
                        {/* Spread Selection */}
                        <div>
                            <label className="block text-xs font-bold text-stone-500 mb-3 uppercase tracking-wider">選擇牌陣</label>
                            <div className="grid grid-cols-2 gap-3">
                                {TAROT_SPREADS.map(spread => (
                                    <button
                                        key={spread.id}
                                        onClick={() => setSelectedSpread(spread.id)}
                                        className={`p-3 rounded-xl border text-left transition-all group
                                            ${selectedSpread === spread.id 
                                                ? 'bg-indigo-900 border-indigo-900 text-white shadow-md' 
                                                : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-indigo-300 hover:bg-white'}
                                        `}
                                    >
                                        <div className={`text-sm font-bold mb-0.5 ${selectedSpread === spread.id ? 'text-white' : 'text-stone-800'}`}>
                                            {spread.label}
                                        </div>
                                        <div className={`text-[10px] leading-tight ${selectedSpread === spread.id ? 'text-indigo-100' : 'text-stone-400'}`}>
                                            {spread.description}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-stone-300 rounded-xl p-6 flex flex-col items-center justify-center text-stone-400 hover:bg-stone-50 hover:border-indigo-400 transition-all cursor-pointer min-h-[120px] relative overflow-hidden"
                        >
                            {preview ? (
                                <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-contain bg-stone-900" />
                            ) : (
                                <>
                                    <Upload size={24} className="mb-2" />
                                    <span className="text-xs">上傳牌面 (選填)</span>
                                </>
                            )}
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                        </div>
                        <textarea 
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            placeholder="請專注想著您的問題..."
                            className="w-full h-24 p-3 bg-stone-50 rounded-xl border border-stone-200 resize-none outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                    </div>
                )}

                {(activeTab === 'ALCHEMY' || activeTab === 'KABBALAH') && (
                    <div>
                        <textarea 
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            placeholder={activeTab === 'ALCHEMY' ? "描述您目前的精神困境或渴望轉化的目標..." : "關於生命意義、靈性成長或魔法符號的疑問..."}
                            className="w-full h-40 p-4 bg-stone-50 rounded-xl border border-stone-200 resize-none outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                    </div>
                )}

                <button 
                    onClick={analyze}
                    disabled={isLoading || (activeTab === 'ASTRO' && !birthDate) || (activeTab !== 'ASTRO' && !inputText && !inputData)}
                    className={`w-full mt-6 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all text-lg shadow-md
                        ${isLoading ? 'bg-stone-100 text-stone-400' : 'bg-indigo-900 text-white hover:bg-indigo-800 active:scale-95'}
                    `}
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : <Orbit size={20} />}
                    {isLoading ? '連結宇宙意識...' : '開始神秘學解讀'}
                </button>
            </div>

            {/* Result Section */}
            {resultText && (
                <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-indigo-900"></div>
                    <h3 className="text-lg font-bold text-indigo-900 serif mb-4 flex items-center gap-2">
                        <Star size={18} fill="currentColor" />
                        神祕學啟示
                    </h3>
                    <button 
                        onClick={() => setIsChatOpen(true)}
                        className="absolute top-4 right-4 p-2 bg-indigo-50 text-indigo-900 rounded-full hover:bg-indigo-100 transition-colors"
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
        </div>
      </div>
    </div>
  );
};
