import { Component } from '@angular/core';

import { CommonModule } from '@angular/common'; // Import CommonModule
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-add-event',
  imports: [CommonModule,RouterModule],
  templateUrl: './add-event.component.html',
  styleUrl: './add-event.component.css'
})
export class AddEventComponent {
  
}
