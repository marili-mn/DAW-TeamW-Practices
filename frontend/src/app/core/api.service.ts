import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from './api.config';
import {
  Cliente,
  EstadoProyecto,
  EstadoTarea,
  Historial,
  Proyecto,
  Tarea,
  Usuario,
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  // Clientes
  getClientes(estado?: 'ACTIVO' | 'BAJA') {
    return this.http.get<Cliente[]>(`${API_URL}/clientes`, {
      params: estado ? { estado } : {},
    });
  }

  createCliente(datos: {
    nombre: string;
    telefono?: string | null;
    email?: string | null;
  }) {
    return this.http.post<Cliente>(`${API_URL}/clientes`, datos);
  }

  updateCliente(
    id: number,
    cambios: Partial<Pick<Cliente, 'nombre' | 'estado' | 'telefono' | 'email'>>,
  ) {
    return this.http.patch<Cliente>(`${API_URL}/clientes/${id}`, cambios);
  }

  // Proyectos
  getProyectos() {
    return this.http.get<Proyecto[]>(`${API_URL}/proyectos`);
  }

  getProyecto(id: number) {
    return this.http.get<Proyecto>(`${API_URL}/proyectos/${id}`);
  }

  createProyecto(datos: {
    nombre: string;
    id_cliente?: number;
    fecha_fin?: string;
  }) {
    return this.http.post<Proyecto>(`${API_URL}/proyectos`, datos);
  }

  updateProyecto(
    id: number,
    cambios: {
      nombre?: string;
      estado?: EstadoProyecto;
      id_cliente?: number | null;
      fecha_fin?: string | null;
    },
  ) {
    return this.http.patch<Proyecto>(`${API_URL}/proyectos/${id}`, cambios);
  }

  // Tareas
  createTarea(datos: { descripcion: string; id_proyecto: number }) {
    return this.http.post<Tarea>(`${API_URL}/tareas`, datos);
  }

  updateTarea(
    id: number,
    cambios: { descripcion?: string; estado?: EstadoTarea },
  ) {
    return this.http.patch<Tarea>(`${API_URL}/tareas/${id}`, cambios);
  }

  deleteTarea(id: number) {
    return this.http.delete<Tarea>(`${API_URL}/tareas/${id}`);
  }

  // Historial de cambios
  getHistorial() {
    return this.http.get<Historial[]>(`${API_URL}/historial`);
  }

  // Usuarios
  getUsuarios() {
    return this.http.get<Usuario[]>(`${API_URL}/usuarios`);
  }

  createUsuario(nombre: string, clave: string) {
    return this.http.post<Usuario>(`${API_URL}/usuarios`, { nombre, clave });
  }

  updateUsuario(
    id: number,
    cambios: Partial<Pick<Usuario, 'nombre' | 'estado'>> & { clave?: string },
  ) {
    return this.http.patch<Usuario>(`${API_URL}/usuarios/${id}`, cambios);
  }
}
