export class UserMemorizationEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly versetId: string,
    public readonly sourateNumero: number,
    public readonly versetNumero: number,
    public readonly statut: string,
    public readonly niveauMaitrise: number,
    public readonly exercicesTotal: number,
    public readonly exercicesReussis: number,
    public readonly derniereRevision: Date | null,
    public readonly prochaineRevision: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
