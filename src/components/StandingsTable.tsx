import React from 'react';
import { Team } from '../types';
import { cn } from '../lib/utils';

interface StandingsTableProps {
  teams: Team[];
  onEdit?: () => void;
}

export default function StandingsTable({ teams, onEdit }: StandingsTableProps) {
  // Sort teams by points, then goal difference
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const diffA = (a.goalsFor || 0) - (a.goalsAgainst || 0);
    const diffB = (b.goalsFor || 0) - (b.goalsAgainst || 0);
    if (diffB !== diffA) return diffB - diffA;
    return (b.goalsFor || 0) - (a.goalsFor || 0);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold brand-font text-white/50 uppercase tracking-[2px]">Таблиця Турніру</h2>
        <div className="flex gap-2">
          {onEdit && (
            <div 
              onClick={onEdit}
              className="px-3 py-1 bg-white/5 rounded border border-white/10 text-[10px] text-white/40 cursor-pointer hover:bg-white/10 transition-all flex items-center gap-2"
            >
              ✎ Редагувати
            </div>
          )}
        </div>
      </div>

      <div className="glass-morphism rounded-3xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left border-collapse min-w-[320px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="pl-4 pr-2 py-4 text-[9px] font-black text-white/30 uppercase tracking-widest w-8">#</th>
                <th className="px-2 py-4 text-[9px] font-black text-white/30 uppercase tracking-widest">Клуб</th>
                <th className="px-2 py-4 text-[9px] font-black text-white/30 uppercase tracking-widest text-center">І</th>
                <th className="px-2 py-4 text-[9px] font-black text-white/30 uppercase tracking-widest text-center">В</th>
                <th className="px-2 py-4 text-[9px] font-black text-white/30 uppercase tracking-widest text-center">Н</th>
                <th className="px-2 py-4 text-[9px] font-black text-white/30 uppercase tracking-widest text-center">П</th>
                <th className="px-2 py-4 text-[9px] font-black text-white/30 uppercase tracking-widest text-center text-accent">О</th>
                <th className="px-2 py-4 text-[9px] font-black text-white/30 uppercase tracking-widest text-center text-white/20">ГЗ</th>
                <th className="pl-2 pr-4 py-4 text-[9px] font-black text-white/30 uppercase tracking-widest text-center text-white/20">ГП</th>
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((team, index) => (
                <tr 
                  key={team.id} 
                  className="border-b border-white/5 transition-colors hover:bg-white/[0.02]"
                >
                  <td className="pl-4 pr-2 py-4 text-[10px] font-bold text-white/20 italic">
                    {index + 1}
                  </td>
                  <td className="px-2 py-4">
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded sm:rounded-lg bg-white overflow-hidden p-0.5 sm:p-1 shadow-lg shrink-0">
                        <img 
                          src={team.logoUrl} 
                          alt={team.name} 
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="font-bold text-[11px] sm:text-[13px] text-white tracking-tight truncate max-w-[80px] sm:max-w-none">
                        {team.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-4 text-center text-[11px] font-bold text-white/60">{team.played || 0}</td>
                  <td className="px-2 py-4 text-center text-[11px] font-bold text-white/60">{team.won || 0}</td>
                  <td className="px-2 py-4 text-center text-[11px] font-bold text-white/60">{team.drawn || 0}</td>
                  <td className="px-2 py-4 text-center text-[11px] font-bold text-white/60">{team.lost || 0}</td>
                  <td className="px-2 py-4 text-center">
                    <div className="font-black text-accent text-xs sm:text-sm drop-shadow-[0_0_8px_rgba(0,255,136,0.3)]">
                      {team.points || 0}
                    </div>
                  </td>
                  <td className="px-2 py-4 text-center text-[11px] font-bold text-white/40">{team.goalsFor || 0}</td>
                  <td className="pl-2 pr-4 py-4 text-center text-[11px] font-bold text-white/40">{team.goalsAgainst || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
