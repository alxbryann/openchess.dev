import { Player, Pairing } from '../types';
import { nanoid } from 'nanoid';

// Berger circle method for round robin scheduling
export function generateRoundRobinPairings(players: Player[], roundNumber: number): Pairing[] {
  const active = players.filter(p => p.active);
  const n = active.length % 2 === 0 ? active.length : active.length + 1; // pad to even
  const list = [...active];
  if (active.length % 2 !== 0) list.push({ id: 'bye', name: 'BYE' } as Player);

  // Rotate: fix first player, rotate the rest
  const half = n / 2;
  // For round r (1-indexed), rotate r-1 times
  const rotated = [list[0], ...list.slice(1)];
  for (let r = 0; r < roundNumber - 1; r++) {
    const last = rotated.pop()!;
    rotated.splice(1, 0, last);
  }

  const pairings: Pairing[] = [];
  for (let i = 0; i < half; i++) {
    const a = rotated[i];
    const b = rotated[n - 1 - i];

    if (a.id === 'bye' || b.id === 'bye') {
      const real = a.id === 'bye' ? b : a;
      if (!real || real.id === 'bye') continue;
      pairings.push({
        id: nanoid(),
        board: i + 1,
        whiteId: real.id,
        blackId: null,
        result: '*',
      });
      continue;
    }

    // Alternate colors: even rounds swap
    const whiteIdx = roundNumber % 2 === 1 ? i : n - 1 - i;
    const white = rotated[whiteIdx < half ? whiteIdx : n - 1 - whiteIdx];
    const isAWhite = roundNumber % 2 === 0 ? i % 2 === 0 : i % 2 === 1;

    pairings.push({
      id: nanoid(),
      board: i + 1,
      whiteId: isAWhite ? a.id : b.id,
      blackId: isAWhite ? b.id : a.id,
      result: '*',
    });
  }

  return pairings;
}

export function totalRoundRobinRounds(playerCount: number): number {
  const n = playerCount % 2 === 0 ? playerCount : playerCount + 1;
  return n - 1;
}
