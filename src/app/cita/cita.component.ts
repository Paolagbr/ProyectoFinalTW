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
import { Auth } from '@angular/fire/auth';
import { RegistrarCitaUsuarioComponent } from '../registrar-cita-usuario/registrar-cita-usuario.component';
import { HttpClient } from '@angular/common/http';

export interface Place {
  name: string;
  grupo: number;
  sexo: string;
  fechaCita: string ;
  hora: string;
}

@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [FormsModule, JsonPipe,
    MatFormFieldModule, MatInputModule,
    MatDatepickerModule, MatRadioModule, MatTimepickerModule,
     MatSelectModule, MatInputModule, MatOptionModule, CommonModule, MatCardModule, RegistrarCitaUsuarioComponent],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cita.component.html',
  styleUrl: './cita.component.css'
})
export class CitaComponent {
  mostrarFormulario = false;
  usuarioAutenticado = false;

  constructor(private auth: Auth, private http: HttpClient) {}
  private apiUrl = 'http://localhost:3000/enviar-cita'; //Conectar con node, para que permita el envio de información 



  enviarCita(cita: any) {
    return this.http.post(this.apiUrl, cita);
  }

  ngOnInit(): void {
    this.auth.onAuthStateChanged(user => {
      this.usuarioAutenticado = !!user;
    });
  }

  mostrarCitaForm() {
    if (this.usuarioAutenticado) {
      this.mostrarFormulario = true;
    } else {
       Swal.fire('Se requiere iniciar sesión');
    }
  }
}