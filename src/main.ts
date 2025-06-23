import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 

// Firebase imports
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

import { routes } from './app/app.routes';

const firebaseConfig = {
  apiKey: "AIzaSyBJXHh0cp0E3_9rJOWV1i54gr9DTGmsSw0",
  authDomain: "proyectofinaltw-73dc0.firebaseapp.com",
  projectId: "proyectofinaltw-73dc0",
  storageBucket: "proyectofinaltw-73dc0.firebasestorage.app",
  messagingSenderId: "691281619346",
  appId: "1:691281619346:web:7779b6975eebab2b8cb94b",
  measurementId: "G-4HJ1KPNT7K"
};

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    importProvidersFrom(FormsModule, CommonModule, AngularFireModule.initializeApp(firebaseConfig),
      AngularFirestoreModule), 
    
    // Firebase providers
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ]
}).catch(err => console.error(err));