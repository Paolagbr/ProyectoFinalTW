import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

 export interface Informacion{
  id:number,
  name: string,
  description:string,
  image:string,
  price:string,
  beneficio: string;
  duracion: string;
  expandido?: boolean;
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
