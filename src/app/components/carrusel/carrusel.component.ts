import { Component, ViewChild, ElementRef, HostListener, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScreenReaderService } from '../../screen-reader.service';

@Component({
  selector: 'app-carrusel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carrusel.component.html',
  styleUrls: ['./carrusel.component.css']
})
export class CarruselComponent {
  isReading = false;
  showAccessibilityPanel = false;
  highContrast = false;
  fontSize = 16;
  selectedFont = 'Arial';

  @ViewChild('mainContent', { static: true }) mainContent!: ElementRef;

  // Aplica la clase de alto contraste al componente raíz si está activado
  @HostBinding('class.high-contrast') get contrastClass() {
    return this.highContrast;
  }

  // Aplica estilos dinámicos para el tamaño de fuente y tipo de fuente
  @HostBinding('style.font-size.px') get dynamicFontSize() {
    return this.fontSize;
  }

  @HostBinding('style.font-family') get dynamicFontFamily() {
    return this.selectedFont;
  }

  constructor(private screenReader: ScreenReaderService) {}

  servicios = [
    { nombre: 'Masaje relajante', descripcion: 'Ayuda a disminuir el estrés.' },
    { nombre: 'Facial de limpieza profunda', descripcion: 'Elimina impurezas y rejuvenece la piel.' },
  ];

  paquetes = [
    { nombre: 'Paquete Relax Total', descripcion: 'Incluye masaje, facial y acceso a sauna.' },
    { nombre: 'Día de spa', descripcion: 'Una experiencia completa con todos nuestros servicios.' },
  ];

  toggleAccessibilityPanel() {
    this.showAccessibilityPanel = !this.showAccessibilityPanel;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInsidePanel = target.closest('.accessibility-menu');
    const clickedFAB = target.closest('.accessibility-fab');

    if (!clickedInsidePanel && !clickedFAB && this.showAccessibilityPanel) {
      this.showAccessibilityPanel = false;
    }
  }

  startReading() {
    if (this.isReading) return;
    const content = document.body.textContent || '';
    this.screenReader.readText(content);
    this.isReading = true;
  }

  pauseReading() {
    this.screenReader.pause();
  }

  stopReading() {
    this.screenReader.stop();
    this.isReading = false;
  }

  toggleContrast() {
    this.highContrast = !this.highContrast;
  }

  increaseFont() {
    this.fontSize += 2;
    this.updateBodyStyles();
  }

  decreaseFont() {
    if (this.fontSize > 10) {
      this.fontSize -= 2;
      this.updateBodyStyles();
    }
  }

  changeFont(font: string) {
    this.selectedFont = font;
    this.updateBodyStyles();
  }

  private updateBodyStyles() {
    document.body.style.fontFamily = this.selectedFont;
    document.body.style.fontSize = `${this.fontSize}px`;
  }
}
