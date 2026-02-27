export type EngineStatus = 'PENDING' | 'STARTED' | 'FINISHED';

export class GameEngine {
  private players: string[];
  private rounds: number;

  private currentRound = 0;
  private currentDrawerIndex = 0;
  private currentWord = '';
  private status: EngineStatus = 'PENDING';

  constructor(players: string[], rounds: number) {
    if (!players?.length) throw new Error('Players required');
    if (rounds <= 0) throw new Error('Rounds must be > 0');

    // ✅ shuffle players for fairness
    this.players = this.shuffle(players);
    this.rounds = rounds;
  }

  // =====================================================
  // ROUND CONTROL
  // =====================================================

  startFirstRound(word: string) {
    if (this.status !== 'PENDING') return;

    this.status = 'STARTED';
    this.currentRound = 1;
    this.currentDrawerIndex = 0;
    this.currentWord = word;
  }

  nextRound(word: string) {
    if (this.status !== 'STARTED') return;

    // finished ?
    if (this.currentRound >= this.rounds) {
      this.status = 'FINISHED';
      return;
    }

    this.currentRound += 1;
    this.currentDrawerIndex =
      (this.currentDrawerIndex + 1) % this.players.length;

    this.currentWord = word;
  }

  // =====================================================
  // GETTERS
  // =====================================================

  getRound() {
    return this.currentRound;
  }

  getCurrentDrawer() {
    return this.players[this.currentDrawerIndex];
  }

  getPlayerCount() {
    return this.players.length;
  }

  getCurrentWord() {
    return this.currentWord;
  }

  getStatus(): EngineStatus {
    return this.status;
  }

  isFinished(): boolean {
    return this.status === 'FINISHED';
  }

  // =====================================================
  // HELPERS
  // =====================================================

  private shuffle(arr: string[]): string[] {
    return [...arr].sort(() => Math.random() - 0.5);
  }
}
