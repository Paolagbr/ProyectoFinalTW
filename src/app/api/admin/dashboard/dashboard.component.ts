import {
  Component,
  type OnInit,
  type OnDestroy,
  signal,
  computed
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { Subscription, interval } from "rxjs";
import { PaypalService } from "../../../servicios/paypal.service";
import { MonedaPipe } from "../../../servicios/pipe";
import Swal from "sweetalert2";

// Interfaces para los datos
interface PagoData {
  id?: string;
  nombre: string;
  servicio: string;
  monto: number;
  fecha: string;
  paypalOrderId: string;
}

interface EstadisticasMensuales {
  mes: string;
  ingresos: number;
  transacciones: number;
}

interface EstadisticasServicios {
  servicio: string;
  ingresos: number;
  transacciones: number;
  color: string;
}

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule, HttpClientModule, MonedaPipe],
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"]
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  // Signals para el estado
  pagos = signal<PagoData[]>([]);
  cargando = signal<boolean>(false);
  ultimaActualizacion = signal<Date>(new Date());
  tabActiva = signal<string>("mensual");

  // Computed para las estadísticas
  estadisticasMensuales = computed(() => {
    const pagosList = this.pagos();
    const estadisticas: { [key: string]: EstadisticasMensuales } = {};
    const meses = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ];

    pagosList.forEach((pago) => {
      const fecha = new Date(pago.fecha);
      const mesKey = `${fecha.getFullYear()}-${fecha.getMonth()}`;
      const mesNombre = meses[fecha.getMonth()];

      if (!estadisticas[mesKey]) {
        estadisticas[mesKey] = {
          mes: mesNombre,
          ingresos: 0,
          transacciones: 0
        };
      }

      estadisticas[mesKey].ingresos += pago.monto;
      estadisticas[mesKey].transacciones += 1;
    });

    return Object.values(estadisticas)
      .sort((a, b) => {
        const mesA = meses.indexOf(a.mes);
        const mesB = meses.indexOf(b.mes);
        return mesA - mesB;
      })
      .slice(-6); // Últimos 6 meses
  });

  estadisticasServicios = computed(() => {
    const pagosList = this.pagos();
    const servicios: { [key: string]: EstadisticasServicios } = {};
    const colores = [
      "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0",
      "#9966FF", "#FF9F40", "#FF6384", "#C9CBCF"
    ];

    pagosList.forEach((pago) => {
      if (!servicios[pago.servicio]) {
        servicios[pago.servicio] = {
          servicio: pago.servicio,
          ingresos: 0,
          transacciones: 0,
          color: colores[Object.keys(servicios).length % colores.length]
        };
      }

      servicios[pago.servicio].ingresos += pago.monto;
      servicios[pago.servicio].transacciones += 1;
    });

    return Object.values(servicios).sort((a, b) => b.ingresos - a.ingresos);
  });

  metricas = computed(() => {
    const pagosList = this.pagos();
    const totalIngresos = pagosList.reduce((sum, pago) => sum + pago.monto, 0);
    const totalTransacciones = pagosList.length;
    const usuariosUnicos = new Set(pagosList.map((pago) => pago.nombre)).size;
    const promedioTransaccion =
      totalTransacciones > 0 ? totalIngresos / totalTransacciones : 0;

    return {
      totalIngresos,
      totalTransacciones,
      usuariosActivos: usuariosUnicos,
      promedioTransaccion
    };
  });

  // Datos para las gráficas
  datosGraficaMensual = computed(() => {
    const datos = this.estadisticasMensuales();
    return {
      labels: datos.map((d) => d.mes),
      ingresos: datos.map((d) => d.ingresos),
      transacciones: datos.map((d) => d.transacciones)
    };
  });

  datosGraficaServicios = computed(() => {
    const datos = this.estadisticasServicios();
    return {
      labels: datos.map((d) => d.servicio),
      valores: datos.map((d) => d.ingresos),
      colores: datos.map((d) => d.color)
    };
  });

  private subscription = new Subscription();

  constructor(private paypalService: PaypalService) {}

  ngOnInit(): void {
    this.cargarDatos();
    this.configurarActualizacionAutomatica();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async cargarDatos(): Promise<void> {
    this.cargando.set(true);

    try {
      const pagosData = await this.paypalService.obtenerDatos("pagos");
      this.pagos.set(pagosData);
      this.ultimaActualizacion.set(new Date());
    } catch (error) {
      console.error("Error cargando datos:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los datos del dashboard",
        confirmButtonColor: "#d33"
      });
    } finally {
      this.cargando.set(false);
    }
  }

  private configurarActualizacionAutomatica(): void {
    this.subscription.add(
      interval(30000).subscribe(() => {
        this.cargarDatos();
      })
    );
  }

  cambiarTab(tab: string): void {
    this.tabActiva.set(tab);
  }

  async actualizarDatos(): Promise<void> {
    await this.cargarDatos();

    Swal.fire({
      icon: "success",
      title: "Datos actualizados",
      text: "El dashboard se ha actualizado correctamente",
      timer: 2000,
      showConfirmButton: false
    });
  }

  async generarDatosPrueba(): Promise<void> {
    const servicios = ["Electricidad", "Agua", "Gas", "Internet", "Teléfono", "Cable TV"];
    const nombres = ["Juan Pérez", "María García", "Carlos López", "Ana Martínez", "Luis Rodríguez"];

    const datosPrueba: Omit<PagoData, "id">[] = [];

    for (let i = 0; i < 50; i++) {
      const fechaAleatoria = new Date();
      fechaAleatoria.setDate(fechaAleatoria.getDate() - Math.floor(Math.random() * 180));

      datosPrueba.push({
        nombre: nombres[Math.floor(Math.random() * nombres.length)],
        servicio: servicios[Math.floor(Math.random() * servicios.length)],
        monto: Math.floor(Math.random() * 1000) + 100,
        fecha: fechaAleatoria.toISOString(),
        paypalOrderId: `TEST_${Date.now()}_${i}`
      });
    }

    try {
      for (const dato of datosPrueba) {
        await this.paypalService.agregarDato("pagos", dato);
      }

      Swal.fire({
        icon: "success",
        title: "Datos de prueba generados",
        text: `Se generaron ${datosPrueba.length} pagos de prueba`,
        confirmButtonColor: "#28a745"
      });

      await this.cargarDatos();
    } catch (error) {
      console.error("Error generando datos de prueba:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron generar los datos de prueba",
        confirmButtonColor: "#d33"
      });
    }
  }

  obtenerAlturaBarra(valor: number, maximo: number): number {
    return (valor / maximo) * 200;
  }

  obtenerAnguloSector(valor: number, total: number): number {
    return (valor / total) * 360;
  }

  obtenerCoordenadasSector(angulo: number, radio = 80): { x: number; y: number } {
    const radianes = (angulo * Math.PI) / 180;
    return {
      x: 100 + radio * Math.cos(radianes - Math.PI / 2),
      y: 100 + radio * Math.sin(radianes - Math.PI / 2)
    };
  }

  crearPathSector(valor: number, total: number, anguloInicio: number): string {
    const angulo = (valor / total) * 360;
    const anguloFin = anguloInicio + angulo;

    const inicio = this.obtenerCoordenadasSector(anguloInicio);
    const fin = this.obtenerCoordenadasSector(anguloFin);

    const banderaArcoGrande = angulo > 180 ? 1 : 0;

    return `M 100 100 L ${inicio.x} ${inicio.y} A 80 80 0 ${banderaArcoGrande} 1 ${fin.x} ${fin.y} Z`;
  }

  // ✅ Agregado: función usada en el template
  obtenerAnguloInicio(index: number): number {
    return index * 20; // Puedes personalizar este valor según tu lógica de sectores
  }

  // ✅ Agregado: función usada para *ngFor trackBy
  trackById(index: number, item: any): string | number {
    return item?.id || index;
  }
}
