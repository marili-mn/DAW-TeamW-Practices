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
  @ApiQuery({ name: 'estado', enum: EstadoCliente, required: false })
  findAll(@Query('estado') estado?: EstadoCliente) {
    return this.clientesService.findAll(estado);
  }

  @Get('export.csv')
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
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.findOne(id);
  }

  @Post()
  create(@Body() createClienteDto: CreateClienteDto) {
    return this.clientesService.create(createClienteDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClienteDto: UpdateClienteDto,
  ) {
    return this.clientesService.update(id, updateClienteDto);
  }
}
