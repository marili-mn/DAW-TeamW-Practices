import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { enviarCsv, toCsv } from '../common/csv.util';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { EstadoProyecto } from './proyecto.entity';
import { ProyectosService } from './proyectos.service';

@ApiTags('proyectos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('proyectos')
export class ProyectosController {
  constructor(private readonly proyectosService: ProyectosService) {}

  @Get()
  @ApiOperation({
    summary: 'Búsqueda avanzada de proyectos',
    description: 'Filtrá por nombre, estado o cliente; ordená por columna; paginá. Devuelve { data, total, page, pageSize }.',
  })
  @ApiQuery({ name: 'nombre', required: false, description: 'Filtro parcial por nombre.' })
  @ApiQuery({ name: 'estado', required: false, enum: EstadoProyecto })
  @ApiQuery({ name: 'clienteId', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, enum: ['nombre', 'estado', 'fecha_fin', 'id'] })
  @ApiQuery({ name: 'dir', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Página (desde 1).' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Registros por página (default 10).' })
  @ApiResponse({ status: 200, description: 'Resultado paginado.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  findAll(
    @Query('nombre') nombre?: string,
    @Query('estado') estado?: EstadoProyecto,
    @Query('clienteId') clienteId?: string,
    @Query('sort') sort?: string,
    @Query('dir') dir?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.proyectosService.search({
      nombre,
      estado,
      clienteId: clienteId !== undefined ? Number(clienteId) : undefined,
      sort,
      dir,
      page: page !== undefined ? Number(page) : undefined,
      pageSize: pageSize !== undefined ? Number(pageSize) : undefined,
    });
  }

  @Get('export.csv')
  @ApiOperation({ summary: 'Exportar proyectos a CSV', description: 'Descarga CSV con id, nombre, estado, cliente y fecha_fin.' })
  @ApiResponse({ status: 200, description: 'Archivo proyectos.csv.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  async exportCsv(@Res() res: Response) {
    const proyectos = await this.proyectosService.findAll();
    const filas = proyectos.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      estado: p.estado,
      cliente: p.cliente?.nombre ?? '',
      fecha_fin: p.fechaFin ?? '',
    }));
    const csv = toCsv(filas, [
      { key: 'id', etiqueta: 'ID' },
      { key: 'nombre', etiqueta: 'Nombre' },
      { key: 'estado', etiqueta: 'Estado' },
      { key: 'cliente', etiqueta: 'Cliente' },
      { key: 'fecha_fin', etiqueta: 'Fecha fin' },
    ]);
    enviarCsv(res, 'proyectos.csv', csv);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener proyecto por ID', description: 'Incluye tareas y cliente anidados.' })
  @ApiResponse({ status: 200, description: 'Proyecto encontrado con sus tareas.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.proyectosService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear proyecto', description: 'El cliente referenciado debe estar en estado ACTIVO.' })
  @ApiResponse({ status: 201, description: 'Proyecto creado.' })
  @ApiResponse({ status: 400, description: 'Cliente en estado BAJA o no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  create(@Body() createProyectoDto: CreateProyectoDto) {
    return this.proyectosService.create(createProyectoDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar proyecto' })
  @ApiResponse({ status: 200, description: 'Proyecto actualizado.' })
  @ApiResponse({ status: 400, description: 'Cliente en estado BAJA.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProyectoDto: UpdateProyectoDto,
  ) {
    return this.proyectosService.update(id, updateProyectoDto);
  }
}
