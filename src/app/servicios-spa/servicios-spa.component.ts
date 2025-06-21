import { Component, OnInit } from '@angular/core'; // Añadido OnInit
import { Informacion, ServiciosSPAService } from '../servicios/servicios-spa.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { DomseguroPipe } from '../domseguro.pipe';
import { PaypalService } from '../servicios/paypal.service';

declare var paypal: any; // Asegúrate que el SDK de PayPal se carga en index.html

@Component({
  selector: 'app-servicios-spa',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule, JsonPipe, CommonModule, FormsModule, DomseguroPipe],
  templateUrl: './servicios-spa.component.html',
  styleUrls: ['./servicios-spa.component.css']
})
export class ServiciosSPAComponent implements OnInit { // Implementa OnInit
  title = 'SPA_services';
  inf: Informacion[] = [];
  serviciosFiltrados: Informacion[] = [];
  cargando = true;
  error: any = null;
  terminoBusqueda: string = '';
  video: string = "DjCFi8NRWvs";

  constructor(
    private tuApiService: ServiciosSPAService,
    private paypalService: PaypalService
  ) { }

  ngOnInit(): void {
    console.log('--- Iniciando carga de servicios ---');
    this.tuApiService.obtenerDatos().subscribe({
      next: (data) => {
        console.log('Datos brutos recibidos de la API:', data); // Ver datos crudos

        this.inf = data.map(d => {
          const originalPrice = d.price;
          let convertedPrice = Number(originalPrice);

          // Manejo de posibles valores no numéricos
          if (isNaN(convertedPrice) || convertedPrice === null || convertedPrice === undefined) {
            console.warn(`Advertencia: El precio original '${originalPrice}' para el servicio '${d.name}' no es un número válido. Se establecerá en 0.`);
            convertedPrice = 0; // O un valor por defecto si lo prefieres
          }

          console.log(`Servicio: ${d.name}, Precio original: ${originalPrice}, Precio convertido: ${convertedPrice}`);

          return {
            ...d,
            price: convertedPrice,
            expandido: false,
            paypalRendered: false,
            pagoCompletado: false
          };
        });

        this.serviciosFiltrados = [...this.inf];
        this.cargando = false;
        console.log('Servicios cargados y procesados:', this.inf); // Ver datos después de procesamiento
        console.log('--- Carga de servicios finalizada ---');
      },
      error: (error) => {
        this.error = error;
        this.cargando = false;
        console.error('Error al obtener datos: ', error);
      }
    });
  }

  filtrarServicios(): void {
    const termino = this.terminoBusqueda.toLowerCase();
    this.serviciosFiltrados = this.inf.filter(servicio =>
      servicio.name.toLowerCase().includes(termino) ||
      servicio.description.toLowerCase().includes(termino)
    );
  }

  toggleDetalles(dato: Informacion): void {
    dato.expandido = !dato.expandido;

    if (dato.expandido && !dato.paypalRendered && !dato.pagoCompletado) {
      setTimeout(() => {
        const paypalContainer = document.getElementById('paypal-button-' + dato.id);
        if (!paypalContainer) {
          console.error(`Contenedor de PayPal no encontrado para el ID: paypal-button-${dato.id}`);
          return;
        }

        // Limpiar el contenedor antes de renderizar si ya hay contenido
        paypalContainer.innerHTML = '';

        // Asegúrate de que PayPal esté disponible
        if (typeof paypal === 'undefined') {
          console.error('El SDK de PayPal no se ha cargado. Verifica tu index.html.');
          alert('El sistema de pago no está disponible. Intenta de nuevo más tarde.');
          return;
        }

        paypal.Buttons({
          createOrder: (data: any, actions: any) => {
            console.log('Intentando crear orden para el servicio:', dato.name);
            console.log('Precio del servicio en createOrder:', dato.price, typeof dato.price);

            if (dato.price <= 0) {
              alert('Precio inválido para realizar el pago');
              console.error('Error: Precio inválido para PayPal:', dato.price);
              return Promise.reject('Precio inválido');
            }

            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: dato.price.toFixed(2) // Asegura 2 decimales
                }
              }]
            });
          },
          onApprove: (data: any, actions: any) => {
            return actions.order.capture().then(async (details: any) => {
              alert('✅ Pago completado por: ' + details.payer.name.given_name);

              try {
                await this.paypalService.agregarDato('pagos', {
                  nombre: details.payer.name.given_name,
                  servicio: dato.name,
                  monto: dato.price,
                  fecha: new Date().toISOString(),
                  paypalOrderId: data.orderID
                });
                alert('Pago registrado en Firebase correctamente.');
              } catch (error) {
                console.error('Error guardando pago en Firebase:', error);
                alert('Error guardando pago en base de datos.');
              }

              dato.pagoCompletado = true;
              console.log('Pago completado y registrado para:', dato.name);
            });
          },
          onError: (err: any) => {
            console.error('❌ Error al procesar el pago:', err);
            alert('Error al procesar el pago, intenta de nuevo. Revisa la consola para más detalles.');
          },
          onCancel: (data: any) => {
            console.log('Transacción de PayPal cancelada:', data);
            alert('Pago cancelado.');
          }
        }).render('#paypal-button-' + dato.id);

        dato.paypalRendered = true;
      }, 0); 
    }
  }

  trackById(index: number, item: Informacion): number {
    return item.id;
  }
}