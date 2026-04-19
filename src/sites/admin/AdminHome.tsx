import React from 'react';
import { Trophy, LogIn, Shield as ShieldIcon } from 'lucide-react';
import AdminLayout from './AdminLayout';
import StandingsTable from '../../components/StandingsTable';
import PlayerList from '../../components/PlayerList';
import MatchSchedule from '../../components/MatchSchedule';
import StatsDashboard from '../../components/StatsDashboard';
import AdminPanel from '../../components/AdminPanel';
import TournamentInfo from '../../components/TournamentInfo';
import TeamList from '../../components/TeamList';
import TournamentRegulations from '../../components/TournamentRegulations';
import { TabType, Team, Player, Match, TournamentInfo as TournamentInfoType } from '../../types';
import { User as FirebaseUser } from 'firebase/auth';

interface AdminHomeProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  teams: Team[];
  players: Player[];
  matches: Match[];
  tournamentInfo: TournamentInfoType | null;
  user: FirebaseUser | null;
  handleLogin: () => void;
  errorStatus: string | null;
}

export default function AdminHome({ activeTab, setActiveTab, teams, players, matches, tournamentInfo, user, handleLogin, errorStatus }: AdminHomeProps) {
  const isAdminPermitted = user?.email === 'gmisa9798@gmail.com';

  if (!user) {
    return (
      <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab} user={null} onLogin={handleLogin}>
        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
          <div className="w-24 h-24 border border-accent/20 bg-accent/5 rounded-full flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(0,255,136,0.1)]">
            <Trophy className="w-12 h-12 text-accent" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Вхід до Адмін-панелі</h2>
          <p className="text-white/40 mb-10 text-xs font-medium uppercase tracking-[3px]">SummerCup672.com</p>
          
          <div className="flex flex-col items-center gap-6 w-full max-w-sm">
            <button 
              onClick={handleLogin}
              className="w-full group flex items-center justify-center gap-4 bg-accent text-pitch hover:scale-[1.02] active:scale-95 px-8 py-5 rounded-2xl transition-all font-black uppercase text-xs tracking-widest shadow-[0_20px_40px_rgba(0,255,136,0.2)]"
            >
              <LogIn className="w-5 h-5" /> Увійти через Google
            </button>
            
            {errorStatus && (
              <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl text-center w-full animate-in slide-in-from-bottom-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <ShieldIcon className="w-4 h-4 text-red-500" />
                  <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">Проблема з авторизацією</p>
                </div>
                <p className="text-white/60 text-[10px] leading-relaxed mb-4 font-medium">
                  {errorStatus === 'domain-error' 
                    ? `Помилка: Домен ${window.location.hostname} не авторизовано у Firebase.`
                    : errorStatus === 'popup-blocked'
                    ? "Помилка: Браузер заблокував вікно входу. Спробуйте інший браузер або нову вкладку."
                    : errorStatus === 'iframe-warning'
                    ? "Увага: Вхід всередині чату обмежується браузером. Потрібна нова вкладка."
                    : `Помилка: ${errorStatus}`}
                </p>
                <button 
                  onClick={() => window.open(window.location.href, '_blank')}
                  className="w-full bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-xl border border-white/10 transition-all active:scale-95"
                >
                  Відкрити в повному вікні
                </button>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAdminPermitted) {
    return (
       <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogin={handleLogin}>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
              <ShieldIcon className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2 uppercase">Доступ заблоковано</h2>
            <p className="text-white/40 text-sm max-w-xs uppercase tracking-wider">
              Ваш акаунт ({user.email}) не має прав адміністратора.
            </p>
          </div>
       </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogin={handleLogin}>
      <div className="animate-in fade-in duration-500">
        <div key={activeTab}>
          {activeTab === 'table' && <StandingsTable teams={teams} onEdit={() => setActiveTab('admin')} />}
          {activeTab === 'teams' && <TeamList teams={teams} players={players} isAdmin={true} onAddTeam={() => setActiveTab('admin')} />}
          {activeTab === 'players' && <PlayerList players={players} teams={teams} />}
          {activeTab === 'matches' && <MatchSchedule matches={matches} teams={teams} players={players} isAdmin={true} />}
          {activeTab === 'stats' && <StatsDashboard players={players} teams={teams} isAdmin={true} onViewAll={() => setActiveTab('players')} />}
          {activeTab === 'regulations' && <TournamentRegulations content={tournamentInfo?.regulations || ''} />}
          {activeTab === 'info' && <TournamentInfo info={tournamentInfo} />}
          {activeTab === 'admin' && (
            <AdminPanel 
              teams={teams} 
              players={players} 
              matches={matches} 
              tournamentInfo={tournamentInfo}
              user={user}
              onLogin={handleLogin}
            />
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
