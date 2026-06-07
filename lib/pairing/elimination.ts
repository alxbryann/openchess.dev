import { Player, Pairing } from '../types';
import { nanoid } from 'nanoid';

// Single elimination bracket seeded by rating
export function generateEliminationPairings(players: Player[], roundNumber: number, previousPairings: Pairing[][]): Pairing[] {
  const active = players.filter(p => p.active);

  if (roundNumber === 1) {
    // Sort by rating descending, seed 1 vs last, 2 vs second-last, etc.
    const seeded = [...active].sort((a, b) => b.rating - a.rating);
    const size = nextPowerOf2(seeded.length);
    // Pad with byes
    while (seeded.length < size) {
      seeded.push({ id: `bye-${seeded.length}`, name: 'BYE' } as Player);
    }

    const pairings: Pairing[] = [];
    for (let i = 0; i < size / 2; i++) {
      const a = seeded[i];
      const b = seeded[size - 1 - i];
      if (b.id.startsWith('bye')) {
        pairings.push({ id: nanoid(), board: i + 1, whiteId: a.id, blackId: null, result: '*' });
      } else {
        pairings.push({ id: nanoid(), board: i + 1, whiteId: a.id, blackId: b.id, result: '*' });
      }
    }
    return pairings;
  }

  // Subsequent rounds: winners from previous round
  const prevRound = previousPairings[roundNumber - 2];
  const winners: string[] = [];
  for (const p of prevRound) {
    if (p.result === '1-0') winners.push(p.whiteId);
    else if (p.result === '0-1' && p.blackId) winners.push(p.blackId);
    else if (p.result === '1/2-1/2') winners.push(p.whiteId); // white advances on draw
    else if (p.blackId === null) winners.push(p.whiteId); // bye → advance
  }

  const pairings: Pairing[] = [];
  for (let i = 0; i < winners.length; i += 2) {
    const a = winners[i];
    const b = winners[i + 1];
    pairings.push({
      id: nanoid(),
      board: Math.floor(i / 2) + 1,
      whiteId: a,
      blackId: b ?? null,
      result: '*',
    });
  }
  return pairings;
}

export function totalEliminationRounds(playerCount: number): number {
  return Math.ceil(Math.log2(playerCount));
}

function nextPowerOf2(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}
