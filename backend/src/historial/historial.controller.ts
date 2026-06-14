import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Rol } from '../usuarios/usuario.entity';
import { HistorialService } from './historial.service';

@ApiTags('historial')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.ADMIN)
@Controller('historial')
export class HistorialController {
  constructor(private readonly historialService: HistorialService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar historial de cambios (solo ADMIN)',
    description: 'Devuelve todos los eventos registrados por el interceptor global, ordenados por fecha descendente.',
  })
  @ApiResponse({ status: 200, description: 'Array de registros de auditoría.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'Requiere rol ADMIN.' })
  findAll() {
    return this.historialService.findAll();
  }
}
