import { Team, Player, Match } from '../types';
import { MOCK_TEAMS_DATA } from '../constants';

const PLAYER_NAMES = [
  'Андрій', 'Микола', 'Сергій', 'Олександр', 'Дмитро', 'Ігор', 'Віталій', 'Юрій',
  'Артем', 'Максим', 'Роман', 'Олег', 'Василь', 'Павло', 'Денис', 'Тарас', 'Іван',
  'Володимир', 'Руслан', 'Анатолій', 'Євген', 'Михайло', 'Богдан', 'Олексій'
];

const SURNAMES = [
  'Шевченко', 'Коваленко', 'Бондаренко', 'Ткаченко', 'Кравченко', 'Олійник', 'Мороз',
  'Зайцев', 'Павленко', 'Козак', 'Мельник', 'Коваль', 'Гончар', 'Кравчук', 'Литвин',
  'Савченко', 'Кузьменко', 'Клименко', 'Марченко', 'Харченко', 'Ковальчук', 'Матвієнко'
];

const POSITIONS: Player['position'][] = ['GK', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'FWD'];

export function generatePlayers(teams: Team[]): Player[] {
  const players: Player[] = [];
  
  teams.forEach((team) => {
    for (let i = 1; i <= 8; i++) {
      const firstName = PLAYER_NAMES[Math.floor(Math.random() * PLAYER_NAMES.length)];
      const lastName = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
      const position = POSITIONS[i - 1] || 'MID';
      
      players.push({
        id: `p-${team.id}-${i}`,
        teamId: team.id,
        name: `${firstName} ${lastName}`,
        number: i + Math.floor(Math.random() * 20),
        position,
        goals: Math.floor(Math.random() * 5),
        assists: Math.floor(Math.random() * 3),
        yellowCards: Math.floor(Math.random() * 2),
        redCards: Math.random() > 0.95 ? 1 : 0,
        photoUrl: `https://picsum.photos/seed/player-${team.id}-${i}/200/200`
      });
    }
  });
  
  return players;
}

export function generateMatches(teams: Team[]): Match[] {
  const matches: Match[] = [];
  let matchId = 1;
  
  // Simple round-robin or just some random matches
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      if (Math.random() > 0.6) {
        const isFinished = Math.random() > 0.4;
        matches.push({
          id: `m-${matchId++}`,
          homeTeamId: teams[i].id,
          awayTeamId: teams[j].id,
          homeGoals: isFinished ? Math.floor(Math.random() * 4) : null,
          awayGoals: isFinished ? Math.floor(Math.random() * 4) : null,
          date: new Date(2026, 3, 10 + Math.floor(Math.random() * 20), 18, 0).toISOString(),
          status: isFinished ? 'finished' : 'upcoming'
        });
      }
    }
  }
  
  return matches;
}
