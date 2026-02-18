export class UserSaveEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly sourateNumero: number,
    public readonly versetNumero: number,
    public readonly lastReadAt: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
