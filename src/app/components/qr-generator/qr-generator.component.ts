import { Component, type OnInit, Inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import * as QRCode from "qrcode"
import { QrApiService, CitaQRData } from "../../services/qr-api.service"
import { InicioSesionService } from "../../servicios/inicio-sesion.service"
import { User } from '@angular/fire/auth';


@Component({
  selector: "app-qr-generator",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./qr-generator.component.html",
  styleUrls: ["./qr-generator.component.css"],
})
export class QrGeneratorComponent implements OnInit {
  qrCodeDataURL = ""
  citaData: CitaQRData | null = null
  loading = false
  error = ""
  userEmail = ""

  constructor(
    private qrApiService: QrApiService,
    @Inject("InicioSesionService") private authService: InicioSesionService,
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user: User | null) => {
      if (user?.email) {
        this.userEmail = user.email
        this.generarQR()
      }
    })
  }

  async generarQR() {
    if (!this.userEmail) {
      this.error = "Usuario no autenticado"
      return
    }

    this.loading = true
    this.error = ""

    try {
      const response = await this.qrApiService.obtenerDatosCitaParaQR(this.userEmail).toPromise()

      if (response?.success && response.data) {
        this.citaData = response.data

        const qrContent = JSON.stringify({
          codigo: this.citaData.codigoConfirmacion,
          cita: this.citaData.citaId,
          cliente: this.citaData.cliente,
          servicio: this.citaData.servicio,
          fecha: this.citaData.fecha,
          hora: this.citaData.hora,
          valido_hasta: this.citaData.validoHasta,
        })

        this.qrCodeDataURL = await QRCode.toDataURL(qrContent, {
          width: 300,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        })
      }
    } catch (error: any) {
      console.error("Error al generar QR:", error)
      this.error = error.error?.error || "Error al generar código QR"
    } finally {
      this.loading = false
    }
  }

  regenerarQR() {
    this.generarQR()
  }

  descargarQR() {
    if (this.qrCodeDataURL) {
      const link = document.createElement("a")
      link.download = `cita-qr-${this.citaData?.codigoConfirmacion}.png`
      link.href = this.qrCodeDataURL
      link.click()
    }
  }
}
