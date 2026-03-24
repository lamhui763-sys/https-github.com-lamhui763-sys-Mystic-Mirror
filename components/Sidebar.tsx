import React from 'react';
import { ViewMode } from '../types';
import { LayoutDashboard, Sparkles, PenTool, Wind, Brain, FileText, Mic, MessageSquare } from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const items = [
    { id: ViewMode.Dashboard, label: '儀表板', icon: LayoutDashboard },
    { id: ViewMode.Metaphysics, label: '玄學核心', icon: Sparkles },
    { id: ViewMode.Divination, label: '測字問事', icon: PenTool },
    { id: ViewMode.FengShui, label: '風水佈局', icon: Wind },
    { id: ViewMode.Science, label: '科學評估', icon: Brain },
    { id: ViewMode.Report, label: '綜合報告', icon: FileText },
    { id: ViewMode.Live, label: '靈性語音', icon: Mic },
    { id: ViewMode.Chat, label: 'AI 諮詢', icon: MessageSquare },
  ];

  const btnClass = (isActive: boolean) => `
    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 mb-1
    ${isActive
      ? 'bg-stone-800 text-stone-50 shadow-lg' 
      : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'}
  `;

  return (
    <div className="w-64 h-screen bg-stone-900 border-r border-stone-800 flex flex-col p-4">
      <div className="flex items-center gap-3 px-2 py-4 mb-8">
        <div className="w-10 h-10 bg-gradient-to-tr from-yellow-600 to-amber-700 rounded-xl flex items-center justify-center shadow-lg">
          <Sparkles className="text-white w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold font-serif text-stone-100">
          Mystic Mirror
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto no-scrollbar">
        {items.map((item) => (
          <button 
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={btnClass(currentView === item.id)}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="pt-4 border-t border-stone-800 text-center">
         <span className="text-xs text-stone-600 font-serif italic">The Universe Awaits</span>
      </div>
    </div>
  );
};
