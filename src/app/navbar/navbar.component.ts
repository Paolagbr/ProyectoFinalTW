import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { InicioSesionService } from '../servicios/inicio-sesion.service';
import { Subscription } from 'rxjs';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { collection, doc, Firestore, getDoc, getDocs, query, where } from '@angular/fire/firestore';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  standalone:true,
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  
  
  appUsername: string | null = null; 
  userType: string | null = null;

  private subscriptions: Subscription[] = []; 

  constructor(private authService: InicioSesionService, private router: Router,
    private auth: Auth, private firestore: Firestore
  ) { }

  isAuthenticated: boolean = false; // Propiedad que controla el @if en el HTML


        ngOnInit(): void {
        onAuthStateChanged(this.auth, async (user) => {
          if (user?.email) {
            this.isAuthenticated = true;

            try {
              // Buscar en la colección 'usuarios' por email
              const q = query(
                collection(this.firestore, 'usuarios'),
                where('email', '==', user.email)
              );
              const querySnap = await getDocs(q);

              if (!querySnap.empty) {
                const userData = querySnap.docs[0].data();
                this.appUsername = userData['username'] ?? null;
                this.userType = userData['userType'] ?? null;
              } else {
                this.appUsername = null;
                this.userType = null;
                 Swal.fire('Correo de Google no registrado');
              
              }
            } catch (error) {
              console.error('Error buscando usuario por correo:', error);
              this.appUsername = null;
              this.userType = null;
            }
          } else {
            this.isAuthenticated = false;
            this.appUsername = null;
            this.userType = null;
          }
      });
    }

  

  async logout(): Promise<void> {
    try {
      await this.authService.logOut();
      this.router.navigate(['/sesion']); 
    } catch (error) {
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  
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
  
  
//   appUsername: string | null = null; 
//   userType: string | null = null;

//   private subscriptions: Subscription[] = []; 

//   constructor(private authService: InicioSesionService, private router: Router) { }

//   isAuthenticated: boolean = false; // Propiedad que controla el @if en el HTML

//   ngOnInit(): void {
    
//     this.subscriptions.push(
//       this.authService.isAuthenticated$.subscribe(status => {
//         this.isAuthenticated = status;
      
//       })
//     );

    
//     this.subscriptions.push(
//       this.authService.appUsername$.subscribe(username => {
//         this.appUsername = username;
        
//       })
//     );
//   }

//   async logout(): Promise<void> {
//     try {
//       await this.authService.logOut();
//       this.router.navigate(['/sesion']); 
//     } catch (error) {
//     }
//   }

//   ngOnDestroy(): void {
//     this.subscriptions.forEach(sub => sub.unsubscribe());
  
//   }
// }


