import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InicioSesionService } from '../servicios/inicio-sesion.service';
import { getRedirectResult, RecaptchaVerifier, signInWithPhoneNumber, getAuth } from '@angular/fire/auth'; // Eliminado 'Auth' y 'PhoneAuthProvider' si no se usan directamente como tipos en este archivo
import { Component, OnInit, signal, NgZone, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
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
    RecaptchaFormsModule, CommonModule],
  templateUrl: './ingresar.component.html',
  styleUrl: './ingresar.component.css',
})
export class IngresarComponent implements OnInit, AfterViewInit {

  IngresarSesion: FormGroup;
  hide = signal(true);
  credencialesIncorrectas = signal(false);
  isLoggingIn = false;
 

  siteKey = '6LeJA2ErAAAAAHg_RsMM_MF-aQt3Nfz97H5p8bfk';
  captchaValid = signal(false);

 
  @ViewChild('recaptchaContainer') recaptchaContainer!: ElementRef;
  recaptchaVerifier: RecaptchaVerifier | undefined;
  confirmationResult: any;
  showCodeInput = signal(false);
  isLoadingSms = signal(false);
  
  
  PhoneAuthForm: FormGroup;


  constructor(
    private firestore: Firestore,
    private router: Router,
    private authService: InicioSesionService,
   
    private ngZone: NgZone
  ) {
   
    this.IngresarSesion = new FormGroup({
      password: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      recaptcha: new FormControl(null, Validators.required),
    });

    this.PhoneAuthForm = new FormGroup({
      phoneNumber: new FormControl('', [Validators.required, Validators.pattern(/^\+\d{10,15}$/)]),
      verificationCode: new FormControl('', Validators.required)
    });
  }

  onCaptchaResolved(token: string | null) {
    if (token) {
      console.log('Captcha token recibido:', token);
      this.IngresarSesion.get('recaptcha')?.setValue(token);
      this.IngresarSesion.get('recaptcha')?.setErrors(null);
      this.captchaValid.set(true);
    } else {
      console.warn('Captcha no completado correctamente.');
      this.IngresarSesion.get('recaptcha')?.setErrors({ required: true });
      this.captchaValid.set(false);
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
    // Usar getAuth() directamente para el resultado de redirección
    getRedirectResult(getAuth()) 
      .then((result) => {
        if (result?.user) {
          this.router.navigate(['/inicio']);
        }
      })
      .catch(err => {
        Swal.fire('Error', `Error al iniciar sesion google: ${err.message}`, 'error');
      });
  }

  ngAfterViewInit(): void {
    if (this.recaptchaContainer && this.recaptchaContainer.nativeElement) {
      this.ngZone.runOutsideAngular(() => {
          // Obtener la instancia de Auth directamente aquí
          const firebaseAuth = getAuth(); 
          this.recaptchaVerifier = new RecaptchaVerifier(this.recaptchaContainer.nativeElement, {
            'size': 'invisible', 
            'callback': (response: any) => {
              console.log('Firebase reCAPTCHA resolved:', response);
            },
            'expired-callback': () => {
              console.log('Firebase reCAPTCHA expired.');
            }
          } as any, // Se mantiene 'as any' para evitar el error de tipo con 'size'
          firebaseAuth // Pasar la instancia obtenida de getAuth()
          );
          // Opcional: renderizar el reCAPTCHA si fuera visible
          // this.recaptchaVerifier.render().then((widgetId) => {
          //   console.log('reCAPTCHA renderizado con ID:', widgetId);
          // });
      });
    } else {
      console.error('Error: recaptchaContainer no está disponible en ngAfterViewInit.');
    }
  }

  async login() {
    const { email, password } = this.IngresarSesion.value;

    if (!email || !password) {
      Swal.fire('Error', 'Favor de llenar todos los campos', 'error');
      return;
    }

    try {
      await this.authService.logIn(email.trim(), password);
      Swal.fire('Éxito', 'Inicio de sesión con correo exitoso!', 'success');
      this.router.navigate(['/inicio']);
    } catch (error: any) {
      if (error.message === 'Usuario no registrado en la base de datos') {
        Swal.fire('Error', 'El correo no está registrado.', 'error');
      } else if (error.message === 'Cuenta bloqueada por múltiples intentos fallidos.' || error.message.includes('bloqueada')) {
        Swal.fire('Cuenta bloqueada', 'Has excedido los intentos permitidos. Debes restablecer tu contraseña.', 'error');
      } else if (error.message === 'Correo no vinculado o contraseña incorrecta') {
        Swal.fire('Error', 'Correo no vinculado o contraseña incorrecta', 'error');
      } else {
        Swal.fire('Error', `Error al iniciar sesión: ${error.message}`, 'error');
      }
    }
    this.IngresarSesion.reset();
    this.captchaValid.set(false);
  }

  googleAuth() {
    if (this.isLoggingIn) return;
    this.isLoggingIn = true;

    this.authService.logInGoogle()
      .then((cred) => {
        if (cred?.user) {
          this.router.navigate(['/inicio']);
          Swal.fire('Éxito', 'Inicio de sesión con Google exitoso!', 'success');
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

  async sendCode() {
    if (this.PhoneAuthForm.get('phoneNumber')?.invalid) {
      this.PhoneAuthForm.get('phoneNumber')?.markAsTouched();
      Swal.fire('Error', 'Por favor, introduce un número de teléfono válido (ej: +521234567890).', 'error');
      return;
    }

    const phoneNumber = this.PhoneAuthForm.get('phoneNumber')?.value;
    this.isLoadingSms.set(true);

    try {
      if (!this.recaptchaVerifier) {
        throw new Error("Recaptcha Verifier no inicializado. Asegúrate de que el contenedor reCAPTCHA esté presente y visible.");
      }
      this.confirmationResult = await this.authService.sendPhoneNumberVerification(phoneNumber, this.recaptchaVerifier);
      this.showCodeInput.set(true);
      Swal.fire('Código Enviado', `Se ha enviado un código de verificación a ${phoneNumber}.`, 'success');
    } catch (error: any) {
      console.error('Error al enviar código SMS:', error);
      Swal.fire('Error', `No se pudo enviar el código: ${error.message}`, 'error');
    } finally {
      this.isLoadingSms.set(false);
    }
  }

  async verifyCode() {
    if (!this.confirmationResult) {
      Swal.fire('Error', 'Primero debes enviar un código de verificación.', 'error');
      return;
    }

    if (this.PhoneAuthForm.get('verificationCode')?.invalid) {
      this.PhoneAuthForm.get('verificationCode')?.markAsTouched();
      Swal.fire('Error', 'Por favor, introduce el código de 6 dígitos.', 'error');
      return;
    }

    const verificationCode = this.PhoneAuthForm.get('verificationCode')?.value;

    try {
      await this.authService.confirmPhoneNumberVerification(this.confirmationResult, verificationCode);
      Swal.fire('Éxito', 'Inicio de sesión con teléfono exitoso!', 'success');
      this.router.navigate(['/inicio']);
    } catch (error: any) {
      console.error('Error al verificar código SMS:', error);
      Swal.fire('Error', `Código de verificación incorrecto o expirado: ${error.message}`, 'error');
    }
    this.PhoneAuthForm.reset();
    this.showCodeInput.set(false);
  }
}

/*AUTENTICACION Y RECAPTCHA Y REGISTRO DE ADMIN Y USUARIOS*/
// import { MatButtonModule } from '@angular/material/button';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatIconModule } from '@angular/material/icon';
// import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { Router, RouterModule } from '@angular/router';
// import { InicioSesionService } from '../servicios/inicio-sesion.service';
// import { Auth, getRedirectResult } from '@angular/fire/auth';
// import { Component, OnInit, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import Swal from 'sweetalert2';
// import { collection, Firestore, getDocs, query, where } from '@angular/fire/firestore';
// import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha-angular19';


// @Component({
//   selector: 'app-ingresar',
//   standalone: true,
//   imports: [MatFormFieldModule, MatInputModule, RouterModule,
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


//   constructor(private firestore: Firestore,private router: Router, private authService: InicioSesionService, auth: Auth) {
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
//           this.router.navigate(['/inicio']);
//         }
//       })
//       .catch(err => {
//         Swal.fire('Error', `Error al iniciar sesion google.`, 'error');
//       });
//   }

//   // async login() {
//   //   const { email, password } = this.IngresarSesion.value;

//   //   if (!email || !password) {
//   //     Swal.fire('Error', 'Favor de llenar todos los campos', 'error');
//   //     return;
//   //   }

//   //   try {
//   //     this.router.navigate(['/inicio']);
//   //     await this.authService.logIn(email.trim(), password);

//   //   } catch (error: any) {
//   //     if (error.message === 'Usuario no registrado en la base de datos') {
//   //       Swal.fire('Error', 'El correo no está registrado.', 'error');
//   //     } else if (error.code === 'auth/account-exists-with-different-credential' || error.code === 'auth/wrong-password') {
//   //       Swal.fire('Error', 'Correo no vinculado', 'error');
//   //     } else if (error.code === 'auth/user-not-found') {
//   //       Swal.fire('Error', 'No existe esta cuenta con este correo', 'error');
//   //     } else {
//   //       Swal.fire('Error', 'Error al iniciar sesión. Verifica tu correo y contraseña', 'error');
//   //     }
//   //   }
//   // }
//   async login() {
//   const { email, password } = this.IngresarSesion.value;

//   if (!email || !password) {
//     Swal.fire('Error', 'Favor de llenar todos los campos', 'error');
//     return;
//   }

//   try {
//     await this.authService.logIn(email.trim(), password);
//     this.router.navigate(['/inicio']); 
//   } catch (error: any) {
//     if (error.message === 'Usuario no registrado en la base de datos') {
//       Swal.fire('Error', 'El correo no está registrado.', 'error');
//     } else if (error.message === 'Cuenta bloqueada por múltiples intentos fallidos.' || error.message.includes('bloqueada')) {
//       Swal.fire('Cuenta bloqueada', 'Has excedido los intentos permitidos. Debes restablecer tu contraseña.', 'error');
//     } else if (error.code === 'auth/account-exists-with-different-credential' || error.code === 'auth/wrong-password') {
//       Swal.fire('Error', 'Correo no vinculado o contraseña incorrecta', 'error');
//     } else if (error.code === 'auth/user-not-found') {
//       Swal.fire('Error', 'No existe esta cuenta con este correo', 'error');
//     } else {
//       Swal.fire('Error', 'Error al iniciar sesión. Verifica tu correo y contraseña', 'error');
//     }
//   }
//   this.IngresarSesion.reset();
//     this.captchaValid.set(false);
// }

//   googleAuth() {
//     if (this.isLoggingIn) return;
//     this.isLoggingIn = true;

//     this.authService.logInGoogle()
//       .then((cred) => {
//         if (cred?.user) {
//           this.router.navigate(['/inicio']);
//         } else {
//           Swal.fire('Error', 'No se pudo iniciar sesión con Google', 'error');
//         }
//       })
//       .catch((error) => {
//         console.error(error);
//         Swal.fire('Error', error.message || 'Error al iniciar sesión con Google', 'error');
//       })
//       .finally(() => {
//         this.isLoggingIn = false;
//       });
//   }
//   clickEvent(event: MouseEvent) {
//     this.hide.set(!this.hide());
//     event.stopPropagation();
//   }



// }


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


