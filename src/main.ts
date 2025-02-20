import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';
import localeFr from '@angular/common/locales/fr';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { registerLocaleData } from '@angular/common';

// Enregistrer la locale française
registerLocaleData(localeFr, 'fr');

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(), // Fournir HttpClient pour l'application entière
    provideRouter(routes, withComponentInputBinding()), // Configuration des routes
    provideAnimationsAsync(), provideAnimationsAsync(), provideAnimationsAsync(), // Fournir les animations asynchrones
  ],
}).catch((err) => console.error(err));