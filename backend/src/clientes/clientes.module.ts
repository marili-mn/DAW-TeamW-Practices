import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proyecto } from '../proyectos/proyecto.entity';
import { Cliente } from './cliente.entity';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente, Proyecto])],
  controllers: [ClientesController],
  providers: [ClientesService],
})
export class ClientesModule {}
