import React from 'react';
import { TournamentInfo as TournamentInfoType } from '../types';
import { MapPin, Calendar, Award } from 'lucide-react';

interface TournamentInfoProps {
  info: TournamentInfoType | null;
}

export default function TournamentInfo({ info }: TournamentInfoProps) {
  if (!info) {
    return (
      <div className="py-20 text-center glass-morphism rounded-3xl p-10">
        <h2 className="text-xl font-bold brand-font text-white uppercase tracking-tighter mb-2">Інформація про турнір</h2>
        <p className="text-white/40 text-sm">Інформація поки що не додана адміністратором.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Hero Section */}
      <div className="relative glass-morphism rounded-[2.5rem] p-8 md:p-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[100px] -mr-32 -mt-32" />
        
        <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {info.logoUrl && (
            <div className="w-40 h-40 md:w-56 md:h-56 bg-white shadow-2xl rounded-3xl p-6 flex items-center justify-center ring-1 ring-white/10">
              <img src={info.logoUrl} alt={info.name} className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
            </div>
          )}
          
          <div className="text-center md:text-left space-y-4">
            <h1 className="text-4xl md:text-6xl font-black brand-font text-white uppercase tracking-tighter leading-none">
              {info.name}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <Calendar className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold text-white/70 uppercase tracking-widest">{info.startDate}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <MapPin className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold text-white/70 uppercase tracking-widest">{info.location}</span>
              </div>
            </div>
            <p className="text-white/60 text-lg leading-relaxed max-w-2xl">
              {info.description}
            </p>
          </div>
        </div>
      </div>

      {/* Sponsor Section */}
      {info.sponsorName && (
        <div className="glass-morphism rounded-[2rem] p-8">
          <div className="flex flex-col items-center gap-8">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-accent" />
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/40">Генеральний Спонсор</h3>
            </div>
            
            <div className="flex flex-col items-center gap-4 group">
              {info.sponsorLogoUrl && (
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10 group-hover:bg-white/10 transition-all duration-500">
                  <img src={info.sponsorLogoUrl} alt={info.sponsorName} className="h-16 md:h-24 object-contain grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                </div>
              )}
              <span className="text-xl font-bold text-white/80 tracking-tight">{info.sponsorName}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
