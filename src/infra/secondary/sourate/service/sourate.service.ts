import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SourateRepositoryInterface } from '../../../../domain/sourate/sourate.repository.interface';
import { SourateEntity } from '../../../../domain/sourate/sourate.entity';

@Injectable()
export class SourateService implements SourateRepositoryInterface {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<SourateEntity[]> {
    const sourates = await this.prisma.sourate.findMany({
      orderBy: { numero: 'asc' },
    });
    return sourates.map(
      (s) =>
        new SourateEntity(
          s.id,
          s.numero,
          s.nomArabe,
          s.nomTranslitteration,
          s.nomTraduction,
          s.nombreVersets,
          s.revelation,
          s.createdAt,
          s.updatedAt,
        ),
    );
  }

  async findById(id: string): Promise<SourateEntity | null> {
    const sourate = await this.prisma.sourate.findUnique({
      where: { id },
    });
    if (!sourate) return null;
    return new SourateEntity(
      sourate.id,
      sourate.numero,
      sourate.nomArabe,
      sourate.nomTranslitteration,
      sourate.nomTraduction,
      sourate.nombreVersets,
      sourate.revelation,
      sourate.createdAt,
      sourate.updatedAt,
    );
  }

  async findByNumero(numero: number): Promise<SourateEntity | null> {
    const sourate = await this.prisma.sourate.findUnique({
      where: { numero },
    });
    if (!sourate) return null;
    return new SourateEntity(
      sourate.id,
      sourate.numero,
      sourate.nomArabe,
      sourate.nomTranslitteration,
      sourate.nomTraduction,
      sourate.nombreVersets,
      sourate.revelation,
      sourate.createdAt,
      sourate.updatedAt,
    );
  }
}
