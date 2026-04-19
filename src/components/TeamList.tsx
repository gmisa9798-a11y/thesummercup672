import React, { useState } from 'react';
import { Team, Player } from '../types';
import { cn } from '../lib/utils';
import { Shield, Plus, X, Maximize2, Shirt, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface TeamListProps {
  teams: Team[];
  players: Player[];
  isAdmin: boolean;
  onAddTeam: () => void;
}

// Fixed positions on the field (5 players)
const ON_FIELD = [
  { id: 'GK', label: 'GK', bottom: '10%', left: '50%' },
  { id: 'FLD1', label: 'DEF/MID', bottom: '38%', left: '28%' },
  { id: 'FLD2', label: 'DEF/MID', bottom: '38%', left: '72%' },
  { id: 'FLD3', label: 'FWD', bottom: '72%', left: '32%' },
  { id: 'FLD4', label: 'FWD', bottom: '72%', left: '68%' },
];

const SUBSTITUTES = [
  { id: 'SUB1', label: 'ZAM' },
  { id: 'SUB2', label: 'ZAM' },
  { id: 'SUB3', label: 'ZAM' },
];

export default function TeamList({ teams, players, isAdmin, onAddTeam }: TeamListProps) {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectingPosId, setSelectingPosId] = useState<string | null>(null);

  const handleUpdateLineup = async (posId: string, playerId: string | null) => {
    if (!selectedTeam) return;

    const newLineup = { ...(selectedTeam.lineup || {}) };
    if (playerId) {
      newLineup[posId] = playerId;
    } else {
      delete newLineup[posId];
    }

    try {
      await updateDoc(doc(db, 'teams', selectedTeam.id), { lineup: newLineup });
      setSelectedTeam({ ...selectedTeam, lineup: newLineup });
      setSelectingPosId(null);
    } catch (error) {
      console.error("Error updating lineup:", error);
    }
  };

  const FootballShirt = ({ number, color = 'var(--color-accent)', size = 'w-10 h-10', name }: { number?: number, color?: string, size?: string, name?: string }) => {
    const displayName = name ? name.trim().split(/\s+/).pop() : '';
    return (
      <div className="flex flex-col items-center gap-1">
        <div className={cn("relative flex items-center justify-center", size)}>
          <Shirt className="w-full h-full" style={{ color }} fill={color} fillOpacity={0.2} strokeWidth={1.5} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-black text-white drop-shadow-md leading-none mt-0.5">{number ?? ''}</span>
          </div>
        </div>
        {displayName && (
          <div className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/10 shadow-xl">
            <span className="text-[7px] font-black text-white uppercase tracking-tight whitespace-nowrap">
              {displayName}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black brand-font text-white uppercase tracking-tighter">Команди Турніру</h2>
          <p className="text-white/40 text-xs font-medium uppercase tracking-[2px] mt-1">Учасники SummerCup672.com</p>
        </div>
        {isAdmin && (
          <button 
            onClick={onAddTeam}
            className="bg-accent text-pitch font-black px-6 py-2.5 rounded-xl uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,136,0.2)] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Додати команду
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => {
          const teamPlayers = players.filter(p => p.teamId === team.id);
          return (
            <div 
              key={team.id}
              onClick={() => setSelectedTeam(team)}
              className="glass-morphism rounded-3xl p-6 group hover:bg-white/[0.08] transition-all duration-500 border border-white/10 hover:border-white/20 relative overflow-hidden cursor-pointer"
            >
              <div className="absolute top-4 right-4 text-white/10 group-hover:text-accent/30 transition-colors">
                <Maximize2 className="w-4 h-4" />
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-accent/10 transition-all duration-700" />
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="w-16 h-16 rounded-2xl bg-white p-2.5 shadow-2xl ring-1 ring-white/10">
                    <img 
                      src={team.logoUrl} 
                      alt={team.name} 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-accent uppercase tracking-[3px] mb-1">{team.shortName}</div>
                    <div className="flex items-center gap-1.5 justify-end">
                      <Shield className="w-3 h-3 text-white/30" />
                      <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">SummerCup672</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-accent transition-colors">{team.name}</h3>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                    <div className="text-[8px] font-black text-white/30 uppercase mb-1">Гравців</div>
                    <div className="text-sm font-black text-white">{teamPlayers.length}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                    <div className="text-[8px] font-black text-white/30 uppercase mb-1">Матчів</div>
                    <div className="text-sm font-black text-white">{team.played || 0}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                    <div className="text-[8px] font-black text-accent/30 uppercase mb-1">Очок</div>
                    <div className="text-sm font-black text-accent">{team.points || 0}</div>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-1.5">
                  {teamPlayers.slice(0, 4).map(p => (
                    <div key={p.id} className="w-6 h-6 rounded-full bg-white/10 border border-white/10 overflow-hidden flex items-center justify-center text-[8px] font-black text-white/40" title={p.name}>
                      {p.photoUrl ? <img src={p.photoUrl} alt="" className="w-full h-full object-cover" /> : p.name[0]}
                    </div>
                  ))}
                  {teamPlayers.length > 4 && (
                    <div className="w-6 h-6 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-[7px] font-black text-accent">
                      +{teamPlayers.length - 4}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedTeam && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedTeam(null);
                setSelectingPosId(null);
              }}
              className="absolute inset-0 bg-pitch/95 backdrop-blur-2xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-sm glass-morphism rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)]"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl p-1.5 shadow-2xl ring-1 ring-white/10">
                    <img src={selectedTeam.logoUrl} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tighter leading-none">{selectedTeam.shortName}</h3>
                    <div className="text-[8px] font-black text-accent uppercase tracking-[3px] mt-1.5 opacity-60">Склад команди</div>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setSelectedTeam(null);
                    setSelectingPosId(null);
                  }}
                  className="p-3 bg-white/5 rounded-full text-white/40 hover:text-white transition-all hover:bg-white/10 outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Football Field - Smaller Size */}
                <div className="relative aspect-[3/3.8] bg-[#1a472a] rounded-[1.5rem] border-[3px] border-white/10 overflow-hidden shadow-[inset_0_0_60px_rgba(0,0,0,0.5)]">
                  <div className="absolute inset-3 border border-white/10 rounded-xl pointer-events-none" />
                  <div className="absolute inset-0 flex flex-col justify-between p-3 pointer-events-none opacity-30">
                    <div className="w-24 h-10 border-b-2 border-x-2 border-white/10 mx-auto" />
                    <div className="w-full h-px bg-white/10" />
                    <div className="w-24 h-10 border-t-2 border-x-2 border-white/10 mx-auto" />
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-white/10 rounded-full pointer-events-none opacity-30" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white/10 rounded-full pointer-events-none opacity-30" />

                  {/* On Field Positions */}
                  {ON_FIELD.map((pos) => {
                    const playerId = selectedTeam.lineup?.[pos.id];
                    const player = playerId ? players.find(p => p.id === playerId) : null;
                    const isActive = selectingPosId === pos.id;

                    return (
                      <div
                        key={pos.id}
                        style={{ bottom: pos.bottom, left: pos.left }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20"
                      >
                        {isAdmin ? (
                          <button 
                            onClick={() => setSelectingPosId(isActive ? null : pos.id)}
                            className={cn(
                              "group relative transition-all duration-300",
                              isActive ? "scale-110" : "hover:scale-105"
                            )}
                          >
                            <FootballShirt 
                              number={player?.number} 
                              color={isActive ? 'var(--color-accent)' : undefined} 
                              name={player?.name}
                              size="w-9 h-9"
                            />
                            {!player && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <Plus className="w-3 h-3 text-white/20" />
                              </div>
                            )}
                            {player && (
                              <div 
                                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center scale-0 group-hover:scale-100 transition-transform shadow-lg z-30" 
                                onClick={(e) => { e.stopPropagation(); handleUpdateLineup(pos.id, null); }}
                              >
                                <X className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </button>
                        ) : (
                          <FootballShirt number={player?.number} name={player?.name} size="w-9 h-9" />
                        )}
                        {!player && !isActive && (
                          <div className="bg-white/5 backdrop-blur-md px-1.5 py-0.5 rounded border border-white/5 opacity-50 mt-1">
                            <span className="text-[6px] font-black text-white/40 uppercase tracking-tighter">{pos.label}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Substitutes Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <Users className="w-3 h-3 text-white/20" />
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-[2px]">Запасні гравці</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {SUBSTITUTES.map((sub) => {
                      const playerId = selectedTeam.lineup?.[sub.id];
                      const player = playerId ? players.find(p => p.id === playerId) : null;
                      const isActive = selectingPosId === sub.id;

                      return (
                        <div key={sub.id} className="flex flex-col items-center">
                          {isAdmin ? (
                            <button
                              onClick={() => setSelectingPosId(isActive ? null : sub.id)}
                              className={cn(
                                "group relative w-full aspect-square bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center transition-all overflow-hidden",
                                isActive ? "border-accent/40 bg-accent/10" : "hover:bg-white/[0.06]"
                              )}
                            >
                              {player ? (
                                <FootballShirt number={player.number} name={player.name} size="w-8 h-8" />
                              ) : (
                                <Plus className="w-4 h-4 text-white/10 group-hover:text-accent transition-colors" />
                              )}
                              {player && (
                                <div 
                                  className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center scale-0 group-hover:scale-100 transition-transform z-30 shadow-lg"
                                  onClick={(e) => { e.stopPropagation(); handleUpdateLineup(sub.id, null); }}
                                >
                                  <X className="w-2.5 h-2.5" />
                                </div>
                              )}
                            </button>
                          ) : (
                            <div className="w-full aspect-square bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center overflow-hidden">
                              {player ? (
                                <FootballShirt number={player.number} name={player.name} size="w-8 h-8" />
                              ) : (
                                <Shield className="w-4 h-4 text-white/5" />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Player Selection Dropdown */}
                <AnimatePresence>
                  {isAdmin && selectingPosId && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-6 left-6 right-6 bg-pitch/95 backdrop-blur-3xl border border-accent/20 rounded-3xl p-5 shadow-2xl z-40"
                    >
                      <div className="flex items-center justify-between mb-3 px-1">
                        <div className="text-[9px] font-black text-accent uppercase tracking-[3px]">Вибір гравця</div>
                        <button onClick={() => setSelectingPosId(null)} className="text-white/20 hover:text-white transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[140px] pr-2 scrollbar-none">
                        {players
                          .filter(p => p.teamId === selectedTeam.id)
                          .sort((a, b) => a.number - b.number)
                          .map(p => {
                            const isAssigned = Object.values(selectedTeam.lineup || {}).includes(p.id);
                            const isCurrent = selectedTeam.lineup?.[selectingPosId] === p.id;

                            return (
                              <button
                                key={p.id}
                                disabled={isAssigned && !isCurrent}
                                onClick={() => handleUpdateLineup(selectingPosId, p.id)}
                                className={cn(
                                  "p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5",
                                  isCurrent ? "bg-accent/20 border-accent/40 text-accent" : 
                                  isAssigned ? "bg-white/5 border-transparent opacity-20 cursor-not-allowed" :
                                  "bg-white/5 border-white/5 text-white/70 hover:bg-white/10 hover:border-white/20"
                                )}
                              >
                                <div className="w-5 h-5 rounded-lg bg-white/10 flex items-center justify-center text-[9px] font-black shrink-0">
                                  {p.number}
                                </div>
                                <span className="text-[9px] font-bold truncate leading-none">{p.name.split(' ').pop()}</span>
                              </button>
                            );
                          })}
                        {players.filter(p => p.teamId === selectedTeam.id).length === 0 && (
                          <div className="col-span-full py-6 text-center bg-white/5 rounded-xl border border-dashed border-white/10 text-[8px] font-black text-white/30 uppercase tracking-[2px]">
                            Гравці відсутні
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
