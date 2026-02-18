import { VersetEntity } from '../../../../domain/verset/verset.entity';

export class VersetResponseDto {
  id: string;
  sourateNumero: number;
  versetNumero: number;
  texteArabe: string;
  translitteration: string | null;
  traduction: string | null;
  audioUrl: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(verset: VersetEntity) {
    this.id = verset.id;
    this.sourateNumero = verset.sourateNumero;
    this.versetNumero = verset.versetNumero;
    this.texteArabe = verset.texteArabe;
    this.translitteration = verset.translitteration;
    this.traduction = verset.traduction;
    this.audioUrl = verset.audioUrl;
    this.createdAt = verset.createdAt;
    this.updatedAt = verset.updatedAt;
  }
}
