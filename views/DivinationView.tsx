import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { PenTool, Upload, Loader2, Send, X, HelpCircle, RotateCcw, Eraser, Brush, History, Trash2, Calendar, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatDialog } from '../components/ChatDialog';

interface Props {
  onSaveResult: (result: string) => void;
}

type InputMode = 'DRAW' | 'UPLOAD';

interface DivinationHistoryItem {
  id: string;
  image: string;
  question: string;
  result: string;
  timestamp: number;
}

export const DivinationView: React.FC<Props> = ({ onSaveResult }) => {
  const [inputMode, setInputMode] = useState<InputMode>('DRAW');
  const [question, setQuestion] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeChatResult, setActiveChatResult] = useState<string | null>(null);
  const [history, setHistory] = useState<DivinationHistoryItem[]>([]);
  
  // Canvas State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load History on Mount
  useEffect(() => {
    const saved = localStorage.getItem('divination_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Save History when updated
  const saveToHistory = (newItem: DivinationHistoryItem) => {
    const updated = [newItem, ...history].slice(0, 20); // Keep last 20
    setHistory(updated);
    localStorage.setItem('divination_history', JSON.stringify(updated));
  };

  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('divination_history', JSON.stringify(updated));
  };

  const clearAllHistory = () => {
    if (window.confirm('確定要清除所有測字紀錄嗎？這將無法復原。')) {
      setHistory([]);
      localStorage.removeItem('divination_history');
    }
  };

  const loadHistoryItem = (item: DivinationHistoryItem) => {
    setImage(item.image);
    setQuestion(item.question);
    setResult(item.result);
    setInputMode('UPLOAD'); // Show as image
    // Scroll to top to see the loaded result
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync canvas internal resolution with its display size
  const syncCanvasSize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#1C1917';
      ctx.lineWidth = 4;
    }
  };

  useLayoutEffect(() => {
    if (inputMode === 'DRAW') {
      const timer = setTimeout(syncCanvasSize, 100);
      window.addEventListener('resize', syncCanvasSize);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', syncCanvasSize);
      };
    }
  }, [inputMode]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      setImage(dataUrl);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setImage(null);
      setResult(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    let finalImage = image;
    if (inputMode === 'DRAW' && canvasRef.current && !image) {
      finalImage = canvasRef.current.toDataURL('image/png');
    }
    if (!finalImage || !question || isLoading) return;
    setIsLoading(true);
    setResult(null);
    
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("No API Key");
      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: "你是一位精通「測字」（拆字）的玄學大師。用戶會提供一個漢字（可能是手寫或照片）並提出問題。請從字形結構、筆畫象形、五行屬性、拆解意義以及諧音等多個角度深刻分析這個字。結合用戶具體的問題，給出吉凶判斷和具體的指引建議。請務必引用《字觸》或《梅花易數》等測字經典作為分析依據，確保每一項分析都有其學理來源。語氣要高深莫測但切中要害，富有東方哲學智慧。請用繁體中文回答。"
        },
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/png', data: finalImage.split(',')[1] } },
            { text: `求測問題: ${question}` }
          ]
        }
      });

      const text = response.text || "無法解讀，請重試。";
      setResult(text);
      onSaveResult(text);

      // Add to history
      saveToHistory({
        id: Date.now().toString(),
        image: finalImage,
        question: question,
        result: text,
        timestamp: Date.now()
      });

    } catch (e: any) {
      console.error(e);
      setResult(`天機被遮蔽... (錯誤: ${e.message})`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 bg-[#FEFCE8] pb-32">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-stone-900 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-xl rotate-3">
            <PenTool className="text-stone-50" size={32} />
          </div>
          <h1 className="text-2xl font-bold serif text-stone-900">測字問事</h1>
          <p className="text-stone-500 text-sm mt-2 font-serif italic">一字見心，一筆斷吉凶。</p>
        </div>

        {/* Main Interface Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 space-y-6 relative overflow-hidden mb-12">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-stone-200 via-stone-400 to-stone-200"></div>

           {/* Input Mode Toggle */}
           <div className="flex bg-stone-100 p-1 rounded-xl">
             <button 
               onClick={() => { setInputMode('DRAW'); setImage(null); setResult(null); }}
               className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all
                 ${inputMode === 'DRAW' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}
               `}
             >
               <Brush size={16} /> 手寫墨寶
             </button>
             <button 
               onClick={() => { setInputMode('UPLOAD'); setImage(null); setResult(null); }}
               className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all
                 ${inputMode === 'UPLOAD' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}
               `}
             >
               <Upload size={16} /> 上傳照片
             </button>
           </div>

           {/* Input Area */}
           <div ref={containerRef}>
             <div className="flex justify-between items-baseline mb-3">
                <label className="text-sm font-bold text-stone-800">
                  {inputMode === 'DRAW' ? '請在畫板寫下一字' : '1. 拍攝/上傳一字'}
                </label>
                {inputMode === 'DRAW' && (
                  <button 
                    onClick={clearCanvas}
                    className="text-xs text-stone-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw size={12} /> 清空畫板
                  </button>
                )}
             </div>
             
             <div className={`
               relative rounded-2xl border-2 border-stone-100 flex items-center justify-center overflow-hidden bg-[#FAF9F6] shadow-inner transition-all
               ${inputMode === 'DRAW' ? 'cursor-crosshair h-64' : 'h-64 cursor-pointer hover:border-yellow-400'}
             `}>
               {inputMode === 'DRAW' ? (
                 <canvas
                   ref={canvasRef}
                   onMouseDown={startDrawing}
                   onMouseMove={draw}
                   onMouseUp={stopDrawing}
                   onMouseLeave={stopDrawing}
                   onTouchStart={startDrawing}
                   onTouchMove={draw}
                   onTouchEnd={stopDrawing}
                   className="w-full h-full touch-none block"
                 />
               ) : (
                 <div 
                   onClick={() => fileInputRef.current?.click()}
                   className="w-full h-full flex flex-col items-center justify-center text-stone-400 group"
                 >
                   {image ? (
                     <>
                       <img src={image} alt="upload" className="w-full h-full object-contain p-4" />
                       <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                         <span className="bg-white/90 px-3 py-1 rounded-full text-xs text-stone-600 shadow-sm">更換照片</span>
                       </div>
                     </>
                   ) : (
                     <>
                       <Upload className="mb-2" size={32} />
                       <span className="text-sm font-medium">點擊選擇照片</span>
                       <p className="text-[10px] mt-1 opacity-60">支援 JPG, PNG 格式</p>
                     </>
                   )}
                   <input 
                     type="file" 
                     ref={fileInputRef} 
                     className="hidden" 
                     accept="image/*" 
                     onChange={handleFileUpload} 
                   />
                 </div>
               )}
             </div>
           </div>

           {/* Question Input */}
           <div className="space-y-3">
             <label className="block text-sm font-bold text-stone-800">心中疑惑</label>
             <div className="relative group">
               <input
                 type="text"
                 value={question}
                 onChange={(e) => setQuestion(e.target.value)}
                 placeholder="例如：今年事業運勢如何？"
                 className="w-full p-4 pr-16 border border-stone-200 rounded-2xl bg-stone-50 focus:bg-white focus:ring-2 focus:ring-stone-200 outline-none transition-all shadow-sm"
                 onKeyDown={(e) => e.key === 'Enter' && analyze()}
               />
               <button
                 onClick={analyze}
                 disabled={(!image && inputMode === 'UPLOAD') || !question || isLoading}
                 className={`absolute right-2 top-2 bottom-2 px-5 rounded-xl flex items-center justify-center transition-all duration-300
                   ${((!image && inputMode === 'UPLOAD') || !question || isLoading) 
                     ? 'bg-stone-100 text-stone-300 cursor-not-allowed' 
                     : 'bg-stone-900 text-white shadow-lg hover:bg-stone-800 hover:scale-[1.05]'}
                 `}
               >
                 {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
               </button>
             </div>
           </div>

           {/* Current Result Display */}
           {result && (
             <div className="mt-8 pt-6 border-t border-stone-100 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="flex items-center gap-2 mb-4 relative">
                    <div className="p-1.5 bg-yellow-50 rounded-lg">
                        <PenTool size={18} className="text-yellow-700" />
                    </div>
                    <h3 className="font-serif font-bold text-stone-800 text-lg">大師批註</h3>
                    <button 
                        onClick={() => setActiveChatResult(result)}
                        className="absolute top-0 right-0 p-2 bg-yellow-50 text-yellow-900 rounded-full hover:bg-yellow-100 transition-colors"
                    >
                        <MessageSquare size={18} />
                    </button>
                </div>
                <div className="markdown-body text-stone-700 leading-relaxed font-serif p-6 bg-stone-50 rounded-2xl border border-stone-100 shadow-inner relative">
                  <div className="absolute top-4 right-4 opacity-5 pointer-events-none">
                    <PenTool size={60} />
                  </div>
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
                {activeChatResult && (
                  <ChatDialog initialContext={activeChatResult} onClose={() => setActiveChatResult(null)} />
                )}
             </div>
           )}
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div className="space-y-6 animate-in fade-in duration-1000 delay-300">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-stone-800">
                <History size={20} className="text-stone-400" />
                <h2 className="font-serif font-bold text-xl">過往靈感</h2>
              </div>
              <button 
                onClick={clearAllHistory}
                className="text-xs text-stone-400 hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <Trash2 size={12} /> 清空紀錄
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {history.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => loadHistoryItem(item)}
                  className="bg-white p-4 rounded-2xl border border-stone-200 hover:border-yellow-400 hover:shadow-md transition-all cursor-pointer group flex gap-4"
                >
                  <div className="w-20 h-20 bg-stone-50 rounded-xl overflow-hidden flex-shrink-0 border border-stone-100">
                    <img src={item.image} alt="past character" className="w-full h-full object-contain p-2" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] text-stone-400 flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button 
                        onClick={(e) => deleteHistoryItem(e, item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-stone-300 hover:text-red-500 transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-stone-800 truncate mb-1 pr-4">{item.question}</p>
                    <p className="text-xs text-stone-500 line-clamp-2 italic font-serif opacity-70">
                      {item.result.replace(/[#*`]/g, '').substring(0, 80)}...
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-12 flex gap-4 text-[10px] text-stone-400 justify-center font-serif italic pb-12">
            <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 bg-stone-300 rounded-full" />
                <span>一字一念，誠心則靈</span>
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 bg-stone-300 rounded-full" />
                <span>字跡清晰，天機易現</span>
            </div>
        </div>
      </div>
    </div>
  );
};
