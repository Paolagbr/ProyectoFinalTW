import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

// Interfaz actualizada con propiedades extra
export interface Informacion {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number ;
  beneficio: string;
  duracion: string;
  expandido?: boolean;
  paypalRendered?: boolean;
  pagoCompletado?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ServiciosSPAService {

 private apiUrl='https://spapag.free.beeceptor.com ';

  constructor(private http: HttpClient) { }
  obtenerDatos(): Observable<Informacion[]> {
    return this.http.get<{ pagina: Informacion[] }>(this.apiUrl)
      .pipe(
        map(response => response.pagina) 
      );
  }
}
