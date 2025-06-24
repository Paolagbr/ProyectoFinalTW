import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ComentarioService } from '../../servicios/comentario.service';
import { QrApiService } from '../../services/qr-api.service';


@Component({
  selector: 'app-cuestionario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './cuestionario.component.html',
  styleUrls: ['./cuestionario.component.css']
})
export class CuestionarioComponent implements OnInit {
  @Input() comentarioParaEditar: any;
  formulario: FormGroup;
  comentarios: any[] = [];

  // QR & UI
  showQRSection = false;
  loading = false;
  error: string | null = null;
  qrCodeDataURL: string | null = null;
  citaData: any = null;

  modoEdicion = false;
  indiceEdicion: number | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private comentarioService: ComentarioService,
    private qrApi: QrApiService
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
    const comentarioEditar = this.comentarioService.getComentarioEditar();
    if (comentarioEditar) {
      this.formulario.patchValue(comentarioEditar);
      this.formulario.get('feedback')?.patchValue(comentarioEditar.feedback || {});
      this.indiceEdicion = this.comentarios.findIndex(c => c.id === comentarioEditar.id);
      this.modoEdicion = true;
      this.comentarioService.limpiarComentarioEditar();
    }
  }

  enviarComentario(): void {
    if (this.formulario.valid) {
      const comentario = {
        ...this.formulario.value,
        fechaCita: this.formulario.value.fechaCita
          ? new Date(this.formulario.value.fechaCita).toISOString().slice(0, 10)
          : null,
        id: this.modoEdicion ? this.formulario.value.id : Date.now()
      };

      if (this.modoEdicion) {
        const index = this.comentarios.findIndex(c => c.id === comentario.id);
        this.comentarios[index] = comentario;
      } else {
        this.comentarios.push(comentario);
      }

      this.comentarioService.addPlace(comentario);

      Swal.fire('¡Guardado!', 'Tu comentario ha sido registrado.', 'success');

      // Llama al backend para obtener los datos del QR
      this.generarQRDesdeBackend(comentario.email);
    } else {
      Swal.fire('Oops...', 'Completa todos los campos correctamente', 'error');
    }
  }

  generarQRDesdeBackend(email: string): void {
    this.loading = true;
    this.error = null;
    this.showQRSection = true;

    this.qrApi.obtenerDatosCitaParaQR(email).subscribe({
      next: (respuesta) => {
        this.loading = false;
        if (respuesta.success) {
          this.citaData = respuesta.data;
          this.qrCodeDataURL =
            'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' +
            encodeURIComponent(JSON.stringify(this.citaData));
        } else {
          this.error = 'No se pudo generar el código QR.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error al obtener datos para el QR: ' + err.message;
      }
    });
  }

  regenerarQR(): void {
    if (this.formulario.get('email')?.value) {
      this.generarQRDesdeBackend(this.formulario.get('email')?.value);
    }
  }

  descargarQR(): void {
    if (this.qrCodeDataURL) {
      const link = document.createElement('a');
      link.href = this.qrCodeDataURL;
      link.download = 'comentario-qr.png';
      link.click();
    }
  }

  editarComentario(index: number): void {
    const comentario = this.comentarios[index];
    this.formulario.patchValue(comentario);
    this.formulario.get('feedback')?.patchValue(comentario.feedback || {});
    this.indiceEdicion = index;
    this.modoEdicion = true;
  }

  eliminarComentario(index: number): void {
    this.comentarios.splice(index, 1);
    Swal.fire('Eliminado', 'El comentario ha sido eliminado', 'info');
  }

  myFilter = (d: Date | null): boolean => {
    const date = d || new Date();
    const day = date.getDay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return day !== 0 && date >= today;
  };
}



// import { Component, OnInit, OnChanges, SimpleChanges, Input } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { ReactiveFormsModule, FormsModule } from '@angular/forms';
// import Swal from 'sweetalert2';
// import { Router } from '@angular/router';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatDatepickerModule } from '@angular/material/datepicker';
// import { MatNativeDateModule } from '@angular/material/core';
// import { ComentarioService } from '../../servicios/comentario.service';

// @Component({
//   selector: 'app-cuestionario',
//   standalone: true,
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     FormsModule,
//     MatDatepickerModule,
//     MatNativeDateModule,
//     MatInputModule,
//     MatFormFieldModule
//   ],
//   templateUrl: './cuestionario.component.html',
//   styleUrls: ['./cuestionario.component.css']
// })
// export class CuestionarioComponent implements OnInit, OnChanges {
//   @Input() comentarioParaEditar: any;
//   formulario: FormGroup;
//   comentarios: any[] = [];

//   // QR & UI
//   showQRSection = false;
//   loading = false;
//   error: string | null = null;
//   qrCodeDataURL: string | null = null;
//   citaData: any = null;

//   modoEdicion = false;
//   indiceEdicion: number | null = null;

//   constructor(
//     private fb: FormBuilder,
//     private router: Router,
//     private comentarioService: ComentarioService
//   ) {
//     this.formulario = this.fb.group({
//       nombre: ['', Validators.required],
//       email: ['', [Validators.required, Validators.email]],
//       mensaje: ['', [Validators.required, Validators.minLength(10)]],
//       servicio: ['', Validators.required],
//       fechaCita: [null, Validators.required],
//       feedback: this.fb.group({
//         facilidadNavegar: [false],
//         buenaPresentacion: [false],
//         facilEntender: [false],
//         estructuraUtilizada: [false]
//       }),
//       id: ['']
//     });
//   }

//   ngOnInit(): void {
//     const comentarioEditar = this.comentarioService.getComentarioEditar();
//     if (comentarioEditar) {
//       this.formulario.patchValue(comentarioEditar);
//       this.formulario.get('feedback')?.patchValue(comentarioEditar.feedback || {});
//       this.indiceEdicion = this.comentarios.findIndex(c => c.id === comentarioEditar.id);
//       this.modoEdicion = true;
//       this.comentarioService.limpiarComentarioEditar();
//     }
//   }

//   ngOnChanges(changes: SimpleChanges): void {
//     if (changes['comentarioParaEditar'] && this.comentarioParaEditar) {
//       this.formulario.patchValue(this.comentarioParaEditar);
//       this.formulario.get('feedback')?.patchValue(this.comentarioParaEditar.feedback || {});
//       this.indiceEdicion = this.comentarios.findIndex(c =>
//         JSON.stringify(c) === JSON.stringify(this.comentarioParaEditar)
//       );
//       this.modoEdicion = true;
//     }
//   }

//   enviarComentario(): void {
//     if (this.formulario.valid) {
//       const rawComentario = this.formulario.value;
//       const comentario = {
//         ...rawComentario,
//         fechaCita: rawComentario.fechaCita
//           ? new Date(rawComentario.fechaCita).toISOString().slice(0, 10)
//           : null,
//         id: this.modoEdicion ? rawComentario.id : Date.now()
//       };

//       if (this.modoEdicion) {
//         const index = this.comentarios.findIndex(c => c.id === comentario.id);
//         this.comentarios[index] = comentario;
//       } else {
//         this.comentarios.push(comentario);
//       }

//       this.comentarioService.addPlace(comentario);

//       Swal.fire('¡Guardado!', 'Tu comentario ha sido registrado.', 'success');

//       // Generar QR aquí con el comentario recién enviado
//       this.generarQR(comentario);
//     } else {
//       Swal.fire('Oops...', 'Completa todos los campos correctamente', 'error');
//     }
//   }

//   generarQR(comentario: any): void {
//     this.loading = true;
//     this.error = null;
//     this.showQRSection = true;

//     setTimeout(() => {
//       this.loading = false;
//       this.qrCodeDataURL = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(JSON.stringify(comentario));
//       this.citaData = {
//         cliente: comentario.nombre,
//         servicio: comentario.servicio,
//         fecha: comentario.fechaCita,
//         hora: new Date().toLocaleTimeString(),
//         codigoConfirmacion: Math.floor(100000 + Math.random() * 900000),
//         validoHasta: new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
//       };
//     }, 1500);
//   }

//   regenerarQR(): void {
//     if (this.citaData) {
//       this.generarQR(this.formulario.value);
//     }
//   }

//   descargarQR(): void {
//     if (this.qrCodeDataURL) {
//       const link = document.createElement('a');
//       link.href = this.qrCodeDataURL;
//       link.download = 'cita-qr.png';
//       link.click();
//     }
//   }

//   editarComentario(index: number): void {
//     const comentario = this.comentarios[index];
//     this.formulario.patchValue(comentario);
//     this.formulario.get('feedback')?.patchValue(comentario.feedback || {});
//     this.indiceEdicion = index;
//     this.modoEdicion = true;
//   }

//   eliminarComentario(index: number): void {
//     this.comentarios.splice(index, 1);
//     Swal.fire('Eliminado', 'El comentario ha sido eliminado', 'info');
//   }

//   myFilter = (d: Date | null): boolean => {
//     const date = d || new Date();
//     const day = date.getDay();
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     date.setHours(0, 0, 0, 0);
//     return day !== 0 && date >= today;
//   };
// }
