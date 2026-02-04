import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRepositoryInterface } from '../../../../domain/user/user.repository.interface';
import { UserEntity } from '../../../../domain/user/user.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService implements UserRepositoryInterface {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany();
    return users.map((u) => new UserEntity(u.id, u.name, u.email));
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) return null;
    return new UserEntity(user.id, user.name, user.email);
  }

  async create(user: Partial<UserEntity>): Promise<UserEntity> {
    try {
      const created = await this.prisma.user.create({
        data: {
          name: user.name!,
          email: user.email!,
        },
      });
      return new UserEntity(created.id, created.name, created.email);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async update(id: string, user: Partial<UserEntity>): Promise<UserEntity> {
    try {
      const updated = await this.prisma.user.update({
        where: { id },
        data: user,
      });
      return new UserEntity(updated.id, updated.name, updated.email);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      throw error;
    }
  }
}
