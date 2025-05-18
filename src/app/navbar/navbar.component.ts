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
  isAuthenticated = false;
  adminName: string | null = null;
  
  private authSubscription: Subscription | undefined;
  private userNameSubscription: Subscription | undefined;

  constructor(private authService: InicioSesionService,  private router: Router) { }

   ngOnInit(): void {
    this.authSubscription = this.authService.isAuthenticated$.subscribe(
      (isAuthenticated) => {
        this.isAuthenticated = isAuthenticated;
        console.log('NavbarComponent: Estado autenticación cambiado:', this.isAuthenticated); 
      }
    );

    this.userNameSubscription = this.authService.loggedInUserName$.subscribe(
      (adminName) => {
        this.adminName = adminName;
        console.log('NavbarComponent: Nombre de usuario cambiado:', this.adminName); 
      }
    );
  }
  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.userNameSubscription?.unsubscribe();
  }
  logout(): void {
    this.authService.logout();
    this.authService.logout();
    this.router.navigate(['/sesion']);//se tiene que redireccionar para que se cierre de forma adeacuada y evitar que siga aparecoendo el localSotrage
  }
}
