import { Player, Pairing } from '../types';
import { nanoid } from 'nanoid';

function preferredColor(player: Player): 'white' | 'black' {
  const whites = player.colorHistory.filter(c => c === 'white').length;
  const blacks = player.colorHistory.filter(c => c === 'black').length;
  if (whites > blacks) return 'black';
  if (blacks > whites) return 'white';
  // Same count: alternate from last
  const last = player.colorHistory[player.colorHistory.length - 1];
  return last === 'white' ? 'black' : 'white';
}

function canPair(a: Player, b: Player): boolean {
  return !a.opponents.includes(b.id) && !b.opponents.includes(a.id);
}

export function generateSwissPairings(players: Player[]): Pairing[] {
  const active = players.filter(p => p.active).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.rating - a.rating;
  });

  const paired = new Set<string>();
  const pairings: Pairing[] = [];
  let board = 1;

  // Group by score
  const scoreGroups = new Map<number, Player[]>();
  for (const p of active) {
    const g = scoreGroups.get(p.score) ?? [];
    g.push(p);
    scoreGroups.set(p.score, g);
  }

  const scores = Array.from(scoreGroups.keys()).sort((a, b) => b - a);
  const unpaired: Player[] = [];

  for (const score of scores) {
    const group = [...(scoreGroups.get(score) ?? []), ...unpaired.filter(p => !paired.has(p.id))];
    unpaired.length = 0;

    const available = group.filter(p => !paired.has(p.id));

    let i = 0;
    while (i < available.length) {
      const a = available[i];
      if (paired.has(a.id)) { i++; continue; }

      let matched = false;
      for (let j = i + 1; j < available.length; j++) {
        const b = available[j];
        if (paired.has(b.id)) continue;
        if (!canPair(a, b)) continue;

        paired.add(a.id);
        paired.add(b.id);

        const aColor = preferredColor(a);
        const bColor = aColor === 'white' ? 'black' : 'white';

        // Resolve color conflict: if both want same, give to higher-rated
        const aWants = preferredColor(a);
        const bWants = preferredColor(b);
        let white: Player, black: Player;
        if (aWants === bWants) {
          // Higher rating gets preference
          if (a.rating >= b.rating) {
            white = aWants === 'white' ? a : b;
            black = aWants === 'white' ? b : a;
          } else {
            white = bWants === 'white' ? b : a;
            black = bWants === 'white' ? a : b;
          }
        } else {
          white = aWants === 'white' ? a : b;
          black = aWants === 'white' ? b : a;
        }

        pairings.push({
          id: nanoid(),
          board: board++,
          whiteId: white.id,
          blackId: black.id,
          result: '*',
        });
        matched = true;
        break;
      }

      if (!matched && !paired.has(a.id)) {
        unpaired.push(a);
      }
      i++;
    }
  }

  // Remaining unpaired → bye
  for (const p of active) {
    if (!paired.has(p.id)) {
      pairings.push({
        id: nanoid(),
        board: board++,
        whiteId: p.id,
        blackId: null,
        result: '*',
      });
    }
  }

  return pairings;
}
