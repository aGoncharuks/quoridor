import { ApplicationConfig } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'start',
    loadComponent: () => import('./start/start.component').then(m => m.StartComponent)
  },
  {
    path: 'game',
    loadComponent: () => import('./game/game.component').then(m => m.GameComponent)
  },
  { path: '', redirectTo: 'start', pathMatch: 'full' },
  { path: '**', redirectTo: 'start' }
];

export const appConfig: ApplicationConfig = {
  providers: [provideClientHydration(), provideRouter(routes)]
};
