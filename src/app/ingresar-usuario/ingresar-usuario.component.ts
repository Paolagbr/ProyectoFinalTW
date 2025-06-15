
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule
} from '@angular/forms';
import Swal from 'sweetalert2';
import { IngresarUsuarioService } from '../servicios/ingresar-usuario.service';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

export interface UsuarioIngresar {
  nombre: string;
  username: string;
  email: string;
  password: string;
  userType?: 'usuario' | 'administrador';
  adminKey?: string;
  lowercaseUsername?: string;
}

@Component({
  selector: 'app-ingresar-usuario',
  standalone: true,
  imports: [ReactiveFormsModule,
    CommonModule, BrowserAnimationsModule,
    NgxSpinnerModule],
  templateUrl: './ingresar-usuario.component.html',
  styleUrls: ['./ingresar-usuario.component.css']
})
export class IngresarUsuarioComponent implements OnInit, OnDestroy {
  form = new FormGroup({
    nombre: new FormControl('', [
      Validators.required,
      Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\\s]*$')
    ]),
    username: new FormControl('', [Validators.required, Validators.maxLength(8)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(12),
      Validators.pattern('^(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d_]+$')
    ]),
    passwordRepeted: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(12),
      Validators.pattern('^(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d_]+$')
    ]),
    userType: new FormControl('usuario', [Validators.required]),
    adminKey: new FormControl('')
  }, { validators: [IngresarUsuarioComponent.passwordsMatchValidator] });

  constructor(private usuariosService: IngresarUsuarioService, public loading: NgxSpinnerService

  ) { }

  static passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const repeated = group.get('passwordRepeted')?.value;
    return password === repeated ? null : { passwordsMismatch: true };
  }

  ngOnInit() {
    document.body.classList.add('usuarios-background');

    this.form.get('userType')?.valueChanges.subscribe(userType => {
      const adminKeyControl = this.form.get('adminKey');
      if (userType === 'administrador') {
        adminKeyControl?.setValidators([
          Validators.required,

        ]);
      } else {
        adminKeyControl?.clearValidators();
        adminKeyControl?.setValue('');
      }
      adminKeyControl?.updateValueAndValidity();
    });
  }

  ngOnDestroy() {
    document.body.classList.remove('usuarios-background');
  }

  async onSubmit() {
    this.form.markAllAsTouched();
    this.loading.show();//Activar

    if (this.form.valid) {
      try {
        const username = this.form.get('username')?.value;

        if (!username) {
          Swal.fire('Error', 'El nombre de usuario es requerido.', 'error');
          this.loading.hide();//detener
          return;
        }


        const usernameTomado = await this.usuariosService.isUsernameTaken(username);
        if (usernameTomado) {
          Swal.fire('Error', `El nombre de usuario '${username}' ya está en uso. Por favor, elige otro.`, 'error');
          this.loading.hide();
          return;
        }

        const usuario: UsuarioIngresar = {
          nombre: this.form.get('nombre')?.value ?? '',
          username: username,
          email: this.form.get('email')?.value ?? '',
          password: this.form.get('password')?.value ?? '',
          userType: this.form.get('userType')?.value as 'usuario' | 'administrador',
          adminKey: this.form.get('adminKey')?.value ?? '',
          lowercaseUsername: username.toLowerCase()
        };
        await this.usuariosService.registrarUsuario(usuario);

        this.form.reset();
        Swal.fire('¡Registro exitoso!', 'Usuario registrado correctamente.', 'success');
      } catch (error: any) {
        console.error(error);
        Swal.fire('Error', error.message || 'Error al registrar usuario.', 'error');
      } finally {
        this.loading.hide();
        
      }
    } else {
      Swal.fire('Formulario inválido', 'Revisa los datos del formulario.', 'warning');
    }
  }


  get nombre() { return this.form.get('nombre'); }
  get username() { return this.form.get('username'); }
  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password'); }
  get passwordRepeted() { return this.form.get('passwordRepeted'); }
  get userType() { return this.form.get('userType'); }
  get adminKey() { return this.form.get('adminKey'); }
}

