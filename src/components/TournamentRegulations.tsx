import React from 'react';
import { ScrollText, ShieldCheck, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface TournamentRegulationsProps {
  content: string;
}

export default function TournamentRegulations({ content }: TournamentRegulationsProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center ring-1 ring-accent/30">
          <ScrollText className="w-8 h-8 text-accent" />
        </div>
        <div>
          <h2 className="text-3xl font-black brand-font text-white uppercase tracking-tighter">Регламент Турніру</h2>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[4px] mt-2">Офіційні правила та положення</p>
        </div>
      </div>

      <div className="glass-morphism rounded-[2rem] p-8 md:p-12 border border-white/10 relative overflow-hidden group min-h-[400px]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] rounded-full -mr-32 -mt-32" />
        
        <div className="prose prose-invert max-w-none prose-p:text-white/60 prose-headings:text-white prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-strong:text-accent prose-ul:list-disc prose-li:text-white/50">
          {content ? (
            <ReactMarkdown>{content}</ReactMarkdown>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <ScrollText className="w-12 h-12 text-white/5" />
              <p className="text-white/30 text-sm font-bold uppercase tracking-widest">Регламент очікує на публікацію адміністратором</p>
            </div>
          )}
        </div>

        <div className="mt-12 pt-12 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
            <ShieldCheck className="w-6 h-6 text-accent shrink-0" />
            <div>
              <h4 className="font-bold text-white text-sm uppercase tracking-tight">Fair Play</h4>
              <p className="text-white/40 text-xs mt-1">Ми вимагаємо поваги до суперників та арбітрів.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
            <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
            <div>
              <h4 className="font-bold text-white text-sm uppercase tracking-tight">Дисципліна</h4>
              <p className="text-white/40 text-xs mt-1">Червона картка веде до автоматичної дискваліфікації.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
