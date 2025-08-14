import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PassesService } from '../../core/services/passes.service';

// Employee - create visitor pass
@Component({
  selector: 'app-create-pass',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h4 class="mb-3">Create Visitor Pass</h4>

    <div class="card shadow-sm">
      <div class="card-body">
        <form (ngSubmit)="create()">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Visitor Name</label>
              <input class="form-control" [(ngModel)]="form.visitorName" name="visitorName" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Visitor Phone</label>
              <input class="form-control" [(ngModel)]="form.visitorPhone" name="visitorPhone" required />
            </div>
            <div class="col-12">
              <label class="form-label">Purpose</label>
              <input class="form-control" [(ngModel)]="form.purpose" name="purpose" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Visit Date & Time</label>
              <input type="datetime-local" class="form-control" [(ngModel)]="form.visitDateTime" name="visitDateTime" required />
            </div>
          </div>
          <div class="mt-3">
            <button class="btn btn-primary">Create Pass</button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class CreatePassComponent {
  private api = inject(PassesService);
  form: any = {};

  create() {
    this.api.createPass(this.form).subscribe(() => {
      alert('Pass created successfully');
    });
  }
}