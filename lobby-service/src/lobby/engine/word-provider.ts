import * as fs from 'fs';
import * as path from 'path';

export class WordProvider {
  private words: string[] = [];
  private pool: string[] = [];

  constructor() {
    this.words = this.loadWords();
    this.reset();
  }

  // =====================================================
  // PUBLIC
  // =====================================================

  getRandomWord(): string {
    // refill automatically
    if (this.pool.length === 0) {
      this.reset();
    }

    const index = Math.floor(Math.random() * this.pool.length);
    const word = this.pool[index];

    // remove to avoid repetition
    this.pool.splice(index, 1);

    return word;
  }

  getRemainingCount(): number {
    return this.pool.length;
  }

  // =====================================================
  // INTERNAL
  // =====================================================

  private loadWords(): string[] {
    const filePath = path.join(__dirname, 'words.txt');
    const raw = fs.readFileSync(filePath, 'utf-8');

    return raw
      .split('\n')
      .map((w) => w.trim())
      .filter(Boolean);
  }

  private reset() {
    this.pool = this.shuffle([...this.words]);
  }

  private shuffle(arr: string[]): string[] {
    return arr.sort(() => Math.random() - 0.5);
  }
}
