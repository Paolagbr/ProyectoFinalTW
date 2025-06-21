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
export class ServiciosSpaComponent {}
