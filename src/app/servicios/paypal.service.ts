import { inject, Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, query, where, orderBy } from '@angular/fire/firestore';
import { collectionData } from '@angular/fire/firestore';
import { firstValueFrom, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaypalService {
  private firestore = inject(Firestore);

  async agregarDato(coleccion: string, dato: any): Promise<void> {
    try {
      const colRef = collection(this.firestore, coleccion);
      await addDoc(colRef, {
        ...dato,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error agregando dato:', error);
      throw error;
    }
  }

  async obtenerDatos(coleccion: string): Promise<any[]> {
    try {
      const colRef = collection(this.firestore, coleccion);
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error obteniendo datos:', error);
      throw error;
    }
  }

  obtenerDatosEnTiempoReal(coleccion: string): Observable<any[]> {
    const colRef = collection(this.firestore, coleccion);
    return collectionData(colRef, { idField: 'id' });
  }

  async obtenerEstadisticasPorFecha(coleccion: string, fechaInicio: Date, fechaFin: Date): Promise<any[]> {
    try {
      const colRef = collection(this.firestore, coleccion);
      const q = query(
        colRef,
        where('fecha', '>=', fechaInicio.toISOString()),
        where('fecha', '<=', fechaFin.toISOString()),
        orderBy('fecha', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error obteniendo estadísticas por fecha:', error);
      throw error;
    }
  }

  async obtenerEstadisticasPorServicio(coleccion: string): Promise<any[]> {
    try {
      const colRef = collection(this.firestore, coleccion);
      const snapshot = await getDocs(colRef);
      const datos = snapshot.docs.map(doc => doc.data());

      const estadisticas: { [key: string]: any } = {};

      datos.forEach((dato: any) => {
        if (!estadisticas[dato.servicio]) {
          estadisticas[dato.servicio] = {
            servicio: dato.servicio,
            totalIngresos: 0,
            totalTransacciones: 0,
            clientes: new Set()
          };
        }

        estadisticas[dato.servicio].totalIngresos += dato.monto;
        estadisticas[dato.servicio].totalTransacciones += 1;
        estadisticas[dato.servicio].clientes.add(dato.nombre);
      });

      return Object.values(estadisticas).map((stat: any) => ({
        ...stat,
        clientesUnicos: stat.clientes.size,
        clientes: undefined
      }));
    } catch (error) {
      console.error('Error obteniendo estadísticas por servicio:', error);
      throw error;
    }
  }
}
