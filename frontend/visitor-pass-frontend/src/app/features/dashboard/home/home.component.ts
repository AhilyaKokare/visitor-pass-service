import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProfileService } from '../../../core/services/profile.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { User } from '../../../core/models/user.model';
import { UserDashboardStats } from '../../../core/models/home-dashboard.model';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, TitleCasePipe, DatePipe, LoadingSpinnerComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  user: User | null = null;
  stats: UserDashboardStats | null = null;
  isLoading = true;
  currentTime = new Date();

  constructor(
    private profileService: ProfileService,
    private dashboardService: DashboardService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.profileService.getMyProfile().subscribe({
      next: profile => this.user = profile,
      error: () => this.toastr.error('Failed to load user profile.')
    });

    this.dashboardService.getUserDashboardStats().subscribe({
      next: dashboardStats => {
        this.stats = dashboardStats;
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load dashboard statistics.');
        this.isLoading = false;
      }
    });

    setInterval(() => this.currentTime = new Date(), 1000);
  }
}
