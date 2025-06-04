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

export interface UsuarioIngresar {
  nombre: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-ingresar-usuario',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './ingresar-usuario.component.html',
  styleUrls: ['./ingresar-usuario.component.css']
})
export class IngresarUsuarioComponent implements OnInit, OnDestroy {
  form = new FormGroup({
    nombre: new FormControl('', [
      Validators.required,
      Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\\s]*$')
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8)
    ]),
    passwordRepeted: new FormControl('', [
      Validators.required,
      Validators.minLength(8)
    ])
  }, { validators: [IngresarUsuarioComponent.passwordsMatchValidator] });

  constructor(private usuariosService: IngresarUsuarioService) {}

  static passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const repeated = group.get('passwordRepeted')?.value;
    return password === repeated ? null : { passwordsMismatch: true };
  }

  async onSubmit() {
    if (this.form.valid) {
      try {
        const usuario: UsuarioIngresar = {
          nombre: this.form.get('nombre')?.value ?? '',
          email: this.form.get('email')?.value ?? '',
          password: this.form.get('password')?.value ?? ''
        };

        await this.usuariosService.registrarUsuario(usuario);

        this.form.reset();
        Swal.fire('¡Registro exitoso!', 'Usuario registrado correctamente.', 'success');
      } catch (error: any) {
        console.error(error);
        Swal.fire('Error', error.message || 'Error al registrar usuario.', 'error');
      }
    } else {
      Swal.fire('Formulario inválido', 'Revisa los datos del formulario.', 'warning');
    }
  }

  ngOnInit() {
    document.body.classList.add('usuarios-background');
  }

  ngOnDestroy() {
    document.body.classList.remove('usuarios-background');
  }

  // Getters útiles en el template
  get nombre() { return this.form.get('nombre'); }
  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password'); }
  get passwordRepeted() { return this.form.get('passwordRepeted'); }
}


// import { CommonModule } from '@angular/common';
// import { Component, OnDestroy, OnInit } from '@angular/core';
// import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators, AbstractControl } from '@angular/forms';
// import Swal from 'sweetalert2';
// import { IngresarUsuarioService } from '../servicios/ingresar-usuario.service';

// export interface UsuarioIngresar {
//   nombre: string;
//   email: string;
//   password: string;
// }

// @Component({
//   selector: 'app-ingresar-usuario',
//   standalone: true,
//   imports: [ReactiveFormsModule, CommonModule],
//   templateUrl: './ingresar-usuario.component.html',
//   styleUrl: './ingresar-usuario.component.css',
// })
// export class IngresarUsuarioComponent implements OnInit, OnDestroy {
//   private passwordPattern: RegExp = /^(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9_]{8,}$/;

//   public form = new FormGroup(
//     {
//       nombre: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\\s]*$')]),
//       email: new FormControl('', [Validators.required, Validators.email]),
//       password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(12), Validators.pattern(this.passwordPattern)]),
//       passwordRepeted: new FormControl('', [Validators.required]),
//     },
//     { validators: [IngresarUsuarioComponent.passwordsMatchValidator] }
//   );

//   constructor(private usuariosService: IngresarUsuarioService) { }

//   ngOnInit(): void {
//     document.body.classList.add('usuarios-background');
//   }

//   static passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
//     const password = group.get('password')?.value;
//     const repeated = group.get('passwordRepeted')?.value;
//     return password === repeated ? null : { passwordsMismatch: true };
//   }

//   get nombre() { return this.form.get('nombre'); }
//   get email() { return this.form.get('email'); }
//   get password() { return this.form.get('password'); }
//   get passwordRepeted() { return this.form.get('passwordRepeted'); }


//   /*******************************Encriptacion de la contraseña mediante Cliente en Angular */
//   async onSubmit() {

//     if (this.form.valid) {
//       try {
//         await this.usuariosService.registrarUsuario(this.form.value);
//         this.form.reset();
//         Swal.fire({
//           icon: 'success',
//           title: '¡Registro exitoso!',
//           text: 'El usuario ha sido registrado correctamente.',
//           confirmButtonText: 'Ok',
//         });
//       } catch (error) {
//         Swal.fire({
//           icon: 'error',
//           title: 'Error al registrar',
//           text: 'Ocurrió un problema al guardar los datos.',
//         });
//         console.error(error);
//       }
//     } else {
//       Swal.fire({
//         icon: 'warning',
//         title: 'Formulario inválido',
//         text: 'Revisa los campos antes de enviar.',
//       });
//     }
//   }

//   ngOnDestroy(): void {
//     document.body.classList.remove('usuarios-background');
//   }
// }
