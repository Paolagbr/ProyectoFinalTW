import { Component, computed, OnInit, signal } from '@angular/core';
import { Informacion, ServiciosSPAService } from '../servicios/servicios-spa.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { DomseguroPipe } from '../domseguro.pipe';
import { MonedaPipe } from '../servicios/pipe';
import { PaypalService } from '../servicios/paypal.service';
import Swal from 'sweetalert2';


declare var paypal: any;

@Component({
  selector: 'app-servicios-spa',
  standalone: true,
  imports: [ HttpClientModule,
    JsonPipe, CommonModule, FormsModule, DomseguroPipe, MonedaPipe],
  templateUrl: './servicios-spa.component.html',
  styleUrl: './servicios-spa.component.css'
})
export class ServiciosSPAComponent implements OnInit {
  title = 'SPA_services';
  inf: Informacion[] = [];
  cargando = true;
  error: any = null;

  terminoBusqueda = signal<string>('');
  serviciosFiltrados = computed(() => {
    const termino = this.terminoBusqueda().toLowerCase();
    return this.inf.filter(servicio =>
      servicio.name.toLowerCase().includes(termino) ||
      servicio.description.toLowerCase().includes(termino)
    );
  });

  video: string = 'DjCFi8NRWvs';

  constructor(
    private tuApiService: ServiciosSPAService,
    private paypalService: PaypalService
  ) { }

  ngOnInit(): void {
    this.tuApiService.obtenerDatos().subscribe({
      next: (data) => {
        this.inf = data.map(d => {
          const precio = Number(d.price);
          return {
            ...d,
            price: isNaN(precio) ? 0 : precio,
            expandido: false,
            paypalRendered: false,
            pagoCompletado: false
          };
        });
        this.cargando = false;
      },
      error: (error) => {
        this.error = error;
        this.cargando = false;
        console.error('Error al obtener datos: ', error);
      }
    });
  }

  actualizarBusqueda(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.terminoBusqueda.set(input.value);
  }

  toggleDetalles(dato: Informacion): void {
    dato.expandido = !dato.expandido;

    if (dato.expandido && !dato.paypalRendered && !dato.pagoCompletado) {
      setTimeout(() => {
        const containerId = 'paypal-button-' + dato.id;
        const paypalContainer = document.getElementById(containerId);

        if (!paypalContainer) {
          console.error('Contenedor PayPal no encontrado:', containerId);
          return;
        }

        paypalContainer.innerHTML = '';

        if (typeof paypal === 'undefined') {
          Swal.fire({
            icon: 'error',
            title: '¡Error!',
            text: '❌ PayPal SDK no está cargado.',
            confirmButtonColor: '#d33'
          });

          return;
        }

        paypal.Buttons({
          createOrder: (_data: any, actions: any) => {
            if (dato.price <= 0 || isNaN(dato.price)) {
              alert('Precio inválido.');
              return Promise.reject('Precio inválido');
            }
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: dato.price.toFixed(2)
                }
              }]
            });
          },
          onApprove: (data: any, actions: any) => {
            return actions.order.capture().then(async (details: any) => {

              Swal.fire({
                icon: 'success',
                title: '¡Pago Exitoso!',
                text: `✅ Pago completado por: ${details.payer.name.given_name}`,
                confirmButtonColor: '#28a745'
              });

              try {
                await this.paypalService.agregarDato('pagos', {
                  nombre: details.payer.name.given_name,
                  servicio: dato.name,
                  monto: dato.price,
                  fecha: new Date().toISOString(),
                  paypalOrderId: data.orderID
                });
                Swal.fire({
                icon: 'success',
                title: '¡Pago Registrado correctamente!',
                confirmButtonColor: '#28a745'
              });
                
              } catch (error) {
                console.error('Error guardando pago:', error);
              }
              dato.pagoCompletado = true;
            });
          },
          onError: (err: any) => {
            Swal.fire({
            icon: 'error',
            title: '¡Error!',
            text: '❌ Error de procesamiento',
            confirmButtonColor: '#d33'
          });
          }
        }).render('#' + containerId);

        dato.paypalRendered = true;
      }, 0);
    }
  }

  trackById(index: number, item: Informacion): number {
    return item.id;
  }
}






