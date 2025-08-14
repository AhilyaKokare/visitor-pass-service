import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

// Simple application shell with a top navbar
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm sticky-top">
      <div class="container">
        <a class="navbar-brand fw-semibold" routerLink="/">Visitor Pass</a>
        <div>
          <a routerLink="/profile" class="btn btn-outline-secondary btn-sm">Profile</a>
        </div>
      </div>
    </nav>

    <main class="container py-4">
      <router-outlet></router-outlet>
    </main>
  `,
})
export class LayoutComponent {}