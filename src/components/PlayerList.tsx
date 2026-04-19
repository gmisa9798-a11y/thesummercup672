import React, { useState } from 'react';
import { Search, Filter, Shield, Zap, Target, LayoutGrid, List } from 'lucide-react';
import { Player, Team } from '../types';
import { cn } from '../lib/utils';

interface PlayerListProps {
  players: Player[];
  teams: Team[];
}

type SortKey = 'goals' | 'assists' | 'discipline';

export default function PlayerList({ players, teams }: PlayerListProps) {
  const [search, setSearch] = useState('');
  const [filterPos, setFilterPos] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortKey>('goals');

  const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || 'Unknown';
  const getTeamLogo = (id: string) => teams.find(t => t.id === id)?.logoUrl || '';

  const sortedPlayers = [...players]
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesPos = filterPos === 'all' || p.position === filterPos;
      return matchesSearch && matchesPos;
    })
    .sort((a, b) => {
      if (sortBy === 'goals') return (b.goals || 0) - (a.goals || 0) || (b.assists || 0) - (a.assists || 0);
      if (sortBy === 'assists') return (b.assists || 0) - (a.assists || 0) || (b.goals || 0) - (a.goals || 0);
      if (sortBy === 'discipline') {
        const scoreA = (a.redCards || 0) * 3 + (a.yellowCards || 0);
        const scoreB = (b.redCards || 0) * 3 + (b.yellowCards || 0);
        return scoreB - scoreA;
      }
      return 0;
    });

  const positions = [
    { id: 'all', label: 'Всі' },
    { id: 'GK', label: 'GK', icon: Shield },
    { id: 'DEF', label: 'DEF', icon: Shield },
    { id: 'MID', label: 'MID', icon: Zap },
    { id: 'FWD', label: 'FWD', icon: Target },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="space-y-4 flex-1 max-w-2xl">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black brand-font text-white uppercase tracking-tighter">Рейтинг Гравців</h2>
            <div className="px-2 py-0.5 rounded bg-accent/10 border border-accent/20 text-[8px] font-black text-accent uppercase tracking-widest">Live Stats</div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input 
                type="text"
                placeholder="Шукати за іменем..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-white focus:ring-2 focus:ring-accent/30 outline-none transition-all"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {positions.map(pos => (
                <button
                  key={pos.id}
                  onClick={() => setFilterPos(pos.id)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all shrink-0",
                    filterPos === pos.id 
                      ? "bg-accent/10 border-accent/20 text-accent" 
                      : "bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white"
                  )}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-2xl border border-white/10">
          {(['goals', 'assists', 'discipline'] as SortKey[]).map(key => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={cn(
                "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                sortBy === key ? "bg-accent text-pitch" : "text-white/30 hover:text-white"
              )}
            >
              {key === 'goals' ? 'Голи' : key === 'assists' ? 'Асисти' : 'Картки'}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-morphism rounded-[2.5rem] overflow-hidden border border-white/10">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-white/[0.03]">
              <tr>
                <th className="pl-8 py-5 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">#</th>
                <th className="px-6 py-5 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Гравець</th>
                <th className="px-6 py-5 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] text-center">Поз.</th>
                <th className={cn("px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-center transition-colors", sortBy === 'goals' ? 'text-accent' : 'text-white/20')}>Голи</th>
                <th className={cn("px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-center transition-colors", sortBy === 'assists' ? 'text-accent' : 'text-white/20')}>Асисти</th>
                <th className={cn("px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-center transition-colors", sortBy === 'discipline' ? 'text-accent' : 'text-white/20')}>ЖК</th>
                <th className={cn("px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-center transition-colors", sortBy === 'discipline' ? 'text-accent' : 'text-white/20')}>ЧК</th>
                <th className="pr-8 py-5 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] text-right">Команда</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedPlayers.map((player, index) => (
                <tr key={player.id} className="group hover:bg-white/[0.03] transition-colors border-b border-white/5 last:border-0">
                  <td className="pl-8 py-4">
                    <span className={cn(
                      "text-xs font-black italic",
                      index < 3 ? "text-accent" : "text-white/20"
                    )}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-10 h-10 shrink-0">
                        <img 
                          src={player.photoUrl} 
                          alt="" 
                          className="w-full h-full rounded-full object-cover border border-white/10 bg-white/5" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-accent text-pitch text-[8px] font-black flex items-center justify-center border-2 border-pitch">
                          {player.number}
                        </div>
                      </div>
                      <div className="font-bold text-sm text-white group-hover:text-accent transition-colors truncate max-w-[150px]">
                        {player.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-[9px] font-black text-white/40 uppercase tracking-widest">{player.position}</span>
                  </td>
                  <td className={cn("px-6 py-4 text-center text-sm font-black", sortBy === 'goals' ? 'text-accent scale-110 transition-transform' : 'text-white/80')}>
                    {player.goals || 0}
                  </td>
                  <td className={cn("px-6 py-4 text-center text-sm font-black", sortBy === 'assists' ? 'text-accent scale-110 transition-transform' : 'text-white/80')}>
                    {player.assists || 0}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <div className={cn("w-2 h-3 bg-yellow-400 rounded-sm shadow-sm opacity-30 group-hover:opacity-100 transition-opacity", (player.yellowCards || 0) > 0 && "opacity-100")} />
                      <span className="text-xs font-bold text-white/50">{player.yellowCards || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <div className={cn("w-2 h-3 bg-red-600 rounded-sm shadow-sm opacity-30 group-hover:opacity-100 transition-opacity", (player.redCards || 0) > 0 && "opacity-100")} />
                      <span className="text-xs font-bold text-white/50">{player.redCards || 0}</span>
                    </div>
                  </td>
                  <td className="pr-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-widest hidden sm:block">{getTeamName(player.teamId)}</span>
                      <img src={getTeamLogo(player.teamId)} alt="" className="w-6 h-6 rounded-lg bg-white p-0.5 shrink-0" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {sortedPlayers.length === 0 && (
        <div className="py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto border border-slate-800">
            <Search className="w-8 h-8 text-slate-700" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Нікого не знайдено</h3>
            <p className="text-slate-500 text-sm">Спробуйте змінити пошуковий запит або фільтри</p>
          </div>
        </div>
      )}
    </div>
  );
}
