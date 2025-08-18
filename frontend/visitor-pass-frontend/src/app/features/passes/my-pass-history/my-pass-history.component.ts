import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PassService } from '../../../core/services/pass.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { VisitorPass } from '../../../core/models/pass.model';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-my-pass-history',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './my-pass-history.component.html',
})
export class MyPassHistoryComponent implements OnInit {
  passHistory: VisitorPass[] = [];
  tenantId!: number;
  isLoading = true;

  constructor(
    private passService: PassService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getDecodedToken();
    if (user && user.tenantId) {
      this.tenantId = user.tenantId;
      this.loadHistory();
    } else {
      this.toastr.error('Could not determine your location. Please log in again.');
      this.isLoading = false;
    }
  }

  loadHistory(): void {
    this.isLoading = true;
    this.passService.getMyPassHistory(this.tenantId).subscribe({
      next: (data) => {
        this.passHistory = data;
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load your pass history.');
        this.isLoading = false;
      },
    });
  }
}
