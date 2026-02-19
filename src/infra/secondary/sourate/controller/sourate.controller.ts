import {
  Controller,
  Get,
  Param,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { SourateService } from '../service/sourate.service';
import { SourateResponseDto } from '../dto/sourate-response.dto';

@Controller('sourates')
export class SourateController {
  constructor(private readonly sourateService: SourateService) {}

  @Get()
  async findAll(): Promise<SourateResponseDto[]> {
    const sourates = await this.sourateService.findAll();
    return sourates.map((sourate) => new SourateResponseDto(sourate));
  }

  @Get(':numero')
  async findByNumero(
    @Param('numero', ParseIntPipe) numero: number,
  ): Promise<SourateResponseDto> {
    const sourate = await this.sourateService.findByNumero(numero);
    if (!sourate) {
      throw new NotFoundException(`Sourate ${numero} not found`);
    }
    return new SourateResponseDto(sourate);
  }
}
