import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UsuariosService } from '../servicios/usuarios.service';
import { hora, lista, sexo, userInfo } from '../datos';
import { HORA } from '../grupo';
import Swal from 'sweetalert2';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { CorreoService } from '../servicios/correo.service';
import { Auth } from '@angular/fire/auth';


@Component({
  selector: 'app-registrar-cita-usuario',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCardModule,
    MatOptionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule

  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './registrar-cita-usuario.component.html',
  styleUrl: './registrar-cita-usuario.component.css'
})
export class RegistrarCitaUsuarioComponent implements OnInit {
  userINFO!: userInfo;
  grupos!: lista[];
  genero!: sexo[];
  horas!: hora[];

  horasOcupadas: string[] = [];

  constructor(private usuariosService: UsuariosService, private correoService: CorreoService,  private auth: Auth, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.userINFO = this.usuariosService.nuevoUsuario();
    this.grupos = this.usuariosService.getlista();
    this.genero = this.usuariosService.getGenero();
    this.horas = this.usuariosService.getHora();
  }

  guardarFecha(event: MatDatepickerInputEvent<Date>): void {
    if (event.value) {
      const fechaFormateada = event.value.toISOString().split('T')[0];
      this.userINFO.fechaCita = fechaFormateada;
      this.cargarHorasOcupadas(fechaFormateada);
    }
  }

  guardarHora(event: any): void {
    this.userINFO.hora = event.value;
  }

  guardarServicio(event: any): void {
    this.userINFO.grupo = event.value;
  }

  actualizarNombre(): void {
    // opcional, si necesitas manipular el nombre
  }

  nuevoUsuario(): void {
    const emailUsuario = this.auth.currentUser?.email || '';//Gmail que se del usuario que se usa para 

    const nuevaCita: userInfo = {
      name: this.userINFO.name,
      grupo: this.userINFO.grupo,
      sexo: this.userINFO.sexo,
      fechaCita: this.userINFO.fechaCita,
      hora: this.userINFO.hora
    };

    this.usuariosService.addPlace(nuevaCita).then(() => {//Guardar informacion en la base de datos
      this.horasOcupadas = [];
       const servicioNombre = this.grupos.find(g => g.id === this.userINFO.grupo)?.nomServicio || 'Desconocido';//Obtener el servicio para enviar por correo

      Swal.fire({
        title: '¡Reservación Exitosa!',
        text: 'Tu reserva ha sido realizada con éxito.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });
      this.correoService.enviarCorreo({//Se envia el correo
       name: this.userINFO.name,
        fechaCita: this.userINFO.fechaCita,
        hora: this.userINFO.hora,
        grupo: servicioNombre,
        email: emailUsuario
      }).subscribe({
        next: () => console.log('Correo enviado correctamente'),
        error: (error) => console.error('Error al enviar correo:', error)
      });

      // Limpiar formulario
      this.userINFO = this.usuariosService.nuevoUsuario();
       this.cd.markForCheck();


    }).catch(error => {
      console.error('Error al registrar cita:', error);
      Swal.fire('Error', 'No se pudo registrar la cita. Intenta más tarde.', 'error');
    });
  }


  myFilter = (d: Date | null): boolean => {
    const date = d || new Date();
    const day = date.getDay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return day !== 0 && date >= today;
  };

  cargarHorasOcupadas(fecha: string): void {

    this.horasOcupadas = [];
  }
}