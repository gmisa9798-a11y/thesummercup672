import React from 'react';
import { Trophy } from 'lucide-react';
import PublicLayout from './PublicLayout';
import StandingsTable from '../../components/StandingsTable';
import PlayerList from '../../components/PlayerList';
import MatchSchedule from '../../components/MatchSchedule';
import StatsDashboard from '../../components/StatsDashboard';
import TournamentInfo from '../../components/TournamentInfo';
import TeamList from '../../components/TeamList';
import TournamentRegulations from '../../components/TournamentRegulations';
import { TabType, Team, Player, Match, TournamentInfo as TournamentInfoType } from '../../types';

interface PublicHomeProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  teams: Team[];
  players: Player[];
  matches: Match[];
  tournamentInfo: TournamentInfoType | null;
}

export default function PublicHome({ activeTab, setActiveTab, teams, players, matches, tournamentInfo }: PublicHomeProps) {
  const isEmpty = teams.length === 0 && activeTab !== 'info';

  if (isEmpty) {
    return (
      <PublicLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
          <div className="w-24 h-24 bg-accent/5 rounded-full flex items-center justify-center mb-8 ring-1 ring-accent/20 relative">
             <div className="absolute inset-0 bg-accent/10 blur-2xl rounded-full" />
             <Trophy className="w-12 h-12 text-accent relative z-10" />
          </div>
          <h2 className="text-3xl font-black brand-font text-white mb-4 uppercase tracking-tighter">Дякуємо, що завітали!</h2>
          <p className="text-white/40 max-w-sm mx-auto mb-10 text-sm font-medium leading-relaxed">
            Сезон SummerCup672.com готується до старту. <br/> Скоро тут з'являться команди, розклад та статистика.
          </p>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="animate-in fade-in duration-500">
        <div key={activeTab}>
          {activeTab === 'table' && <StandingsTable teams={teams} />}
          {activeTab === 'teams' && <TeamList teams={teams} players={players} isAdmin={false} onAddTeam={() => {}} />}
          {activeTab === 'players' && <PlayerList players={players} teams={teams} />}
          {activeTab === 'matches' && <MatchSchedule matches={matches} teams={teams} players={players} isAdmin={false} />}
          {activeTab === 'stats' && <StatsDashboard players={players} teams={teams} isAdmin={false} onViewAll={() => setActiveTab('players')} />}
          {activeTab === 'regulations' && <TournamentRegulations content={tournamentInfo?.regulations || ''} />}
          {activeTab === 'info' && <TournamentInfo info={tournamentInfo} />}
        </div>
      </div>
    </PublicLayout>
  );
}
