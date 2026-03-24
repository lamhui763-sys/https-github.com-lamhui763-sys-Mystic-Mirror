
import React, { useState, useEffect } from 'react';
import { ViewMode, AnalysisResults } from './types';
import { Navigation } from './components/Navigation';
import { SearchBar } from './components/SearchBar';
import { DashboardView } from './views/DashboardView';
import { ChatView } from './views/ChatView';
import { LiveView } from './views/LiveView';
import { MetaphysicsView } from './views/MetaphysicsView';
import { WesternView } from './views/WesternView';
import { DivinationView } from './views/DivinationView';
import { FengShuiView } from './views/FengShuiView';
import { ScienceView } from './views/ScienceView';
import { ReportView } from './views/ReportView';
import { AboutView } from './views/AboutView';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.Dashboard);
  
  // Centralized state
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults>(() => {
    const saved = localStorage.getItem('mystic_mirror_results');
    return saved ? JSON.parse(saved) : { lastUpdated: Date.now() };
  });

  useEffect(() => {
    localStorage.setItem('mystic_mirror_results', JSON.stringify(analysisResults));
  }, [analysisResults]);

  const updateAnalysis = (key: keyof AnalysisResults, value: any) => {
    setAnalysisResults(prev => ({
      ...prev,
      [key]: value,
      lastUpdated: Date.now()
    }));
  };

  const updateBirthInfo = (date: string, time: string) => {
    setAnalysisResults(prev => ({
      ...prev,
      birthDate: date,
      birthTime: time,
      // Clear old guidance when birth info changes
      dailyGuidance: undefined,
      dailyGuidanceDate: undefined,
      lastUpdated: Date.now()
    }));
  };

  const updateDailyGuidance = (guidance: string, dateStr: string) => {
    setAnalysisResults(prev => ({
      ...prev,
      dailyGuidance: guidance,
      dailyGuidanceDate: dateStr,
      lastUpdated: Date.now()
    }));
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#FEFCE8]">
      {/* Top App Header */}
      <div className="px-6 py-4 flex justify-between items-center bg-[#FEFCE8] border-b border-stone-100">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView(ViewMode.Dashboard)}>
           <div className="bg-gradient-to-tr from-stone-700 to-stone-900 p-1.5 rounded-lg text-white shadow-md">
              <Sparkles size={16} fill="currentColor" />
           </div>
           <span className="font-serif font-bold text-lg text-stone-800 tracking-wide">Mystic Mirror</span>
        </div>
        
        <SearchBar onSearch={(query) => console.log('Searching for:', query)} />
        
        <div className="w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center text-stone-600 font-serif text-xs border border-stone-300">
          You
        </div>
      </div>

      <Navigation 
        currentView={currentView} 
        onViewChange={setCurrentView} 
      />
      
      <main className="flex-1 relative h-full overflow-hidden">
        {currentView === ViewMode.Dashboard && (
          <DashboardView 
            results={analysisResults} 
            onViewChange={setCurrentView}
            onUpdateBirthInfo={updateBirthInfo}
            onUpdateDailyGuidance={updateDailyGuidance}
          />
        )}
        {currentView === ViewMode.Metaphysics && (
          <MetaphysicsView 
            onSaveResult={(type, result) => updateAnalysis(type, result)}
            results={analysisResults}
          />
        )}
        {currentView === ViewMode.Western && (
          <WesternView 
            onSaveResult={(result) => updateAnalysis('western', result)}
            results={analysisResults}
          />
        )}
        {currentView === ViewMode.Divination && (
           <DivinationView onSaveResult={(result) => updateAnalysis('divination', result)} />
        )}
        {currentView === ViewMode.FengShui && (
           <FengShuiView 
             results={analysisResults}
             onSaveResult={(result) => updateAnalysis('fengshui', result)} 
           />
        )}
        {currentView === ViewMode.Science && (
           <ScienceView onSaveResult={(result) => updateAnalysis('science', result)} />
        )}
        {currentView === ViewMode.Report && (
           <ReportView results={analysisResults} />
        )}
        {currentView === ViewMode.Chat && <ChatView />}
        {currentView === ViewMode.Live && <LiveView />}
        {currentView === ViewMode.About && <AboutView />}
      </main>
    </div>
  );
}
