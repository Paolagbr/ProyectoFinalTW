import { Routes } from '@angular/router';
import { TiendaComponent } from './tienda/tienda.component';
import { UnProductoComponent } from './un-producto/un-producto.component';
import { CarruselComponent } from './components/carrusel/carrusel.component';
import { NosotrosComponent } from './nosotros/nosotros.component';
import { AppComponent } from './app.component';
import { CitaComponent } from './cita/cita.component';
import { IngresarComponent } from './ingresar/ingresar.component';
import { MenuComponent } from './menu/menu.component';
import { CuestionarioComponent } from './components/cuestionario/cuestionario.component';
import { ServiciosSPAComponent } from './servicios-spa/servicios-spa.component';
import { UsurioNuevoComponent } from './usurio-nuevo/usurio-nuevo.component';
import { RegistrarCitaUsuarioComponent } from './registrar-cita-usuario/registrar-cita-usuario.component';
import { PasswordComponent } from './password/password.component';
import { AdminDashboardComponent } from './api/admin/dashboard/dashboard.component'; 





export const routes: Routes = [
    { path: '', redirectTo: '/inicio', pathMatch: 'full' },
    { path: 'inicio', component: CarruselComponent },
    {path:'Tienda', component: TiendaComponent},
    {path:'Tienda/:id', component: UnProductoComponent},
    {path: 'Nosotros', component: NosotrosComponent },
    {path: 'Contacto', component: CitaComponent},
    {path: 'sesion', component: IngresarComponent},
    {path: 'menu', component: MenuComponent},
    {path: 'Cuestionario', component: CuestionarioComponent},
    {path: 'servicio', component: ServiciosSPAComponent},
    {path: 'usuario', component: UsurioNuevoComponent},
    {path: 'agendar', component: RegistrarCitaUsuarioComponent},
    {path: 'recuperar', component: PasswordComponent},
    {path: 'grafica', component: AdminDashboardComponent},


    // Rutas adicionales
    { path: "", component: ServiciosSPAComponent },
    { path: "servicios", component: ServiciosSPAComponent },
    { path: "admin/dashboard", component: AdminDashboardComponent },
    { path: "**", redirectTo: "" },
];