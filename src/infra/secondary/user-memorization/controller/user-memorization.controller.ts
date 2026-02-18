import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { UserMemorizationService } from '../service/user-memorization.service';
import { UserMemorizationResponseDto } from '../dto/user-memorization-response.dto';
import { CreateMemorizationDto } from '../dto/create-memorization.dto';
import { UpdateMemorizationDto } from '../dto/update-memorization.dto';
import { UserMemorizationEntity } from '../../../../domain/user-memorization/user-memorization.entity';
import { JwtAuthGuard } from '../../../primary/auth/guards/jwt-auth.guard';

@Controller('users/:userId/memorizations')
@UseGuards(JwtAuthGuard)
export class UserMemorizationController {
  constructor(
    private readonly memorizationService: UserMemorizationService,
  ) {}

  @Get()
  async findByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<UserMemorizationResponseDto[]> {
    const memorizations =
      await this.memorizationService.findByUserId(userId);
    return memorizations.map((m) => new UserMemorizationResponseDto(m));
  }

  @Get('revisions')
  async findRevisionsForUser(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<UserMemorizationResponseDto[]> {
    const memorizations =
      await this.memorizationService.findRevisionsForUser(userId);
    return memorizations.map((m) => new UserMemorizationResponseDto(m));
  }

  @Get(':id')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserMemorizationResponseDto> {
    const memorization = await this.memorizationService.findById(id);
    if (!memorization) {
      throw new NotFoundException(`Memorization with ID ${id} not found`);
    }
    return new UserMemorizationResponseDto(memorization);
  }

  @Post()
  async create(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() createDto: CreateMemorizationDto,
  ): Promise<UserMemorizationResponseDto> {
    const memorization = await this.memorizationService.create(
      userId,
      createDto.versetId,
      createDto.sourateNumero,
      createDto.versetNumero,
    );
    return new UserMemorizationResponseDto(memorization);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateMemorizationDto,
  ): Promise<UserMemorizationResponseDto> {
    const updateData: Partial<UserMemorizationEntity> = {
      statut: updateDto.statut,
      niveauMaitrise: updateDto.niveauMaitrise,
      exercicesTotal: updateDto.exercicesTotal,
      exercicesReussis: updateDto.exercicesReussis,
    };
    if (updateDto.prochaineRevision) {
      updateData.prochaineRevision = new Date(updateDto.prochaineRevision);
    }
    const memorization = await this.memorizationService.update(id, updateData);
    return new UserMemorizationResponseDto(memorization);
  }

  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.memorizationService.delete(id);
  }
}
