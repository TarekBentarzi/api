export class SourateEntity {
  constructor(
    public readonly id: string,
    public readonly numero: number,
    public readonly nomArabe: string,
    public readonly nomTranslitteration: string,
    public readonly nomTraduction: string,
    public readonly nombreVersets: number,
    public readonly revelation: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
