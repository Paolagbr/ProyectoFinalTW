import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { InicioSesionService } from '../servicios/inicio-sesion.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone:true,
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  
  // No necesitas adminName si solo usas appUsername
  // adminName: string | null = null;
  appUsername: string | null = null; // Correcto, este es el que se usa en el HTML
  
  // subscriptions es suficiente, puedes eliminar las individuales si lo prefieres
  // private authSubscription: Subscription | undefined;
  // private userNameSubscription: Subscription | undefined;
  private subscriptions: Subscription[] = []; // Array para todas las suscripciones

  constructor(private authService: InicioSesionService, private router: Router) { }

  isAuthenticated: boolean = false; // Propiedad que controla el @if en el HTML

  ngOnInit(): void {
    // Suscripción al estado de autenticación (isAuthenticated$)
    this.subscriptions.push(
      this.authService.isAuthenticated$.subscribe(status => {
        this.isAuthenticated = status;
        console.log('NavbarComponent: Estado de autenticación:', this.isAuthenticated);
      })
    );

    // Suscripción al username de la aplicación (appUsername$)
    this.subscriptions.push(
      this.authService.appUsername$.subscribe(username => {
        this.appUsername = username;
        console.log('NavbarComponent: Username de la app (recibido del servicio):', this.appUsername);
      })
    );
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logOut();
      this.router.navigate(['/sesion']); // Redirige a la página de login
      console.log('NavbarComponent: Sesión cerrada y redirigiendo.');
    } catch (error) {
      console.error('NavbarComponent: Error al cerrar sesión:', error);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    console.log('NavbarComponent: Desuscrito de Observables.');
  }
}

// import { Component, OnDestroy, OnInit } from '@angular/core';
// import { RouterModule, Router } from '@angular/router';
// import { InicioSesionService } from '../servicios/inicio-sesion.service';
// import { Subscription } from 'rxjs';

// @Component({
//   selector: 'app-navbar',
//   standalone:true,
//   imports: [RouterModule],
//   templateUrl: './navbar.component.html',
//   styleUrl: './navbar.component.css'
// })
// export class NavbarComponent implements OnInit, OnDestroy {
 
//   adminName: string | null = null;
//    appUsername: string | null = null;
  
//   private authSubscription: Subscription | undefined;
//   private userNameSubscription: Subscription | undefined;
//    private subscriptions: Subscription[] = [];

//   constructor(private authService: InicioSesionService,  private router: Router) { }

//   isAuthenticated: boolean = false;

//   ngOnInit(): void {
//     this.subscriptions.push(
//       this.authService.isAuthenticated$.subscribe(status => {
//         this.isAuthenticated = status;
//         console.log('NavbarComponent: Estado de autenticación:', this.isAuthenticated);
//       })
//     );

//     this.subscriptions.push(
//       this.authService.appUsername$.subscribe(username => {
//         this.appUsername = username;
//         console.log('NavbarComponent: Username de la app:', this.appUsername);
//       })
//     );
//   }

//   async logout(): Promise<void> {
//     try {
//       await this.authService.logOut();
//       this.router.navigate(['/sesion']); // Redirige a la página de login
//       console.log('NavbarComponent: Sesión cerrada y redirigiendo.');
//     } catch (error) {
//       console.error('NavbarComponent: Error al cerrar sesión:', error);
//     }
//   }

//   ngOnDestroy(): void {
//     this.subscriptions.forEach(sub => sub.unsubscribe());
//     console.log('NavbarComponent: Desuscrito de Observables.');
//   }
// }

