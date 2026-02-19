import { VersetEntity } from './verset.entity';

export interface VersetRepositoryInterface {
  findAll(): Promise<VersetEntity[]>;
  findById(id: string): Promise<VersetEntity | null>;
  findBySourate(sourateNumero: number): Promise<VersetEntity[]>;
  findByNumero(
    sourateNumero: number,
    versetNumero: number,
  ): Promise<VersetEntity | null>;
}
