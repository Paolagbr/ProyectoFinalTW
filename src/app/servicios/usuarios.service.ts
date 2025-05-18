import { Injectable } from '@angular/core';
import { hora, lista, sexo, userInfo } from '../datos';
import { Genero, GRUPOS, HORA } from '../grupo';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  userINFO!:userInfo[];
  Lista: lista[] = GRUPOS;
  genero: sexo[]= Genero;
  horas: hora[]=HORA;

  constructor() { 
    this.userINFO=JSON.parse(localStorage.getItem("data")|| '[]');
  }
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
