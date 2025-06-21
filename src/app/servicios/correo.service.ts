import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CorreoService {

private apiUrl = 'http://localhost:3000/api/enviar-cita';


  constructor(private http: HttpClient) {}

  enviarCorreo(datos: any) {//Envio de correo con los datos
    return this.http.post(this.apiUrl, datos);
  }
  
}
