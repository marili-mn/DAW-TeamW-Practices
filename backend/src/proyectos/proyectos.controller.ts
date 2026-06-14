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
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
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

  // Búsqueda avanzada: filtros, ordenamiento y paginación por query params.
  // Devuelve shape { data, total, page, pageSize }.
  @Get()
  @ApiQuery({ name: 'nombre', required: false })
  @ApiQuery({ name: 'estado', required: false, enum: EstadoProyecto })
  @ApiQuery({ name: 'clienteId', required: false, type: Number })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['nombre', 'estado', 'fecha_fin', 'id'],
  })
  @ApiQuery({ name: 'dir', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
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

  // CSV antes del ':id' para que no colisione con findOne.
  @Get('export.csv')
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
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.proyectosService.findOne(id);
  }

  @Post()
  create(@Body() createProyectoDto: CreateProyectoDto) {
    return this.proyectosService.create(createProyectoDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProyectoDto: UpdateProyectoDto,
  ) {
    return this.proyectosService.update(id, updateProyectoDto);
  }
}
