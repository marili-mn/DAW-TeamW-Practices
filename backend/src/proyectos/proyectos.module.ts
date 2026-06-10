import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from '../clientes/cliente.entity';
import { Proyecto } from './proyecto.entity';
import { ProyectosController } from './proyectos.controller';
import { ProyectosService } from './proyectos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Proyecto, Cliente])],
  controllers: [ProyectosController],
  providers: [ProyectosService],
})
export class ProyectosModule {}
