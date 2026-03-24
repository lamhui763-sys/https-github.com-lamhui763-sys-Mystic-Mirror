
import React, { useState } from 'react';
import { AnalysisResults } from '../types';
import { GoogleGenAI } from '@google/genai';
import { FileText, Sparkles, Loader2, Download, Share2, Fingerprint } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  results: AnalysisResults;
}

export const ReportView: React.FC<Props> = ({ results }) => {
  const [report, setReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter available data
  const availableModules = [
    { key: 'bazi', label: '八字命理', data: results.bazi },
    { key: 'western', label: '西方玄學', data: results.western },
    { key: 'palm', label: '手相解讀', data: results.palm },
    { key: 'face', label: '面相分析', data: results.face },
    { key: 'fengshui', label: '風水佈局', data: results.fengshui },
    { key: 'divination', label: '測字問事', data: results.divination },
    { key: 'science', label: '科學評估', data: results.science },
  ].filter(m => !!m.data);

  const generateReport = async () => {
    if (availableModules.length === 0 || isLoading) return;
    setIsLoading(true);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("No API Key");
      const ai = new GoogleGenAI({ apiKey });

      // Compile all data into a context string
      const dataContext = availableModules.map(m => `### ${m.label}數據:\n${m.data}`).join('\n\n');

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: "你是一位整合了東西方智慧的終極人生導師。請閱讀用戶提供的所有玄學與科學分析數據，並撰寫一份名為「靈魂藍圖 (Soul Blueprint)」的深度整合報告。任務：1. 尋找不同數據之間的共鳴點（例如八字缺火但星盤火象特質重，或手相與占星結論的一致性）。2. 綜合分析用戶的優勢、潛在挑戰與人生課題。3. 給出一個整體的行動指南。語氣要宏大、優雅、充滿啟發性，並使用 Markdown 格式排版（使用標題、列表、引用）。請用繁體中文撰寫。"
        },
        contents: `請整合以下分析數據，生成我的靈魂藍圖報告：\n\n${dataContext}`
      });

      setReport(response.text || "生成報告時發生錯誤。");

    } catch (e) {
      console.error(e);
      setReport("無法連結宇宙數據庫，請稍後再試。");
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date().toLocaleDateString('zh-TW');

  return (
    <div className="h-full overflow-y-auto bg-[#FEFCE8] p-6 md:p-10 pb-24">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-stone-900 text-yellow-500 rounded-2xl mb-4 shadow-xl">
          <Fingerprint size={32} />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold serif text-stone-900 tracking-tight">綜合靈魂報告</h1>
        <p className="text-stone-500 mt-2 font-serif italic">The Soul Blueprint</p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sidebar: Data Sources */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
             <h3 className="font-bold text-stone-800 mb-4 text-sm uppercase tracking-wider">分析數據源</h3>
             <div className="space-y-3">
               {[
                 { key: 'bazi', label: '八字' },
                 { key: 'western', label: '西方玄學' },
                 { key: 'palm', label: '手相' },
                 { key: 'face', label: '面相' },
                 { key: 'fengshui', label: '風水' },
                 { key: 'science', label: '心理' },
               ].map((item) => {
                 const hasData = !!results[item.key as keyof AnalysisResults];
                 return (
                   <div key={item.key} className={`flex items-center justify-between p-3 rounded-lg text-sm ${hasData ? 'bg-green-50 text-green-800' : 'bg-stone-50 text-stone-400'}`}>
                      <span>{item.label}</span>
                      {hasData ? <span className="text-xs font-bold">已完成</span> : <span className="text-xs">未檢測</span>}
                   </div>
                 );
               })}
             </div>
             <div className="mt-6 pt-6 border-t border-stone-100">
               <button 
                 onClick={generateReport}
                 disabled={availableModules.length < 1 || isLoading}
                 className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all
                   ${availableModules.length < 1 || isLoading 
                     ? 'bg-stone-100 text-stone-400 cursor-not-allowed' 
                     : 'bg-stone-900 text-white hover:bg-stone-800 shadow-lg'}
                 `}
               >
                 {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                 {report ? '重新生成' : '生成報告'}
               </button>
               {availableModules.length < 1 && (
                 <p className="text-xs text-red-400 mt-2 text-center">請至少完成一項分析</p>
               )}
             </div>
           </div>
        </div>

        {/* Main Report Area */}
        <div className="lg:col-span-2">
           {report ? (
             <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-stone-100 relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600"></div>
                <div className="flex justify-between items-end mb-8 border-b border-stone-100 pb-4">
                   <div>
                     <h2 className="font-serif text-2xl font-bold text-stone-900">靈魂藍圖</h2>
                     <p className="text-xs text-stone-400 mt-1 font-mono uppercase">Report ID: {Date.now().toString().slice(-6)} / {today}</p>
                   </div>
                   <Fingerprint className="text-stone-200" size={48} />
                </div>
                
                <div className="markdown-body text-stone-700 leading-relaxed font-serif">
                   <ReactMarkdown>{report}</ReactMarkdown>
                </div>

                <div className="mt-12 pt-8 border-t border-stone-100 flex justify-center gap-4 print:hidden">
                   <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600 text-sm transition-colors">
                     <Download size={16} /> 存為 PDF
                   </button>
                   <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600 text-sm transition-colors">
                     <Share2 size={16} /> 分享
                   </button>
                </div>
             </div>
           ) : (
             <div className="h-full min-h-[400px] bg-white/50 rounded-2xl border border-dashed border-stone-300 flex flex-col items-center justify-center p-8 text-stone-400">
                <FileText size={48} className="mb-4 opacity-50" />
                <h3 className="font-serif text-lg font-medium text-stone-600">等待生成</h3>
                <p className="text-sm text-center max-w-xs mt-2">
                  當您完成足夠的分析後，Mystic Mirror 將為您編織各個維度的洞見，揭示您命運的全貌。
                </p>
             </div>
           )}
        </div>

      </div>
    </div>
  );
};
