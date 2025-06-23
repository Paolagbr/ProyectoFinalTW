import { Injectable } from "@angular/core"

@Injectable({
  providedIn: "root",
})
export class ScreenReaderService {
  private synth: SpeechSynthesis
  private utterance: SpeechSynthesisUtterance | null = null
  private isPaused = false
  private isReading = false

  constructor() {
    this.synth = window.speechSynthesis
  }

  readText(text: string): void {
    if (this.isReading) {
      this.stop()
    }

    // Limpiar el texto de caracteres especiales y espacios extra
    const cleanText = text
      .replace(/\s+/g, " ")
      .replace(/[^\w\s.,!?;:-]/g, "")
      .trim()

    if (!cleanText) return

    this.utterance = new SpeechSynthesisUtterance(cleanText)

    // Configurar la voz
    this.utterance.rate = 0.8
    this.utterance.pitch = 1
    this.utterance.volume = 1
    this.utterance.lang = "es-ES"

    // Eventos
    this.utterance.onstart = () => {
      this.isReading = true
      this.isPaused = false
    }

    this.utterance.onend = () => {
      this.isReading = false
      this.isPaused = false
    }

    this.utterance.onerror = (event) => {
      console.error("Error en la síntesis de voz:", event)
      this.isReading = false
      this.isPaused = false
    }

    // Iniciar la lectura
    this.synth.speak(this.utterance)
  }

  pause(): void {
    if (this.synth.speaking && !this.isPaused) {
      this.synth.pause()
      this.isPaused = true
    }
  }

  resume(): void {
    if (this.isPaused) {
      this.synth.resume()
      this.isPaused = false
    }
  }

  stop(): void {
    if (this.synth.speaking) {
      this.synth.cancel()
    }
    this.isReading = false
    this.isPaused = false
    this.utterance = null
  }

  get isCurrentlyReading(): boolean {
    return this.isReading
  }

  get isCurrentlyPaused(): boolean {
    return this.isPaused
  }
}
