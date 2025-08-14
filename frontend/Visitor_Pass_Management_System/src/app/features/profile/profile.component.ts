import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../core/services/profile.service';

// Profile - view & update own details
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h4 class="mb-3">My Profile</h4>

    <div class="card shadow-sm">
      <div class="card-body">
        <form (ngSubmit)="save()">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Email</label>
              <input class="form-control" [(ngModel)]="model.email" name="email" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Contact</label>
              <input class="form-control" [(ngModel)]="model.contact" name="contact" />
            </div>
            <div class="col-12">
              <label class="form-label">Address</label>
              <input class="form-control" [(ngModel)]="model.address" name="address" />
            </div>
          </div>
          <div class="mt-3">
            <button class="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ProfileComponent {
  private api = inject(ProfileService);
  model: any = {};

  ngOnInit() { this.api.me().subscribe(res => this.model = res); }

  save() { this.api.update(this.model).subscribe(() => alert('Profile updated')); }
}