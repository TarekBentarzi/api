import { UserMemorizationEntity } from './user-memorization.entity';

export interface UserMemorizationRepositoryInterface {
  findByUserId(userId: string): Promise<UserMemorizationEntity[]>;
  findById(id: string): Promise<UserMemorizationEntity | null>;
  findByUserAndVerset(
    userId: string,
    versetId: string,
  ): Promise<UserMemorizationEntity | null>;
  findRevisionsForUser(userId: string): Promise<UserMemorizationEntity[]>;
  create(
    userId: string,
    versetId: string,
    sourateNumero: number,
    versetNumero: number,
  ): Promise<UserMemorizationEntity>;
  update(
    id: string,
    data: Partial<UserMemorizationEntity>,
  ): Promise<UserMemorizationEntity>;
  delete(id: string): Promise<void>;
}
