import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Historial } from './historial.entity';

@Injectable()
export class HistorialService {
  private readonly logger = new Logger(HistorialService.name);

  constructor(
    @InjectRepository(Historial)
    private readonly repo: Repository<Historial>,
  ) {}

  async registrar(datos: {
    entidad: string;
    entidadId: number | null;
    accion: string;
    usuario: string;
  }): Promise<void> {
    try {
      await this.repo.save(this.repo.create(datos));
    } catch (e) {
      // La auditoría nunca debe romper la operación principal: solo avisamos.
      this.logger.warn(`No se pudo registrar en historial: ${String(e)}`);
    }
  }

  findAll(): Promise<Historial[]> {
    return this.repo.find({ order: { fecha: 'DESC' }, take: 200 });
  }
}
