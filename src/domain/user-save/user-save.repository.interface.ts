import { UserSaveEntity } from './user-save.entity';

export interface UserSaveRepositoryInterface {
  findByUserId(userId: string): Promise<UserSaveEntity | null>;
  create(
    userId: string,
    sourateNumero: number,
    versetNumero: number,
  ): Promise<UserSaveEntity>;
  update(
    userId: string,
    sourateNumero: number,
    versetNumero: number,
  ): Promise<UserSaveEntity>;
  upsert(
    userId: string,
    sourateNumero: number,
    versetNumero: number,
  ): Promise<UserSaveEntity>;
}
