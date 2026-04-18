import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { environment } from '../environments/environment';
import { routes } from './app.routes';

const app = initializeApp(environment.firebase);
const db = getFirestore(app);
const auth = getAuth(app);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    { provide: 'FIRESTORE', useValue: db },
    { provide: 'AUTH', useValue: auth }
  ]
};
