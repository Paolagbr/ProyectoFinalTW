import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatRadioModule } from '@angular/material/radio';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatNativeDateModule, MatOptionModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button'; // Importar MatButtonModule
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { userInfo } from '../datos';
import { GRUPOS, Genero, HORA as HORAS } from '../grupo';
import { ComentarioService } from '../servicios/comentario.service';
import { CuestionarioComponent } from '../components/cuestionario/cuestionario.component';
import { UsuariosService } from '../servicios/usuarios.service';
import { Auth, GoogleAuthProvider, linkWithPopup } from '@angular/fire/auth';
import { QrGeneratorComponent } from '../components/qr-generator/qr-generator.component';


@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    QrGeneratorComponent,
  ],
  templateUrl: "./menu.component.html",
  styleUrls: ["./menu.component.css"],
})
export class MenuComponent implements OnInit {
  selectedOption = "1"

  options = [
    { value: "1", label: "Agendar Cita" },
    { value: "2", label: "Quejas y Sugerencias" },
    { value: "3", label: "Mi Código QR" },
  ]

  userINFO = {
    name: "",
    grupo: 0,
    sexo: "",
    fechaCita: null,
    hora: "",
  }

  grupos = [
    { id: 1, nomServicio: "Masaje Corporal" },
    { id: 2, nomServicio: "Facial" },
    { id: 3, nomServicio: "Sauna" },
    { id: 4, nomServicio: "Aromaterapia" },
    { id: 5, nomServicio: "Masaje para Pies y Manos" },
    { id: 6, nomServicio: "Sala de Relajación" },
  ]

  genero = [
    { id: 1, genero: "Masculino" },
    { id: 2, genero: "Femenino" },
    { id: 3, genero: "Otro" },
  ]

  horas = [
    { id: 1, horaC: "09:00" },
    { id: 2, horaC: "10:00" },
    { id: 3, horaC: "11:00" },
    { id: 4, horaC: "12:00" },
    { id: 5, horaC: "13:00" },
    { id: 6, horaC: "14:00" },
    { id: 7, horaC: "15:00" },
    { id: 8, horaC: "16:00" },
    { id: 9, horaC: "17:00" },
  ]

  horasOcupadas: string[] = []
  listaCitas: any[] = []

  formulario: FormGroup
  comentarios: any[] = []
  modoEdicion = false

  constructor(private fb: FormBuilder) {
    this.formulario = this.fb.group({
      nombre: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      feedback: this.fb.group({
        facilidadNavegar: [false],
        buenaPresentacion: [false],
        facilEntender: [false],
        estructuraUtilizada: [false],
      }),
      servicio: ["", Validators.required],
      mensaje: ["", [Validators.required, Validators.minLength(10)]],
      fechaCita: ["", Validators.required],
    })
  }

  ngOnInit() {
    // Inicialización
  }

  guardarServicio(event: any) {
    console.log("Servicio guardado:", event)
  }

  guardarFecha(event: any) {
    console.log("Fecha guardada:", event)
  }

  guardarHora(event: any) {
    console.log("Hora guardada:", event)
  }

  guardarCita() {
    if (
      this.userINFO.name &&
      this.userINFO.grupo &&
      this.userINFO.sexo &&
      this.userINFO.fechaCita &&
      this.userINFO.hora
    ) {
      this.listaCitas.push({ ...this.userINFO })
      console.log("Cita guardada:", this.userINFO)
      // Limpiar formulario
      this.userINFO = {
        name: "",
        grupo: 0,
        sexo: "",
        fechaCita: null,
        hora: "",
      }
    }
  }

  editarUsuario(usuario: any) {
    console.log("Editando usuario:", usuario)
  }

  eliminarUsuario(usuario: any) {
    const index = this.listaCitas.indexOf(usuario)
    if (index > -1) {
      this.listaCitas.splice(index, 1)
    }
  }

  getNomServicio(grupoId: number): string {
    const grupo = this.grupos.find((g) => g.id === grupoId)
    return grupo ? grupo.nomServicio : "Servicio no encontrado"
  }

  myFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay()
    return day !== 0 && day !== 6
  }

  enviarComentario() {
    if (this.formulario.valid) {
      this.comentarios.push({ ...this.formulario.value, i: Date.now() })
      this.formulario.reset()
      console.log("Comentario enviado")
    }
  }

  editarComentario(comentario: any) {
    console.log("Editando comentario:", comentario)
  }

  eliminarComentario(comentario: any) {
    const index = this.comentarios.indexOf(comentario)
    if (index > -1) {
      this.comentarios.splice(index, 1)
    }
  }

  linkGoogleAccount() {
    console.log("Vinculando cuenta de Google")
  }
}
