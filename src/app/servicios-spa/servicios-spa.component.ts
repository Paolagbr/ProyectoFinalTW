import { Component } from '@angular/core';
import { Informacion, ServiciosSPAService } from '../servicios/servicios-spa.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { DomseguroPipe } from '../domseguro.pipe';

declare var paypal: any; // Es para usar PayPal

@Component({
  selector: 'app-servicios-spa',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule, JsonPipe, CommonModule, FormsModule, DomseguroPipe],
  templateUrl: './servicios-spa.component.html',
  styleUrl: './servicios-spa.component.css'
})
export class ServiciosSPAComponent {
  title = 'SPA_services';
  inf: Informacion[] = [];
  cargando = true;
  error = null;
  expandido?: boolean;
  terminoBusqueda: string = '';
  serviciosFiltrados: Informacion[] = [];
  video: string = "DjCFi8NRWvs";

  constructor(private tuApiService: ServiciosSPAService) { }

  ngOnInit(): void {
    this.tuApiService.obtenerDatos().subscribe({
      next: (data) => {
        this.inf = data;
        this.serviciosFiltrados = data;
        this.cargando = false;
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

  toggleDetalles(dato: any): void {
    dato.expandido = !dato.expandido;

    if (dato.expandido && !dato.paypalRendered) {
      setTimeout(() => {
        paypal.Buttons({
          createOrder: (data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: dato.price.toString() // Asegúrate que `dato.price` sea número
                }
              }]
            });
          },
          onApprove: (data: any, actions: any) => {
            return actions.order.capture().then((details: any) => {
              alert('✅ Pago completado por: ' + details.payer.name.given_name);
              // Aquí podrías guardar en localStorage o enviar al servidor
            });
          },
          onError: (err: any) => {
            console.error('❌ Error al procesar el pago:', err);
          }
        }).render('#paypal-button-' + dato.id);

        dato.paypalRendered = true;
      }, 0);
    }
  }
}
