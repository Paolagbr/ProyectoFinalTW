import { Component, ViewChild, type ElementRef, HostListener, type OnInit, type OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { ScreenReaderService } from "../../screen-reader.service"

interface AccessibilitySettings {
  fontSize: number
  selectedFont: string
  highContrast: boolean
}

@Component({
  selector: "app-carrusel",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./carrusel.component.html",
  styleUrls: ["./carrusel.component.css"],
})
export class CarruselComponent implements OnInit, OnDestroy {
  showAccessibilityPanel = false
  highContrast = false
  fontSize = 16
  selectedFont = "Arial"

  // Opciones de fuentes disponibles
  fontOptions = [
    { name: "Arial", value: "Arial, sans-serif" },
    { name: "Verdana", value: "Verdana, sans-serif" },
    { name: "Roboto", value: "Roboto, sans-serif" },
    { name: "Times New Roman", value: "Times New Roman, serif" },
    { name: "Georgia", value: "Georgia, serif" },
  ]

  @ViewChild("mainContent", { static: true }) mainContent!: ElementRef

  constructor(private screenReader: ScreenReaderService) {}

  ngOnInit(): void {
    this.loadAccessibilitySettings()
    this.applySettings()
  }

  ngOnDestroy(): void {
    this.screenReader.stop()
    this.saveAccessibilitySettings()
  }

  servicios = [
    { nombre: "Masaje relajante", descripcion: "Ayuda a disminuir el estrés." },
    { nombre: "Facial de limpieza profunda", descripcion: "Elimina impurezas y rejuvenece la piel." },
  ]

  paquetes = [
    { nombre: "Paquete Relax Total", descripcion: "Incluye masaje, facial y acceso a sauna." },
    { nombre: "Día de spa", descripcion: "Una experiencia completa con todos nuestros servicios." },
  ]

  toggleAccessibilityPanel(): void {
    this.showAccessibilityPanel = !this.showAccessibilityPanel
  }

  @HostListener("document:click", ["$event"])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement
    const clickedInsidePanel = target.closest(".accessibility-menu")
    const clickedFAB = target.closest(".accessibility-fab")

    if (!clickedInsidePanel && !clickedFAB && this.showAccessibilityPanel) {
      this.showAccessibilityPanel = false
    }
  }

  @HostListener("document:keydown", ["$event"])
  onKeyDown(event: KeyboardEvent): void {
    // Cerrar panel con Escape
    if (event.key === "Escape" && this.showAccessibilityPanel) {
      this.showAccessibilityPanel = false
    }
  }

  startReading(): void {
    const content = this.getReadableContent()
    this.screenReader.readText(content)
  }

  pauseReading(): void {
    if (this.screenReader.isCurrentlyPaused) {
      this.screenReader.resume()
    } else {
      this.screenReader.pause()
    }
  }

  stopReading(): void {
    this.screenReader.stop()
  }

  toggleContrast(): void {
    this.highContrast = !this.highContrast
    this.applySettings()
    this.saveAccessibilitySettings()
  }

  increaseFont(): void {
    if (this.fontSize < 24) {
      this.fontSize += 2
      this.applySettings()
      this.saveAccessibilitySettings()
    }
  }

  decreaseFont(): void {
    if (this.fontSize > 12) {
      this.fontSize -= 2
      this.applySettings()
      this.saveAccessibilitySettings()
    }
  }

  onFontChange(): void {
    this.applySettings()
    this.saveAccessibilitySettings()
  }

  get isReading(): boolean {
    return this.screenReader.isCurrentlyReading
  }

  get isPaused(): boolean {
    return this.screenReader.isCurrentlyPaused
  }

  private getReadableContent(): string {
    const mainContent = this.mainContent?.nativeElement
    if (!mainContent) return ""

    // Extraer texto legible del contenido principal
    const textElements = mainContent.querySelectorAll("p, h1, h2, h3, h4, h5, h6, .card-title, .card-text, .lema")
    const texts: string[] = []

    textElements.forEach((element: Element) => {
      const text = element.textContent?.trim()
      if (text && text.length > 0) {
        texts.push(text)
      }
    })

    return texts.join(". ")
  }

  private applySettings(): void {
    const body = document.body
    const mainContent = this.mainContent?.nativeElement

    if (mainContent) {
      // Aplicar tamaño de fuente
      mainContent.style.fontSize = `${this.fontSize}px`

      // Aplicar familia de fuente
      mainContent.style.fontFamily = this.selectedFont

      // Aplicar o quitar clase de alto contraste
      if (this.highContrast) {
        mainContent.classList.add("high-contrast")
        body.classList.add("high-contrast")
      } else {
        mainContent.classList.remove("high-contrast")
        body.classList.remove("high-contrast")
      }
    }
  }

  private saveAccessibilitySettings(): void {
    const settings: AccessibilitySettings = {
      fontSize: this.fontSize,
      selectedFont: this.selectedFont,
      highContrast: this.highContrast,
    }

    localStorage.setItem("spa-accessibility-settings", JSON.stringify(settings))
  }

  private loadAccessibilitySettings(): void {
    const savedSettings = localStorage.getItem("spa-accessibility-settings")

    if (savedSettings) {
      try {
        const settings: AccessibilitySettings = JSON.parse(savedSettings)
        this.fontSize = settings.fontSize || 16
        this.selectedFont = settings.selectedFont || "Arial"
        this.highContrast = settings.highContrast || false
      } catch (error) {
        console.error("Error al cargar configuraciones de accesibilidad:", error)
      }
    }
  }
}
