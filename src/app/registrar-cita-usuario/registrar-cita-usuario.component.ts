import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UsuariosService } from '../servicios/usuarios.service';
import { hora, lista, sexo, userInfo } from '../datos';
import { HORA } from '../grupo';
import Swal from 'sweetalert2';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';
import { CommonModule, JsonPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatOptionModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';


export interface Place {
  name: string;
  grupo: number;
  sexo: string;
  fechaCita: string ;
  hora: string;
}

@Component({
  selector: 'app-registrar-cita-usuario',
  standalone:true,
   imports: [FormsModule, JsonPipe,
    MatFormFieldModule, MatInputModule,
    MatDatepickerModule, MatRadioModule, MatTimepickerModule,
     MatSelectModule, MatInputModule, MatOptionModule, CommonModule, MatCardModule],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './registrar-cita-usuario.component.html',
  styleUrl: './registrar-cita-usuario.component.css'
})

export class RegistrarCitaUsuarioComponent {
   /*Cargamos con la informacion de  la interfaz*/
  userINFO!: userInfo;
  grupos!: lista[];
  genero!: sexo[];
  horas!:hora[];
 
  horasOcupadas: string[] = [];

  constructor(private usuariosService: UsuariosService, private router: Router) { }

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
    //localStorage.setItem('formularioUsuario', JSON.stringify(this.userINFO));
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
    this.userINFO.hora = event.value;
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
  //localStorage.setItem('citas', JSON.stringify(citas));

  //Guardar en la base de datos 
    const nuevaCitaEnFirebase: Place = {
      name: this.userINFO.name,
      //name: this.userINFO.name, 
      grupo: this.userINFO.grupo,
      sexo:this.userINFO.sexo,
      fechaCita: this.userINFO.fechaCita,
      hora: this.userINFO.hora,
      
  };
    this.usuariosService.addPlace(nuevaCitaEnFirebase);//Se integra en la firestore


    //localStorage.removeItem('formularioUsuario');
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
