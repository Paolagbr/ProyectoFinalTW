import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Input } from '@angular/core';

import { ComentarioService } from '../../servicios/comentario.service';

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
export class CuestionarioComponent implements OnInit, OnChanges  {
   @Input() comentarioParaEditar: any; // <-- esto permite recibir datos desde el padre
  formulario: FormGroup;
  comentarios: any[] = [];
  modoEdicion = false;
  indiceEdicion: number | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private comentarioService: ComentarioService
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
      id: [''] // <-- AÑADIDO AQUÍ
    });
  }

  ngOnInit(): void {
  // Cargar comentarios desde localStorage
  const comentariosGuardados = localStorage.getItem('comentariosUsuario');
  this.comentarios = comentariosGuardados ? JSON.parse(comentariosGuardados) : [];
  const comentarioEditar = this.comentarioService.getComentarioEditar();
  if (comentarioEditar) {
    this.formulario.patchValue(comentarioEditar);
    this.formulario.get('feedback')?.patchValue(comentarioEditar.feedback || {});
    this.indiceEdicion = this.comentarios.findIndex(c => c.id === comentarioEditar.id);
    this.modoEdicion = true;
    this.comentarioService.limpiarComentarioEditar();
  }
}


ngOnChanges(changes: SimpleChanges): void {
    if (changes['comentarioParaEditar'] && this.comentarioParaEditar) {
      this.formulario.patchValue(this.comentarioParaEditar);
      this.formulario.get('feedback')?.patchValue(this.comentarioParaEditar.feedback || {});
      this.indiceEdicion = this.comentarios.findIndex(c =>
        JSON.stringify(c) === JSON.stringify(this.comentarioParaEditar)
      );
      this.modoEdicion = true;
    }
  }

  enviarComentario(): void {
  if (this.formulario.valid) {
    const comentario = { ...this.formulario.value };

    // Si estamos en modo edición, actualizamos el comentario existente
    if (this.modoEdicion) {
      const index = this.comentarios.findIndex(c => c.id === comentario.id);
      this.comentarios[index] = comentario;
    } else {
      // Si no, agregamos un nuevo comentario
      comentario.id = Date.now(); // genera nuevo ID
      this.comentarios.push(comentario);
    }

    // Guardar en localStorage
    localStorage.setItem('comentariosUsuario', JSON.stringify(this.comentarios));
    this.formulario.reset();
    this.modoEdicion = false;
    this.indiceEdicion = null;

    Swal.fire({
      title: '¡Guardado!',
      text: 'Tu comentario ha sido registrado.',
      icon: 'success'
    });
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Completa todos los campos correctamente'
    });
  }
}

  editarComentario(index: number): void {
  const comentario = this.comentarios[index];
  this.formulario.patchValue({
    nombre: comentario.nombre,
    email: comentario.email,
    mensaje: comentario.mensaje,
    servicio: comentario.servicio,
    fechaCita: comentario.fechaCita,
    id: comentario.id // Esto es importante para poder encontrarlo después
  });
  this.formulario.get('feedback')?.patchValue(comentario.feedback || {});
  this.modoEdicion = true;
  this.indiceEdicion = index;
}

  eliminarComentario(index: number): void {
  this.comentarios.splice(index, 1);
  localStorage.setItem('comentariosUsuario', JSON.stringify(this.comentarios));
  Swal.fire({
    icon: 'info',
    title: 'Comentario eliminado',
    text: 'Se ha eliminado correctamente.'
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
}
