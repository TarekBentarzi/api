export class VersetEntity {
  constructor(
    public readonly id: string,
    public readonly sourateNumero: number,
    public readonly versetNumero: number,
    public readonly texteArabe: string,
    public readonly translitteration: string | null,
    public readonly traduction: string | null,
    public readonly audioUrl: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
