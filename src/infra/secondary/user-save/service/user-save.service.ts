import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserSaveRepositoryInterface } from '../../../../domain/user-save/user-save.repository.interface';
import { UserSaveEntity } from '../../../../domain/user-save/user-save.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserSaveService implements UserSaveRepositoryInterface {
  constructor(private prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<UserSaveEntity | null> {
    const userSave = await this.prisma.userSave.findUnique({
      where: { userId },
    });
    if (!userSave) return null;
    return new UserSaveEntity(
      userSave.id,
      userSave.userId,
      userSave.sourateNumero,
      userSave.versetNumero,
      userSave.lastReadAt,
      userSave.createdAt,
      userSave.updatedAt,
    );
  }

  async create(
    userId: string,
    sourateNumero: number,
    versetNumero: number,
  ): Promise<UserSaveEntity> {
    const userSave = await this.prisma.userSave.create({
      data: {
        userId,
        sourateNumero,
        versetNumero,
      },
    });
    return new UserSaveEntity(
      userSave.id,
      userSave.userId,
      userSave.sourateNumero,
      userSave.versetNumero,
      userSave.lastReadAt,
      userSave.createdAt,
      userSave.updatedAt,
    );
  }

  async update(
    userId: string,
    sourateNumero: number,
    versetNumero: number,
  ): Promise<UserSaveEntity> {
    try {
      const userSave = await this.prisma.userSave.update({
        where: { userId },
        data: {
          sourateNumero,
          versetNumero,
          lastReadAt: new Date(),
        },
      });
      return new UserSaveEntity(
        userSave.id,
        userSave.userId,
        userSave.sourateNumero,
        userSave.versetNumero,
        userSave.lastReadAt,
        userSave.createdAt,
        userSave.updatedAt,
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`User save for user ${userId} not found`);
      }
      throw error;
    }
  }

  async upsert(
    userId: string,
    sourateNumero: number,
    versetNumero: number,
  ): Promise<UserSaveEntity> {
    const userSave = await this.prisma.userSave.upsert({
      where: { userId },
      update: {
        sourateNumero,
        versetNumero,
        lastReadAt: new Date(),
      },
      create: {
        userId,
        sourateNumero,
        versetNumero,
      },
    });
    return new UserSaveEntity(
      userSave.id,
      userSave.userId,
      userSave.sourateNumero,
      userSave.versetNumero,
      userSave.lastReadAt,
      userSave.createdAt,
      userSave.updatedAt,
    );
  }
}
