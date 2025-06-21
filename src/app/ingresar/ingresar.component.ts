

/*AUTENTICACION Y RECAPTCHA Y REGISTRO DE ADMIN Y USUARIOS*/
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InicioSesionService } from '../servicios/inicio-sesion.service';
import { Auth, getRedirectResult } from '@angular/fire/auth';
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { collection, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha-angular19';


@Component({
  selector: 'app-ingresar',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, RouterModule,
    MatButtonModule, MatIconModule, ReactiveFormsModule, ReactiveFormsModule,
    RecaptchaModule,
    RecaptchaFormsModule,CommonModule],
  templateUrl: './ingresar.component.html',
  styleUrl: './ingresar.component.css',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IngresarComponent implements OnInit {

  IngresarSesion: FormGroup;
  hide = signal(true);
  credencialesIncorrectas = signal(false);
  isLoggingIn = false;
  auth: Auth;

  siteKey = '6LeJA2ErAAAAAHg_RsMM_MF-aQt3Nfz97H5p8bfk'; 
  captchaValid = signal(false);


  constructor(private firestore: Firestore,private router: Router, private authService: InicioSesionService, auth: Auth) {
    this.auth = auth;
    this.IngresarSesion = new FormGroup({
      password: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
      recaptcha: new FormControl(null, Validators.required),

    });
    
      }
      onCaptchaResolved(token: string | null) {
      if (token) {
        console.log('Captcha token recibido:', token);
        this.IngresarSesion.get('recaptcha')?.setValue(token);
        this.IngresarSesion.get('recaptcha')?.setErrors(null); 
      } else {
        console.warn('Captcha no completado correctamente.');
        this.IngresarSesion.get('recaptcha')?.setErrors({ required: true });
      }
    }
    onSubmit(): void {
      if (this.IngresarSesion.invalid) {
        this.IngresarSesion.markAllAsTouched();
        return;
      }
      this.login();
    }

  ngOnInit(): void {
    getRedirectResult(this.auth)
      .then((result) => {
        if (result?.user) {
          this.router.navigate(['/inicio']);
        }
      })
      .catch(err => {
        Swal.fire('Error', `Error al iniciar sesion google.`, 'error');
      });
  }

  async login() {
    const { email, password } = this.IngresarSesion.value;

    if (!email || !password) {
      Swal.fire('Error', 'Favor de llenar todos los campos', 'error');
      return;
    }

    try {
      this.router.navigate(['/inicio']);
      await this.authService.logIn(email.trim(), password);

    } catch (error: any) {
      if (error.message === 'Usuario no registrado en la base de datos') {
        Swal.fire('Error', 'El correo no está registrado.', 'error');
      } else if (error.code === 'auth/account-exists-with-different-credential' || error.code === 'auth/wrong-password') {
        Swal.fire('Error', 'Correo no vinculado', 'error');
      } else if (error.code === 'auth/user-not-found') {
        Swal.fire('Error', 'No existe esta cuenta con este correo', 'error');
      } else {
        Swal.fire('Error', 'Error al iniciar sesión. Verifica tu correo y contraseña', 'error');
      }
    }
  }
  googleAuth() {
    if (this.isLoggingIn) return;
    this.isLoggingIn = true;

    this.authService.logInGoogle()
      .then((cred) => {
        if (cred?.user) {
          this.router.navigate(['/inicio']);
        } else {
          Swal.fire('Error', 'No se pudo iniciar sesión con Google', 'error');
        }
      })
      .catch((error) => {
        console.error(error);
        Swal.fire('Error', error.message || 'Error al iniciar sesión con Google', 'error');
      })
      .finally(() => {
        this.isLoggingIn = false;
      });
  }
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }



}


// /*AUTENTICACION Y RECAPTCHA*/
// import { MatButtonModule } from '@angular/material/button';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatIconModule } from '@angular/material/icon';
// import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { Router } from '@angular/router';
// import { InicioSesionService } from '../servicios/inicio-sesion.service';
// import { Auth, getRedirectResult } from '@angular/fire/auth';
// import { Component, OnInit, signal } from '@angular/core';
// import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
// import { CommonModule } from '@angular/common';
// import Swal from 'sweetalert2';


// @Component({
//   selector: 'app-ingresar',
//   standalone: true,
//   imports: [MatFormFieldModule, MatInputModule, 
//     MatButtonModule, MatIconModule, ReactiveFormsModule, ReactiveFormsModule,
//     RecaptchaModule,
//     RecaptchaFormsModule,CommonModule],
//   templateUrl: './ingresar.component.html',
//   styleUrl: './ingresar.component.css',
//   // changeDetection: ChangeDetectionStrategy.OnPush,
// })
// export class IngresarComponent implements OnInit {

//   IngresarSesion: FormGroup;
//   hide = signal(true);
//   credencialesIncorrectas = signal(false);
//   isLoggingIn = false;
//   auth: Auth;

//   siteKey = '6LeJA2ErAAAAAHg_RsMM_MF-aQt3Nfz97H5p8bfk'; 
//   captchaValid = signal(false);


//   constructor(private router: Router, private authService: InicioSesionService, auth: Auth) {
//     this.auth = auth;
//     this.IngresarSesion = new FormGroup({
//       password: new FormControl('', Validators.required),
//       email: new FormControl('', Validators.required),
//       recaptcha: new FormControl(null, Validators.required),

//     });
    
//       }
//       onCaptchaResolved(token: string | null) {
//       if (token) {
//         console.log('Captcha token recibido:', token);
//         this.IngresarSesion.get('recaptcha')?.setValue(token);
//         this.IngresarSesion.get('recaptcha')?.setErrors(null); 
//       } else {
//         console.warn('Captcha no completado correctamente.');
//         this.IngresarSesion.get('recaptcha')?.setErrors({ required: true });
//       }
//     }
//     onSubmit(): void {
//       if (this.IngresarSesion.invalid) {
//         this.IngresarSesion.markAllAsTouched();
//         return;
//       }
//       this.login();
//     }

//   ngOnInit(): void {
//     getRedirectResult(this.auth)
//       .then((result) => {
//         if (result?.user) {
//           console.log('Usuario autenticado por redirect:', result.user);
//           this.router.navigate(['/menu']);
//           Swal.fire('Error', `INICIO`, 'error');
        
//         }
//       })
//       .catch(err => {
//         console.error('Error en redirect login:', err);
//         Swal.fire('Error', `Error al iniciar sesion google.`, 'error');
//       });
//   }

//   login() {
//     const { email, password } = this.IngresarSesion.value;

//     if (!email || !password) {
//      Swal.fire('Error', `Fabor de llenar todos los campos`, 'error');
//       return;
//     }
//     this.authService.logIn(email.trim(), password)
//       .then(() => {
//         this.router.navigate(['/menu']);
//       })
//       .catch((error) => {
//         if (error.message === 'Usuario no registrado en la base de datos') {
//           Swal.fire('Error', `El correo no esta registrado.`, 'error');
//         } else if (error.code === 'auth/account-exists-with-different-credential' || error.code === 'auth/wrong-password') {
//           Swal.fire('Error', `Correo no vinculado`, 'error');
//         } else if (error.code === 'auth/user-not-found') {
//           Swal.fire('Error', `No existe esta cuenta con este correo`, 'error');
//         } else {
//         //  Swal.fire('Error', `Error al iniciar sesión:  ${error.message}`, 'error');
//           Swal.fire('Error', `Error al iniciar sesión. Verifica tu correo y contraseña`, 'error');

//         }
//       });
      
//   }


//   googleAuth() {
//     if (this.isLoggingIn) return;
//     this.isLoggingIn = true;

//     this.authService.logInGoogle()
//       .catch((error) => {
//         console.error(error);
//       })
//       .finally(() => {
//         this.isLoggingIn = false;
//       });
//   }

//   clickEvent(event: MouseEvent) {
//     this.hide.set(!this.hide());
//     event.stopPropagation();
//   }
//   /* */
// }


