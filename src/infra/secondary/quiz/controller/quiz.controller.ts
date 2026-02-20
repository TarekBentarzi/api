import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { QuizService } from '../service/quiz.service';
import {
  QuizQuestionResponseDto,
  QuizAttemptResponseDto,
  SubmitAnswerDto,
  SourateQuizStatsDto,
} from '../dto';

@Controller('users/:userId/quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  /**
   * GET /users/:userId/quiz/stats
   * Récupère les statistiques de quiz pour toutes les sourates mémorisées
   */
  @Get('stats')
  async getUserQuizStats(
    @Param('userId') userId: string,
  ): Promise<SourateQuizStatsDto[]> {
    return this.quizService.getUserQuizStats(userId);
  }

  /**
   * GET /users/:userId/quiz/sourate/:sourateNumero/daily
   * Récupère le quiz quotidien (5 questions) pour une sourate
   */
  @Get('sourate/:sourateNumero/daily')
  async getDailyQuiz(
    @Param('userId') userId: string,
    @Param('sourateNumero', ParseIntPipe) sourateNumero: number,
  ): Promise<QuizQuestionResponseDto[]> {
    return this.quizService.getDailyQuiz(userId, sourateNumero);
  }

  /**
   * GET /users/:userId/quiz/sourate/:sourateNumero/new
   * Récupère de nouvelles questions non encore répondues
   */
  @Get('sourate/:sourateNumero/new')
  async getNewQuestions(
    @Param('userId') userId: string,
    @Param('sourateNumero', ParseIntPipe) sourateNumero: number,
    @Query('count', ParseIntPipe) count: number = 5,
  ): Promise<QuizQuestionResponseDto[]> {
    return this.quizService.getNewQuestions(userId, sourateNumero, count);
  }

  /**
   * POST /users/:userId/quiz/answer
   * Soumet une réponse à une question
   */
  @Post('answer')
  async submitAnswer(
    @Param('userId') userId: string,
    @Body() submitAnswerDto: SubmitAnswerDto,
  ): Promise<QuizAttemptResponseDto> {
    return this.quizService.submitAnswer(
      userId,
      submitAnswerDto.questionId,
      submitAnswerDto.selectedAnswer,
    );
  }
}

@Controller('users/:userId/memorization')
export class MemorizationController {
  constructor(private readonly quizService: QuizService) {}

  /**
   * POST /users/:userId/memorization/sourate/:sourateNumero/unlock
   * Débloque une sourate pour le quiz (quand on l'a lue)
   */
  @Post('sourate/:sourateNumero/unlock')
  async unlockSourate(
    @Param('userId') userId: string,
    @Param('sourateNumero', ParseIntPipe) sourateNumero: number,
  ) {
    await this.quizService.unlockSourate(userId, sourateNumero);
    return { success: true, message: 'Sourate unlocked for quiz' };
  }

  /**
   * POST /users/:userId/memorization/sourate/:sourateNumero/complete
   * Marque une sourate comme complètement mémorisée
   */
  @Post('sourate/:sourateNumero/complete')
  async markSourateAsMemorized(
    @Param('userId') userId: string,
    @Param('sourateNumero', ParseIntPipe) sourateNumero: number,
  ) {
    await this.quizService.markSourateAsMemorized(userId, sourateNumero);
    return { success: true, message: 'Sourate marked as memorized' };
  }

  /**
   * GET /users/:userId/memorization/sourates
   * Récupère la liste des numéros de sourates mémorisées
   */
  @Get('sourates')
  async getMemorizedSourates(
    @Param('userId') userId: string,
  ): Promise<number[]> {
    return this.quizService.getMemorizedSourates(userId);
  }
}
