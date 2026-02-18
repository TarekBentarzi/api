import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VersetRepositoryInterface } from '../../../../domain/verset/verset.repository.interface';
import { VersetEntity } from '../../../../domain/verset/verset.entity';

@Injectable()
export class VersetService implements VersetRepositoryInterface {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<VersetEntity[]> {
    const versets = await this.prisma.verset.findMany({
      orderBy: [{ sourateNumero: 'asc' }, { versetNumero: 'asc' }],
    });
    return versets.map(
      (v) =>
        new VersetEntity(
          v.id,
          v.sourateNumero,
          v.versetNumero,
          v.texteArabe,
          v.translitteration,
          v.traduction,
          v.audioUrl,
          v.createdAt,
          v.updatedAt,
        ),
    );
  }

  async findById(id: string): Promise<VersetEntity | null> {
    const verset = await this.prisma.verset.findUnique({
      where: { id },
    });
    if (!verset) return null;
    return new VersetEntity(
      verset.id,
      verset.sourateNumero,
      verset.versetNumero,
      verset.texteArabe,
      verset.translitteration,
      verset.traduction,
      verset.audioUrl,
      verset.createdAt,
      verset.updatedAt,
    );
  }

  async findBySourate(sourateNumero: number): Promise<VersetEntity[]> {
    const versets = await this.prisma.verset.findMany({
      where: { sourateNumero },
      orderBy: { versetNumero: 'asc' },
    });
    return versets.map(
      (v) =>
        new VersetEntity(
          v.id,
          v.sourateNumero,
          v.versetNumero,
          v.texteArabe,
          v.translitteration,
          v.traduction,
          v.audioUrl,
          v.createdAt,
          v.updatedAt,
        ),
    );
  }

  async findByNumero(
    sourateNumero: number,
    versetNumero: number,
  ): Promise<VersetEntity | null> {
    const verset = await this.prisma.verset.findUnique({
      where: {
        sourateNumero_versetNumero: {
          sourateNumero,
          versetNumero,
        },
      },
    });
    if (!verset) return null;
    return new VersetEntity(
      verset.id,
      verset.sourateNumero,
      verset.versetNumero,
      verset.texteArabe,
      verset.translitteration,
      verset.traduction,
      verset.audioUrl,
      verset.createdAt,
      verset.updatedAt,
    );
  }
}
