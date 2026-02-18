import { SourateEntity } from './sourate.entity';

export interface SourateRepositoryInterface {
  findAll(): Promise<SourateEntity[]>;
  findById(id: string): Promise<SourateEntity | null>;
  findByNumero(numero: number): Promise<SourateEntity | null>;
}
