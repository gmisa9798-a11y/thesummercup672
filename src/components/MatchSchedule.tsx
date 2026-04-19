import React from 'react';
import { Calendar, Clock, ArrowRightLeft } from 'lucide-react';
import { Match, Team, Player, MatchEvent } from '../types';
import { cn } from '../lib/utils';
import { format, isToday, isValid } from 'date-fns';
import { uk } from 'date-fns/locale';

interface MatchScheduleProps {
  matches: Match[];
  teams: Team[];
  players: Player[];
  isAdmin?: boolean;
}

const MatchCard = ({ match, teams, players }: { match: Match, teams: Team[], players: Player[], key?: string }) => {
  const getTeam = (id: string) => teams.find(t => t.id === id);
  const home = getTeam(match.homeTeamId);
  const away = getTeam(match.awayTeamId);
  const matchDate = new Date(match.date);
  const isValidDate = isValid(matchDate);

  const homeEvents = match.events?.filter(e => e.teamId === match.homeTeamId).sort((a,b) => a.minute - b.minute) || [];
  const awayEvents = match.events?.filter(e => e.teamId === match.awayTeamId).sort((a,b) => a.minute - b.minute) || [];

  const renderEvent = (e: MatchEvent) => {
    const player = players.find(p => p.id === e.playerId);
    const assistant = e.assistPlayerId ? players.find(p => p.id === e.assistPlayerId) : null;
    const subOut = e.subOutPlayerId ? players.find(p => p.id === e.subOutPlayerId) : null;

    return (
      <div key={`${e.type}-${e.playerId}-${e.minute}`} className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-tighter animate-in fade-in slide-in-from-bottom-1 duration-500">
        <span className="text-white/20 font-mono w-4">{e.minute}'</span>
        
        {e.type === 'goal' && <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_5px_rgba(0,255,102,0.5)]" />}
        {e.type === 'yellow_card' && <div className="w-1.5 h-2 rounded-sm bg-yellow-400" />}
        {e.type === 'red_card' && <div className="w-1.5 h-2 rounded-sm bg-red-600 shadow-[0_0_5px_rgba(239,68,68,0.5)]" />}
        {e.type === 'substitution' && <ArrowRightLeft className="w-2.5 h-2.5 text-blue-400" />}
        
        <div className="flex flex-col">
          <span className={cn(e.type === 'goal' ? "text-accent" : "text-white/60")}>
            {player?.name}
          </span>
          {e.assistPlayerId && assistant && (
            <span className="text-white/20 text-[6px] lowercase italic -mt-0.5">
              асист: {assistant.name}
            </span>
          )}
          {e.subOutPlayerId && subOut && (
            <span className="text-white/20 text-[6px] lowercase italic -mt-0.5">
              вих: {subOut.name}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="glass-morphism rounded-2xl p-6 transition-all hover:bg-white/[0.08] hover:border-white/20 match-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30">
          <Calendar className="w-3 h-3 text-accent" />
          {isValidDate ? format(matchDate, 'd MMMM, yyyy', { locale: uk }) : 'Дата уточнюється'}
        </div>
        {match.status === 'finished' ? (
          <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-black uppercase text-white/40 tracking-widest">Завершено</div>
        ) : match.status === 'live' ? (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <div className="text-[9px] font-black uppercase text-red-500 tracking-widest">LIVE</div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent">
            <Clock className="w-3 h-3" />
            {format(matchDate, 'HH:mm')}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col items-center gap-3 flex-1">
          <div className="relative">
            <img src={home?.logoUrl} alt="" className="w-14 h-14 rounded-2xl bg-white/10 p-2 border border-white/10" referrerPolicy="no-referrer" />
            <div className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded bg-accent text-pitch text-[7px] font-black uppercase tracking-widest shadow-lg">ДОМА</div>
          </div>
          <div className="space-y-2 w-full">
            <h4 className="text-center font-bold text-xs uppercase tracking-tight flex items-center justify-center text-white/80">{home?.name}</h4>
            <div className="flex flex-col items-start gap-1.5 min-h-[16px] max-h-[100px] overflow-y-auto custom-scrollbar">
              {homeEvents.map(renderEvent)}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          {match.status !== 'upcoming' ? (
            <div className="flex items-center gap-4">
              <div className={cn("text-3xl font-black brand-font match-score", match.status === 'live' ? "text-red-500" : "text-white")}>{match.homeGoals}</div>
              <div className="text-white/20 text-lg font-bold">:</div>
              <div className={cn("text-3xl font-black brand-font match-score", match.status === 'live' ? "text-red-500" : "text-white")}>{match.awayGoals}</div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="text-xl font-bold brand-font text-white/20 tracking-[10px] match-score">VS</div>
            </div>
          )}
          <div className={cn("text-[10px] font-bold uppercase match-time", match.status === 'live' ? "text-red-500 animate-pulse" : "text-white/40")}>
            {match.status === 'finished' ? 'Завершено' : match.status === 'live' ? 'Йде матч' : (!isValidDate ? 'Час уточнюється' : (isToday(matchDate) ? `Сьогодні, ${format(matchDate, 'HH:mm')}` : format(matchDate, 'd MMMM', { locale: uk })))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 flex-1">
          <div className="relative">
            <img src={away?.logoUrl} alt="" className="w-14 h-14 rounded-2xl bg-white/10 p-2 border border-white/10" referrerPolicy="no-referrer" />
            <div className="absolute -top-2 -left-2 px-1.5 py-0.5 rounded bg-white/20 text-white text-[7px] font-black uppercase tracking-widest shadow-lg">ГОСТІ</div>
          </div>
          <div className="space-y-2 w-full">
            <h4 className="text-center font-bold text-xs uppercase tracking-tight flex items-center justify-center text-white/80">{away?.name}</h4>
            <div className="flex flex-col items-start gap-1.5 min-h-[16px] max-h-[100px] overflow-y-auto custom-scrollbar">
              {awayEvents.map(renderEvent)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MatchSchedule({ matches, teams, players, isAdmin }: MatchScheduleProps) {
  const liveMatches = matches.filter(m => m.status === 'live');
  const upcomingMatches = matches.filter(m => m.status === 'upcoming').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const finishedMatches = matches.filter(m => m.status === 'finished').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-12">
      {liveMatches.length > 0 && (
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
            <h2 className="text-xl font-bold brand-font text-red-500 uppercase tracking-[2px]">МАТЧІ НАЖИВО</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {liveMatches.map(m => <MatchCard key={m.id} match={m} teams={teams} players={players} />)}
          </div>
        </div>
      )}

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold brand-font text-white/50 uppercase tracking-[2px]">МАЙБУТНІ МАТЧІ</h2>
          {isAdmin && <div className="edit-icon text-[10px] text-white/30 cursor-pointer">✎ Редагувати</div>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingMatches.length > 0 ? (
            upcomingMatches.map(m => <MatchCard key={m.id} match={m} teams={teams} players={players} />)
          ) : (
            <div className="col-span-full py-16 glass-morphism rounded-2xl border-dashed flex items-center justify-center text-white/30 text-sm font-medium uppercase tracking-widest">
              Немає запланованих матчів
            </div>
          )}
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold brand-font text-white/50 uppercase tracking-[2px]">ОСТАННІ РЕЗУЛЬТАТИ</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-80">
          {finishedMatches.map(m => <MatchCard key={m.id} match={m} teams={teams} players={players} />)}
        </div>
      </div>
    </div>
  );
}
