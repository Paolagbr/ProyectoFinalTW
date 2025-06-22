import { Component } from "@angular/core"
import { HttpClientModule } from "@angular/common/http"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

@Component({
  selector: "app-servicios-spa",
  standalone: true,
  imports: [HttpClientModule, CommonModule, FormsModule],
  templateUrl: "./servicios-spa.component.html",
  styleUrls: ["./servicios-spa.component.css"],
})
export class CitaComponent {
  mostrarFormulario = false;
  usuarioAutenticado = false;

  constructor(private auth: Auth, private http: HttpClient) {}
  private apiUrl = 'http://localhost:3000/enviar-cita'; //Conectar con node, para que permita el envio de información 



  enviarCita(cita: any) {
    return this.http.post(this.apiUrl, cita);
  }

  ngOnInit(): void {
    this.auth.onAuthStateChanged(user => {
      this.usuarioAutenticado = !!user;
    });
  }

  mostrarCitaForm() {
    if (this.usuarioAutenticado) {
      this.mostrarFormulario = true;
    } else {
       Swal.fire('Se requiere iniciar sesión');
    }
  }
}

// Aquí se define el componente CitaComponent, que maneja la lógica del formulario de citas
