import { Component, computed, signal } from '@angular/core';
import { Informacion, ServiciosSPAService } from '../servicios/servicios-spa.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { DomseguroPipe} from '../domseguro.pipe';
import { MonedaPipe } from '../servicios/pipe';


declare var paypal: any; 

@Component({
  selector: 'app-servicios-spa',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule, JsonPipe, CommonModule, FormsModule, DomseguroPipe,  MonedaPipe ],
  templateUrl: './servicios-spa.component.html',
  styleUrl: './servicios-spa.component.css'
})
export class ServiciosSPAComponent {
  title = 'SPA_services';
  cargando = true;
  error = null;
  expandido?: boolean;
  video: string = "DjCFi8NRWvs";


  inf = signal<Informacion[]>([]);//Datos de la API 
  terminoBusqueda = signal<string>('');//Declaramos lo que se ingresa a la barra de navegacion


  serviciosFiltrados = computed(() => {//Computed permite que se actualice la informacion 
    const termino = this.terminoBusqueda().toLowerCase();
    return this.inf().filter(servicio =>
      servicio.name.toLowerCase().includes(termino) ||
      servicio.description.toLowerCase().includes(termino)
    );
  });

  constructor(private tuApiService: ServiciosSPAService) { }

  ngOnInit(): void {
    this.tuApiService.obtenerDatos().subscribe({
      next: (data) => {
        this.inf.set(data);
        this.cargando = false;
      },
      error: (error) => {
        this.error = error;
        this.cargando = false;
        //console.error('Error al obtener datos: ', error);
      }
    });
  }

  actualizarBusqueda(valor: string): void {
    this.terminoBusqueda.set(valor);
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
                  value: dato.price.toString()
                }
              }]
            });
          },
          onApprove: (data: any, actions: any) => {
            return actions.order.capture().then((details: any) => {
              alert('✅ Pago completado por: ' + details.payer.name.given_name);
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

