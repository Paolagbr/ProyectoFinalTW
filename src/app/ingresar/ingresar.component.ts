

/*Uso de de ngRecaptcha*/
// import { Component, OnInit, signal, NgZone, ElementRef, ViewChild, OnDestroy } from '@angular/core';
// import { MatButtonModule } from '@angular/material/button';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatIconModule } from '@angular/material/icon';
// import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { Router } from '@angular/router';
// import { InicioSesionService } from '../servicios/inicio-sesion.service';
// import { Auth, getRedirectResult } from '@angular/fire/auth';
// import { CommonModule } from '@angular/common';
// import Swal from 'sweetalert2';

// @Component({
//   selector: 'app-ingresar',
//   standalone: true,
//   imports: [
//     MatFormFieldModule,
//     MatInputModule,
//     MatButtonModule,
//     MatIconModule,
//     ReactiveFormsModule,
//     CommonModule,
//   ],
//   templateUrl: './ingresar.component.html',
//   styleUrls: ['./ingresar.component.css'],
// })
// export class IngresarComponent implements OnInit, OnDestroy{

//   IngresarSesion: FormGroup;
//   hide = signal(true);
//   credencialesIncorrectas = signal(false);
//   isLoggingIn = false;
//   auth: Auth;

//   siteKey = '6LeJA2ErAAAAAHg_RsMM_MF-aQt3Nfz97H5p8bfk';  
//   captchaValid = signal(false);
//   captchaWidgetId: any;
//   @ViewChild('captchaContainer', { static: false }) captchaContainer!: ElementRef;
 
 
//   constructor(private router: Router, private authService: InicioSesionService, auth: Auth, private ngZone: NgZone) {
//     this.auth = auth;
//     this.IngresarSesion = new FormGroup({
//       email: new FormControl('', [Validators.required, Validators.email]),
//       password: new FormControl('', Validators.required),
//       recaptcha: new FormControl(null, Validators.required),
//     });
//   }

//   ngOnInit(): void {
//     // Definir funciones globales para callbacks de reCAPTCHA v2
//     // (window as any).onCaptchaSuccess = (token: string) => {
//     //   this.ngZone.run(() => {
//     //     this.captchaValid.set(true);
//     //     this.IngresarSesion.get('recaptcha')?.setValue(token);
//     //     this.IngresarSesion.get('recaptcha')?.setErrors(null);
//     //   });
//     // };

//     // (window as any).onCaptchaExpired = () => {
//     //   this.ngZone.run(() => {
//     //     console.log('Captcha expirado');
//     //     this.captchaValid.set(false);
//     //     this.IngresarSesion.get('recaptcha')?.setValue(null);
//     //     this.IngresarSesion.get('recaptcha')?.setErrors({ required: true });
//     //   });
//     // };

//      (window as any).onCaptchaSuccess = (token: string) => {
//         this.ngZone.run(() => {
//           this.IngresarSesion.get('recaptcha')?.setValue(token);
//           this.IngresarSesion.get('recaptcha')?.setErrors(null);
//         });
//       };

//       (window as any).onCaptchaExpired = () => {
//         this.ngZone.run(() => {
//           this.IngresarSesion.get('recaptcha')?.setValue(null);
//           this.IngresarSesion.get('recaptcha')?.setErrors({ required: true });
//         });
//       };

    
//       const checkGrecaptcha = setInterval(() => {
//         if ((window as any).grecaptcha && (window as any).grecaptcha.render) {
//           clearInterval(checkGrecaptcha);
//           this.renderCaptcha();
//         }
//       }, 100);


//     // Manejo de redirección Google Auth
//     getRedirectResult(this.auth)
//       .then((result) => {
//         if (result?.user) {
//           this.router.navigate(['/menu']);
//         }
//       })
//       .catch(err => {
//          Swal.fire('Error', `Error al iniciar sesion google.`, 'error');
//       });
//   }


//   renderCaptcha() {// Se regenera el recaptcha
//     if (this.captchaContainer && typeof this.captchaWidgetId === 'undefined') {
//       this.captchaWidgetId = (window as any).grecaptcha.render(this.captchaContainer.nativeElement, {
//         sitekey: this.siteKey,
//         callback: 'onCaptchaSuccess',
//         'expired-callback': 'onCaptchaExpired'
//       });
//     }
//   }


//   onSubmit(): void {
//     if (!this.captchaValid()) {
//        Swal.fire('Error', `Completa el RECAPTCHA`, 'error');
//       return;
//     }

//     if (this.IngresarSesion.invalid) {
//       this.IngresarSesion.markAllAsTouched();
//       return;
//     }

//     this.login();
//   }

//  ngOnDestroy(): void {
//     if ((window as any).grecaptcha && typeof this.captchaWidgetId === 'number') {
//       (window as any).grecaptcha.reset(this.captchaWidgetId);
//     }
//   }



//   login() {
//     const { email, password } = this.IngresarSesion.value;

//     if (!email || !password) {
//        Swal.fire('Error', `Formulario Incompleto`, 'error');
//       return;
//     }

//     this.authService.logIn(email.trim(), password)
//       .then(() => {
//         this.router.navigate(['/menu']);
//       })
//       .catch((error) => {
//         if (error.message === 'Usuario no registrado en la base de datos') {
//            Swal.fire('Error', `Correo sin registrar`, 'error');
         
//         } else if (error.code === 'auth/account-exists-with-different-credential' || error.code === 'auth/wrong-password') {
         
//         } else if (error.code === 'auth/user-not-found') {
//            Swal.fire('Error', `Correo sin registrar`, 'error');
//         } else {
//            Swal.fire('Error', `Error al iniciar sesión: ${error.message}`, 'error');
//         }
//         console.error(error);
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
// }


/*AUTENTICACION Y RECAPTCHA*/
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InicioSesionService } from '../servicios/inicio-sesion.service';
import { Auth, getRedirectResult } from '@angular/fire/auth';
import { Component, OnInit, signal } from '@angular/core';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
import { CommonModule } from '@angular/common';


// export interface AdminCredential {
//   nombre: string;
//   email: string;
//   username: string;
//   password: string;
// }

@Component({
  selector: 'app-ingresar',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, 
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


  constructor(private router: Router, private authService: InicioSesionService, auth: Auth) {
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
        console.warn('Formulario inválido');
        console.log(this.IngresarSesion.status); 
        console.log(this.IngresarSesion.errors);
        console.log(this.IngresarSesion.get('recaptcha')?.errors); 
        this.IngresarSesion.markAllAsTouched();
        return;
      }
      this.login();
    }




  ngOnInit(): void {
    getRedirectResult(this.auth)
      .then((result) => {
        if (result?.user) {
          console.log('Usuario autenticado por redirect:', result.user);
          this.router.navigate(['/menu']);
          alert('INICIO.');
        }
      })
      .catch(err => {
        console.error('Error en redirect login:', err);
        alert('Error en el inicio de sesión con Google.');
      });
  }

  login() {
    const { email, password } = this.IngresarSesion.value;

    if (!email || !password) {
      alert('Por favor llena todos los campos');
      return;
    }
    this.authService.logIn(email.trim(), password)
      .then(() => {
        this.router.navigate(['/menu']);
      })
      .catch((error) => {
        if (error.message === 'Usuario no registrado en la base de datos') {
          alert('Este correo no está registrado para ingresar.');
        } else if (error.code === 'auth/account-exists-with-different-credential' || error.code === 'auth/wrong-password') {
          alert('Este correo está vinculado a otra forma de inicio de sesión (como Google). Por favor, inicia sesión con Google.');
        } else if (error.code === 'auth/user-not-found') {
          alert('No existe una cuenta con este correo.');
        } else {
          alert(`Error al iniciar sesión: ${error.message}`);
        }
        console.error(error);
      });
      
  }


  googleAuth() {
    if (this.isLoggingIn) return;
    this.isLoggingIn = true;

    this.authService.logInGoogle()
      .catch((error) => {
        
        console.error(error);
      })
      .finally(() => {
        this.isLoggingIn = false;
      });
  }

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }
  /* */



}






/*AUTENTICACIO */
// import { MatButtonModule } from '@angular/material/button';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatIconModule } from '@angular/material/icon';
// import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { Router } from '@angular/router';
// import { InicioSesionService } from '../servicios/inicio-sesion.service';
// import { Auth, getRedirectResult } from '@angular/fire/auth';
// import { Component, OnInit, signal } from '@angular/core';

// export interface AdminCredential {
//   nombre: string;
//   email: string;
//   username: string;
//   password: string;
// }

// @Component({
//   selector: 'app-ingresar',
//   standalone: true,
//   imports: [MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, ReactiveFormsModule],
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


//   constructor(private router: Router, private authService: InicioSesionService, auth: Auth) {
//     this.auth = auth;
//     this.IngresarSesion = new FormGroup({
//       username: new FormControl('', Validators.required),
//       password: new FormControl('', Validators.required),
//       email: new FormControl('', Validators.required)

//     });

//     // getRedirectResult(this.auth)
//     //   .then((result) => {
//     //     if (result?.user) {
//     //       console.log('Usuario autenticado por redirect:', result.user);
//     //       this.router.navigate(['/menu']);
//     //        alert('INICIO.');
//     //     }
//     //   })
//     //   .catch(err => {
//     //     console.error('Error en redirect login:', err);
//     //     alert('Error en el inicio de sesión con Google.');
//     //   });
//   }
//   ngOnInit(): void {
//     getRedirectResult(this.auth)
//       .then((result) => {
//         if (result?.user) {
//           console.log('Usuario autenticado por redirect:', result.user);
//           this.router.navigate(['/menu']);
//           alert('INICIO.');
//         }
//       })
//       .catch(err => {
//         console.error('Error en redirect login:', err);
//         alert('Error en el inicio de sesión con Google.');
//       });
//   }

//   login() {
//     const { email, password } = this.IngresarSesion.value;

//     if (!email || !password) {
//       alert('Por favor llena todos los campos');
//       return;
//     }
//     this.authService.logIn(email.trim(), password)
//       .then(() => {
//         this.router.navigate(['/menu']);
//       })
//       .catch((error) => {
//         if (error.message === 'Usuario no registrado en la base de datos') {
//           alert('Este correo no está registrado para ingresar.');
//         } else if (error.code === 'auth/account-exists-with-different-credential' || error.code === 'auth/wrong-password') {
//           alert('Este correo está vinculado a otra forma de inicio de sesión (como Google). Por favor, inicia sesión con Google.');
//         } else if (error.code === 'auth/user-not-found') {
//           alert('No existe una cuenta con este correo.');
//         } else {
//           alert(`Error al iniciar sesión: ${error.message}`);
//         }
//         console.error(error);
//       });
      
//   }


//   googleAuth() {
//     if (this.isLoggingIn) return;
//     this.isLoggingIn = true;

//     this.authService.logInGoogle()
//       .catch((error) => {
//         //alert(Error al iniciar sesión con Google: ${error.message});
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
