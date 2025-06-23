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
    name: '',
    grupo: 0,
    sexo: '',
    fechaCita: null,
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
  formulario: FormGroup;
  comentarios: any[] = [];
  modoEdicion = false;

  // QR
  qrCode!: QRCodeStyling;
  citaData: CitaQRData | null = null;
  loading = false;
  error = '';
  userEmail = '';

  constructor(
    private fb: FormBuilder,
    private qrApiService: QrApiService,
    private authService: InicioSesionService
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
      fechaCita: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe((user: User | null) => {
      if (user?.email) {
        this.userEmail = user.email;
        this.generarQR();
      }
    });
  }

  ngAfterViewInit(): void {
    this.initQRInstance(); // Inicializa la instancia vacía para usar después
  }

  initQRInstance() {
    this.qrCode = new QRCodeStyling({
      width: 300,
      height: 300,
      type: 'canvas',
      data: 'Cargando...',
      dotsOptions: { color: '#000', type: 'rounded' },
      backgroundOptions: { color: '#fff' },
    });

    if (this.qrContainer?.nativeElement) {
      this.qrCode.append(this.qrContainer.nativeElement);
    }
  }

  async generarQR() {
    if (!this.userEmail) {
      this.error = 'Usuario no autenticado';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
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

        this.qrCode.update({ data: qrContent });
      }
    } catch (error: any) {
      console.error('Error al generar QR:', error);
      this.error = error.error?.error || 'Error al generar código QR';
    } finally {
      this.loading = false;
    }
  }

  regenerarQR() {
    this.generarQR();
  }

  descargarQR() {
    this.qrCode.download({
      name: `cita-qr-${this.citaData?.codigoConfirmacion || 'descarga'}`,
      extension: 'png',
    });
  }

  guardarCita() {
    if (
      this.userINFO.name &&
      this.userINFO.grupo &&
      this.userINFO.sexo &&
      this.userINFO.fechaCita &&
      this.userINFO.hora
    ) {
      this.listaCitas.push({ ...this.userINFO });
      console.log('Cita guardada:', this.userINFO);
      this.userINFO = { name: '', grupo: 0, sexo: '', fechaCita: null, hora: '' };
    }
  }

  editarUsuario(usuario: any) {
    console.log('Editando usuario:', usuario);
  }

  eliminarUsuario(usuario: any) {
    const index = this.listaCitas.indexOf(usuario);
    if (index > -1) this.listaCitas.splice(index, 1);
  }

  getNomServicio(grupoId: number): string {
    const grupo = this.grupos.find((g) => g.id === grupoId);
    return grupo ? grupo.nomServicio : 'Servicio no encontrado';
  }

  myFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    return day !== 0 && day !== 6;
  };

  enviarComentario() {
    if (this.formulario.valid) {
      this.comentarios.push({ ...this.formulario.value, i: Date.now() });
      this.formulario.reset();
      console.log('Comentario enviado');
    }
  }

  editarComentario(comentario: any) {
    console.log('Editando comentario:', comentario);
  }

  eliminarComentario(comentario: any) {
    const index = this.comentarios.indexOf(comentario);
    if (index > -1) this.comentarios.splice(index, 1);
  }

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

  linkGoogleAccount() {
    console.log('Vinculando cuenta de Google');
  }
}
