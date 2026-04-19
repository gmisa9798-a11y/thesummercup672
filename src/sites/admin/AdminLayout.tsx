import React from 'react';
import { Trophy, Shield, Users, Calendar, BarChart2, Settings, LogOut, LogIn, Info, ScrollText } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TabType } from '../../types';
import { User as FirebaseUser } from 'firebase/auth';
import { auth } from '../../firebase';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  user: FirebaseUser | null;
  onLogin: () => void;
}

export default function AdminLayout({ children, activeTab, setActiveTab, user, onLogin }: AdminLayoutProps) {
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

  const allTabs = [...mainTabs, { id: 'admin', label: 'Адмін', icon: Settings }];

  return (
    <div className="min-h-screen flex flex-col pb-24 lg:pb-32">
      <header className="bg-pitch/80 backdrop-blur-xl border-b border-accent/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-4 lg:gap-8">
            <div className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group" onClick={() => setActiveTab('table')}>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-accent to-[#00bd68] rounded-full shadow-[0_0_15px_rgba(0,255,136,0.3)] group-hover:scale-110 transition-transform flex items-center justify-center p-1 sm:p-1.5">
                <Trophy className="w-full h-full text-pitch" />
              </div>
              <h1 className="text-sm sm:text-lg font-black tracking-tighter text-white uppercase whitespace-nowrap">
                SummerCup<span className="text-accent">.ADMIN</span>
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

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-[10px] font-bold text-white/90 leading-none">{user.displayName}</div>
                  <div className="text-[8px] font-bold text-accent uppercase tracking-widest mt-1">
                    АДМІНІСТРАТОР
                  </div>
                </div>
                {user.photoURL && (
                   <img 
                    src={user.photoURL} 
                    alt="" 
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full border-2 border-accent/20"
                  />
                )}
                <button 
                  onClick={() => auth.signOut()}
                  className="p-2 text-white/30 hover:text-white transition-colors"
                  title="Вийти"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="bg-accent text-pitch text-[10px] font-black uppercase tracking-[2px] px-6 py-3 rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,136,0.2)] flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Увійти</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-10">
        <div className="bg-accent/5 border border-accent/10 rounded-2xl p-3 mb-8 flex items-center gap-3">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Ви працюєте в панелі керування</span>
        </div>
        {children}
      </main>

      <footer className="py-6 px-4 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[11px] font-bold uppercase tracking-widest text-accent/50">SUMMERCUP672.COM - ПАНЕЛЬ АДМІНІСТРАТОРА</div>
        </div>
      </footer>

      {/* Admin Universal Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 glass-morphism border-t border-white/10 px-1 sm:px-2 py-4 z-60 rounded-t-2xl mb-safe flex shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex justify-around items-center w-full max-w-7xl mx-auto">
          {allTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "flex flex-col items-center gap-1 transition-all group px-1 sm:px-4 py-1 rounded-xl relative",
                activeTab === tab.id 
                  ? "text-accent bg-accent/5" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon className={cn("w-3.5 h-3.5 sm:w-5 sm:h-5 transition-transform", activeTab === tab.id && "scale-110")} />
              <span className="text-[7px] min-[375px]:text-[8px] sm:text-[10px] uppercase font-black tracking-tighter sm:tracking-widest">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="w-1 h-1 bg-accent rounded-full animate-in zoom-in absolute -bottom-1 shadow-[0_0_10px_#00ff88]" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
