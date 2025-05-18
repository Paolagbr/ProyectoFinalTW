// File: src/app/menu/menu.component.ts
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatRadioModule } from '@angular/material/radio';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatNativeDateModule, MatOptionModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { userInfo } from '../datos';
import { GRUPOS, Genero, HORA as HORAS } from '../grupo';
import { ComentarioService } from '../servicios/comentario.service';
import { CuestionarioComponent } from '../components/cuestionario/cuestionario.component';

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
    CuestionarioComponent
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

  
  selectedOption = '1';
  options = [
    { value: '1', label: 'Agendar cita' },
    { value: '2', label: 'Ver comentarios' }
  ];
  originalUserName?: string;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private comentarioService: ComentarioService
  ) {}

  ngOnInit(): void {
    this.listaCitas = JSON.parse(localStorage.getItem('citas') || '[]');
    this.comentarios = JSON.parse(localStorage.getItem('comentariosUsuario') || '[]');

    const datosParaEditar = localStorage.getItem('usuarioParaEditar');
    if (datosParaEditar) {
      this.userINFO = JSON.parse(datosParaEditar);
      this.originalUserName = this.userINFO.name;
      this.selectedOption = '1';
      if (this.userINFO.fechaCita) {
        this.cargarHorasOcupadas(this.userINFO.fechaCita);
      }
    } else {
      localStorage.removeItem('usuarioParaEditar');
    }
    this.cdr.detectChanges();
  }

  trackOption(_: number, o: any) { return o.value; }
  trackGrupo(_: number, g: any)  { return g.id; }
  trackGenero(_: number, g: any){ return g.id; }
  trackHora(_: number, h: any)   { return h.id; }
  trackCita(_: number, u: any)   { return u.name; }
  trackComentario(_: number, c:any){ return c.nombre; }

  getNomServicio(id: number): string {
    const g = this.grupos.find(x => x.id === id);
    return g ? g.nomServicio : '';
  }

  editarUsuario(u: userInfo) {
    localStorage.setItem('usuarioParaEditar', JSON.stringify(u));
    this.userINFO = { ...u };
    this.originalUserName = u.name;
    this.cargarHorasOcupadas(this.userINFO.fechaCita);
    this.selectedOption = '1';
    this.cdr.detectChanges();
  }

  eliminarUsuario(u: userInfo) {
    Swal.fire({
      title: `¿Eliminar a ${u.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí'
    }).then(res => {
      if (res.isConfirmed) {
        const updated = this.listaCitas.filter(x => x.name !== u.name);
        localStorage.setItem('citas', JSON.stringify(updated));
        this.listaCitas = updated;
        if (this.originalUserName === u.name) this.limpiarFormulario();
        Swal.fire('Eliminado', '', 'success');
        this.cdr.detectChanges();
      }
    });
  }

  actualizarUsuario() {
    if (!this.originalUserName) {
      Swal.fire('Selecciona un usuario', '', 'warning');
      return;
    }
    const citas = JSON.parse(localStorage.getItem('citas')||'[]');
    const idx = citas.findIndex((x:any)=>x.name===this.originalUserName);
    if (idx>=0) {
      citas[idx] = { ...this.userINFO };
      localStorage.setItem('citas', JSON.stringify(citas));
      this.listaCitas = citas;
      Swal.fire('Guardado','', 'success');
    } else {
      Swal.fire('Error','Usuario no encontrado','error');
    }
    this.originalUserName = undefined;
    localStorage.removeItem('usuarioParaEditar');
    this.cdr.detectChanges();
  }

  guardarFecha(e: MatDatepickerInputEvent<Date>) {
    if (e.value) {
      const f = e.value.toISOString().split('T')[0];
      this.userINFO.fechaCita = f;
      this.guardarCitaStorage();
      this.cargarHorasOcupadas(f);
    }
  }

  guardarHora(e: any) {
    this.userINFO.hora = e.value;
    this.guardarCitaStorage();
  }

  guardarServicio(e: any) {
    this.userINFO.grupo = e.value;
    this.guardarCitaStorage();
  }

  myFilter = (d: Date|null) => {
    const dt = (d||new Date());
    dt.setHours(0,0,0,0);
    const today = new Date(); today.setHours(0,0,0,0);
    return dt>=today && dt.getDay()!==0;
  };

  cargarHorasOcupadas(fecha: string) {
    const citas = JSON.parse(localStorage.getItem('citas')||'[]');
    this.horasOcupadas = citas.filter((x:any)=>x.fecha===fecha).map((x:any)=>x.hora);
  }

  limpiarFormulario() {
    this.userINFO = { name:'', grupo:0, sexo:'', fechaCita:'', hora:'' };
    this.originalUserName = undefined;
    localStorage.removeItem('usuarioParaEditar');
    this.cdr.detectChanges();
  }

  editarComentario(c: any) {
    this.comentarioService.setComentarioEditar(c);
    this.router.navigate(['/cuestionario']);

    this.comentarioSeleccionado = c;
    this.selectedOption = '2';
    this.cdr.detectChanges();
  }

  eliminarComentario(c: any) {
    this.comentarios = this.comentarios.filter(x=>x!==c);
    localStorage.setItem('comentariosUsuario', JSON.stringify(this.comentarios));
  }

  private guardarCitaStorage() {
    const citas = JSON.parse(localStorage.getItem('citas')||'[]');
    if (this.originalUserName) {
      const i = citas.findIndex((x:any)=>x.name===this.originalUserName);
      if (i>=0) citas[i] = { ...this.userINFO };
    } else {
      citas.push({ ...this.userINFO });
    }
    localStorage.setItem('citas', JSON.stringify(citas));
    this.listaCitas = citas;
  }
}
