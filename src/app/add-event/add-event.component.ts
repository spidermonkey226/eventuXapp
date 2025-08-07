import { Component } from '@angular/core';

import { CommonModule } from '@angular/common'; // Import CommonModule
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-add-event',
  imports: [CommonModule,RouterModule,FormsModule],
  templateUrl: './add-event.component.html',
  styleUrl: './add-event.component.css'
})
export class AddEventComponent {
  categories: string[] = ['Conference', 'Workshop', 'Webinar', 'Seminar', 'Festival']; // Example categories

  eventCategory: string = '';
  hasManager: boolean = false;
  manager = {
    name: '',
    email: '',
    phone: ''
  };
}
