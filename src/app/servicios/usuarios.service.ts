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

  constructor(private firestore:Firestore) { 
    this.userINFO=JSON.parse(localStorage.getItem("data")|| '[]');
  }
  //Configuracion de BD
  addPlace(place: userInfo){
    const placeRef=collection(this.firestore, 'citas')
    return addDoc(placeRef, place);
  }
   //Mostrar datos de la BD
  getPlaces(): Observable<userInfo[]> {
    const placeRef = collection(this.firestore, 'citas');
    return collectionData(placeRef, { idField: 'id' }) as Observable<userInfo[]>;
  }
  //Borrar datos de la BD
  deletePlace(place: userInfo) {
    const placeDocRef = doc(this.firestore, `citas/${place.id}`);
    return deleteDoc(placeDocRef);
  }
  //Editar BD
  updatePlace(id: string, data: Partial<userInfo>) {
    const placeDocRef = doc(this.firestore, `citas/${id}`);
    return updateDoc(placeDocRef, data);
  }
  //localStorage
  getHora(){
    return this.horas;
  }
  getlista(){
    return this.Lista;
    
  }
  getuserINFO(){
    return this.userINFO;
  }
  getGenero(){
    return this.genero;
  }
  agregarUsuario(userINFO:userInfo){
    this.userINFO.push(userINFO);
    localStorage.setItem('data', JSON.stringify(this.userINFO));
  }
  nuevoUsuario():userInfo{
    return {
     name:'',
     grupo:0,
     sexo:'',
     fechaCita:'',
     hora:''
    };
  }
  /*Editar la parte del localStorage*/
  eliminarUsuario(usuario: userInfo) {
    this.userINFO = this.userINFO.filter(u => u !== usuario);
    localStorage.setItem('data', JSON.stringify(this.userINFO));
  }

  actualizarUsuarios(usuarios: userInfo[]) {
    this.userINFO = usuarios;
    localStorage.setItem('data', JSON.stringify(this.userINFO));
  }
  private localStorageKey = "data";
   private saveUsuariosToLocalStorage(): void {
      localStorage.setItem(this.localStorageKey, JSON.stringify(this.userINFO));
  }
  updateUsuario(originalName: string, updatedUserData: userInfo): boolean {
     
      const index = this.userINFO.findIndex(u => u && u.name === originalName);

      if (index !== -1) {
         
          this.userINFO[index] = { ...updatedUserData }; 
          this.saveUsuariosToLocalStorage();

          console.log('Servicio: Usuario actualizado exitosamente:', updatedUserData.name);
          return true; 
      } else {
          console.error('Servicio: No se encontró el usuario para actualizar (nombre:', originalName, ')');
          return false; 
      }
  }

}
