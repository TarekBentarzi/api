export class QuizQuestionResponseDto {
  id: string;
  versetId: string;
  versetNumero: number;
  texteArabe: string;
  texteWithBlank: string;
  options: string[];
  correctAnswer: string;
  wordPosition: number;
}
