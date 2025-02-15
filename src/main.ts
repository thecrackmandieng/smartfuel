import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes'; // Remplacez appRoutes par routes
import { provideRouter } from '@angular/router';
import { bootstrapApplication } from '@angular/platform-browser';


bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
  ]
}).catch(err => console.error(err));
