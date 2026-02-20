export class QuizQuestionEntity {
  constructor(
    public readonly id: string,
    public readonly versetId: string,
    public readonly sourateNumero: number,
    public readonly versetNumero: number,
    public readonly texteArabe: string,
    public readonly texteWithBlank: string,
    public readonly correctAnswer: string,
    public readonly options: string[],
    public readonly wordPosition: number,
    public readonly createdAt: Date,
  ) {}
}
