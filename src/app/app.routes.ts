import { Routes } from '@angular/router';
import { TiendaComponent } from './tienda/tienda.component';
import { UnProductoComponent } from './un-producto/un-producto.component';
import { CarruselComponent } from './components/carrusel/carrusel.component';
import { NosotrosComponent } from './nosotros/nosotros.component';
import { FormularioReactivoComponent } from './components/formulario-reactivo/formulario-reactivo.component';
import { CitaComponent } from './cita/cita.component';
import { IngresarComponent } from './ingresar/ingresar.component';
import { MenuComponent } from './menu/menu.component';
import { CuestionarioComponent } from './components/cuestionario/cuestionario.component';
import { ServiciosSPAComponent } from './servicios-spa/servicios-spa.component';

export const routes: Routes = [
    { path: '', redirectTo: '/inicio', pathMatch: 'full' },
    { path: 'inicio', component: CarruselComponent },
    {path:'Tienda', component: TiendaComponent},
    {path:'Tienda/:id', component: UnProductoComponent},
    {path: 'Nosotros', component: NosotrosComponent },
    {path: 'Contacto', component: CitaComponent},
    {path: 'formulario-reactivo', component: FormularioReactivoComponent},
    {path: 'sesion', component: IngresarComponent},
    {path: 'menu', component: MenuComponent},
    {path: 'Cuestionario', component: CuestionarioComponent},
    {path: 'servicio', component: ServiciosSPAComponent}
];
