
import React from 'react';
import { ViewMode } from '../types';
import { LayoutDashboard, Sparkles, PenTool, Wind, Brain, FileText, Mic, MessageSquare, Info, Orbit } from 'lucide-react';

interface NavigationProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const items = [
    { id: ViewMode.Dashboard, label: '儀表', icon: LayoutDashboard },
    { id: ViewMode.Metaphysics, label: '玄學分析', icon: Sparkles },
    { id: ViewMode.Western, label: '西方玄學', icon: Orbit },
    { id: ViewMode.Divination, label: '測字', icon: PenTool },
    { id: ViewMode.FengShui, label: '風水', icon: Wind },
    { id: ViewMode.Science, label: '科學評估', icon: Brain },
    { id: ViewMode.Report, label: '綜合報告', icon: FileText },
    { id: ViewMode.Live, label: '靈性對話', icon: Mic },
    { id: ViewMode.Chat, label: '自由諮詢', icon: MessageSquare },
    { id: ViewMode.About, label: '關於我們', icon: Info },
  ];

  return (
    <div className="w-full bg-[#FEFCE8] px-4 pt-2 pb-2 sticky top-0 z-50 border-b border-stone-100/50 shadow-sm">
      <div className="flex overflow-x-auto gap-1 no-scrollbar pb-1">
        {items.map((item) => {
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-xl whitespace-nowrap transition-all text-sm font-medium
                ${isActive 
                  ? 'bg-stone-800 text-stone-50 shadow-md' 
                  : 'bg-transparent text-stone-500 hover:bg-stone-100 hover:text-stone-800'}
              `}
            >
              <item.icon size={15} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
