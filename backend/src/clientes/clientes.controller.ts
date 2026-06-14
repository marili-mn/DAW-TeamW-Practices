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
import { EstadoCliente } from './cliente.entity';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@ApiTags('clientes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar clientes', description: 'Filtrá por estado con ?estado=ACTIVO|BAJA.' })
  @ApiQuery({ name: 'estado', enum: EstadoCliente, required: false })
  @ApiResponse({ status: 200, description: 'Array de clientes.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  findAll(@Query('estado') estado?: EstadoCliente) {
    return this.clientesService.findAll(estado);
  }

  @Get('export.csv')
  @ApiOperation({ summary: 'Exportar clientes a CSV', description: 'Descarga un archivo CSV con id, nombre, estado, teléfono y email.' })
  @ApiResponse({ status: 200, description: 'Archivo clientes.csv.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  async exportCsv(@Res() res: Response) {
    const clientes = await this.clientesService.findAll();
    const csv = toCsv(
      clientes.map((c) => ({
        id: c.id,
        nombre: c.nombre,
        estado: c.estado,
        telefono: c.telefono ?? '',
        email: c.email ?? '',
      })),
      [
        { key: 'id', etiqueta: 'ID' },
        { key: 'nombre', etiqueta: 'Nombre' },
        { key: 'estado', etiqueta: 'Estado' },
        { key: 'telefono', etiqueta: 'Teléfono' },
        { key: 'email', etiqueta: 'Email' },
      ],
    );
    enviarCsv(res, 'clientes.csv', csv);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener cliente por ID' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear cliente' })
  @ApiResponse({ status: 201, description: 'Cliente creado.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 409, description: 'Ya existe un cliente con ese nombre.' })
  create(@Body() createClienteDto: CreateClienteDto) {
    return this.clientesService.create(createClienteDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar cliente', description: 'Dar de baja solo si el cliente no tiene proyectos asociados.' })
  @ApiResponse({ status: 200, description: 'Cliente actualizado.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  @ApiResponse({ status: 409, description: 'Tiene proyectos asociados — no se puede dar de baja.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClienteDto: UpdateClienteDto,
  ) {
    return this.clientesService.update(id, updateClienteDto);
  }
}
