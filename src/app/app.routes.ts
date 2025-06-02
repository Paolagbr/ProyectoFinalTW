import { Routes } from '@angular/router';
import { TiendaComponent } from './tienda/tienda.component';
import { UnProductoComponent } from './un-producto/un-producto.component';
import { CarruselComponent } from './components/carrusel/carrusel.component';
import { NosotrosComponent } from './nosotros/nosotros.component';
import { CitaComponent } from './cita/cita.component';
import { IngresarComponent } from './ingresar/ingresar.component';
import { MenuComponent } from './menu/menu.component';
import { CuestionarioComponent } from './components/cuestionario/cuestionario.component';
import { ServiciosSPAComponent } from './servicios-spa/servicios-spa.component';
<<<<<<< HEAD
import { IngresarUsuarioComponent } from './ingresar-usuario/ingresar-usuario.component';
=======
import { RegistroUsuariosComponent } from './registro-usuarios/registro-usuarios.component';
>>>>>>> 342c28e694589aebebb965b4cccf1f6dacb4e52a

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
<<<<<<< HEAD
    {path: 'ingresarUsuario', component: IngresarUsuarioComponent}

=======
    {path: 'usuario', component: RegistroUsuariosComponent}
>>>>>>> 342c28e694589aebebb965b4cccf1f6dacb4e52a
];
