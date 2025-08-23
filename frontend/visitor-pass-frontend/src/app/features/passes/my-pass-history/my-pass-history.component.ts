// FILE: frontend/visitor-pass-frontend/src/app/features/passes/my-pass-history/my-pass-history.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
<<<<<<< HEAD
import { PassService } from '../../../core/services/pass.service';
import { AuthService } from '../../../core/services/auth.service';
=======
>>>>>>> 44b2135 (Updated Pagination and notification service)
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';
import { PassService } from '../../../core/services/pass.service';
import { VisitorPass } from '../../../core/models/pass.model';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
<<<<<<< HEAD
import { Page, PaginationComponent } from '../../../shared/pagination/pagination.component';
import { RouterModule } from '@angular/router';
=======
import { Page } from '../../../core/models/page.model';
import { PaginationComponent } from '../../../shared/pagination/pagination.component'; // <-- DOUBLE CHECK THIS PATH
>>>>>>> 44b2135 (Updated Pagination and notification service)

@Component({
  selector: 'app-my-pass-history',
  standalone: true,
<<<<<<< HEAD
  imports: [CommonModule, LoadingSpinnerComponent, PaginationComponent, RouterModule, DatePipe],
  templateUrl: './my-pass-history.component.html',
})
export class MyPassHistoryComponent implements OnInit {
  passHistoryPage: Page<VisitorPass> | null = null;
  tenantId!: number;
=======
  imports: [
    CommonModule, 
    DatePipe, 
    LoadingSpinnerComponent, 
    PaginationComponent // <-- ENSURE THIS COMPONENT IS CORRECTLY IMPORTED
  ],
  templateUrl: './my-pass-history.component.html',
})
export class MyPassHistoryComponent implements OnInit {
  
  passHistoryPage: Page<VisitorPass> | null = null;
  currentPage = 0;
  pageSize = 10;
  
>>>>>>> 44b2135 (Updated Pagination and notification service)
  isLoading = true;
  tenantId!: number;
  selectedPass: VisitorPass | null = null;

  currentPage = 0;
  pageSize = 10;

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
    }
  }

  loadHistory(): void {
    this.isLoading = true;
    this.passService.getMyPassHistory(this.tenantId, this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        this.passHistoryPage = data;
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load pass history.');
        this.isLoading = false;
      }
    });
  }
<<<<<<< HEAD

=======
  
>>>>>>> 44b2135 (Updated Pagination and notification service)
  onPageChange(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.loadHistory();
  }
<<<<<<< HEAD
}
=======

  viewDetails(pass: VisitorPass): void {
    this.selectedPass = pass;
  }
}
>>>>>>> 44b2135 (Updated Pagination and notification service)
