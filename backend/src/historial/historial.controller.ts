import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HistorialService } from './historial.service';

@ApiTags('historial')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('historial')
export class HistorialController {
  constructor(private readonly historialService: HistorialService) {}

  @Get()
  findAll() {
    return this.historialService.findAll();
  }
}
