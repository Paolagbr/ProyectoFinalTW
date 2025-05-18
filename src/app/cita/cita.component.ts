import { CommonModule, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { hora, lista, sexo, userInfo } from '../datos';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepicker, MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatOptionModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import Swal from 'sweetalert2';
import { MatTimepickerInput, MatTimepickerModule } from '@angular/material/timepicker';
import { MatSelectModule } from '@angular/material/select';
import { HORA } from '../grupo';
import { MatCardModule } from '@angular/material/card';
import { UsuariosService } from '../servicios/usuarios.service';


@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [FormsModule, JsonPipe,
    MatFormFieldModule, MatInputModule,
    MatDatepickerModule, MatRadioModule, MatTimepickerModule,
     MatSelectModule, MatInputModule, MatOptionModule, CommonModule, MatCardModule],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cita.component.html',
  styleUrl: './cita.component.css'
})
export class CitaComponent {
  /*Cargamos con la informacion de  la interfaz*/
  userINFO!: userInfo;
  grupos!: lista[];
  genero!: sexo[];
  horas!:hora[];
 
  horasOcupadas: string[] = [];

  constructor(private usuariosService: UsuariosService) { }

  ngOnInit() {
     this.userINFO = this.usuariosService.nuevoUsuario();
    //this.cargarDatosGuardados();
    this.grupos = this.usuariosService.getlista();
    this.horas = HORA; 
  }

  cargarDatosGuardados(): void {
    const datosGuardados = localStorage.getItem('formularioUsuario');
    if (datosGuardados) {
      this.userINFO = JSON.parse(datosGuardados);
    } else {
      this.userINFO = this.usuariosService.nuevoUsuario();
    }
  }

  guardarFormulario(): void {
    localStorage.setItem('formularioUsuario', JSON.stringify(this.userINFO));
  }

  actualizarSexo(event: any): void {
    this.guardarFormulario();
  }

  //Fecha seleccionada por el usuario
  guardarFecha(event: MatDatepickerInputEvent<Date>): void {
    if (event.value) {
      const fecha = event.value;
      const fechaFormateada = fecha.toISOString().split('T')[0]; // Solo el YYYY-MM-DD
      this.userINFO.fechaCita = fechaFormateada;
      this.cargarHorasOcupadas(fechaFormateada); 
    } else {
      this.userINFO.fechaCita = '';
    }
    this.guardarFormulario();
  }
  //Hora seleccionada
  guardarHora(event: any): void {
    this.userINFO.hora = event.target.value;
    this.guardarFormulario();
  }
  //Tipo de Servicio que se almacena
  guardarServicio(event: any): void {
    this.userINFO.grupo = event.value;
    this.guardarFormulario();
  }

  //Nombre del usuario
  actualizarNombre(): void {
    this.guardarFormulario();
  }

  nuevoUsuario(): void {
    this.usuariosService.agregarUsuario(this.userINFO);
    const citas = JSON.parse(localStorage.getItem('citas') || '[]');
  citas.push({
    fecha: this.userINFO.fechaCita,
    hora: this.userINFO.hora
  });
  localStorage.setItem('citas', JSON.stringify(citas));

    localStorage.removeItem('formularioUsuario');
    this.userINFO = this.usuariosService.nuevoUsuario();
    this.horasOcupadas = [];
    
    //Confirmacion de la cita
    Swal.fire({
      title: '¡Reservación Exitosa!',
      text: 'Tu reserva ha sido realizada con éxito.',
      icon: 'success',
      confirmButtonText: 'Aceptar'
    });
  }

  /*Validacion del calendario*/
  myFilter = (d: Date | null): boolean => {
    const date = d || new Date();
    const day = date.getDay();
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
  
    return day !== 0  && date >= today;
  };
  /*Validacion de horas*/
  cargarHorasOcupadas(fecha: string): void {
    const citas = JSON.parse(localStorage.getItem('citas') || '[]');
    this.horasOcupadas = citas
      .filter((cita: any) => cita.fecha === fecha)
      .map((cita: any) => cita.hora);
  }
  

}