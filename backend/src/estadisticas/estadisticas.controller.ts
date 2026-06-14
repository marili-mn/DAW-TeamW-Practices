import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EstadisticasService } from './estadisticas.service';

@ApiTags('estadisticas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('estadisticas')
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener métricas del dashboard',
    description: 'Devuelve totales, distribución por estado, ranking de clientes y cantidad de proyectos atrasados.',
  })
  @ApiResponse({ status: 200, description: 'Objeto con proyectosPorEstado, tareasPorEstado, topClientes, proyectosAtrasados y totales.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  obtener() {
    return this.estadisticasService.obtener();
  }
}
