import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScreenReaderService {
  private synth = window.speechSynthesis;
  private utterance?: SpeechSynthesisUtterance;

  readText(text: string) {
    this.stop(); // Detener cualquier lectura previa
    this.utterance = new SpeechSynthesisUtterance(text);
    this.utterance.lang = 'es-MX';
    this.synth.speak(this.utterance);
  }

  pause() {
    this.synth.pause();
  }

  stop() {
    this.synth.cancel();
  }
}
