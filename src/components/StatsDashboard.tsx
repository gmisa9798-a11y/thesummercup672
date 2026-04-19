import React from 'react';
import { Player, Team } from '../types';
import { Target, Zap, Shield, User } from 'lucide-react';

interface StatsDashboardProps {
  players: Player[];
  teams: Team[];
  isAdmin?: boolean;
  onViewAll?: () => void;
}

const StatRow = ({ player, stat, teams, unit = 'ГОЛІВ' }: { player: Player, stat: number, teams: Team[], unit?: string, key?: React.Key }) => {
  const team = teams.find(t => t.id === player.teamId);
  return (
    <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.05] rounded-xl hover:bg-white/[0.08] transition-all player-row">
      <div className="flex items-center gap-4 player-info">
        <div className="relative">
          <img src={player.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover bg-white/10 p-0.5 border border-accent/30 player-img" referrerPolicy="no-referrer" />
          <img src={team?.logoUrl} alt="" className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-pitch" referrerPolicy="no-referrer" />
        </div>
        <div>
          <div className="font-bold text-xs text-white/90 tracking-tight">{player.name}</div>
          <div className="text-[9px] uppercase font-bold text-white/30 tracking-wider">{team?.name}</div>
        </div>
      </div>
      <div className="text-sm font-bold text-accent player-stats">
        {stat} <span className="text-[8px] font-normal text-white/40 uppercase ml-0.5">{unit}</span>
      </div>
    </div>
  );
};

export default function StatsDashboard({ players, teams, isAdmin, onViewAll }: StatsDashboardProps) {
  const topScorers = [...players].sort((a, b) => b.goals - a.goals || b.assists - a.assists).slice(0, 3);
  const topAssisters = [...players].sort((a, b) => b.assists - a.assists || b.goals - a.goals).slice(0, 3);
  const topTeams = [...teams].sort((a, b) => b.goalsFor - a.goalsFor).slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="glass-card glass-morphism p-6 rounded-2xl flex flex-col h-full">
        <div className="card-title flex items-center justify-between mb-6">
          <span className="text-[11px] font-bold uppercase tracking-[2px] text-white/30">ТОП БОМБАРДИРИ</span>
          {isAdmin && <span className="edit-icon text-[10px] text-white/20 cursor-pointer">✎</span>}
        </div>
        <div className="space-y-3 flex-1">
          {topScorers.map(p => <StatRow key={p.id} player={p} stat={p.goals} teams={teams} unit="ГОЛІВ" />)}
        </div>
        <div className="mt-8 text-center">
          <button 
            onClick={onViewAll}
            className="text-accent text-[11px] font-bold uppercase tracking-widest hover:underline transition-all"
          >
            Переглянути всіх гравців →
          </button>
        </div>
      </div>

      <div className="glass-card glass-morphism p-6 rounded-2xl flex flex-col h-full">
        <div className="card-title flex items-center justify-between mb-6">
          <span className="text-[11px] font-bold uppercase tracking-[2px] text-white/30">ТОП АСИСТЕНТИ</span>
          {isAdmin && <span className="edit-icon text-[10px] text-white/20 cursor-pointer">✎</span>}
        </div>
        <div className="space-y-3 flex-1">
          {topAssisters.map(p => <StatRow key={p.id} player={p} stat={p.assists} teams={teams} unit="АСИСТ" />)}
        </div>
        <div className="mt-8 text-center lg:hidden">
          <button onClick={onViewAll} className="text-accent text-[11px] font-bold uppercase tracking-widest hover:underline">Більше →</button>
        </div>
      </div>

      <div className="glass-card glass-morphism p-6 rounded-2xl flex flex-col h-full">
        <div className="card-title flex items-center justify-between mb-6">
          <span className="text-[11px] font-bold uppercase tracking-[2px] text-white/30">ДИСЦИПЛІНА (КАРТКИ)</span>
          {isAdmin && <span className="edit-icon text-[10px] text-white/20 cursor-pointer">✎</span>}
        </div>
        <div className="space-y-3 flex-1">
          {[...players]
            .sort((a, b) => (b.redCards * 3 + b.yellowCards) - (a.redCards * 3 + a.yellowCards))
            .slice(0, 3)
            .map(p => {
              const team = teams.find(t => t.id === p.teamId);
              return (
                <div key={p.id} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.05] rounded-xl hover:bg-white/[0.08] transition-all">
                  <div className="flex items-center gap-4">
                    <img src={p.photoUrl} alt="" className="w-8 h-8 rounded-full border border-white/10" referrerPolicy="no-referrer" />
                    <div>
                      <div className="font-bold text-xs text-white/90">{p.name}</div>
                      <div className="text-[9px] uppercase font-bold text-white/30">{team?.name}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {p.yellowCards > 0 && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-3 bg-yellow-400 rounded-sm" />
                        <span className="text-xs font-bold text-white/60">{p.yellowCards}</span>
                      </div>
                    )}
                    {p.redCards > 0 && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-3 bg-red-500 rounded-sm" />
                        <span className="text-xs font-bold text-white/60">{p.redCards}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
