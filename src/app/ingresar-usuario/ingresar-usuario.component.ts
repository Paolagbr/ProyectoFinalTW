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
  username: string;
  email: string;
  password: string;
  userType?: 'usuario' | 'administrador';
  adminKey?: string;
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
    username: new FormControl('', [Validators.required, Validators.maxLength(8)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6), 
      Validators.maxLength(8)  
    ]),
    passwordRepeted: new FormControl('', [
      Validators.required,
      Validators.minLength(6), 
      Validators.maxLength(8)  
    ]),
    userType: new FormControl('usuario', [Validators.required]), 
    adminKey: new FormControl('') 
  }, { validators: [IngresarUsuarioComponent.passwordsMatchValidator] });

  private readonly ADMIN_SECRET_KEY = 'MICLAVEADMIN123'; 

  constructor(private usuariosService: IngresarUsuarioService) {}

  static passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const repeated = group.get('passwordRepeted')?.value;
    return password === repeated ? null : { passwordsMismatch: true };
  }

  ngOnInit() {
    document.body.classList.add('usuarios-background');

    // Suscribirse a los cambios de 'userType'
    this.form.get('userType')?.valueChanges.subscribe(userType => {
      const adminKeyControl = this.form.get('adminKey');
      if (userType === 'administrador') {
        adminKeyControl?.setValidators([
          Validators.required,
          // Validador personalizado para la clave de administrador
          // Puedes usar un Validators.pattern si la clave tiene un formato específico
          Validators.pattern(this.ADMIN_SECRET_KEY) // Aquí validamos que sea la clave secreta
        ]);
      } else {
        adminKeyControl?.clearValidators(); // Limpiar validadores si no es administrador
        adminKeyControl?.setValue('');      // Limpiar el valor si no es administrador
      }
      adminKeyControl?.updateValueAndValidity(); // Recalcular la validez del control
    });
  }

  ngOnDestroy() {
    document.body.classList.remove('usuarios-background');
  }

  async onSubmit() {
    // Marcar todos los controles como 'touched' para mostrar los errores de validación
    this.form.markAllAsTouched();

    if (this.form.valid) {
      try {
        const usuario: UsuarioIngresar = {
          nombre: this.form.get('nombre')?.value ?? '',
          username: this.form.get('username')?.value ?? '',
          email: this.form.get('email')?.value ?? '',
          password: this.form.get('password')?.value ?? '',
          userType: this.form.get('userType')?.value as 'usuario' | 'administrador',
          adminKey: this.form.get('adminKey')?.value ?? ''
        };

        // Si es administrador y la clave no es la correcta, mostrar un error
        if (usuario.userType === 'administrador' && usuario.adminKey !== this.ADMIN_SECRET_KEY) {
          Swal.fire('Error', 'La clave de administrador es incorrecta.', 'error');
          return; // Detener el envío del formulario
        }

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

  // Getters útiles en el template
  get nombre() { return this.form.get('nombre'); }
  get username() { return this.form.get('username'); }
  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password'); }
  get passwordRepeted() { return this.form.get('passwordRepeted'); }
  get userType() { return this.form.get('userType'); } // Nuevo getter
  get adminKey() { return this.form.get('adminKey'); } // Nuevo getter
}


// import { Component, OnDestroy, OnInit } from '@angular/core';
// import {
//   FormControl,
//   FormGroup,
//   Validators,
//   AbstractControl,
//   ValidationErrors,
//   ReactiveFormsModule
// } from '@angular/forms';
// import Swal from 'sweetalert2';
// import { IngresarUsuarioService } from '../servicios/ingresar-usuario.service';
// import { CommonModule } from '@angular/common';

// export interface UsuarioIngresar {
//   nombre: string;
//   username:string;
//   email: string;
//   password: string;
// }

// @Component({
//   selector: 'app-ingresar-usuario',
//   standalone: true,
//   imports: [ReactiveFormsModule, CommonModule],
//   templateUrl: './ingresar-usuario.component.html',
//   styleUrls: ['./ingresar-usuario.component.css']
// })
// export class IngresarUsuarioComponent implements OnInit, OnDestroy {
//   form = new FormGroup({
//     nombre: new FormControl('', [
//       Validators.required,
//       Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\\s]*$')
//     ]),
//     username: new FormControl('', [Validators.required,Validators.maxLength(8)]),
//     email: new FormControl('', [Validators.required, Validators.email]),
//     password: new FormControl('', [
//       Validators.required,
//       Validators.minLength(6),
//        Validators.maxLength(8)
//     ]),
//     passwordRepeted: new FormControl('', [
//       Validators.required,
//       Validators.minLength(6),
//        Validators.maxLength(8)
//     ])
//   }, { validators: [IngresarUsuarioComponent.passwordsMatchValidator] });

//   constructor(private usuariosService: IngresarUsuarioService) {}

//   static passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
//     const password = group.get('password')?.value;
//     const repeated = group.get('passwordRepeted')?.value;
//     return password === repeated ? null : { passwordsMismatch: true };
//   }

//   async onSubmit() {
//     if (this.form.valid) {
//       try {
//         const usuario: UsuarioIngresar = {
//           nombre: this.form.get('nombre')?.value ?? '',
//           username: this.form.get('username')?.value ?? '',
//           email: this.form.get('email')?.value ?? '',
//           password: this.form.get('password')?.value ?? ''
//         };

//         await this.usuariosService.registrarUsuario(usuario);

//         this.form.reset();
//         Swal.fire('¡Registro exitoso!', 'Usuario registrado correctamente.', 'success');
//       } catch (error: any) {
//         console.error(error);
//         Swal.fire('Error', error.message || 'Error al registrar usuario.', 'error');
//       }
//     } else {
//       Swal.fire('Formulario inválido', 'Revisa los datos del formulario.', 'warning');
//     }
//   }

//   ngOnInit() {
//     document.body.classList.add('usuarios-background');
//   }

//   ngOnDestroy() {
//     document.body.classList.remove('usuarios-background');
//   }

//   // Getters útiles en el template
//   get nombre() { return this.form.get('nombre'); }
//    get username() { return this.form.get('username'); }
//   get email() { return this.form.get('email'); }
//   get password() { return this.form.get('password'); }
//   get passwordRepeted() { return this.form.get('passwordRepeted'); }
// }


