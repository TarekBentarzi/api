export class QuizAttemptResponseDto {
  id: string;
  userId: string;
  questionId: string;
  sourateNumero: number;
  selectedAnswer: string;
  isCorrect: boolean;
  attemptedAt: string;
}
