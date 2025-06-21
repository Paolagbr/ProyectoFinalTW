import { Injectable } from '@angular/core';
import { hora, lista, sexo, userInfo } from '../datos';
import { Genero, GRUPOS, HORA } from '../grupo';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  userINFO!:userInfo[];
  Lista: lista[] = GRUPOS;
  genero: sexo[]= Genero;
  horas: hora[]=HORA;

  constructor(private firestore:Firestore) { }

  addPlace(place: userInfo) {
    const placeRef = collection(this.firestore, 'citas');
    return addDoc(placeRef, place);
  }

  // 🔍 Obtener todas las citas
  getPlaces(): Observable<userInfo[]> {
    const placeRef = collection(this.firestore, 'citas');
    return collectionData(placeRef, { idField: 'id' }) as Observable<userInfo[]>;
  }

  deletePlace(place: userInfo) {
    const placeDocRef = doc(this.firestore, `citas/${place.id}`);
    return deleteDoc(placeDocRef);
  }

 
  updatePlace(id: string, data: Partial<userInfo>) {
    const placeDocRef = doc(this.firestore, `citas/${id}`);
    return updateDoc(placeDocRef, data);
  }

  
  getHora() {
    return this.horas;
  }

  getlista() {
    return this.Lista;
  }

  getGenero() {
    return this.genero;
  }

  
  nuevoUsuario(): userInfo {
    return {
      name: '',
      grupo: 0,
      sexo: '',
      fechaCita: '',
      hora: ''
    };
  }
}


