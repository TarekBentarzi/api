import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QuizRepositoryInterface } from '../../../../domain/quiz/quiz.repository.interface';
import { QuizQuestionEntity } from '../../../../domain/quiz/quiz-question.entity';
import { QuizAttemptEntity } from '../../../../domain/quiz/quiz-attempt.entity';
import { SourateProgressEntity } from '../../../../domain/quiz/sourate-progress.entity';
import {
  QuizQuestionResponseDto,
  QuizAttemptResponseDto,
  SourateQuizStatsDto,
} from '../dto';

@Injectable()
export class QuizService implements QuizRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  // ============ QUESTIONS ============

  async findQuestionsByVersetId(
    versetId: string,
  ): Promise<QuizQuestionEntity[]> {
    const questions = await this.prisma.quizQuestion.findMany({
      where: { versetId },
    });
    return questions.map(this.toQuestionEntity);
  }

  async findQuestionsBySourate(
    sourateNumero: number,
  ): Promise<QuizQuestionEntity[]> {
    const questions = await this.prisma.quizQuestion.findMany({
      where: { sourateNumero },
    });
    return questions.map(this.toQuestionEntity);
  }

  async createQuestion(
    versetId: string,
    sourateNumero: number,
    versetNumero: number,
    texteArabe: string,
    texteWithBlank: string,
    correctAnswer: string,
    options: string[],
    wordPosition: number,
  ): Promise<QuizQuestionEntity> {
    const question = await this.prisma.quizQuestion.create({
      data: {
        versetId,
        sourateNumero,
        versetNumero,
        texteArabe,
        texteWithBlank,
        correctAnswer,
        options,
        wordPosition,
      },
    });
    return this.toQuestionEntity(question);
  }

  // ============ ATTEMPTS ============

  async findAttemptsByUser(userId: string): Promise<QuizAttemptEntity[]> {
    const attempts = await this.prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { attemptedAt: 'desc' },
    });
    return attempts.map(this.toAttemptEntity);
  }

  async findAttemptsByUserAndSourate(
    userId: string,
    sourateNumero: number,
  ): Promise<QuizAttemptEntity[]> {
    const attempts = await this.prisma.quizAttempt.findMany({
      where: { userId, sourateNumero },
      orderBy: { attemptedAt: 'desc' },
    });
    return attempts.map(this.toAttemptEntity);
  }

  async findAttemptsByUserAndQuestion(
    userId: string,
    questionId: string,
  ): Promise<QuizAttemptEntity[]> {
    const attempts = await this.prisma.quizAttempt.findMany({
      where: { userId, questionId },
      orderBy: { attemptedAt: 'desc' },
    });
    return attempts.map(this.toAttemptEntity);
  }

  async createAttempt(
    userId: string,
    questionId: string,
    sourateNumero: number,
    selectedAnswer: string,
    isCorrect: boolean,
  ): Promise<QuizAttemptEntity> {
    const attempt = await this.prisma.quizAttempt.create({
      data: {
        userId,
        questionId,
        sourateNumero,
        selectedAnswer,
        isCorrect,
      },
    });
    return this.toAttemptEntity(attempt);
  }

  // ============ SOURATE PROGRESS ============

  async findProgressByUser(userId: string): Promise<SourateProgressEntity[]> {
    const progress = await this.prisma.sourateProgress.findMany({
      where: { userId },
    });
    return progress.map(this.toProgressEntity);
  }

  async findProgressByUserAndSourate(
    userId: string,
    sourateNumero: number,
  ): Promise<SourateProgressEntity | null> {
    const progress = await this.prisma.sourateProgress.findUnique({
      where: {
        userId_sourateNumero: { userId, sourateNumero },
      },
    });
    return progress ? this.toProgressEntity(progress) : null;
  }

  async unlockSourate(
    userId: string,
    sourateNumero: number,
  ): Promise<SourateProgressEntity> {
    // Débloque une sourate pour le quiz (quand on l'a lue)
    const progress = await this.prisma.sourateProgress.upsert({
      where: {
        userId_sourateNumero: { userId, sourateNumero },
      },
      update: {}, // Si existe déjà, ne rien changer
      create: {
        userId,
        sourateNumero,
        isMemorized: false, // Pas encore mémorisée, juste débloquée
      },
    });
    return this.toProgressEntity(progress);
  }

  async markSourateAsMemorized(
    userId: string,
    sourateNumero: number,
  ): Promise<SourateProgressEntity> {
    const progress = await this.prisma.sourateProgress.upsert({
      where: {
        userId_sourateNumero: { userId, sourateNumero },
      },
      update: {
        isMemorized: true,
        completedAt: new Date(),
      },
      create: {
        userId,
        sourateNumero,
        isMemorized: true,
        completedAt: new Date(),
      },
    });
    return this.toProgressEntity(progress);
  }

  async getMemorizedSourates(userId: string): Promise<number[]> {
    const progress = await this.prisma.sourateProgress.findMany({
      where: { userId, isMemorized: true },
      select: { sourateNumero: true },
    });
    return progress.map((p) => p.sourateNumero);
  }

  // ============ BUSINESS LOGIC ============

  /**
   * Génère ou récupère les questions pour un verset
   */
  async generateQuestionsForVerset(
    versetId: string,
  ): Promise<QuizQuestionEntity[]> {
    // Vérifier si des questions existent déjà
    const existing = await this.findQuestionsByVersetId(versetId);
    if (existing.length > 0) {
      return existing;
    }

    // Récupérer le verset
    const verset = await this.prisma.verset.findUnique({
      where: { id: versetId },
    });

    if (!verset) {
      throw new Error('Verset not found');
    }

    // Extraire les mots arabes
    const words = verset.texteArabe.split(' ').filter((w) => w.trim());

    if (words.length < 4) {
      // Trop court pour générer des questions
      return [];
    }

    const questions: QuizQuestionEntity[] = [];

    // Générer une question pour chaque mot significatif (éviter les petits mots)
    for (let i = 0; i < words.length; i++) {
      const word = words[i];

      // Skip mots trop courts
      if (word.length < 3) continue;

      // Créer le texte avec un blanc
      const texteWithBlank = words
        .map((w, idx) => (idx === i ? '_____' : w))
        .join(' ');

      // Générer 3 options incorrectes (on pourrait améliorer ça avec des mots similaires)
      const otherWords = words.filter(
        (w, idx) => idx !== i && w.length >= 3 && w !== word,
      );
      const incorrectOptions = this.getRandomItems(otherWords, 3);

      // S'assurer qu'on a 4 options au total
      while (incorrectOptions.length < 3) {
        incorrectOptions.push('...');
      }

      const options = this.shuffleArray([word, ...incorrectOptions]);

      const question = await this.createQuestion(
        versetId,
        verset.sourateNumero,
        verset.versetNumero,
        verset.texteArabe,
        texteWithBlank,
        word,
        options,
        i,
      );

      questions.push(question);
    }

    return questions;
  }

  /**
   * Récupère le quiz quotidien pour une sourate (5 questions)
   */
  async getDailyQuiz(
    userId: string,
    sourateNumero: number,
  ): Promise<QuizQuestionResponseDto[]> {
    // Obtenir toutes les questions de la sourate
    const allQuestions = await this.findQuestionsBySourate(sourateNumero);

    if (allQuestions.length === 0) {
      // Générer les questions si elles n'existent pas
      const versets = await this.prisma.verset.findMany({
        where: { sourateNumero },
      });

      for (const verset of versets) {
        await this.generateQuestionsForVerset(verset.id);
      }

      // Récupérer les questions nouvellement générées
      const newQuestions = await this.findQuestionsBySourate(sourateNumero);
      return this.selectDailyQuestions(userId, newQuestions, 5);
    }

    return this.selectDailyQuestions(userId, allQuestions, 5);
  }

  /**
   * Récupère des nouvelles questions non encore répondues
   */
  async getNewQuestions(
    userId: string,
    sourateNumero: number,
    count: number,
  ): Promise<QuizQuestionResponseDto[]> {
    // Obtenir toutes les questions de la sourate
    const allQuestions = await this.findQuestionsBySourate(sourateNumero);

    // Obtenir les IDs des questions déjà répondues
    const attempts = await this.findAttemptsByUserAndSourate(
      userId,
      sourateNumero,
    );
    const answeredQuestionIds = new Set(attempts.map((a) => a.questionId));

    // Filtrer pour obtenir les questions non répondues
    const unanswered = allQuestions.filter(
      (q) => !answeredQuestionIds.has(q.id),
    );

    // Sélectionner aléatoirement 'count' questions
    const selected = this.getRandomItems(unanswered, count);

    return selected.map(this.toQuestionDto);
  }

  /**
   * Soumet une réponse et retourne le résultat
   */
  async submitAnswer(
    userId: string,
    questionId: string,
    selectedAnswer: string,
  ): Promise<QuizAttemptResponseDto> {
    // Récupérer la question
    const question = await this.prisma.quizQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new Error('Question not found');
    }

    // Vérifier si la réponse est correcte
    const isCorrect = selectedAnswer === question.correctAnswer;

    // Créer la tentative
    const attempt = await this.createAttempt(
      userId,
      questionId,
      question.sourateNumero,
      selectedAnswer,
      isCorrect,
    );

    return this.toAttemptDto(attempt);
  }

  /**
   * Récupère les statistiques de quiz pour toutes les sourates débloquées
   */
  async getUserQuizStats(userId: string): Promise<SourateQuizStatsDto[]> {
    // Obtenir toutes les sourates débloquées (pas seulement mémorisées)
    const unlockedProgress = await this.prisma.sourateProgress.findMany({
      where: { userId },
      select: { sourateNumero: true },
    });
    const memorizedSourates = unlockedProgress.map((p) => p.sourateNumero);

    const stats: SourateQuizStatsDto[] = [];

    for (const sourateNumero of memorizedSourates) {
      // Obtenir le nombre total de versets
      const sourate = await this.prisma.sourate.findUnique({
        where: { numero: sourateNumero },
      });

      // Obtenir toutes les questions de cette sourate
      const questions = await this.findQuestionsBySourate(sourateNumero);

      // Obtenir toutes les tentatives pour cette sourate
      const attempts = await this.findAttemptsByUserAndSourate(
        userId,
        sourateNumero,
      );

      // Calculer le nombre de questions uniques répondues
      const uniqueQuestionIds = new Set(attempts.map((a) => a.questionId));
      const questionsAnswered = uniqueQuestionIds.size;

      // Calculer le nombre de réponses correctes (première tentative uniquement)
      const firstAttempts = new Map<string, QuizAttemptEntity>();
      attempts.forEach((attempt) => {
        if (!firstAttempts.has(attempt.questionId)) {
          firstAttempts.set(attempt.questionId, attempt);
        }
      });
      const correctAnswers = Array.from(firstAttempts.values()).filter(
        (a) => a.isCorrect,
      ).length;

      // Dernière tentative
      const lastAttempt = attempts.length > 0 ? attempts[0] : null;

      // Questions quotidiennes restantes
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayAttempts = attempts.filter(
        (a) => a.attemptedAt >= today,
      ).length;
      const dailyQuestionsRemaining = Math.max(0, 5 - todayAttempts);

      stats.push({
        sourateNumero,
        totalVersets: sourate?.nombreVersets || 0,
        totalQuestions: questions.length,
        questionsAnswered,
        correctAnswers,
        lastAttemptDate: lastAttempt
          ? lastAttempt.attemptedAt.toISOString()
          : null,
        dailyQuestionsRemaining,
      });
    }

    return stats;
  }

  // ============ HELPERS ============

  private selectDailyQuestions(
    userId: string,
    questions: QuizQuestionEntity[],
    count: number,
  ): QuizQuestionResponseDto[] {
    // Pour le quiz quotidien, on utilise une seed basée sur la date
    // pour avoir les mêmes questions toute la journée
    const today = new Date();
    const seed =
      today.getFullYear() * 10000 +
      (today.getMonth() + 1) * 100 +
      today.getDate();

    // Mélanger avec une seed déterministe
    const shuffled = this.shuffleWithSeed([...questions], seed);

    return shuffled.slice(0, count).map(this.toQuestionDto);
  }

  private shuffleWithSeed<T>(array: T[], seed: number): T[] {
    const rng = this.seededRandom(seed);
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
  }

  private seededRandom(seed: number) {
    return function () {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  private getRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = this.shuffleArray(array);
    return shuffled.slice(0, Math.min(count, array.length));
  }

  // ============ MAPPERS ============

  private toQuestionEntity(question: any): QuizQuestionEntity {
    return new QuizQuestionEntity(
      question.id,
      question.versetId,
      question.sourateNumero,
      question.versetNumero,
      question.texteArabe,
      question.texteWithBlank,
      question.correctAnswer,
      question.options as string[],
      question.wordPosition,
      question.createdAt,
    );
  }

  private toAttemptEntity(attempt: any): QuizAttemptEntity {
    return new QuizAttemptEntity(
      attempt.id,
      attempt.userId,
      attempt.questionId,
      attempt.sourateNumero,
      attempt.selectedAnswer,
      attempt.isCorrect,
      attempt.attemptedAt,
    );
  }

  private toProgressEntity(progress: any): SourateProgressEntity {
    return new SourateProgressEntity(
      progress.id,
      progress.userId,
      progress.sourateNumero,
      progress.isMemorized,
      progress.completedAt,
      progress.createdAt,
      progress.updatedAt,
    );
  }

  private toQuestionDto(question: QuizQuestionEntity): QuizQuestionResponseDto {
    return {
      id: question.id,
      versetId: question.versetId,
      versetNumero: question.versetNumero,
      texteArabe: question.texteArabe,
      texteWithBlank: question.texteWithBlank,
      options: question.options,
      correctAnswer: question.correctAnswer,
      wordPosition: question.wordPosition,
    };
  }

  private toAttemptDto(attempt: QuizAttemptEntity): QuizAttemptResponseDto {
    return {
      id: attempt.id,
      userId: attempt.userId,
      questionId: attempt.questionId,
      sourateNumero: attempt.sourateNumero,
      selectedAnswer: attempt.selectedAnswer,
      isCorrect: attempt.isCorrect,
      attemptedAt: attempt.attemptedAt.toISOString(),
    };
  }
}
