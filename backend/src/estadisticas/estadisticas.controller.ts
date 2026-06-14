import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EstadisticasService } from './estadisticas.service';

@ApiTags('estadisticas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('estadisticas')
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get()
  obtener() {
    return this.estadisticasService.obtener();
  }
}
