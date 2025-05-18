import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ComentarioService {
  private comentarioEditar: any = null;

  setComentarioEditar(comentario: any) {
    this.comentarioEditar = comentario;
  }

  getComentarioEditar() {
    return this.comentarioEditar;
  }

  limpiarComentarioEditar() {
    this.comentarioEditar = null;
  }
}
