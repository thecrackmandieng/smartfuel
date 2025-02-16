import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes'; // Utilisation des routes
import { provideRouter } from '@angular/router';
import { bootstrapApplication } from '@angular/platform-browser';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), // Passer les routes à l'application
  ]
}).catch(err => console.error(err));
