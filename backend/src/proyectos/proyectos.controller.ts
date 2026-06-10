import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { ProyectosService } from './proyectos.service';

@ApiTags('proyectos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('proyectos')
export class ProyectosController {
  constructor(private readonly proyectosService: ProyectosService) {}

  @Get()
  findAll() {
    return this.proyectosService.findAll();
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
