import { IsInt, Min, Max } from 'class-validator';

export class UpsertUserSaveDto {
  @IsInt()
  @Min(1)
  @Max(114)
  sourateNumero: number;

  @IsInt()
  @Min(1)
  versetNumero: number;
}
