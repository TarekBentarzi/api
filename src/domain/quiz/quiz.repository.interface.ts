import { QuizQuestionEntity } from './quiz-question.entity';
import { QuizAttemptEntity } from './quiz-attempt.entity';
import { SourateProgressEntity } from './sourate-progress.entity';

export interface QuizRepositoryInterface {
  // Questions
  findQuestionsByVersetId(versetId: string): Promise<QuizQuestionEntity[]>;
  findQuestionsBySourate(sourateNumero: number): Promise<QuizQuestionEntity[]>;
  createQuestion(
    versetId: string,
    sourateNumero: number,
    versetNumero: number,
    texteArabe: string,
    texteWithBlank: string,
    correctAnswer: string,
    options: string[],
    wordPosition: number,
  ): Promise<QuizQuestionEntity>;

  // Attempts
  findAttemptsByUser(userId: string): Promise<QuizAttemptEntity[]>;
  findAttemptsByUserAndSourate(
    userId: string,
    sourateNumero: number,
  ): Promise<QuizAttemptEntity[]>;
  findAttemptsByUserAndQuestion(
    userId: string,
    questionId: string,
  ): Promise<QuizAttemptEntity[]>;
  createAttempt(
    userId: string,
    questionId: string,
    sourateNumero: number,
    selectedAnswer: string,
    isCorrect: boolean,
  ): Promise<QuizAttemptEntity>;

  // Sourate Progress
  findProgressByUser(userId: string): Promise<SourateProgressEntity[]>;
  findProgressByUserAndSourate(
    userId: string,
    sourateNumero: number,
  ): Promise<SourateProgressEntity | null>;
  markSourateAsMemorized(
    userId: string,
    sourateNumero: number,
  ): Promise<SourateProgressEntity>;
  getMemorizedSourates(userId: string): Promise<number[]>;
}
