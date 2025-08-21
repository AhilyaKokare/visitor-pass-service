import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modern-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modern-button.component.html',
  styleUrls: ['./modern-button.component.scss']
})
export class ModernButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'outline' | 'glass' = 'primary';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() icon: string = '';
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() fullWidth: boolean = false;
  @Input() glowEffect: boolean = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  
  @Output() clicked = new EventEmitter<void>();
  
  onClick(): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit();
    }
  }
}
