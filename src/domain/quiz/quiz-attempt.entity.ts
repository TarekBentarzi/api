export class QuizAttemptEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly questionId: string,
    public readonly sourateNumero: number,
    public readonly selectedAnswer: string,
    public readonly isCorrect: boolean,
    public readonly attemptedAt: Date,
  ) {}
}
