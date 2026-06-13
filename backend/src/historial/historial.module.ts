import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditInterceptor } from './audit.interceptor';
import { Historial } from './historial.entity';
import { HistorialController } from './historial.controller';
import { HistorialService } from './historial.service';

@Module({
  imports: [TypeOrmModule.forFeature([Historial])],
  controllers: [HistorialController],
  providers: [
    HistorialService,
    // Registrado como APP_INTERCEPTOR => se aplica a TODA la app (global).
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class HistorialModule {}
