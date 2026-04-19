import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MOCK_TEAMS_DATA = [
  { id: 't1', name: 'Київські Леви', shortName: 'LIV', points: 15, played: 6, won: 5, drawn: 0, lost: 1, goalsFor: 12, goalsAgainst: 4, logoUrl: 'https://picsum.photos/seed/lions/100/100' },
  { id: 't2', name: 'Дніпро Ультрас', shortName: 'DNP', points: 13, played: 6, won: 4, drawn: 1, lost: 1, goalsFor: 10, goalsAgainst: 5, logoUrl: 'https://picsum.photos/seed/dnipro/100/100' },
  { id: 't3', name: 'Карпатські Орли', shortName: 'EAG', points: 10, played: 6, won: 3, drawn: 1, lost: 2, goalsFor: 8, goalsAgainst: 7, logoUrl: 'https://picsum.photos/seed/eagle/100/100' },
  { id: 't4', name: 'Одеські Шторми', shortName: 'STO', points: 9, played: 6, won: 2, drawn: 3, lost: 1, goalsFor: 7, goalsAgainst: 6, logoUrl: 'https://picsum.photos/seed/storm/100/100' },
  { id: 't5', name: 'Харківські Тигри', shortName: 'TIG', points: 7, played: 6, won: 2, drawn: 1, lost: 3, goalsFor: 6, goalsAgainst: 9, logoUrl: 'https://picsum.photos/seed/tiger/100/100' },
  { id: 't6', name: 'Львівські Батяри', shortName: 'BAT', points: 6, played: 6, won: 1, drawn: 3, lost: 2, goalsFor: 5, goalsAgainst: 6, logoUrl: 'https://picsum.photos/seed/batyar/100/100' },
  { id: 't7', name: 'Шахтарські Гірники', shortName: 'MIN', points: 5, played: 6, won: 1, drawn: 2, lost: 3, goalsFor: 4, goalsAgainst: 8, logoUrl: 'https://picsum.photos/seed/miner/100/100' },
  { id: 't8', name: 'Чорноморські Маяки', shortName: 'LGT', points: 4, played: 6, won: 1, drawn: 1, lost: 4, goalsFor: 3, goalsAgainst: 9, logoUrl: 'https://picsum.photos/seed/lighthouse/100/100' },
  { id: 't9', name: 'Зубри Полісся', shortName: 'ZUB', points: 4, played: 6, won: 1, drawn: 1, lost: 4, goalsFor: 4, goalsAgainst: 10, logoUrl: 'https://picsum.photos/seed/zubr/100/100' },
  { id: 't10', name: 'Таврійські Скіфи', shortName: 'SKY', points: 3, played: 6, won: 0, drawn: 3, lost: 3, goalsFor: 2, goalsAgainst: 7, logoUrl: 'https://picsum.photos/seed/skyth/100/100' },
];
