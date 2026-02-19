import { UserSaveEntity } from '../../../../domain/user-save/user-save.entity';

export class UserSaveResponseDto {
  id: string;
  userId: string;
  sourateNumero: number;
  versetNumero: number;
  lastReadAt: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(userSave: UserSaveEntity) {
    this.id = userSave.id;
    this.userId = userSave.userId;
    this.sourateNumero = userSave.sourateNumero;
    this.versetNumero = userSave.versetNumero;
    this.lastReadAt = userSave.lastReadAt;
    this.createdAt = userSave.createdAt;
    this.updatedAt = userSave.updatedAt;
  }
}
