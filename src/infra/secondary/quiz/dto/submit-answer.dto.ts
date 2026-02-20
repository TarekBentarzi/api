import { IsString, IsNotEmpty } from 'class-validator';

export class SubmitAnswerDto {
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @IsString()
  @IsNotEmpty()
  selectedAnswer: string;
}
