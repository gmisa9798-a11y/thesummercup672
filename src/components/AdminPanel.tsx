import React, { useState } from 'react';
import { Save, Plus, Trash2, Edit2, ShieldAlert, Calendar, Check, Ghost, Info, Image as ImageIcon } from 'lucide-react';
import { Team, Player, Match, TournamentInfo, MatchEvent } from '../types';
import { cn } from '../lib/utils';
import { doc, updateDoc, deleteDoc, addDoc, collection, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { User as FirebaseUser } from 'firebase/auth';

interface AdminPanelProps {
  teams: Team[];
  players: Player[];
  matches: Match[];
  tournamentInfo: TournamentInfo | null;
  user: FirebaseUser | null;
  onLogin: () => void;
}

export default function AdminPanel({ 
  teams, players, matches, tournamentInfo, user, onLogin
}: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'teams' | 'players' | 'matches' | 'tournament'>('tournament');
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [isAddingMatch, setIsAddingMatch] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, type: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [goalEvent, setGoalEvent] = useState<{ matchId: string, teamId: string, type: MatchEvent['type'], scorerId: string, assistId: string, subOutId: string, minute: number } | null>(null);

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const isAdmin = user?.email === 'gmisa9798@gmail.com';

  // --- Handlers ---

  const handleUpdateTeam = async (id: string, data: Partial<Team>) => {
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'teams', id), data);
      showNotification("Команда оновлена");
    } catch (e) {
      showNotification("Помилка оновлення", "error");
      handleFirestoreError(e, OperationType.UPDATE, `teams/${id}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePlayer = async (id: string, data: Partial<Player>) => {
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'players', id), data);
    } catch (e) {
      showNotification("Помилка оновлення", "error");
      handleFirestoreError(e, OperationType.UPDATE, `players/${id}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddEvent = async (matchId: string, teamId: string, type: MatchEvent['type'], playerId: string, extraId?: string, minute: number = 0) => {
    setIsSaving(true);
    try {
      const match = matches.find(m => m.id === matchId);
      if (!match) return;

      const event: MatchEvent = {
        type,
        teamId,
        minute,
        playerId,
      };

      if (type === 'goal' && extraId && extraId.trim() !== "") {
        event.assistPlayerId = extraId;
      } else if (type === 'substitution' && extraId && extraId.trim() !== "") {
        event.subOutPlayerId = extraId;
      }

      const newEvents = [...(match.events || []), event];
      const isHome = teamId === match.homeTeamId;
      
      const updateData: any = { events: newEvents };
      
      if (type === 'goal') {
        updateData[isHome ? 'homeGoals' : 'awayGoals'] = (isHome ? (match.homeGoals || 0) : (match.awayGoals || 0)) + 1;
      }

      await updateDoc(doc(db, 'matches', matchId), updateData);
      
      // Update Player Individual Stats
      const player = players.find(p => p.id === playerId);
      if (player) {
        if (type === 'goal') await updateDoc(doc(db, 'players', playerId), { goals: (player.goals || 0) + 1 });
        if (type === 'yellow_card') await updateDoc(doc(db, 'players', playerId), { yellowCards: (player.yellowCards || 0) + 1 });
        if (type === 'red_card') await updateDoc(doc(db, 'players', playerId), { redCards: (player.redCards || 0) + 1 });
      }

      if (type === 'goal' && event.assistPlayerId) {
        const assistant = players.find(p => p.id === event.assistPlayerId);
        if (assistant) await updateDoc(doc(db, 'players', assistant.id), { assists: (assistant.assists || 0) + 1 });
      }

      showNotification("Подію зафіксовано!");
      setGoalEvent(null);
    } catch (e) {
      console.error("Error adding event:", e);
      showNotification("Помилка при записі", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateMatch = async (id: string, data: Partial<Match>, forceFinished: boolean = false) => {
    setIsSaving(true);
    try {
      const match = matches.find(m => m.id === id);
      if (!match) return;

      const updateData = forceFinished ? { ...data, status: 'finished' } : data;
      await updateDoc(doc(db, 'matches', id), updateData);
      
      // Automatic Standing Updates (Assistant)
      if (forceFinished && match.status !== 'finished') {
        const homeGoals = (data.homeGoals !== undefined ? data.homeGoals : match.homeGoals) || 0;
        const awayGoals = (data.awayGoals !== undefined ? data.awayGoals : match.awayGoals) || 0;
        
        const homeTeam = teams.find(t => t.id === match.homeTeamId);
        const awayTeam = teams.find(t => t.id === match.awayTeamId);

        if (homeTeam && awayTeam) {
          // Home Team Stats
          const hUpdate = {
            played: (homeTeam.played || 0) + 1,
            goalsFor: (homeTeam.goalsFor || 0) + homeGoals,
            goalsAgainst: (homeTeam.goalsAgainst || 0) + awayGoals,
            won: (homeTeam.won || 0) + (homeGoals > awayGoals ? 1 : 0),
            drawn: (homeTeam.drawn || 0) + (homeGoals === awayGoals ? 1 : 0),
            lost: (homeTeam.lost || 0) + (homeGoals < awayGoals ? 1 : 0),
            points: (homeTeam.points || 0) + (homeGoals > awayGoals ? 3 : homeGoals === awayGoals ? 1 : 0),
          };

          // Away Team Stats
          const aUpdate = {
            played: (awayTeam.played || 0) + 1,
            goalsFor: (awayTeam.goalsFor || 0) + awayGoals,
            goalsAgainst: (awayTeam.goalsAgainst || 0) + homeGoals,
            won: (awayTeam.won || 0) + (awayGoals > homeGoals ? 1 : 0),
            drawn: (awayTeam.drawn || 0) + (homeGoals === awayGoals ? 1 : 0),
            lost: (awayTeam.lost || 0) + (awayGoals < homeGoals ? 1 : 0),
            points: (awayTeam.points || 0) + (awayGoals > homeGoals ? 3 : (homeGoals === awayGoals ? 1 : 0)),
          };

          await updateDoc(doc(db, 'teams', homeTeam.id), hUpdate);
          await updateDoc(doc(db, 'teams', awayTeam.id), aUpdate);
        }
      }

      showNotification(forceFinished ? "Матч завершено та таблицю оновлено" : "Матч оновлено");
    } catch (e) {
      showNotification("Помилка оновлення", "error");
      handleFirestoreError(e, OperationType.UPDATE, `matches/${id}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTournament = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      logoUrl: formData.get('logoUrl') as string,
      sponsorName: formData.get('sponsorName') as string,
      sponsorLogoUrl: formData.get('sponsorLogoUrl') as string,
      description: formData.get('description') as string,
      location: formData.get('location') as string,
      startDate: formData.get('startDate') as string,
      regulations: formData.get('regulations') as string,
    };
    try {
      await setDoc(doc(db, 'settings', 'tournament'), data, { merge: true });
      showNotification("Турнір оновлено");
    } catch (e) {
      showNotification("Помилка оновлення", "error");
      handleFirestoreError(e, OperationType.UPDATE, 'settings/tournament');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (collectionName: string, id: string) => {
    setDeleteConfirm(null);
    setIsSaving(true);
    try {
      if (collectionName === 'matches') {
        const match = matches.find(m => m.id === id);
        if (match) {
          // 1. ROLLBACK Team Standings (Only if match was finished)
          if (match.status === 'finished') {
            const homeTeam = teams.find(t => t.id === match.homeTeamId);
            const awayTeam = teams.find(t => t.id === match.awayTeamId);
            const homeGoals = match.homeGoals || 0;
            const awayGoals = match.awayGoals || 0;

            if (homeTeam) {
              await updateDoc(doc(db, 'teams', homeTeam.id), {
                played: Math.max(0, (homeTeam.played || 0) - 1),
                goalsFor: Math.max(0, (homeTeam.goalsFor || 0) - homeGoals),
                goalsAgainst: Math.max(0, (homeTeam.goalsAgainst || 0) - awayGoals),
                won: Math.max(0, (homeTeam.won || 0) - (homeGoals > awayGoals ? 1 : 0)),
                drawn: Math.max(0, (homeTeam.drawn || 0) - (homeGoals === awayGoals ? 1 : 0)),
                lost: Math.max(0, (homeTeam.lost || 0) - (homeGoals < awayGoals ? 1 : 0)),
                points: Math.max(0, (homeTeam.points || 0) - (homeGoals > awayGoals ? 3 : homeGoals === awayGoals ? 1 : 0)),
              });
            }

            if (awayTeam) {
              await updateDoc(doc(db, 'teams', awayTeam.id), {
                played: Math.max(0, (awayTeam.played || 0) - 1),
                goalsFor: Math.max(0, (awayTeam.goalsFor || 0) - awayGoals),
                goalsAgainst: Math.max(0, (awayTeam.goalsAgainst || 0) - homeGoals),
                won: Math.max(0, (awayTeam.won || 0) - (awayGoals > homeGoals ? 1 : 0)),
                drawn: Math.max(0, (awayTeam.drawn || 0) - (homeGoals === awayGoals ? 1 : 0)),
                lost: Math.max(0, (awayTeam.lost || 0) - (awayGoals < homeGoals ? 1 : 0)),
                points: Math.max(0, (awayTeam.points || 0) - (awayGoals > homeGoals ? 3 : homeGoals === awayGoals ? 1 : 0)),
              });
            }
          }

          // 2. ROLLBACK Player Stats (Events from this match - Goals, Assists, Cards)
          if (match.events && match.events.length > 0) {
            // Aggregate all changes per player to avoid stale data/multiple writes
            const playerRollbacks: Record<string, { goals: number, assists: number, yellowCards: number, redCards: number }> = {};

            match.events.forEach(e => {
              if (!playerRollbacks[e.playerId]) {
                playerRollbacks[e.playerId] = { goals: 0, assists: 0, yellowCards: 0, redCards: 0 };
              }
              if (e.type === 'goal') playerRollbacks[e.playerId].goals++;
              if (e.type === 'yellow_card') playerRollbacks[e.playerId].yellowCards++;
              if (e.type === 'red_card') playerRollbacks[e.playerId].redCards++;
              
              if (e.type === 'goal' && e.assistPlayerId) {
                if (!playerRollbacks[e.assistPlayerId]) {
                  playerRollbacks[e.assistPlayerId] = { goals: 0, assists: 0, yellowCards: 0, redCards: 0 };
                }
                playerRollbacks[e.assistPlayerId].assists++;
              }
            });

            // Apply aggregated rollbacks
            for (const [playerId, change] of Object.entries(playerRollbacks)) {
              const player = players.find(p => p.id === playerId);
              if (player) {
                await updateDoc(doc(db, 'players', player.id), {
                  goals: Math.max(0, (player.goals || 0) - change.goals),
                  assists: Math.max(0, (player.assists || 0) - change.assists),
                  yellowCards: Math.max(0, (player.yellowCards || 0) - change.yellowCards),
                  redCards: Math.max(0, (player.redCards || 0) - change.redCards),
                });
              }
            }
          }
        }
      }

      await deleteDoc(doc(db, collectionName, id));
      showNotification("Видалено успішно");
    } catch (e) {
      showNotification("Помилка видалення", "error");
      handleFirestoreError(e, OperationType.DELETE, `${collectionName}/${id}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMatch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const gameDate = formData.get('gameDate') as string;
    const gameTime = formData.get('gameTime') as string;
    
    // Combine date and time
    let isoDate = new Date().toISOString();
    if (gameDate && gameTime) {
      isoDate = new Date(`${gameDate}T${gameTime}`).toISOString();
    }

    const matchData = {
      homeTeamId: (formData.get('homeTeamId') as string) || '',
      awayTeamId: (formData.get('awayTeamId') as string) || '',
      date: isoDate,
      status: (editingId ? matches.find(m => m.id === editingId)?.status : 'upcoming') as any,
      homeGoals: Number(formData.get('homeGoals') || 0),
      awayGoals: Number(formData.get('awayGoals') || 0),
      events: editingId ? (matches.find(m => m.id === editingId)?.events || []) : []
    };

    try {
      setIsSaving(true);
      if (editingId) {
        await updateDoc(doc(db, 'matches', editingId), matchData);
        setEditingId(null);
        showNotification("Матч оновлено");
      } else {
        await addDoc(collection(db, 'matches'), matchData);
        showNotification("Матч додано");
      }
      setIsAddingMatch(false);
    } catch (e) { 
      console.error("Match Action Error:", e);
      showNotification("Помилка збереження", "error");
      handleFirestoreError(e, editingId ? OperationType.UPDATE : OperationType.CREATE, 'matches'); 
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTeam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const name = (formData.get('name') as string || '').trim();
    const shortName = (formData.get('shortName') as string || '').trim().toUpperCase();
    
    const newTeam = {
      name,
      shortName,
      logoUrl: (formData.get('logoUrl') as string) || `https://picsum.photos/seed/${name}/200`,
      points: Number(formData.get('points') || 0),
      played: Number(formData.get('played') || 0),
      won: Number(formData.get('won') || 0),
      drawn: Number(formData.get('drawn') || 0),
      lost: Number(formData.get('lost') || 0),
      goalsFor: Number(formData.get('goalsFor') || 0),
      goalsAgainst: Number(formData.get('goalsAgainst') || 0)
    };
    try {
      if (editingId) {
        await updateDoc(doc(db, 'teams', editingId), newTeam);
        setEditingId(null);
        showNotification("Команду оновлено");
      } else {
        await addDoc(collection(db, 'teams'), newTeam);
        showNotification("Команду додано");
      }
      setIsAddingTeam(false);
    } catch (e) {
      console.error("Add Team Error:", e);
      showNotification("Помилка збереження", "error");
      handleFirestoreError(e, OperationType.CREATE, 'teams');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPlayer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const name = (formData.get('name') as string || '').trim();
    
    const playerData = {
      teamId: (formData.get('teamId') as string) || '',
      name,
      number: Number(formData.get('number') || 0),
      position: (formData.get('position') as string) || 'GK',
      photoUrl: (formData.get('photoUrl') as string) || `https://picsum.photos/seed/${name}/200`,
      goals: Number(formData.get('goals') || 0),
      assists: Number(formData.get('assists') || 0),
      yellowCards: Number(formData.get('yellowCards') || 0),
      redCards: Number(formData.get('redCards') || 0),
    };
    try {
      if (editingId) {
        await updateDoc(doc(db, 'players', editingId), playerData);
        setEditingId(null);
        showNotification("Гравця оновлено");
      } else {
        await addDoc(collection(db, 'players'), playerData);
        showNotification("Гравця додано");
      }
      setIsAddingPlayer(false);
    } catch (e) {
      console.error("Add Player Error:", e);
      showNotification("Помилка збереження", "error");
      handleFirestoreError(e, OperationType.CREATE, 'players');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 glass-morphism rounded-3xl p-10 text-center">
        <ShieldAlert className="w-12 h-12 text-accent/50 mb-6" />
        <h2 className="text-xl font-bold brand-font text-white mb-4 uppercase tracking-tighter">Доступ обмежено</h2>
        <p className="text-white/40 mb-8 text-sm max-w-xs">Тільки авторизовані адміністратори мають доступ до цієї панелі.</p>
        <button onClick={onLogin} className="bg-accent text-pitch font-black px-8 py-3 rounded-xl uppercase tracking-widest hover:scale-105 transition-all shadow-lg">Увійти</button>
        
        <div className="mt-10 p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20 max-w-sm">
          <div className="flex flex-col gap-4 text-left">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-white/60 leading-relaxed font-medium">
                <span className="text-blue-400 font-bold block mb-1 uppercase tracking-wider">Порада для iOS та Mac (Safari):</span>
                Якщо при спробі входу ви бачите помилку "Cookies blocked" або нічого не відбувається, натисніть кнопку нижче:
              </p>
            </div>
            
            <button 
              onClick={() => window.open(window.location.href, '_blank')}
              className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 py-3 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all"
            >
              Відкрити в новій вкладці для входу
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 glass-morphism rounded-3xl p-10 text-center">
        <Ghost className="w-12 h-12 text-white/10 mb-6" />
        <h2 className="text-xl font-bold brand-font text-white mb-4 uppercase tracking-tighter">Лише для читання</h2>
        <p className="text-white/40 mb-8 text-sm max-w-xs">Ви увійшли як гість ({user.email}). Тільки головний адмін може вносити зміни.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Notifications */}
      {notification && (
        <div className={cn(
          "fixed top-4 right-4 z-[100] px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-10 duration-300 flex items-center gap-3 border backdrop-blur-xl",
          notification.type === 'success' ? "bg-accent/20 border-accent/20 text-accent" : "bg-red-500/20 border-red-500/20 text-red-500"
        )}>
          {notification.type === 'success' ? <Check className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          <div className="font-bold uppercase tracking-widest text-[10px]">{notification.message}</div>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-morphism p-6 rounded-2xl">
        <div className="space-y-1">
          <h2 className="text-xl font-bold brand-font flex items-center gap-3 text-accent uppercase tracking-[2px]">
            <ShieldAlert className="w-6 h-6" /> ПАНЕЛЬ УПРАВЛІННЯ
          </h2>
          <p className="text-white/40 text-xs">Адміністратор: {user.email}</p>
        </div>
        
        <div className="flex flex-wrap gap-2 bg-black/20 p-1 rounded-xl border border-white/10">
          {(['tournament', 'teams', 'players', 'matches'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={cn("px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all", activeSubTab === tab ? "bg-accent/20 text-accent border border-accent/30" : "text-white/40 hover:text-white")}
            >
              {tab === 'tournament' ? 'Про Турнір' : tab === 'teams' ? 'Команди' : tab === 'players' ? 'Гравці' : 'Матчі'}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-morphism rounded-2xl overflow-hidden p-6 min-h-[400px]">
        {/* TOURNAMENT INFO SECTION */}
        {activeSubTab === 'tournament' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/60">Редагувати відомості про турнір</h3>
            <form onSubmit={handleUpdateTournament} className="space-y-4 max-w-4xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/30 ml-2">Назва Турніру</label>
                  <input name="name" defaultValue={tournamentInfo?.name} required className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/30 ml-2">Logo URL (Турнір)</label>
                  <input name="logoUrl" defaultValue={tournamentInfo?.logoUrl} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/30 ml-2">Спонсор</label>
                  <input name="sponsorName" defaultValue={tournamentInfo?.sponsorName} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/30 ml-2">Logo URL (Спонсор)</label>
                  <input name="sponsorLogoUrl" defaultValue={tournamentInfo?.sponsorLogoUrl} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/30 ml-2">Локація</label>
                  <input name="location" defaultValue={tournamentInfo?.location} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/30 ml-2">Дата Початку</label>
                  <input name="startDate" defaultValue={tournamentInfo?.startDate} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-white/30 ml-2">Опис Турніру</label>
                  <textarea name="description" defaultValue={tournamentInfo?.description} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm min-h-[100px]" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-white/30 ml-2">Регламент (Markdown)</label>
                  <textarea name="regulations" defaultValue={tournamentInfo?.regulations} placeholder="Введіть правила турніру тут... (підтримує Markdown)" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm min-h-[200px] font-mono" />
                </div>
              </div>
              <button type="submit" disabled={isSaving} className="bg-accent text-pitch font-black px-8 py-4 rounded-xl uppercase tracking-widest text-xs hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-wait">
                {isSaving ? 'Зберігаємо...' : 'Оновити Інформацію'}
              </button>
            </form>
          </div>
        )}

        {/* TEAMS SECTION */}
        {activeSubTab === 'teams' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/60">Керування Командами</h3>
              <button 
                onClick={() => {
                  setIsAddingTeam(!isAddingTeam);
                  setEditingId(null);
                }}
                className="bg-accent/10 text-accent px-4 py-2 rounded-lg text-[10px] font-bold uppercase border border-accent/20 flex items-center gap-2 hover:bg-accent/20 transition-all"
              >
                {isAddingTeam ? 'Відмінити' : 'Додати Команду'}
                <Plus className={cn("w-4 h-4 transition-transform duration-300", isAddingTeam && "rotate-45")} /> 
              </button>
            </div>

            {isAddingTeam && (
              <form onSubmit={handleAddTeam} className="bg-white/5 border border-white/10 p-6 rounded-xl animate-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <input name="name" placeholder="Назва" required defaultValue={editingId ? teams.find(t => t.id === editingId)?.name : ''} className="bg-black/40 border border-white/10 rounded-lg p-3 text-white text-xs" />
                  <input name="shortName" placeholder="Код" required maxLength={3} defaultValue={editingId ? teams.find(t => t.id === editingId)?.shortName : ''} className="bg-black/40 border border-white/10 rounded-lg p-3 text-white text-xs uppercase" />
                  <input name="logoUrl" placeholder="Logo Link" defaultValue={editingId ? teams.find(t => t.id === editingId)?.logoUrl : ''} className="bg-black/40 border border-white/10 rounded-lg p-3 text-white text-xs" />
                  <input name="points" type="number" placeholder="Очки" defaultValue={editingId ? teams.find(t => t.id === editingId)?.points ?? 0 : 0} className="bg-black/40 border border-white/10 rounded-lg p-3 text-white text-xs" />
                  <input name="won" type="number" placeholder="Победы" defaultValue={editingId ? teams.find(t => t.id === editingId)?.won ?? 0 : 0} className="bg-black/40 border border-white/10 rounded-lg p-3 text-white text-xs" />
                  <input name="drawn" type="number" placeholder="Ничьи" defaultValue={editingId ? teams.find(t => t.id === editingId)?.drawn ?? 0 : 0} className="bg-black/40 border border-white/10 rounded-lg p-3 text-white text-xs" />
                  <input name="lost" type="number" placeholder="Поражения" defaultValue={editingId ? teams.find(t => t.id === editingId)?.lost ?? 0 : 0} className="bg-black/40 border border-white/10 rounded-lg p-3 text-white text-xs" />
                  <input name="goalsFor" type="number" placeholder="ГЗ" defaultValue={editingId ? teams.find(t => t.id === editingId)?.goalsFor ?? 0 : 0} className="bg-black/40 border border-white/10 rounded-lg p-3 text-white text-xs" />
                  <input name="goalsAgainst" type="number" placeholder="ГП" defaultValue={editingId ? teams.find(t => t.id === editingId)?.goalsAgainst ?? 0 : 0} className="bg-black/40 border border-white/10 rounded-lg p-3 text-white text-xs" />
                  <input name="played" type="number" placeholder="Игры" defaultValue={editingId ? teams.find(t => t.id === editingId)?.played ?? 0 : 0} className="bg-black/40 border border-white/10 rounded-lg p-3 text-white text-xs" />
                </div>
                <button type="submit" disabled={isSaving} className="w-full bg-accent text-pitch font-black py-4 rounded-xl uppercase text-[10px] tracking-widest hover:brightness-110 transition-all disabled:opacity-50">
                  {isSaving ? 'ЗБЕРЕЖЕННЯ...' : (editingId ? 'Оновити Дані' : 'Зберегти Команду')}
                </button>
              </form>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.length === 0 && !isAddingTeam && (
                <div className="col-span-full py-10 text-center text-white/20 border border-dashed border-white/10 rounded-xl">
                  <p className="text-xs uppercase tracking-widest font-black">Команди ще не додані</p>
                </div>
              )}
              {teams.map(team => (
                <div key={team.id} className="bg-white/[0.03] border border-white/5 p-4 rounded-xl flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <img src={team.logoUrl} alt="" className="w-12 h-12 rounded-lg bg-white p-1" referrerPolicy="no-referrer" />
                    <div>
                      <div className="font-bold text-xs tracking-tight text-white/90">{team.name}</div>
                      <div className="text-[9px] text-white/30 uppercase font-bold">{team.points} очок | {team.won}В - {team.drawn}Н - {team.lost}П</div>
                    </div>
                  </div>
                  <div className="flex gap-1 transform group-hover:translate-x-0 transition-transform">
                    <button 
                      onClick={() => {
                        setEditingId(team.id);
                        setIsAddingTeam(true);
                      }}
                      className="p-2 bg-white/5 rounded-lg text-white/20 hover:text-accent transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    {deleteConfirm?.id === team.id ? (
                      <div className="flex gap-1 animate-in zoom-in-95 duration-200">
                        <button 
                          onClick={() => handleDelete('teams', team.id)} 
                          className="px-2 py-1 bg-red-500 text-white text-[9px] font-black rounded hover:bg-red-600 transition-colors"
                        >
                          ТАК
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm(null)} 
                          className="px-2 py-1 bg-white/10 text-white text-[9px] font-black rounded hover:bg-white/20 transition-colors"
                        >
                          НІ
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setDeleteConfirm({ id: team.id, type: 'teams' })} 
                        className="p-2 bg-white/5 rounded-lg text-white/20 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PLAYERS SECTION */}
        {activeSubTab === 'players' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/60">Редактор Гравців</h3>
              <button 
                onClick={() => {
                  setIsAddingPlayer(!isAddingPlayer);
                  setEditingId(null);
                }}
                className="bg-accent/10 text-accent px-4 py-2 rounded-lg text-[10px] font-bold uppercase border border-accent/20 flex items-center gap-2 hover:bg-accent/20 transition-all"
              >
                {isAddingPlayer ? 'Відмінити' : 'Додати Гравця'}
                <Plus className={cn("w-4 h-4 transition-transform duration-300", isAddingPlayer && "rotate-45")} /> 
              </button>
            </div>

            {isAddingPlayer && (
              <form onSubmit={handleAddPlayer} className="bg-white/5 border border-white/10 p-6 rounded-xl animate-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <select name="teamId" required defaultValue={editingId ? players.find(p => p.id === editingId)?.teamId : ''} className="bg-black/40 border border-white/10 rounded-lg p-3 text-white text-xs appearance-none focus:outline-accent">
                    <option value="" disabled>Виберіть Команду</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <input name="name" placeholder="Ім'я Гравця" required defaultValue={editingId ? players.find(p => p.id === editingId)?.name : ''} className="bg-black/40 border border-white/10 rounded-lg p-3 text-white text-xs" />
                  <input name="number" type="number" placeholder="Номер" required defaultValue={editingId ? players.find(p => p.id === editingId)?.number : ''} className="bg-black/40 border border-white/10 rounded-lg p-3 text-white text-xs" />
                  <select name="position" required defaultValue={editingId ? players.find(p => p.id === editingId)?.position : 'GK'} className="bg-black/40 border border-white/10 rounded-lg p-3 text-white text-xs appearance-none focus:outline-accent">
                    <option value="GK">Воротар (GK)</option>
                    <option value="DEF">Захисник (DEF)</option>
                    <option value="MID">Півзахисник (MID)</option>
                    <option value="FWD">Нападник (FWD)</option>
                  </select>
                  <input name="photoUrl" placeholder="Player Photo URL" defaultValue={editingId ? players.find(p => p.id === editingId)?.photoUrl : ''} className="bg-black/40 border border-white/10 rounded-lg p-3 text-white text-xs md:col-span-2" />
                  <input name="goals" type="number" placeholder="Голи" defaultValue={editingId ? players.find(p => p.id === editingId)?.goals ?? 0 : 0} className="bg-black/40 border border-white/10 rounded-lg p-3 text-white text-xs" />
                  <input name="assists" type="number" placeholder="Асисти" defaultValue={editingId ? players.find(p => p.id === editingId)?.assists ?? 0 : 0} className="bg-black/40 border border-white/10 rounded-lg p-3 text-white text-xs" />
                  <input name="yellowCards" type="number" placeholder="ЖК" defaultValue={editingId ? players.find(p => p.id === editingId)?.yellowCards ?? 0 : 0} className="bg-black/40 border border-white/10 rounded-lg p-3 text-white text-xs" />
                  <input name="redCards" type="number" placeholder="ЧК" defaultValue={editingId ? players.find(p => p.id === editingId)?.redCards ?? 0 : 0} className="bg-black/40 border border-white/10 rounded-lg p-3 text-white text-xs" />
                </div>
                <button type="submit" disabled={isSaving} className="w-full bg-accent text-pitch font-black py-4 rounded-xl uppercase text-[10px] tracking-widest disabled:opacity-50">
                  {isSaving ? 'ЗБЕРЕЖЕННЯ...' : (editingId ? 'Оновити Гравця' : 'Зберегти Гравця')}
                </button>
              </form>
            )}

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {players.map(player => (
                <div key={player.id} className="bg-white/[0.03] border border-white/5 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                  <div className="flex items-center gap-4 min-w-[240px]">
                    <div className="relative">
                      <img src={player.photoUrl} alt="" className="w-12 h-12 rounded-full border border-white/10 bg-white/5 object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute -bottom-1 -right-1 bg-accent text-pitch text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-pitch">{player.number}</div>
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white/90 leading-tight">{player.name}</div>
                      <div className="text-[10px] text-accent/70 uppercase font-black tracking-wider">{teams.find(t => t.id === player.teamId)?.name}</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    {(['goals', 'assists', 'yellowCards', 'redCards'] as const).map(stat => (
                      <div key={stat} className="flex flex-col items-center gap-1">
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-tighter">
                          {stat === 'goals' ? 'ГОЛ' : stat === 'assists' ? 'ПАС' : stat === 'yellowCards' ? 'ЖК' : 'ЧК'}
                        </span>
                        <div className="flex items-center gap-2 bg-black/30 rounded-lg p-1.5 border border-white/5">
                          <button 
                            onClick={() => {
                              const current = Number(player[stat] || 0);
                              handleUpdatePlayer(player.id, { [stat]: Math.max(0, current - 1) });
                            }} 
                            className="w-5 h-5 flex items-center justify-center text-white/20 hover:text-white transition-colors"
                          >
                            -
                          </button>
                          <div className={cn("text-[11px] font-black min-w-[20px] text-center", stat.includes('Cards') ? (stat.startsWith('red') ? 'text-red-500' : 'text-yellow-400') : 'text-accent')}>
                            {player[stat] || 0}
                          </div>
                          <button 
                            onClick={() => {
                              const current = Number(player[stat] || 0);
                              handleUpdatePlayer(player.id, { [stat]: current + 1 });
                            }} 
                            className="w-5 h-5 flex items-center justify-center text-white/20 hover:text-white transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-1 ml-4">
                      <button 
                        onClick={() => {
                          setEditingId(player.id);
                          setIsAddingPlayer(true);
                        }}
                        className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/20 hover:text-accent transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {deleteConfirm?.id === player.id ? (
                        <div className="flex gap-1 animate-in zoom-in-95 duration-200">
                          <button 
                            onClick={() => handleDelete('players', player.id)} 
                            className="px-2 py-1 bg-red-500 text-white text-[10px] font-black rounded-lg hover:bg-red-600 transition-all"
                          >
                            ТАК
                          </button>
                          <button 
                            onClick={() => setDeleteConfirm(null)} 
                            className="px-2 py-1 bg-white/10 text-white text-[10px] font-black rounded-lg hover:bg-white/20 transition-all"
                          >
                            НІ
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setDeleteConfirm({ id: player.id, type: 'players' })} 
                          className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/20 hover:text-red-500 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MATCHES SECTION */}
        {activeSubTab === 'matches' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/60">Управління Матчами</h3>
              <button 
                onClick={() => {
                  setIsAddingMatch(!isAddingMatch);
                  setEditingId(null);
                }}
                className="bg-accent/10 text-accent px-4 py-2 rounded-lg text-[10px] font-bold uppercase border border-accent/20 flex items-center gap-2 hover:bg-accent/20 transition-all"
              >
                {isAddingMatch ? <Plus className="w-4 h-4 rotate-45" /> : <Plus className="w-3 h-3" />} 
                {isAddingMatch ? 'Відмінити' : 'Додати Гру'}
              </button>
            </div>

            {isAddingMatch && (
              <form onSubmit={handleAddMatch} className="bg-white/5 border border-white/10 p-6 rounded-xl animate-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase text-white/30 ml-2 mb-1">Господарі</div>
                    <select name="homeTeamId" required defaultValue={editingId ? matches.find(m => m.id === editingId)?.homeTeamId : ''} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-xs appearance-none">
                      <option value="" disabled>Виберіть Команду</option>
                      {teams.map(t => <option key={t.id} value={t.id}>🏠 {t.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase text-white/30 ml-2 mb-1">Гості</div>
                    <select name="awayTeamId" required defaultValue={editingId ? matches.find(m => m.id === editingId)?.awayTeamId : ''} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-xs appearance-none">
                      <option value="" disabled>Виберіть Команду</option>
                      {teams.map(t => <option key={t.id} value={t.id}>✈️ {t.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase text-white/30 ml-2 mb-1">Дата та Час</div>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        name="gameDate" 
                        type="date" 
                        required
                        defaultValue={editingId ? matches.find(m => m.id === editingId)?.date.slice(0, 10) : ''} 
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-[10px]" 
                      />
                      <input 
                        name="gameTime" 
                        type="time" 
                        required
                        defaultValue={editingId ? matches.find(m => m.id === editingId)?.date.slice(11, 16) : ''} 
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-[10px]" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="text-[10px] font-black uppercase text-white/30 ml-2 mb-1">Г1</div>
                      <input name="homeGoals" type="number" defaultValue={editingId ? matches.find(m => m.id === editingId)?.homeGoals ?? 0 : 0} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-xs" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-black uppercase text-white/30 ml-2 mb-1">Г2</div>
                      <input name="awayGoals" type="number" defaultValue={editingId ? matches.find(m => m.id === editingId)?.awayGoals ?? 0 : 0} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-xs" />
                    </div>
                  </div>
                </div>
                <button type="submit" disabled={isSaving} className="w-full bg-accent text-pitch font-black py-4 rounded-xl uppercase text-[10px] tracking-widest disabled:opacity-50">
                  {isSaving ? 'ЗБЕРЕЖЕННЯ...' : (editingId ? 'Оновити Дані Матчу' : 'Запланувати Матч')}
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {matches.map(match => {
                const home = teams.find(t => t.id === match.homeTeamId);
                const away = teams.find(t => t.id === match.awayTeamId);
                
                return (
                  <div 
                    key={match.id} 
                    className={cn(
                      "bg-white/[0.03] border border-white/5 p-5 rounded-xl space-y-4 transition-all hover:bg-white/[0.05]",
                      match.status === 'live' && "border-red-500/30 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {match.status === 'live' ? (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-500/20 border border-red-500/30">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <div className="text-[9px] font-black uppercase text-red-500 tracking-widest">LIVE</div>
                          </div>
                        ) : match.status === 'finished' ? (
                          <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-black uppercase text-white/40 tracking-widest">ЗАВЕРШЕНО</div>
                        ) : (
                          <div className="px-2 py-0.5 rounded bg-accent/10 border border-accent/20 text-[9px] font-black uppercase text-accent tracking-widest">ЗАПЛАНОВАНО</div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {match.status === 'upcoming' && (
                          <button 
                            onClick={() => handleUpdateMatch(match.id, { status: 'live' })}
                            className="text-[9px] font-black uppercase text-accent hover:underline"
                          >
                            Почати Матч
                          </button>
                        )}
                        {match.status === 'live' && (
                          <button 
                            onClick={() => handleUpdateMatch(match.id, { status: 'finished' }, true)}
                            className="text-[9px] font-black uppercase text-white/60 hover:text-white"
                          >
                            Завершити
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      {[match.homeTeamId, match.awayTeamId].map((tid, idx) => (
                        <div key={`${match.id}-${tid}-${idx}`} className="flex flex-col items-center gap-2 flex-1">
                          <div className="relative group">
                            <img src={teams.find(t => t.id === tid)?.logoUrl} alt="" className="w-12 h-12 rounded-xl shadow-md bg-white p-1.5" referrerPolicy="no-referrer" />
                            <div className={cn(
                              "absolute -top-2 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest shadow-lg",
                              idx === 0 ? "bg-accent text-pitch -right-2" : "bg-white/20 text-white -left-2"
                            )}>
                              {idx === 0 ? 'Home' : 'Away'}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 bg-black/40 rounded-lg px-3 py-1.5 border border-white/5">
                            <button 
                              disabled={isSaving}
                              onClick={(e) => {
                                e.stopPropagation();
                                const current = idx === 0 ? (match.homeGoals || 0) : (match.awayGoals || 0);
                                handleUpdateMatch(match.id, { [idx === 0 ? 'homeGoals' : 'awayGoals']: Math.max(0, current - 1) }, match.status === 'finished');
                              }} 
                              className="text-white/20 hover:text-white transition-colors disabled:opacity-30 p-1"
                            >
                              -
                            </button>
                            <span className="text-sm font-black text-white px-2 tabular-nums">{(idx === 0 ? match.homeGoals : match.awayGoals) ?? 0}</span>
                            <button 
                              disabled={isSaving}
                              onClick={(e) => {
                                e.stopPropagation();
                                const current = idx === 0 ? (match.homeGoals || 0) : (match.awayGoals || 0);
                                handleUpdateMatch(match.id, { [idx === 0 ? 'homeGoals' : 'awayGoals']: current + 1 }, match.status === 'finished');
                              }} 
                              className="text-white/20 hover:text-white transition-colors disabled:opacity-30 p-1"
                            >
                              +
                            </button>
                          </div>
                          
                          {(match.status === 'live' || match.status === 'finished') && (
                            <div className="mt-2 w-full">
                              {goalEvent?.matchId === match.id && goalEvent?.teamId === tid ? (
                                <div className="bg-black/80 p-3 rounded-xl border border-accent/40 space-y-3 animate-in zoom-in-95 duration-200 shadow-2xl">
                                  <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
                                    {(['goal', 'yellow_card', 'red_card', 'substitution'] as MatchEvent['type'][]).map(type => (
                                      <button
                                        key={type}
                                        onClick={() => setGoalEvent({ ...goalEvent, type })}
                                        className={cn(
                                          "flex-1 py-1 rounded text-[7px] font-black uppercase transition-all",
                                          goalEvent.type === type ? "bg-accent text-pitch" : "text-white/40 hover:text-white"
                                        )}
                                      >
                                        {type.replace('_', ' ')}
                                      </button>
                                    ))}
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                      <div className="text-[7px] font-black uppercase text-accent">Гравець</div>
                                      <select 
                                        value={goalEvent.scorerId}
                                        onChange={(e) => setGoalEvent({ ...goalEvent, scorerId: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-[9px] text-white font-bold outline-none focus:border-accent"
                                      >
                                        <option value="">Виберіть</option>
                                        {players.filter(p => p.teamId === tid).sort((a, b) => a.number - b.number).map(p => (
                                          <option key={p.id} value={p.id}>{p.number}. {p.name}</option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="space-y-1">
                                      <div className="text-[7px] font-black uppercase text-white/30">Хвилина</div>
                                      <input 
                                        type="number" 
                                        placeholder="Min"
                                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-[9px] text-white font-bold outline-none"
                                        onChange={(e) => setGoalEvent({ ...goalEvent, minute: parseInt(e.target.value) || 0 })}
                                      />
                                    </div>
                                  </div>

                                  {goalEvent.type === 'goal' && (
                                    <div className="space-y-1">
                                      <div className="text-[7px] font-black uppercase text-white/30">Гольова передача</div>
                                      <select 
                                        value={goalEvent.assistId}
                                        onChange={(e) => setGoalEvent({ ...goalEvent, assistId: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-[9px] text-white/70 font-bold outline-none"
                                      >
                                        <option value="">Без асистента</option>
                                        {players.filter(p => p.teamId === tid && p.id !== goalEvent.scorerId).sort((a, b) => a.number - b.number).map(p => (
                                          <option key={p.id} value={p.id}>{p.number}. {p.name}</option>
                                        ))}
                                      </select>
                                    </div>
                                  )}

                                  {goalEvent.type === 'substitution' && (
                                    <div className="space-y-1">
                                      <div className="text-[7px] font-black uppercase text-white/30">Замість кого виходить?</div>
                                      <select 
                                        value={goalEvent.subOutId}
                                        onChange={(e) => setGoalEvent({ ...goalEvent, subOutId: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-[9px] text-white/70 font-bold outline-none"
                                      >
                                        <option value="">Виберіть гравця</option>
                                        {players.filter(p => p.teamId === tid && p.id !== goalEvent.scorerId).sort((a, b) => a.number - b.number).map(p => (
                                          <option key={p.id} value={p.id}>{p.number}. {p.name}</option>
                                        ))}
                                      </select>
                                    </div>
                                  )}

                                  <div className="flex gap-1 pt-1">
                                    <button 
                                      disabled={!goalEvent.scorerId || isSaving}
                                      onClick={() => {
                                        const extra = goalEvent.type === 'goal' ? goalEvent.assistId : goalEvent.subOutId;
                                        handleAddEvent(match.id, tid, goalEvent.type, goalEvent.scorerId, extra, goalEvent.minute);
                                      }}
                                      className="flex-[2] bg-accent text-pitch text-[9px] font-black py-2 rounded uppercase hover:brightness-110 disabled:opacity-50 transition-all font-mono"
                                    >
                                      {isSaving ? 'ОБРОБКА...' : 'ЗАПИСАТИ ПОДІЮ'}
                                    </button>
                                    <button 
                                      onClick={() => setGoalEvent(null)}
                                      className="flex-1 bg-white/10 text-white/60 text-[9px] font-black py-2 rounded uppercase hover:bg-white/20 transition-all"
                                    >
                                      Х
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => setGoalEvent({ matchId: match.id, teamId: tid, type: 'goal', scorerId: '', assistId: '', subOutId: '', minute: 0 } as any)}
                                  className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-[9px] text-white/40 uppercase font-black hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                >
                                  <Plus className="w-3 h-3" /> ПОДІЯ МАТЧУ
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => {
                            setEditingId(match.id);
                            setIsAddingMatch(true);
                          }}
                          className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/10 hover:text-accent transition-all group"
                          title="Редагувати параметри"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {deleteConfirm?.id === match.id ? (
                          <div className="flex gap-1 animate-in zoom-in-95 duration-200">
                            <button 
                              onClick={() => handleDelete('matches', match.id)} 
                              className="px-2 py-1 bg-red-500 text-white text-[9px] font-black rounded hover:bg-red-600 transition-all"
                            >
                              ТАК
                            </button>
                            <button 
                              onClick={() => setDeleteConfirm(null)} 
                              className="px-2 py-1 bg-white/10 text-white text-[9px] font-black rounded hover:bg-white/20 transition-all"
                            >
                              НІ
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setDeleteConfirm({ id: match.id, type: 'matches' })} 
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/10 hover:text-red-500 transition-all"
                            title="Видалити матч"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                        {new Date(match.date).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex flex-col items-end gap-1.5 max-h-[150px] overflow-y-auto pr-1">
                        {match.events?.sort((a,b) => a.minute - b.minute).map((e, i) => (
                           <div key={i} className="text-[8px] font-black uppercase tracking-tighter flex items-center gap-1.5 group/event">
                             <div className="text-white/30 font-mono w-4">{e.minute}'</div>
                             {e.type === 'goal' && <div className="w-1.5 h-1.5 rounded-full bg-accent" title="Goal" />}
                             {e.type === 'yellow_card' && <div className="w-1.5 h-2 rounded-sm bg-yellow-400" title="Yellow Card" />}
                             {e.type === 'red_card' && <div className="w-1.5 h-2 rounded-sm bg-red-600" title="Red Card" />}
                             {e.type === 'substitution' && <div className="text-blue-400 text-[10px]" title="Substitution">⇄</div>}
                             
                             <span className={cn(
                               "transition-colors",
                               e.type === 'goal' ? "text-accent" : "text-white/60"
                             )}>
                               {players.find(p => p.id === e.playerId)?.name}
                             </span>
                             {e.type === 'goal' && e.assistPlayerId && (
                               <span className="text-white/30 lowercase italic">
                                 (асист: {players.find(p => p.id === e.assistPlayerId)?.name})
                               </span>
                             )}
                             {e.type === 'substitution' && (
                               <span className="text-white/30 lowercase italic">
                                 (вих: {players.find(p => p.id === e.subOutPlayerId)?.name})
                               </span>
                             )}
                           </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="bg-accent/5 border border-accent/20 p-5 rounded-2xl flex items-start gap-4 ring-1 ring-accent/10">
        <ShieldAlert className="w-6 h-6 text-accent shrink-0 mt-0.5 shadow-[0_0_15px_rgba(0,255,136,0.3)]" />
        <div className="space-y-1">
          <h4 className="font-bold text-accent text-xs uppercase tracking-[0.2em]">СИСТЕМА РЕДАГУВАННЯ АКТИВНА</h4>
          <p className="text-xs text-white/50 leading-relaxed">Всі зміни синхронізуються з Cloud Firestore миттєво. Надано повний доступ до всіх параметрів турніру.</p>
        </div>
      </div>
    </div>
  );
}
