
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Sun, Hand, Eye, Calendar, Moon, PenTool, Wind, Brain, FileText, Mic, MessageSquare, ArrowRight, Github, Code, Terminal, BookOpen, User, Camera, Orbit } from 'lucide-react';

const DEFAULT_PHOTO = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=250&auto=format&fit=crop";

type Tab = 'DEVELOPER' | 'GUIDE';

export const AboutView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('DEVELOPER');
  const [developerPhoto, setDeveloperPhoto] = useState<string>(DEFAULT_PHOTO);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('developer_photo');
    if (saved) {
      setDeveloperPhoto(saved);
    }
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setDeveloperPhoto(base64);
        localStorage.setItem('developer_photo', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#FEFCE8]">
      {/* Tab Header */}
      <div className="flex border-b border-stone-200 bg-white/50 backdrop-blur-md">
        <button 
          onClick={() => setActiveTab('DEVELOPER')}
          className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-bold transition-all
            ${activeTab === 'DEVELOPER' ? 'text-stone-900 border-b-2 border-stone-900 bg-stone-50' : 'text-stone-400'}
          `}
        >
          <User size={18} /> 關於開發者
        </button>
        <button 
          onClick={() => setActiveTab('GUIDE')}
          className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-bold transition-all
            ${activeTab === 'GUIDE' ? 'text-stone-900 border-b-2 border-stone-900 bg-stone-50' : 'text-stone-400'}
          `}
        >
          <BookOpen size={18} /> 如何使用
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-32">
        <div className="max-w-3xl mx-auto">
          
          {/* DEVELOPER CONTENT */}
          {activeTab === 'DEVELOPER' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-xl overflow-hidden mb-8">
                  <div className="h-32 bg-gradient-to-r from-stone-800 to-stone-900 relative">
                     <div className="absolute inset-0 opacity-20">
                        <Sparkles className="absolute top-4 right-10 text-white" size={40} />
                        <Code className="absolute bottom-4 left-10 text-white" size={40} />
                     </div>
                  </div>
                  <div className="px-8 pb-8 text-center relative">
                     <div 
                       className="w-32 h-32 mx-auto -mt-16 rounded-full border-4 border-white shadow-lg overflow-hidden bg-stone-200 relative group cursor-pointer"
                       onClick={() => fileInputRef.current?.click()}
                     >
                        <img src={developerPhoto} alt="Master Ma" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                           <Camera className="text-white" size={24} />
                        </div>
                     </div>
                     <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                     <p className="text-[10px] text-stone-400 mt-2 italic">(點擊照片可上傳您的照片)</p>

                     <h2 className="text-2xl font-bold serif text-stone-900 mt-4">馬启堅大師 (Master Ma Qijian)</h2>
                     <p className="text-sm text-yellow-600 font-bold tracking-widest uppercase mb-4">首席靈性工程師 | 玄學科技整合者</p>
                     
                     <div className="text-stone-600 leading-relaxed font-serif text-justify bg-stone-50 p-6 rounded-2xl border border-stone-100">
                        <p className="mb-4">
                           「東方的八字是時間的密碼，西方的星盤是空間的投影。而代碼，是連結兩者的橋樑。」
                        </p>
                        <p className="mb-4">
                           馬启堅 (Ma Qijian) 早年投身於高頻交易算法的研究，卻在數據的海洋中看見了宇宙運行的碎形幾何。他發現金融市場的波動與星體運行的週期存在著驚人的共振。
                        </p>
                        <p>
                           為了追尋真理，他走訪世界，從中國龍虎山的天師府到倫敦的神秘學社團。<b>Mystic Mirror</b> 是他畢生所學的結晶——一個打破東西方界線，融合古老智慧與現代 AI 的靈性工具。
                        </p>
                     </div>
                     
                     <div className="mt-6 flex justify-center gap-4 text-stone-400">
                        <div className="flex items-center gap-1 text-xs font-mono bg-stone-100 px-3 py-1 rounded-full">
                           <Terminal size={12} /> Typescript
                        </div>
                        <div className="flex items-center gap-1 text-xs font-mono bg-stone-100 px-3 py-1 rounded-full">
                           <Orbit size={12} /> Astrology
                        </div>
                        <div className="flex items-center gap-1 text-xs font-mono bg-stone-100 px-3 py-1 rounded-full">
                           <Moon size={12} /> I-Ching
                        </div>
                     </div>
                  </div>
               </div>

               <div className="text-center text-stone-400 text-xs font-serif italic">
                 "我開發的不只是 App，而是一面能映照你靈魂深處的鏡子。" — Master Ma
               </div>
            </div>
          )}

          {/* GUIDE CONTENT */}
          {activeTab === 'GUIDE' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="text-center mb-8">
                 <h1 className="text-3xl font-bold serif text-stone-900 mb-2">Mystic Mirror 使用指南</h1>
                 <p className="text-stone-500 text-sm">如何使用科技洞察天機？</p>
               </div>

               <article className="prose prose-stone max-w-none font-serif text-stone-700">
                 <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm mb-6">
                    <h3 className="text-lg font-bold text-stone-900 mb-3 flex items-center gap-2">
                      <Sun className="text-yellow-600" size={20} />
                      1. 啟動每日氣場 (儀表板)
                    </h3>
                    <p className="text-sm leading-relaxed mb-0">
                      進入 App 的第一步，請在儀表板設定您的<b>出生日期與時間</b>。系統會將這些數據鎖定，並與每日的「流日干支」進行碰撞運算。每天早上打開 App，您會收到一份絕不重複的運勢報告，包含今日的幸運色、宜忌與身心建議。
                    </p>
                 </div>

                 <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm mb-6">
                    <h3 className="text-lg font-bold text-stone-900 mb-3 flex items-center gap-2">
                      <Sparkles className="text-purple-600" size={20} />
                      2. 解鎖玄學核心 (東方)
                    </h3>
                    <p className="text-sm leading-relaxed mb-4">
                      點擊底部的選單進入「玄學分析」，這裡有四個強大的 AI 模型：
                    </p>
                    <ul className="text-sm space-y-2 list-disc pl-5">
                       <li><b>手相/面相</b>：請在光線充足處拍攝。AI 會識別掌紋的主線與雜紋，或面部的十二宮位氣色。</li>
                       <li><b>八字排盤</b>：支援輸入農曆或國曆。AI 不僅排盤，還會根據「大運」分析未來十年的趨勢。</li>
                       <li><b>解夢</b>：醒來後立刻用語音或文字記錄夢境，AI 會結合佛洛伊德心理學與周公解夢進行解析。</li>
                    </ul>
                 </div>

                 <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm mb-6">
                    <h3 className="text-lg font-bold text-stone-900 mb-3 flex items-center gap-2">
                      <Orbit className="text-indigo-900" size={20} />
                      3. 西方玄學 (新功能)
                    </h3>
                    <p className="text-sm leading-relaxed mb-0">
                      探索西方神祕學的智慧：
                      <br/><b>占星術</b>：輸入出生地與時間，繪製本命星盤與相位分析。
                      <br/><b>塔羅占卜</b>：上傳牌面或進行虛擬抽牌，解答當下的困惑。
                      <br/><b>煉金與魔法</b>：透過卡巴拉生命之樹與煉金術哲學，轉化心靈狀態。
                    </p>
                 </div>

                 <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm mb-6">
                    <h3 className="text-lg font-bold text-stone-900 mb-3 flex items-center gap-2">
                      <PenTool className="text-stone-700" size={20} />
                      4. 測字與風水
                    </h3>
                    <p className="text-sm leading-relaxed mb-0">
                      <b>測字問事</b>適合解決具體的單一問題（如：這筆生意該不該做？）。請在畫板上手寫一個字，心誠則靈。<br/><br/>
                      <b>風水佈局</b>則需要您上傳房間的照片。AI 具備空間識別能力，能指出財位是否受阻，或床位擺放是否有煞氣。
                    </p>
                 </div>

                 <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm mb-6">
                    <h3 className="text-lg font-bold text-stone-900 mb-3 flex items-center gap-2">
                      <Brain className="text-indigo-600" size={20} />
                      5. 科學評估 (理性視角)
                    </h3>
                    <p className="text-sm leading-relaxed mb-0">
                      如果您偏好理性分析，請使用此模組。
                      <br/><b>個人使用說明書</b>：用幽默的方式解析您的人格特質。
                      <br/><b>科學算命</b>：結合博弈論與混沌理論，為您的決策計算成功機率。
                      <br/><b>每日記錄</b>：追蹤睡眠與心情，AI 將為您找出生活中的隱藏規律。
                    </p>
                 </div>

                 <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm mb-6">
                    <h3 className="text-lg font-bold text-stone-900 mb-3 flex items-center gap-2">
                      <Mic className="text-amber-600" size={20} />
                      6. 靈性對話與自由諮詢
                    </h3>
                    <p className="text-sm leading-relaxed mb-0">
                      <b>靈性對話 (Live)</b>：戴上耳機，與 AI 智者進行實時語音通話，如同與一位老友深夜促膝長談。<br/><br/>
                      <b>自由諮詢 (Chat)</b>：有任何無法歸類的問題？在這裡上傳照片或文字，AI 大師將為您提供一對一的專屬解答。
                    </p>
                 </div>
                 
                 <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm mb-6">
                    <h3 className="text-lg font-bold text-stone-900 mb-3 flex items-center gap-2">
                      <FileText className="text-emerald-600" size={20} />
                      7. 終極目標：靈魂藍圖
                    </h3>
                    <p className="text-sm leading-relaxed mb-0">
                      這是 Mystic Mirror 最特別的功能。當您完成了上述各項分析後，請前往「綜合報告」頁面。系統會將八字、星盤、手相、風水等分散的數據進行交叉比對，為您生成一份長篇的、深度整合的人生戰略報告。
                    </p>
                 </div>
               </article>

               <div className="text-center pt-8 pb-4">
                  <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="bg-stone-900 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg">
                    開始探索
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
