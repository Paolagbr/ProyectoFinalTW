import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
interface AdminUser {
  nombre: string;
  username: string;
  
}
@Injectable({
  providedIn: 'root'
})
export class InicioSesionService {
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.checkAuthStatus());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable(); 

  
  private loggedInUserNameSubject = new BehaviorSubject<string | null>(this.getStoredUsername());
  loggedInUserName$ = this.loggedInUserNameSubject.asObservable(); 

  constructor() {
     this.isAuthenticatedSubject.next(this.checkAuthStatus());
     this.loggedInUserNameSubject.next(this.getStoredUsername());
  }

 
  private checkAuthStatus(): boolean {
    return !!localStorage.getItem('adminUsername');
  }

 
  private getStoredUsername(): string | null {
    return localStorage.getItem('adminUsername');
  }
  loginSuccess(user: AdminUser): void {
    console.log('InicioSesionService: Método loginSuccess llamado con', user);
    if (user && user.nombre) {
       
       localStorage.setItem('adminUsername', user.nombre);
       
       localStorage.setItem('isAuthenticatedFlag', 'true'); 
      
       this.isAuthenticatedSubject.next(true);
       this.loggedInUserNameSubject.next(user.nombre);

       console.log('InicioSesionService: Estado de sesión actualizado a logueado');

    } else {
        console.error("InicioSesionService: loginSuccess llamado con datos de usuario incompletos:", user);
        
        this.logout(); 
    }
  }

 
  logout(): void {
    console.log('InicioSesionService: Cerrando sesión');

   
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('isAuthenticatedFlag'); 
   
    this.isAuthenticatedSubject.next(false);
    this.loggedInUserNameSubject.next(null);

    console.log('InicioSesionService: Estado de sesión actualizado a deslogueado');
  }

 
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getLoggedInUserName(): string | null {
    return this.loggedInUserNameSubject.value;
  }
}

