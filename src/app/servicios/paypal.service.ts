import { Injectable } from "@angular/core"
import { AngularFirestore } from "@angular/fire/compat/firestore"
import { Observable, firstValueFrom } from "rxjs"

@Injectable({
  providedIn: "root",
})
export class PaypalService {
  constructor(private firestore: AngularFirestore) {}

  // Método existente para agregar datos
  async agregarDato(coleccion: string, dato: any): Promise<void> {
    try {
      await this.firestore.collection(coleccion).add({
        ...dato,
        timestamp: new Date(),
      })
    } catch (error) {
      console.error("Error agregando dato:", error)
      throw error
    }
  }

  // Método para obtener datos (para el dashboard)
  async obtenerDatos(coleccion: string): Promise<any[]> {
    try {
      const snapshot = await firstValueFrom(this.firestore.collection(coleccion).get())
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as object),
      }))
    } catch (error) {
      console.error("Error obteniendo datos:", error)
      throw error
    }
  }

  // Método para obtener datos en tiempo real
  obtenerDatosEnTiempoReal(coleccion: string): Observable<any[]> {
    return this.firestore.collection(coleccion).valueChanges({ idField: "id" })
  }

  // Método para obtener estadísticas específicas por fecha
  async obtenerEstadisticasPorFecha(coleccion: string, fechaInicio: Date, fechaFin: Date): Promise<any[]> {
    try {
      const snapshot = await firstValueFrom(
        this.firestore
          .collection(coleccion, (ref) =>
            ref
              .where("fecha", ">=", fechaInicio.toISOString())
              .where("fecha", "<=", fechaFin.toISOString())
              .orderBy("fecha", "desc")
          )
          .get()
      )

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as object),
      }))
    } catch (error) {
      console.error("Error obteniendo estadísticas por fecha:", error)
      throw error
    }
  }

  // Método para obtener estadísticas por servicio
  async obtenerEstadisticasPorServicio(coleccion: string): Promise<any[]> {
    try {
      const snapshot = await firstValueFrom(this.firestore.collection(coleccion).get())
      const datos = snapshot.docs.map((doc) => doc.data())

      const estadisticas: { [key: string]: any } = {}

      datos.forEach((dato: any) => {
        if (!estadisticas[dato.servicio]) {
          estadisticas[dato.servicio] = {
            servicio: dato.servicio,
            totalIngresos: 0,
            totalTransacciones: 0,
            clientes: new Set(),
          }
        }

        estadisticas[dato.servicio].totalIngresos += dato.monto
        estadisticas[dato.servicio].totalTransacciones += 1
        estadisticas[dato.servicio].clientes.add(dato.nombre)
      })

      return Object.values(estadisticas).map((stat: any) => ({
        ...stat,
        clientesUnicos: stat.clientes.size,
        clientes: undefined,
      }))
    } catch (error) {
      console.error("Error obteniendo estadísticas por servicio:", error)
      throw error
    }
  }
}
