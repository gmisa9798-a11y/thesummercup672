import React from 'react';
import { Trophy, Info, ScrollText, Shield, Users, Calendar, BarChart2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TabType } from '../../types';

interface PublicLayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export default function PublicLayout({ children, activeTab, setActiveTab }: PublicLayoutProps) {
  const mainTabs = [
    { id: 'table', label: 'Таблиця', icon: Trophy },
    { id: 'teams', label: 'Команди', icon: Shield },
    { id: 'players', label: 'Гравці', icon: Users },
    { id: 'matches', label: 'Розклад', icon: Calendar },
    { id: 'stats', label: 'Статистика', icon: BarChart2 },
  ];

  const topTabs = [
    { id: 'regulations', label: 'Регламент', icon: ScrollText },
    { id: 'info', label: 'Про турнір', icon: Info },
  ];

  return (
    <div className="min-h-screen flex flex-col pb-24">
      <header className="bg-pitch/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-4 lg:gap-8">
            <div className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group" onClick={() => setActiveTab('table')}>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-accent to-[#00bd68] rounded-full shadow-[0_0_15px_rgba(0,255,136,0.3)] group-hover:scale-110 transition-transform flex items-center justify-center p-1 sm:p-1.5">
                <Trophy className="w-full h-full text-pitch" />
              </div>
              <h1 className="text-sm sm:text-lg font-black tracking-tighter text-white uppercase whitespace-nowrap">
                SummerCup<span className="text-accent underline decoration-accent/30 underline-offset-4">672.com</span>
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-6 ml-1 sm:ml-4 border-l border-white/10 pl-2 sm:pl-6">
              {topTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={cn(
                    "text-[8px] sm:text-[12px] font-black uppercase tracking-[1px] sm:tracking-[2px] transition-all shrink-0 py-1 px-1",
                    activeTab === tab.id 
                      ? "text-accent border-b border-accent" 
                      : "text-white/30 hover:text-white"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-10">
        {children}
      </main>

      <footer className="py-6 px-4 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[11px] font-bold uppercase tracking-widest text-white/30">&copy; 2026 SUMMERCUP672.COM - PUBLIC</div>
        </div>
      </footer>

      {/* Public Bottom Nav - Pure View Only */}
      <nav className="fixed bottom-0 left-0 right-0 glass-morphism border-t border-white/10 px-1 sm:px-2 py-4 z-50 rounded-t-2xl mb-safe flex">
        <div className="flex justify-around items-center w-full max-w-7xl mx-auto">
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "flex flex-col items-center gap-1 transition-all group px-2 sm:px-4 py-1 rounded-xl relative",
                activeTab === tab.id 
                  ? "text-accent bg-accent/5" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon className={cn("w-4 h-4 sm:w-5 sm:h-5 transition-transform", activeTab === tab.id && "scale-110")} />
              <span className="text-[8px] sm:text-[10px] uppercase font-black tracking-tighter sm:tracking-widest">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="w-1 h-1 bg-accent rounded-full animate-in zoom-in absolute -bottom-1" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
