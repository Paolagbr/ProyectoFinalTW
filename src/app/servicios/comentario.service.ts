import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore, updateDoc } from '@angular/fire/firestore';
import { userInfo } from '../datos';
import { Observable } from 'rxjs';


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
  //Mostrar datos de la BD
  getPlaces(): Observable<userInfo[]> {
    const placeRef = collection(this.firestore, 'comentarios');
    return collectionData(placeRef, { idField: 'id' }) as Observable<userInfo[]>;
  }
  //Borrar datos de la BD

  deletePlace(place: userInfo) {
    const placeDocRef = doc(this.firestore, `comentarios/${place.id}`);
    return deleteDoc(placeDocRef);
  }
  //Editar BD
  updatePlace(id: string, data: Partial<userInfo>) {
    const placeDocRef = doc(this.firestore, `comentarios/${id}`);
    return updateDoc(placeDocRef, data);
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
