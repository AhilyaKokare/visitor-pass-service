import { Component, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, SidebarComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
  @ViewChild('sidebar') sidebar!: SidebarComponent;
  isSidebarOpen = false;

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    if (this.sidebar) {
      this.sidebar.isMobileMenuOpen = this.isSidebarOpen;
    }
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
    if (this.sidebar) {
      this.sidebar.isMobileMenuOpen = false;
    }
  }
}
