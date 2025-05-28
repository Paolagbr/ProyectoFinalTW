import { Injectable } from '@angular/core';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';
import { userInfo } from '../datos';

@Injectable({
  providedIn: 'root'
})
export class ComentarioService {
  private comentarioEditar: any = null;
  constructor(private firestore: Firestore) {

  }
  //Configuracion de BD
  addPlace(place: userInfo) {
    const placeRef = collection(this.firestore, 'comentarios')
    return addDoc(placeRef, place);
  }
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
