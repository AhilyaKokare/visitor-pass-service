import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modern-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modern-card.component.html',
  styleUrls: ['./modern-card.component.scss']
})
export class ModernCardComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() icon: string = '';
  @Input() gradient: 'primary' | 'success' | 'info' | 'warning' | 'danger' | 'glass' = 'glass';
  @Input() hoverable: boolean = true;
  @Input() clickable: boolean = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() borderAccent: boolean = false;
  @Input() glowEffect: boolean = false;
}
