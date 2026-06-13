import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ApiService } from '../../core/api.service';
import { Historial } from '../../core/models';

@Component({
  selector: 'app-historial',
  imports: [DatePipe, TableModule, TagModule],
  templateUrl: './historial.page.html',
})
export class HistorialPage {
  private readonly api = inject(ApiService);

  readonly registros = signal<Historial[]>([]);
  readonly cargando = signal(true);

  ngOnInit(): void {
    this.api.getHistorial().subscribe({
      next: (r) => {
        this.registros.set(r);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  severidad(accion: string): 'success' | 'info' | 'danger' {
    return accion === 'ALTA'
      ? 'success'
      : accion === 'MODIFICACION'
        ? 'info'
        : 'danger';
  }
}
