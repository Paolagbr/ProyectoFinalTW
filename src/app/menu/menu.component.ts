
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

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    MatRadioModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatTimepickerModule,
    MatSelectModule,
    MatOptionModule,
    CommonModule,
    MatCardModule,
    ReactiveFormsModule,
    MatNativeDateModule,
    CuestionarioComponent,
    MatButtonModule
  ],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {
  userINFO: userInfo = { name: '', grupo: 0, sexo: '', fechaCita: '', hora: '' };
  grupos = GRUPOS;
  genero = Genero;
  horas = HORAS;
  listaCitas: userInfo[] = [];
  comentarios: any[] = [];
  horasOcupadas: string[] = [];

  comentarioSeleccionado: any = null;
  formulario: FormGroup;
  modoEdicion = false;
  indiceEdicion: number | null = null;

  selectedOption = '1';
  options = [
    { value: '1', label: 'Agendar cita' },
    { value: '2', label: 'Ver comentarios' }
  ];

  editingCitaId: string | undefined;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private comentarioService: ComentarioService,
    private usuariosService: UsuariosService,
    private fb: FormBuilder,
    private auth: Auth
  ) {
    this.formulario = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mensaje: ['', [Validators.required, Validators.minLength(10)]],
      servicio: ['', Validators.required],
      fechaCita: [null, Validators.required],
      feedback: this.fb.group({
        facilidadNavegar: [false],
        buenaPresentacion: [false],
        facilEntender: [false],
        estructuraUtilizada: [false]
      }),
      id: ['']
    });
  }

  ngOnInit(): void {
    this.cargarCitas();
    this.cargarComentarios();

    const comentarioEditar = this.comentarioService.getComentarioEditar();
    if (comentarioEditar) {

      const fechaParaFormulario = comentarioEditar.fechaCita ? new Date(comentarioEditar.fechaCita + 'T00:00:00') : null;

      this.formulario.patchValue({
        ...comentarioEditar,
        fechaCita: fechaParaFormulario
      });

      this.formulario.get('feedback')?.patchValue(comentarioEditar.feedback || {});
      this.indiceEdicion = this.comentarios.findIndex(c => c.id === comentarioEditar.id);
      this.modoEdicion = true;
      this.comentarioService.limpiarComentarioEditar();
    }
  }

  cargarCitas() {
    this.usuariosService.getPlaces().subscribe(places => {
      this.listaCitas = places;
      if (this.editingCitaId && !this.listaCitas.some(c => c.id === this.editingCitaId)) {
        this.limpiarFormulario();
        Swal.fire('Información', 'La cita que intentabas editar ya no existe.', 'info');
      }
      this.cdr.detectChanges();
    }, error => {
      console.error("Error al cargar las citas:", error);
      Swal.fire('Error', 'No se pudieron cargar las citas.', 'error');
    });
  }

  cargarComentarios() {
    this.comentarioService.getPlaces().subscribe(data => {
      this.comentarios = data;
      this.cdr.detectChanges();
    });
  }

  guardarCita() {
    if (this.editingCitaId) {
      this.usuariosService.updatePlace(this.editingCitaId, this.userINFO)
        .then(() => {
          Swal.fire('Cita Actualizada', '', 'success');
          this.limpiarFormulario();
          this.cargarCitas();
        })
        .catch(error => {
          console.error("Error al actualizar la cita:", error);
          Swal.fire('Error', 'No se pudo actualizar la cita.', 'error');
        });
    } else {
      this.usuariosService.addPlace(this.userINFO)
        .then(() => {
          Swal.fire('Cita Agendada', '', 'success');
          this.limpiarFormulario();
          this.cargarCitas();
        })
        .catch(error => {
          console.error("Error al agendar la cita:", error);
          Swal.fire('Error', 'No se pudo agendar la cita.', 'error');
        });
    }
  }

  eliminarUsuario(place: userInfo) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¡Esta acción no se puede deshacer!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(result => {
      if (result.isConfirmed) {
        this.usuariosService.deletePlace(place)
          .then(() => {
            Swal.fire('Eliminado', 'La cita ha sido eliminada.', 'success');
            this.cargarCitas();
            if (this.editingCitaId === place.id) this.limpiarFormulario();
          })
          .catch(error => {
            console.error("Error al eliminar la cita:", error);
            Swal.fire('Error', 'No se pudo eliminar la cita.', 'error');
          });
      }
    });
  }

  eliminarComentario(c: any) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¡Esta acción no se puede deshacer!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(result => {
      if (result.isConfirmed) {
        this.comentarioService.deletePlace(c)
          .then(() => {
            Swal.fire('Eliminado', 'El comentario ha sido eliminado.', 'success');
            this.cargarComentarios();

            if (this.modoEdicion && this.formulario.get('id')?.value === c.id) {
              this.limpiarFormularioComentario();
            }
          })
          .catch(error => {
            console.error("Error al eliminar comentario:", error);
            Swal.fire('Error', 'No se pudo eliminar el comentario.', 'error');
          });
      }
    });
  }

  editarUsuario(u: userInfo) {
    this.userINFO = { ...u };
    if (this.userINFO.fechaCita) {

      const originalDate = new Date(this.userINFO.fechaCita + 'T00:00:00');
      originalDate.setDate(originalDate.getDate() + 1);
      this.userINFO.fechaCita = originalDate.toISOString().split('T')[0];
    }

    this.editingCitaId = u.id;
    this.selectedOption = '1';
    if (this.userINFO.fechaCita) this.cargarHorasOcupadas(this.userINFO.fechaCita);
    this.cdr.detectChanges();
  }


  editarComentario(c: any) {

    const fechaParaFormulario = c.fechaCita ? new Date(c.fechaCita + 'T00:00:00') : null;

    this.formulario.patchValue({
      ...c,
      fechaCita: fechaParaFormulario
    });
    this.formulario.get('feedback')?.patchValue(c.feedback || {});
    this.indiceEdicion = this.comentarios.findIndex(com => com.id === c.id);
    this.modoEdicion = true;
    this.selectedOption = '2';
    this.cdr.detectChanges();
  }

  enviarComentario(): void {
    if (this.formulario.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Formulario incompleto',
        text: 'Por favor llena todos los campos requeridos.'
      });
      return;
    }

    const rawComentario = this.formulario.value;
    const comentarioAEnviar = {
      ...rawComentario,

      fechaCita: rawComentario.fechaCita
        ? new Date(rawComentario.fechaCita).toISOString().split('T')[0]
        : null,
    };

    if (this.modoEdicion && comentarioAEnviar.id) {

      this.comentarioService.updatePlace(comentarioAEnviar.id, comentarioAEnviar)
        .then(() => {
          Swal.fire('¡Actualizado!', 'Tu comentario ha sido actualizado.', 'success');
          this.cargarComentarios();
          this.limpiarFormularioComentario();
        })
        .catch(error => {
          console.error("Error al actualizar comentario:", error);
          Swal.fire('Error', 'No se pudo actualizar el comentario.', 'error');
        });
    } else {

      const nuevoComentario = { ...comentarioAEnviar, id: comentarioAEnviar.id || Date.now().toString() };
      this.comentarioService.addPlace(nuevoComentario)
        .then(() => {
          Swal.fire('¡Guardado!', 'Tu comentario ha sido registrado.', 'success');
          this.cargarComentarios();
          this.limpiarFormularioComentario();
        })
        .catch(error => {
          console.error("Error al guardar comentario:", error);
          Swal.fire('Error', 'No se pudo registrar el comentario.', 'error');
        });
    }
  }


  limpiarFormularioComentario() {
    this.formulario.reset();
    this.modoEdicion = false;
    this.indiceEdicion = null;

    this.formulario.get('feedback')?.patchValue({
      facilidadNavegar: false,
      buenaPresentacion: false,
      facilEntender: false,
      estructuraUtilizada: false
    });
    this.cdr.detectChanges();
  }


  guardarFecha(e: MatDatepickerInputEvent<Date>) {
    if (e.value) {
      const f = e.value.toISOString().split('T')[0];
      this.userINFO.fechaCita = f;
      this.cargarHorasOcupadas(f);
    }
  }

  guardarHora(e: any) {
    this.userINFO.hora = e.value;
  }

  guardarServicio(e: any) {
    this.userINFO.grupo = e.value;
  }

  cargarHorasOcupadas(fecha: string) {
    this.horasOcupadas = this.listaCitas
      .filter(x => x.fechaCita === fecha && x.id !== this.editingCitaId)
      .map(x => x.hora);
    this.cdr.detectChanges();
  }

  limpiarFormulario() {
    this.userINFO = { name: '', grupo: 0, sexo: '', fechaCita: '', hora: '' };
    this.editingCitaId = undefined;
    this.horasOcupadas = [];
    this.cdr.detectChanges();
  }

  trackOption(_: number, o: any) { return o.value; }
  trackGrupo(_: number, g: any) { return g.id; }
  trackGenero(_: number, g: any) { return g.id; }
  trackHora(_: number, h: any) { return h.id; }
  trackCita(_: number, u: userInfo) { return u.id; }
  trackComentario(_: number, c: any) { return c.id; }

  myFilter = (d: Date | null) => {
    const dt = d || new Date();
    dt.setHours(0, 0, 0, 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return dt >= today && dt.getDay() !== 0;
  };
  getNomServicio(id: any): string {
    const idAsNumber = typeof id === 'string' ? parseInt(id, 10) : id;

    if (isNaN(idAsNumber)) {
      console.warn('getNomServicio: ID de grupo no válido (NaN):', id);
      return '';
    }
    const g = this.grupos.find(x => x.id === idAsNumber);
    return g ? g.nomServicio : '';
  }

  async linkGoogleAccount() {
    try {
      if (!this.auth.currentUser) {
        console.warn("No hay un usuario autenticado para vincular.");
        return;
      }
      const provider = new GoogleAuthProvider();
      await linkWithPopup(this.auth.currentUser, provider);
       Swal.fire('Error', 'Cuenta correctamente vinculada con Google', 'error');
     
    } catch (error: any) {
       Swal.fire('Error', 'Error al vincular cuenta con Google', 'error');
      
      if (error.code === 'auth/credential-already-in-use') {
        
      }
     
    }
  }

}

