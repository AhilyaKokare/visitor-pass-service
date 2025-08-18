import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { PassService } from '../../../core/services/pass.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-pass',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-pass.component.html',
})
export class CreatePassComponent {
  passData: any = {};
  tenantId!: number;
  isSubmitting = false;

  constructor(
    private passService: PassService,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {
    const user = this.authService.getDecodedToken();
    if (user && user.tenantId) {
      this.tenantId = user.tenantId;
    }
  }

  onCreatePass(): void {
    this.isSubmitting = true;
    this.passService.createPass(this.tenantId, this.passData).subscribe({
      next: () => {
        this.toastr.success('Visitor pass request submitted successfully!');
        this.router.navigate(['/passes/history']);
      },
      error: (err) => {
        this.toastr.error(err.error.message || 'Failed to submit pass request.');
        this.isSubmitting = false;
      }
    });
  }
}
