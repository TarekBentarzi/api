import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { UserSaveService } from '../service/user-save.service';
import { UserSaveResponseDto } from '../dto/user-save-response.dto';
import { UpsertUserSaveDto } from '../dto/upsert-user-save.dto';
import { JwtAuthGuard } from '../../../primary/auth/guards/jwt-auth.guard';

@Controller('users/:userId/save')
@UseGuards(JwtAuthGuard)
export class UserSaveController {
  constructor(private readonly userSaveService: UserSaveService) {}

  @Get()
  async findByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<UserSaveResponseDto | null> {
    const userSave = await this.userSaveService.findByUserId(userId);
    if (!userSave) {
      return null;
    }
    return new UserSaveResponseDto(userSave);
  }

  @Put()
  async upsert(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() upsertUserSaveDto: UpsertUserSaveDto,
  ): Promise<UserSaveResponseDto> {
    const userSave = await this.userSaveService.upsert(
      userId,
      upsertUserSaveDto.sourateNumero,
      upsertUserSaveDto.versetNumero,
    );
    return new UserSaveResponseDto(userSave);
  }
}
