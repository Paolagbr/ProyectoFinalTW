import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(HttpClientModule),
    provideRouter(routes), provideFirebaseApp(() => initializeApp({ 
      projectId: "proyectofinaltw-73dc0",
       appId: "1:691281619346:web:7779b6975eebab2b8cb94b", 
       storageBucket: "proyectofinaltw-73dc0.firebasestorage.app", 
       apiKey: "AIzaSyBJXHh0cp0E3_9rJOWV1i54gr9DTGmsSw0",
        authDomain: "proyectofinaltw-73dc0.firebaseapp.com", 
        messagingSenderId: "691281619346" })), provideFirestore(() => getFirestore()),
        provideAuth(() => getAuth()),
        
  ]
})
  .catch((err) => console.error(err));