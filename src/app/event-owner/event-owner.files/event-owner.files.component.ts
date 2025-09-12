import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventOwnerStore } from '../event-owner.store';

@Component({
 selector: 'app-event-owner-files',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-owner.files.component.html',
  styleUrls: ['./event-owner.files.component.css', '../event-owner.component.css'] 
})
export class EventOwnerFilesComponent {
  store = inject(EventOwnerStore);

  onFilePick(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const files = input.files;
    if (!files?.length) return;
    this.store.upload([...files]).subscribe({
      error: (e) => this.store.error$.next(e?.error?.message || 'Upload failed')
    });
  }
  deleteFile(id: number) {
    this.store.deleteFile(id).subscribe({
      error: (e) => this.store.error$.next(e?.error?.message || 'Failed to delete file')
    });
  }
}
