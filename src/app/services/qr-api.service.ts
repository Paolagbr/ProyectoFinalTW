import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import type { Observable } from "rxjs"

export interface CitaQRData {
  codigoConfirmacion: string
  citaId: string
  cliente: string
  email: string
  servicio: string
  fecha: string
  hora: string
  estado: string
  generadoEn: string
  validoHasta: string
}

export interface QRResponse {
  success: boolean
  data: CitaQRData
}

export interface VerificarQRResponse {
  valid: boolean
  message: string
  cita?: {
    cliente: string
    servicio: string
    fecha: string
    hora: string
  }
}

@Injectable({
  providedIn: "root",
})
export class QrApiService {
  private apiUrl = 'https://nodeproyectofinaltw-1.onrender.com/api';

  constructor(private http: HttpClient) {}

  obtenerDatosCitaParaQR(email: string): Observable<QRResponse> {
    return this.http.get<QRResponse>(`${this.apiUrl}/cita-qr/${email}`)
  }

  verificarQR(codigoConfirmacion: string): Observable<VerificarQRResponse> {
    return this.http.post<VerificarQRResponse>(`${this.apiUrl}/verificar-qr`, {
      codigoConfirmacion,
    })
  }
}
