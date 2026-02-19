import {
  Controller,
  Get,
  Param,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { VersetService } from '../service/verset.service';
import { VersetResponseDto } from '../dto/verset-response.dto';

@Controller('versets')
export class VersetController {
  constructor(private readonly versetService: VersetService) {}

  @Get('sourate/:sourateNumero')
  async findBySourate(
    @Param('sourateNumero', ParseIntPipe) sourateNumero: number,
  ): Promise<VersetResponseDto[]> {
    const versets = await this.versetService.findBySourate(sourateNumero);
    return versets.map((verset) => new VersetResponseDto(verset));
  }

  @Get('sourate/:sourateNumero/verset/:versetNumero')
  async findByNumero(
    @Param('sourateNumero', ParseIntPipe) sourateNumero: number,
    @Param('versetNumero', ParseIntPipe) versetNumero: number,
  ): Promise<VersetResponseDto> {
    const verset = await this.versetService.findByNumero(
      sourateNumero,
      versetNumero,
    );
    if (!verset) {
      throw new NotFoundException(
        `Verset ${versetNumero} of Sourate ${sourateNumero} not found`,
      );
    }
    return new VersetResponseDto(verset);
  }
}
