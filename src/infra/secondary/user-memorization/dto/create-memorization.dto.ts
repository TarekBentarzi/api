import { IsUUID, IsInt, Min, Max } from 'class-validator';

export class CreateMemorizationDto {
  @IsUUID()
  versetId: string;

  @IsInt()
  @Min(1)
  @Max(114)
  sourateNumero: number;

  @IsInt()
  @Min(1)
  versetNumero: number;
}
