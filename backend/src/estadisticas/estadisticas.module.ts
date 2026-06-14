import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from '../clientes/cliente.entity';
import { Proyecto } from '../proyectos/proyecto.entity';
import { Tarea } from '../tareas/tarea.entity';
import { EstadisticasController } from './estadisticas.controller';
import { EstadisticasService } from './estadisticas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Proyecto, Tarea, Cliente])],
  controllers: [EstadisticasController],
  providers: [EstadisticasService],
})
export class EstadisticasModule {}
