import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  NgForm, // Import NgForm
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import QRCodeStyling from 'qr-code-styling';
import { QrApiService, CitaQRData } from '../services/qr-api.service';
import { InicioSesionService } from '../servicios/inicio-sesion.service';
import { User } from '@angular/fire/auth';

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
    MatCardModule // Added MatCardModule here, though not strictly used in your provided HTML
  ],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
})
export class MenuComponent implements OnInit, AfterViewInit {
  @ViewChild('qrContainer', { static: false }) qrContainer!: ElementRef;

  selectedOption = '1';
  options = [
    { value: '1', label: 'Agendar Cita' },
    { value: '2', label: 'Quejas y Sugerencias' },
  ];

  userINFO = {
    id: 0, // Añadir un ID para identificar las citas al editar
    name: '',
    grupo: 0,
    sexo: '',
    fechaCita: null as Date | null, // Asegurar que sea tipo Date o null
    hora: '',
  };

  grupos = [
    { id: 1, nomServicio: 'Masaje Corporal' },
    { id: 2, nomServicio: 'Facial' },
    { id: 3, nomServicio: 'Sauna' },
    { id: 4, nomServicio: 'Aromaterapia' },
    { id: 5, nomServicio: 'Masaje para Pies y Manos' },
    { id: 6, nomServicio: 'Sala de Relajación' },
  ];

  genero = [
    { id: 1, genero: 'Masculino' },
    { id: 2, genero: 'Femenino' },
    { id: 3, genero: 'Otro' },
  ];

  horas = [
    { id: 1, horaC: '09:00' }, { id: 2, horaC: '10:00' },
    { id: 3, horaC: '11:00' }, { id: 4, horaC: '12:00' },
    { id: 5, horaC: '13:00' }, { id: 6, horaC: '14:00' },
    { id: 7, horaC: '15:00' }, { id: 8, horaC: '16:00' },
    { id: 9, horaC: '17:00' },
  ];

  horasOcupadas: string[] = [];
  listaCitas: any[] = [];
  modoEdicionCita = false;
  citaAEditar: any = null; // Para almacenar la cita que se está editando

  formulario: FormGroup;
  comentarios: any[] = [];
  modoEdicionComentario = false; // Cambiado para claridad
  comentarioAEditar: any = null; // Para almacenar el comentario que se está editando

  // QR
  qrCode!: QRCodeStyling;
  citaData: CitaQRData | null = null;
  loading = false;
  error = '';
  userEmail = '';

  constructor(
    private fb: FormBuilder,
    private qrApiService: QrApiService,
    private authService: InicioSesionService,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef
  ) {
    this.formulario = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      feedback: this.fb.group({
        facilidadNavegar: [false],
        buenaPresentacion: [false],
        facilEntender: [false],
        estructuraUtilizada: [false],
      }),
      servicio: ['', Validators.required],
      mensaje: ['', [Validators.required, Validators.minLength(10)]],
      fechaCita: [null, Validators.required], // Initialize with null
    });
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe((user: User | null) => {
      if (user?.email) {
        this.userEmail = user.email;
        this.generarQR(); // Generar QR solo si hay un usuario logueado
      }
    });

    // Cargar datos de ejemplo si las listas están vacías (para desarrollo)
    if (this.listaCitas.length === 0) {
      this.listaCitas.push(
        { id: 1, name: 'Juan Perez', grupo: 1, sexo: 'Masculino', fechaCita: new Date(), hora: '10:00' },
        { id: 2, name: 'Ana Gomez', grupo: 2, sexo: 'Femenino', fechaCita: new Date(), hora: '11:00' }
      );
    }
    if (this.comentarios.length === 0) {
      this.comentarios.push(
        { id: 1, nombre: 'Carlos Ruiz', email: 'carlos@example.com', feedback: { facilidadNavegar: true, buenaPresentacion: false, facilEntender: true, estructuraUtilizada: false }, servicio: 'Masaje Corporal', mensaje: 'Muy buen servicio, la página es fácil de usar.', fechaCita: new Date() },
        { id: 2, nombre: 'Maria Lopez', email: 'maria@example.com', feedback: { facilidadNavegar: false, buenaPresentacion: true, facilEntender: false, estructuraUtilizada: true }, servicio: 'Atencion al cliente', mensaje: 'Excelente atención al cliente!', fechaCita: new Date() }
      );
    }
  }

  ngAfterViewInit(): void {
    // Es importante asegurarse de que qrContainer exista antes de intentar usarlo
    // Y que initQRInstance solo se llame una vez.
    if (!this.qrCode && this.qrContainer?.nativeElement) {
      this.initQRInstance();
      this.generarQR(); // Genera el QR después de que la vista esté inicializada y el contenedor disponible
    }
  }

  initQRInstance() {
    if (this.qrContainer?.nativeElement) {
      this.qrCode = new QRCodeStyling({
        width: 300,
        height: 300,
        type: 'canvas',
        data: 'Cargando...',
        dotsOptions: { color: '#000', type: 'rounded' },
        backgroundOptions: { color: '#fff' },
      });
      this.qrCode.append(this.qrContainer.nativeElement);
    }
  }

  async generarQR() {
    if (!this.userEmail) {
      this.error = 'Usuario no autenticado';
      // Remueve el QR si no hay usuario autenticado
      if (this.qrCode) {
        this.qrCode.update({ data: 'No autenticado' });
      }
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      // Usar .toPromise() es obsoleto, es mejor usar `firstValueFrom` o `lastValueFrom`
      // O suscribirse directamente al observable
      const response = await this.qrApiService.obtenerDatosCitaParaQR(this.userEmail).toPromise();

      if (response?.success && response.data) {
        this.citaData = response.data;

        const qrContent = JSON.stringify({
          codigo: this.citaData.codigoConfirmacion,
          cita: this.citaData.citaId,
          cliente: this.citaData.cliente,
          servicio: this.citaData.servicio,
          fecha: this.citaData.fecha,
          hora: this.citaData.hora,
          valido_hasta: this.citaData.validoHasta,
        });

        if (this.qrCode) { // Asegurarse de que qrCode esté inicializado
          this.qrCode.update({ data: qrContent });
        } else {
          // Si por alguna razón no se inicializó, intentarlo de nuevo
          this.initQRInstance();
          if (this.qrCode) {
           // this.qrCode.update({ data: qrContent });
          }
        }
      } else {
        this.error = 'No se encontraron datos de cita para el usuario.';
        if (this.qrCode) {
          this.qrCode.update({ data: 'No hay datos de cita' });
        }
      }
    } catch (error: any) {
      console.error('Error al generar QR:', error);
      this.error = error.error?.error || 'Error al generar código QR';
      if (this.qrCode) {
        this.qrCode.update({ data: 'Error al cargar QR' });
      }
    } finally {
      this.loading = false;
      this.cdr.detectChanges(); // Forzar detección de cambios para actualizar la vista
    }
  }

  regenerarQR() {
    this.generarQR();
  }

  descargarQR() {
    if (this.qrCode && this.citaData) { // Asegurarse de que exista el QR y los datos
      this.qrCode.download({
        name: `cita-qr-${this.citaData.codigoConfirmacion || 'descarga'}`,
        extension: 'png',
      });
    } else {
      Swal.fire('Error', 'No hay un código QR para descargar.', 'error');
    }
  }

  // --- Funciones para Citas ---
  guardarCita(form: NgForm) {
    if (form.valid) {
      if (this.modoEdicionCita && this.citaAEditar) {
        // En modo edición, encontrar y actualizar la cita
        const index = this.listaCitas.findIndex(c => c.id === this.citaAEditar.id);
        if (index > -1) {
          this.listaCitas[index] = { ...this.userINFO };
          Swal.fire('Actualizado', 'La cita ha sido actualizada.', 'success');
        }
        this.modoEdicionCita = false;
        this.citaAEditar = null;
      } else {
        // No en modo edición, agregar una nueva cita
        const newId = this.listaCitas.length > 0 ? Math.max(...this.listaCitas.map(c => c.id)) + 1 : 1;
        this.listaCitas.push({ ...this.userINFO, id: newId });
        Swal.fire('Agendada', 'Tu cita ha sido agendada con éxito.', 'success');
      }
      // Limpiar el formulario y resetear el userINFO
      form.resetForm(); // Limpia los controles del formulario y los estados de touched/dirty
      this.userINFO = { id: 0, name: '', grupo: 0, sexo: '', fechaCita: null, hora: '' };
      console.log('Citas actuales:', this.listaCitas);
    } else {
      Swal.fire('Error', 'Por favor, completa todos los campos requeridos.', 'error');
    }
  }

  editarUsuario(cita: any) {
    this.modoEdicionCita = true;
    this.citaAEditar = cita;
    // Rellenar el formulario con los datos de la cita
    this.userINFO = { ...cita };
    // Si fechaCita es una cadena, conviértela a Date para el datepicker
    if (typeof this.userINFO.fechaCita === 'string') {
      this.userINFO.fechaCita = new Date(this.userINFO.fechaCita);
    }
  }

  eliminarUsuario(cita: any) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, borrarlo!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.listaCitas = this.listaCitas.filter(c => c.id !== cita.id);
        Swal.fire('Borrado!', 'La cita ha sido eliminada.', 'success');
        // Si la cita eliminada era la que se estaba editando, resetear el formulario
        if (this.citaAEditar && this.citaAEditar.id === cita.id) {
          this.modoEdicionCita = false;
          this.citaAEditar = null;
          this.userINFO = { id: 0, name: '', grupo: 0, sexo: '', fechaCita: null, hora: '' };
        }
      }
    });
  }

  getNomServicio(grupoId: number): string {
    const grupo = this.grupos.find((g) => g.id === grupoId);
    return grupo ? grupo.nomServicio : 'Servicio no encontrado';
  }

  myFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    // Previene sábados (6) y domingos (0)
    return day !== 0 && day !== 6;
  };

  guardarServicio(event: any) {
    this.userINFO.grupo = event.value;
    console.log('Servicio seleccionado:', this.getNomServicio(event.value));
  }

  guardarFecha(event: any) {
    this.userINFO.fechaCita = event.value;
    console.log('Fecha seleccionada:', event.value);
  }

  guardarHora(event: any) {
    this.userINFO.hora = event.value;
    console.log('Hora seleccionada:', event.value);
  }

  // --- Funciones para Comentarios ---
  enviarComentario() {
    if (this.formulario.valid) {
      if (this.modoEdicionComentario && this.comentarioAEditar) {
        // En modo edición, encontrar y actualizar el comentario
        const index = this.comentarios.findIndex(c => c.id === this.comentarioAEditar.id);
        if (index > -1) {
          // Mantener el ID original del comentario
          this.comentarios[index] = { ...this.formulario.value, id: this.comentarioAEditar.id };
          Swal.fire('Actualizado', 'El comentario ha sido actualizado.', 'success');
        }
        this.modoEdicionComentario = false;
        this.comentarioAEditar = null;
      } else {
        // No en modo edición, agregar un nuevo comentario
        const newId = this.comentarios.length > 0 ? Math.max(...this.comentarios.map(c => c.id)) + 1 : 1;
        this.comentarios.push({ ...this.formulario.value, id: newId });
        Swal.fire('Enviado', 'Tu comentario ha sido enviado con éxito.', 'success');
      }
      this.formulario.reset();
      // Resetear los checkboxes manualmente ya que form.reset() no siempre lo hace bien con formGroups anidados
      this.formulario.get('feedback')?.patchValue({
        facilidadNavegar: false,
        buenaPresentacion: false,
        facilEntender: false,
        estructuraUtilizada: false,
      });
      console.log('Comentarios actuales:', this.comentarios);
    } else {
      Swal.fire('Error', 'Por favor, completa todos los campos requeridos y asegúrate de que el mensaje tenga al menos 10 caracteres.', 'error');
    }
  }

  editarComentario(comentario: any) {
    this.modoEdicionComentario = true;
    this.comentarioAEditar = comentario;
    // Rellenar el formulario reactivo con los datos del comentario
    this.formulario.patchValue({
      nombre: comentario.nombre,
      email: comentario.email,
      feedback: {
        facilidadNavegar: comentario.feedback?.facilidadNavegar || false,
        buenaPresentacion: comentario.feedback?.buenaPresentacion || false,
        facilEntender: comentario.feedback?.facilEntender || false,
        estructuraUtilizada: comentario.feedback?.estructuraUtilizada || false,
      },
      servicio: comentario.servicio,
      mensaje: comentario.mensaje,
      fechaCita: comentario.fechaCita ? new Date(comentario.fechaCita) : null, // Convertir a Date
    });
  }

  eliminarComentario(comentario: any) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, borrarlo!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.comentarios = this.comentarios.filter(com => com.id !== comentario.id);
        Swal.fire('Borrado!', 'El comentario ha sido eliminado.', 'success');
        // Si el comentario eliminado era el que se estaba editando, resetear el formulario
        if (this.comentarioAEditar && this.comentarioAEditar.id === comentario.id) {
          this.modoEdicionComentario = false;
          this.comentarioAEditar = null;
          this.formulario.reset();
          this.formulario.get('feedback')?.patchValue({
            facilidadNavegar: false,
            buenaPresentacion: false,
            facilEntender: false,
            estructuraUtilizada: false,
          });
        }
      }
    });
  }

  // Se mantiene como una función auxiliar si la necesitas,
  // pero ya no está directamente vinculada al flujo de QR.
  linkGoogleAccount() {
    Swal.fire('Funcionalidad', 'Esto vincularía tu cuenta de Google.', 'info');
    console.log('Vinculando cuenta de Google');
  }
}