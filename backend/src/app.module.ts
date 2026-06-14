import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ClientesModule } from './clientes/clientes.module';
import { EstadisticasModule } from './estadisticas/estadisticas.module';
import { HistorialModule } from './historial/historial.module';
import { ProyectosModule } from './proyectos/proyectos.module';
import { TareasModule } from './tareas/tareas.module';
import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService): Promise<TypeOrmModuleOptions> => {
        const databaseUrl = config.get<string>('DATABASE_URL');
        if (databaseUrl) {
          const url = new URL(databaseUrl);
          return {
            type: 'postgres',
            host: url.hostname,
            port: Number(url.port),
            username: url.username,
            password: url.password,
            database: url.pathname.slice(1),
            ssl: { rejectUnauthorized: false },
            autoLoadEntities: true,
            synchronize: false,
          };
        }
        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST') ?? 'localhost',
          port: config.get<number>('DB_PORT') ?? 5432,
          username: config.get<string>('DB_USER'),
          password: config.get<string>('DB_PASS'),
          database: config.get<string>('DB_NAME'),
          autoLoadEntities: true,
          synchronize: false,
        };
      },
    }),
    AuthModule,
    ClientesModule,
    ProyectosModule,
    TareasModule,
    HistorialModule,
    UsuariosModule,
    EstadisticasModule,
  ],
})
export class AppModule {}
