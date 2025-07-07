import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { provideToastr, ToastrModule } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

bootstrapApplication(AppComponent, {
  providers:[ 
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(), // required animations providers
    provideToastr({
      timeOut: 5000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      closeButton: true,
      progressBar: true,
    }),  // Toastr providers
    provideCharts(withDefaultRegisterables()), // Chart.js providers
  ]
})
  .catch((err) => console.error(err));
