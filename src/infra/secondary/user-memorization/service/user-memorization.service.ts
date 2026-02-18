import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserMemorizationRepositoryInterface } from '../../../../domain/user-memorization/user-memorization.repository.interface';
import { UserMemorizationEntity } from '../../../../domain/user-memorization/user-memorization.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserMemorizationService
  implements UserMemorizationRepositoryInterface
{
  constructor(private prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<UserMemorizationEntity[]> {
    const memorizations = await this.prisma.userMemorization.findMany({
      where: { userId },
      orderBy: [{ sourateNumero: 'asc' }, { versetNumero: 'asc' }],
    });
    return memorizations.map((m) => this.toEntity(m));
  }

  async findById(id: string): Promise<UserMemorizationEntity | null> {
    const memorization = await this.prisma.userMemorization.findUnique({
      where: { id },
    });
    if (!memorization) return null;
    return this.toEntity(memorization);
  }

  async findByUserAndVerset(
    userId: string,
    versetId: string,
  ): Promise<UserMemorizationEntity | null> {
    const memorization = await this.prisma.userMemorization.findUnique({
      where: {
        userId_versetId: {
          userId,
          versetId,
        },
      },
    });
    if (!memorization) return null;
    return this.toEntity(memorization);
  }

  async findRevisionsForUser(
    userId: string,
  ): Promise<UserMemorizationEntity[]> {
    const now = new Date();
    const memorizations = await this.prisma.userMemorization.findMany({
      where: {
        userId,
        prochaineRevision: {
          lte: now,
        },
      },
      orderBy: { prochaineRevision: 'asc' },
    });
    return memorizations.map((m) => this.toEntity(m));
  }

  async create(
    userId: string,
    versetId: string,
    sourateNumero: number,
    versetNumero: number,
  ): Promise<UserMemorizationEntity> {
    try {
      const memorization = await this.prisma.userMemorization.create({
        data: {
          userId,
          versetId,
          sourateNumero,
          versetNumero,
        },
      });
      return this.toEntity(memorization);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'User already started memorizing this verset',
        );
      }
      throw error;
    }
  }

  async update(
    id: string,
    data: Partial<UserMemorizationEntity>,
  ): Promise<UserMemorizationEntity> {
    try {
      const updateData: any = {};
      
      if (data.statut !== undefined) updateData.statut = data.statut;
      if (data.niveauMaitrise !== undefined)
        updateData.niveauMaitrise = data.niveauMaitrise;
      if (data.exercicesTotal !== undefined)
        updateData.exercicesTotal = data.exercicesTotal;
      if (data.exercicesReussis !== undefined)
        updateData.exercicesReussis = data.exercicesReussis;
      if (data.derniereRevision !== undefined)
        updateData.derniereRevision = data.derniereRevision;
      if (data.prochaineRevision !== undefined)
        updateData.prochaineRevision = data.prochaineRevision;

      const memorization = await this.prisma.userMemorization.update({
        where: { id },
        data: updateData,
      });
      return this.toEntity(memorization);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Memorization with ID ${id} not found`);
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.userMemorization.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Memorization with ID ${id} not found`);
      }
      throw error;
    }
  }

  private toEntity(m: any): UserMemorizationEntity {
    return new UserMemorizationEntity(
      m.id,
      m.userId,
      m.versetId,
      m.sourateNumero,
      m.versetNumero,
      m.statut,
      m.niveauMaitrise,
      m.exercicesTotal,
      m.exercicesReussis,
      m.derniereRevision,
      m.prochaineRevision,
      m.createdAt,
      m.updatedAt,
    );
  }
}
