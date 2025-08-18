import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../../core/services/profile.service';
import { User } from '../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-profile.component.html'
})
export class MyProfileComponent implements OnInit {
  profile?: User;
  editableProfile: any = {};

  constructor(private profileService: ProfileService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.profileService.getMyProfile().subscribe(data => {
      this.profile = data;
      this.editableProfile = {
        email: data.email,
        contact: data.contact,
        address: data.address
      };
    });
  }

  onUpdateProfile(): void {
    this.profileService.updateMyProfile(this.editableProfile).subscribe({
      next: (updatedProfile) => {
        this.profile = updatedProfile;
        this.toastr.success('Profile updated successfully!');
      },
      error: () => this.toastr.error('Failed to update profile.')
    });
  }
}
