import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { CarruselComponent } from "./components/carrusel/carrusel.component";

@Component({
  selector: 'app-root',
  standalone:true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, CarruselComponent, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'MiniProyectoANGULAR';
}
