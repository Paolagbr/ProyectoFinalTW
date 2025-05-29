// File: src/app/menu/menu.component.ts
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 
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
import { UsuariosService } from '../servicios/usuarios.service';

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

  editingCitaId: string | undefined;
  // originalUserName?: string;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private comentarioService: ComentarioService, 
    private usuariosService: UsuariosService
  ) { }

  ngOnInit(): void {
    this.cargarCitas();
  //  this.comentarios = JSON.parse(localStorage.getItem('comentariosUsuario') || '[]');

    const datosParaEditar = localStorage.getItem('usuarioParaEditar');
    if (datosParaEditar) {
      const parsedData: userInfo = JSON.parse(datosParaEditar);
      this.userINFO = { ...parsedData };
      this.editingCitaId = parsedData.id; 
      this.selectedOption = '1'; 
      if (this.userINFO.fechaCita) {
        this.cargarHorasOcupadas(this.userINFO.fechaCita);
      }
      localStorage.removeItem('usuarioParaEditar'); 
    }
    this.cdr.detectChanges(); 
  }

  trackOption(_: number, o: any) { return o.value; }
  trackGrupo(_: number, g: any) { return g.id; }
  trackGenero(_: number, g: any) { return g.id; }
  trackHora(_: number, h: any) { return h.id; }
  trackCita(_: number, u: any) { return u.id; } 
  trackComentario(_: number, c: any) { return c.nombre; } 

 
  getNomServicio(id: any): string {
    const idAsNumber = typeof id === 'string' ? parseInt(id, 10) : id;

    if (isNaN(idAsNumber)) {
      console.warn('getNomServicio: ID de grupo no válido (NaN):', id);
      return '';
    }

    const g = this.grupos.find(x => x.id === idAsNumber);
    return g ? g.nomServicio : '';
  }

  eliminarUsuario(place: userInfo) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¡Esta acción no se puede deshacer!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuariosService.deletePlace(place)
          .then(() => {
            Swal.fire('Eliminado', 'La cita ha sido eliminada.', 'success');
            this.cargarCitas(); 
            if (this.editingCitaId === place.id) {
              this.limpiarFormulario(); 
            }
          })
          .catch((error) => {
            Swal.fire('Error', 'No se pudo eliminar la cita.', 'error');
            console.error("Error al eliminar la cita:", error);
          });
      }
    });
  }

  cargarCitas() {
    this.usuariosService.getPlaces().subscribe(places => {
      this.listaCitas = places;
      if (this.editingCitaId && !this.listaCitas.some(c => c.id === this.editingCitaId)) {
        this.limpiarFormulario();
        Swal.fire('Información', 'La cita que intentabas editar ya no existe.', 'info');
      }

     
      if (this.userINFO.fechaCita) {
        this.cargarHorasOcupadas(this.userINFO.fechaCita);
      }
      this.cdr.detectChanges();
    }, error => {
      console.error("Error al cargar las citas desde Firestore:", error);
      Swal.fire('Error', 'No se pudieron cargar las citas.', 'error');
    });
  }

  guardarCita() {
    if (!this.userINFO.name || !this.userINFO.fechaCita || !this.userINFO.hora || !this.userINFO.grupo) {
      Swal.fire('Campos incompletos', 'Por favor, rellena todos los campos de la cita.', 'warning');
      return;
    }

  
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
      // Agendar nueva cita
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

  editarUsuario(u: userInfo) {
  

    this.userINFO = { ...u }; 
    this.editingCitaId = u.id; 
    

    if (this.userINFO.fechaCita) {
      this.cargarHorasOcupadas(this.userINFO.fechaCita);
    }
    this.selectedOption = '1'; 
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

  myFilter = (d: Date | null) => {
    const dt = (d || new Date());
    dt.setHours(0, 0, 0, 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return dt >= today && dt.getDay() !== 0;
  };

  cargarHorasOcupadas(fecha: string) {
   
    this.horasOcupadas = this.listaCitas.filter(x => x.fechaCita === fecha).map(x => x.hora);
    this.cdr.detectChanges(); 
  }
  limpiarFormulario() {
    this.userINFO = { name: '', grupo: 0, sexo: '', fechaCita: '', hora: '' };
    this.editingCitaId = undefined;
   
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
    this.comentarios = this.comentarios.filter(x => x !== c);
    localStorage.setItem('comentariosUsuario', JSON.stringify(this.comentarios));
  }

  
}

// // File: src/app/menu/menu.component.ts
// import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
// import { MatRadioModule } from '@angular/material/radio';
// import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatDatepickerModule, MatDatepickerInputEvent } from '@angular/material/datepicker';
// import { MatSelectModule } from '@angular/material/select';
// import { MatTimepickerModule } from '@angular/material/timepicker';
// import { MatNativeDateModule, MatOptionModule, provideNativeDateAdapter } from '@angular/material/core';
// import { MatCardModule } from '@angular/material/card';
// import { Router } from '@angular/router';
// import Swal from 'sweetalert2';

// import { userInfo } from '../datos';
// import { GRUPOS, Genero, HORA as HORAS } from '../grupo';
// import { ComentarioService } from '../servicios/comentario.service';
// import { CuestionarioComponent } from '../components/cuestionario/cuestionario.component';
// import { UsuariosService } from '../servicios/usuarios.service';

// @Component({
//   selector: 'app-menu',
//   standalone: true,
//   imports: [
//     MatRadioModule,
//     FormsModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatDatepickerModule,
//     MatTimepickerModule,
//     MatSelectModule,
//     MatOptionModule,
//     CommonModule,
//     MatCardModule,
//     ReactiveFormsModule,
//     MatNativeDateModule,
//     CuestionarioComponent
//   ],
//   providers: [provideNativeDateAdapter()],
//   changeDetection: ChangeDetectionStrategy.OnPush,
//   templateUrl: './menu.component.html',
//   styleUrl: './menu.component.css'
// })
// export class MenuComponent implements OnInit {
//   userINFO: userInfo = { name: '', grupo: 0, sexo: '', fechaCita: '', hora: '' };
//   grupos = GRUPOS;
//   genero = Genero;
//   horas = HORAS;
//   listaCitas: userInfo[] = [];
//   comentarios: any[] = [];
//   horasOcupadas: string[] = [];

//   comentarioSeleccionado: any = null;


//   selectedOption = '1';
//   options = [
//     { value: '1', label: 'Agendar cita' },
//     { value: '2', label: 'Ver comentarios' }
//   ];

//   editingCitaId: string | undefined;
//   originalUserName?: string;

//   constructor(
//     private router: Router,
//     private cdr: ChangeDetectorRef,
//     private comentarioService: ComentarioService,
//     private usuariosService: UsuariosService
//   ) { }

//   ngOnInit(): void {
//   this.cargarCitas();

//   const datosParaEditar = localStorage.getItem('usuarioParaEditar');
//   if (datosParaEditar) {
//     const parsedData: userInfo = JSON.parse(datosParaEditar); 
//     this.userINFO = { ...parsedData }; 
//     this.editingCitaId = parsedData.id; 
//     this.selectedOption = '1';
//     if (this.userINFO.fechaCita) {
//       this.cargarHorasOcupadas(this.userINFO.fechaCita);
//     }
//     localStorage.removeItem('usuarioParaEditar');
//   } else {
    
//   }
//   this.cdr.detectChanges();
// }

//   trackOption(_: number, o: any) { return o.value; }
//   trackGrupo(_: number, g: any) { return g.id; }
//   trackGenero(_: number, g: any) { return g.id; }
//   trackHora(_: number, h: any) { return h.id; }
//   trackCita(_: number, u: any) { return u.name; }
//   trackComentario(_: number, c: any) { return c.nombre; }

//   //Se integra el nombre del servicio de acorde al id en grupos
//   getNomServicio(id: any): string {
//     const idAsNumber = typeof id === 'string' ? parseInt(id, 10) : id;

//     if (isNaN(idAsNumber)) {
//       console.warn('getNomServicio: ID de grupo no válido (NaN):', id);
//       return '';
//     }

//     const g = this.grupos.find(x => x.id === idAsNumber);
//     return g ? g.nomServicio : '';
//   }

//   eliminarUsuario(place: userInfo) {
//     Swal.fire({
//       title: '¿Estás seguro?',
//       text: "¡Esta acción no se puede deshacer!",
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#3085d6',
//       cancelButtonColor: '#d33',
//       confirmButtonText: 'Sí, eliminar'
//     }).then((result) => {
//       if (result.isConfirmed) {
//         this.usuariosService.deletePlace(place)
//           .then(() => {
//             Swal.fire('Eliminado', 'La cita ha sido eliminada.', 'success');
//             this.cargarCitas();
//             if (this.editingCitaId === place.id) {
//               this.limpiarFormulario();
//             }
//           })
//           .catch((error) => {
//             Swal.fire('Error', 'No se pudo eliminar la cita.', 'error');
//             console.error("Error al eliminar la cita:", error);
//           });
//       }
//     });
//   }
//   cargarCitas() {
//     this.usuariosService.getPlaces().subscribe(places => {
//       this.listaCitas = places;

//       if (this.editingCitaId && !this.listaCitas.some(c => c.id === this.editingCitaId)) {
//         this.limpiarFormulario();
//         Swal.fire('Información', 'La cita que intentabas editar ya no existe.', 'info');
//       }
//       this.cdr.detectChanges();
//     }, error => {
//       console.error("Error al cargar las citas desde Firestore:", error);
//       Swal.fire('Error', 'No se pudieron cargar las citas.', 'error');
//     });
//   }

//   guardarCita() {
//     if (!this.userINFO.name || !this.userINFO.fechaCita || !this.userINFO.hora || !this.userINFO.grupo) {
//       Swal.fire('Campos incompletos', 'Por favor, rellena todos los campos de la cita.', 'warning');
//       return;
//     }

//     if (this.editingCitaId) {

//       this.usuariosService.updatePlace(this.editingCitaId, this.userINFO)
//         .then(() => {
//           Swal.fire('Cita Actualizada', '', 'success');
//           this.limpiarFormulario();
//           this.cargarCitas();
//         })
//         .catch(error => {
//           console.error("Error al actualizar la cita:", error);
//           Swal.fire('Error', 'No se pudo actualizar la cita.', 'error');
//         });
//     } else {

//       this.usuariosService.addPlace(this.userINFO)
//         .then(() => {
//           Swal.fire('Cita Agendada', '', 'success');
//           this.limpiarFormulario();
//           this.cargarCitas();
//         })
//         .catch(error => {
//           console.error("Error al agendar la cita:", error);
//           Swal.fire('Error', 'No se pudo agendar la cita.', 'error');
//         });
//     }
//   }


//   editarUsuario(u: userInfo) {
//    // localStorage.setItem('usuarioParaEditar', JSON.stringify(u));
//     this.userINFO = { ...u }; // Copia el objeto para no modificar el original de la lista
//   this.editingCitaId = u.id; // ¡AQUÍ DEBE SER EL ID DE FIRESTORE!
//   // this.originalUserName = u.name; // <-- ¡Eliminar esto, es de la lógica vieja!
//   this.cargarHorasOcupadas(this.userINFO.fechaCita);
//   this.selectedOption = '1';
//   this.cdr.detectChanges();
//   }

//   actualizarUsuario() {
//     if (!this.originalUserName) {
//       Swal.fire('Selecciona un usuario', '', 'warning');
//       return;
//     }
//     const citas = JSON.parse(localStorage.getItem('citas') || '[]');
//     const idx = citas.findIndex((x: any) => x.name === this.originalUserName);
//     if (idx >= 0) {
//       citas[idx] = { ...this.userINFO };
//       localStorage.setItem('citas', JSON.stringify(citas));
//       this.listaCitas = citas;
//       Swal.fire('Guardado', '', 'success');
//     } else {
//       Swal.fire('Error', 'Usuario no encontrado', 'error');
//     }
//     this.originalUserName = undefined;
//     localStorage.removeItem('usuarioParaEditar');
//     this.cdr.detectChanges();
//   }

//   guardarFecha(e: MatDatepickerInputEvent<Date>) {
//     if (e.value) {
//       const f = e.value.toISOString().split('T')[0];
//       this.userINFO.fechaCita = f;
//       this.guardarCitaStorage();
//       this.cargarHorasOcupadas(f);
//     }
//   }

//   guardarHora(e: any) {
//     this.userINFO.hora = e.value;
//     this.guardarCitaStorage();
//   }

//   guardarServicio(e: any) {
//     this.userINFO.grupo = e.value;
//     this.guardarCitaStorage();
//   }

//   myFilter = (d: Date | null) => {
//     const dt = (d || new Date());
//     dt.setHours(0, 0, 0, 0);
//     const today = new Date(); today.setHours(0, 0, 0, 0);
//     return dt >= today && dt.getDay() !== 0;
//   };

//   cargarHorasOcupadas(fecha: string) {
//     const citas = JSON.parse(localStorage.getItem('citas') || '[]');
//     this.horasOcupadas = citas.filter((x: any) => x.fecha === fecha).map((x: any) => x.hora);
//   }

//   limpiarFormulario() {
//     this.userINFO = { name: '', grupo: 0, sexo: '', fechaCita: '', hora: '' };
//     this.originalUserName = undefined;
//     localStorage.removeItem('usuarioParaEditar');
//     this.cdr.detectChanges();
//   }

//   editarComentario(c: any) {
//     this.comentarioService.setComentarioEditar(c);
//     this.router.navigate(['/cuestionario']);

//     this.comentarioSeleccionado = c;
//     this.selectedOption = '2';
//     this.cdr.detectChanges();
//   }

//   eliminarComentario(c: any) {
//     this.comentarios = this.comentarios.filter(x => x !== c);
//     localStorage.setItem('comentariosUsuario', JSON.stringify(this.comentarios));
//   }

//   private guardarCitaStorage() {
//     const citas = JSON.parse(localStorage.getItem('citas') || '[]');
//     if (this.originalUserName) {
//       const i = citas.findIndex((x: any) => x.name === this.originalUserName);
//       if (i >= 0) citas[i] = { ...this.userINFO };
//     } else {
//       citas.push({ ...this.userINFO });
//     }
//     localStorage.setItem('citas', JSON.stringify(citas));
//     this.listaCitas = citas;
//   }
// }
