export class SourateProgressEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly sourateNumero: number,
    public readonly isMemorized: boolean,
    public readonly completedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
