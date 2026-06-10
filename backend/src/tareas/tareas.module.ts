import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proyecto } from '../proyectos/proyecto.entity';
import { Tarea } from './tarea.entity';
import { TareasController } from './tareas.controller';
import { TareasService } from './tareas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tarea, Proyecto])],
  controllers: [TareasController],
  providers: [TareasService],
})
export class TareasModule {}
