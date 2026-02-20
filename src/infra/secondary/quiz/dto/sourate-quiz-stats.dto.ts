export class SourateQuizStatsDto {
  sourateNumero: number;
  totalVersets: number;
  totalQuestions: number;
  questionsAnswered: number;
  correctAnswers: number;
  lastAttemptDate: string | null;
  dailyQuestionsRemaining: number;
}
