import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { IngresarUsuarioService } from '../servicios/ingresar-usuario.service';
import Swal from 'sweetalert2';
import { Auth, signOut } from '@angular/fire/auth';

export interface UsuarioIngresar {
  nombre: string;
  username: string;
  email: string;
  password: string;
  userType?: 'usuario' | 'administrador';
  lowercaseUsername?: string;
}

@Component({
  selector: 'app-usurio-nuevo',
  standalone:true,
  imports: [ReactiveFormsModule,
    CommonModule, RouterModule, NgxSpinnerModule,RouterModule],
  templateUrl: './usurio-nuevo.component.html',
  styleUrl: './usurio-nuevo.component.css'
})
export class UsurioNuevoComponent implements OnInit, OnDestroy {
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
      Validators.pattern('^(?=.*[A-Z])(?=.*\\d)[a-zA-Z0-9_]+$')
    ]),
    passwordRepeted: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(12),
      Validators.pattern('^(?=.*[A-Z])(?=.*\\d)[a-zA-Z0-9_]+$')
    ]),
    userType: new FormControl('usuario', [Validators.required]),
  }, 
  { validators: [UsurioNuevoComponent.passwordsMatchValidator] });

  constructor(private usuariosService: IngresarUsuarioService, public loading: NgxSpinnerService,  private router: Router,  private auth: Auth

  ) { }
  
  static passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const repeated = group.get('passwordRepeted')?.value;
    return password === repeated ? null : { passwordsMismatch: true };
  }
  ngOnInit() {
    document.body.classList.add('usuarios-background');
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
          Swal.fire('Error',' El nombre de usuario seleccionado ya está en uso. Por favor, elige otro.', 'error');
          this.loading.hide();
          return;
        }

        const usuario: UsuarioIngresar = {
          nombre: this.form.get('nombre')?.value ?? '',
          username: username,
          email: this.form.get('email')?.value ?? '',
          password: this.form.get('password')?.value ?? '',
          userType: this.form.get('userType')?.value as 'usuario' | 'administrador',
          lowercaseUsername: username.toLowerCase()
        };
        console.log('Tipo de usuario:', this.userType); 
        await this.usuariosService.registrarUsuario(usuario);
        await signOut(this.auth);
        this.form.reset();
        Swal.fire('¡Registro exitoso!', 'Usuario registrado correctamente.', 'success');
        this.loading.hide();
      } catch (error: any) {
        console.error(error);
        Swal.fire('Error', error.message || 'Error al registrar usuario.', 'error');
        this.loading.hide();
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

}
