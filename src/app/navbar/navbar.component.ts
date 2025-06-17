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
  
  
  appUsername: string | null = null; 
  private subscriptions: Subscription[] = []; 

  constructor(private authService: InicioSesionService, private router: Router) { }

  isAuthenticated: boolean = false; // Propiedad que controla el @if en el HTML

  ngOnInit(): void {
    
    this.subscriptions.push(
      this.authService.isAuthenticated$.subscribe(status => {
        this.isAuthenticated = status;
        console.log('NavbarComponent: Estado de autenticación:', this.isAuthenticated);
      })
    );

    
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
      this.router.navigate(['/sesion']); 
      console.log('NavbarComponent: Sesión cerrada y redirigiendo.');
    } catch (error) {
      console.error('NavbarComponent: Error al cerrar sesión:', error);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  
  }
}


