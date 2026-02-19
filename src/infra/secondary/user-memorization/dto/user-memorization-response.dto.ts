import { UserMemorizationEntity } from '../../../../domain/user-memorization/user-memorization.entity';

export class UserMemorizationResponseDto {
  id: string;
  userId: string;
  versetId: string;
  sourateNumero: number;
  versetNumero: number;
  statut: string;
  niveauMaitrise: number;
  exercicesTotal: number;
  exercicesReussis: number;
  derniereRevision: Date | null;
  prochaineRevision: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(memorization: UserMemorizationEntity) {
    this.id = memorization.id;
    this.userId = memorization.userId;
    this.versetId = memorization.versetId;
    this.sourateNumero = memorization.sourateNumero;
    this.versetNumero = memorization.versetNumero;
    this.statut = memorization.statut;
    this.niveauMaitrise = memorization.niveauMaitrise;
    this.exercicesTotal = memorization.exercicesTotal;
    this.exercicesReussis = memorization.exercicesReussis;
    this.derniereRevision = memorization.derniereRevision;
    this.prochaineRevision = memorization.prochaineRevision;
    this.createdAt = memorization.createdAt;
    this.updatedAt = memorization.updatedAt;
  }
}
