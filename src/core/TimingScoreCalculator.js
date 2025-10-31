export class TimingScoreCalculator {
  constructor(difficulty) {
    this.difficulty = difficulty;
    this.toleranceMap = {
      easy: { excellent: 80, ok: 150 },     // ms
      hard: { excellent: 50, ok: 100 },
      extreme: { excellent: 25, ok: 60 },
    };
  }

  evaluate(inputTime, expectedTime) {
    const offset = Math.abs(inputTime - expectedTime);
    const { excellent, ok } = this.toleranceMap[this.difficulty];

    if (offset <= excellent) return { rating: "excellent", offset };
    if (offset <= ok) return { rating: "ok", offset };
    return { rating: "miss", offset };
  }
}
