import {
  IsEnum,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class UpdateMemorizationDto {
  @IsOptional()
  @IsEnum(['en_cours', 'memorise', 'a_reviser'])
  statut?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  niveauMaitrise?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  exercicesTotal?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  exercicesReussis?: number;

  @IsOptional()
  @IsDateString()
  prochaineRevision?: string;
}
