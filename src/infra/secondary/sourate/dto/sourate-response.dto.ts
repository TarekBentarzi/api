import { SourateEntity } from '../../../../domain/sourate/sourate.entity';

export class SourateResponseDto {
  id: string;
  numero: number;
  nomArabe: string;
  nomTranslitteration: string;
  nomTraduction: string;
  nombreVersets: number;
  revelation: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(sourate: SourateEntity) {
    this.id = sourate.id;
    this.numero = sourate.numero;
    this.nomArabe = sourate.nomArabe;
    this.nomTranslitteration = sourate.nomTranslitteration;
    this.nomTraduction = sourate.nomTraduction;
    this.nombreVersets = sourate.nombreVersets;
    this.revelation = sourate.revelation;
    this.createdAt = sourate.createdAt;
    this.updatedAt = sourate.updatedAt;
  }
}
