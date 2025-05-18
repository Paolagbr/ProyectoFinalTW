import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InicioSesionService } from '../servicios/inicio-sesion.service';

interface AdminCredential {
  nombre: string;
  username: string;
  password?: string; 
}

@Component({
  selector: 'app-ingresar',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, ReactiveFormsModule],
  templateUrl: './ingresar.component.html',
  styleUrl: './ingresar.component.css',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IngresarComponent {
  readonly admin = [
    { nombre: 'Paola Becerra', username: 'PaoB', password: 'pao123.' },
    { nombre: 'Edith Garcia', username: 'EdyG', password: 'edgl658' },
    { nombre: 'Alondra Ibarra', username: 'AloI', password: 'aloib25' },

  ];


  IngresarSesion: FormGroup;
  hide = signal(true);//visibilidad de la contraseña
 credencialesIncorrectas=signal(false);


  constructor(private router: Router,  private authService: InicioSesionService) {
    this.IngresarSesion = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });
  }
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  onSubmit() {
    console.log('onSubmit ejecutado');
    this.credencialesIncorrectas.set(false);
    if (this.IngresarSesion.valid) {
      console.log('Formulario válido:', this.IngresarSesion.value);
      const nom = this.IngresarSesion.get('username')?.value;
      const password = this.IngresarSesion.get('password')?.value;

      const user = this.admin.find(
        (u) => (u.username === nom || u.nombre === nom) && u.password === password
      );

      if (user) {
        console.log('¡Inicio de sesión exitoso!', user);
         this.authService.loginSuccess(user);
        this.router.navigate(['/menu']);
      } else {
        console.log('Credenciales inválidas detectadas');
        this.credencialesIncorrectas.set(true);
      }
    } else {
      console.log('Formulario inválido. Por favor, completa todos los campos.');
    }
  }
}

