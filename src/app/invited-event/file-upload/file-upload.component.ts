import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css'
})
export class FileUploadComponent  implements OnInit {
  // UI state
  files: File[] = [];
  uploading = false;
  message = '';
  success = false;

  // Settings
  allowMultiple = true;
  maxSizeMB = 10;             // 10 MB per file
  acceptTypes = 'image/*';    // images for invites page; change if you want PDFs etc.

  // Event context
  eventId!: number;
  loadingList = true;
  listError = '';

  // Existing server files for this event
  existingFiles: { id:number; name:string; size?:string; type?:string }[] = [];

  constructor(private route: ActivatedRoute, private eventSvc: EventService) {}

  ngOnInit(): void {
    // Works in both places:
    // 1) Child of /invited-event/:id/upload  -> parent param('id')
    // 2) Standalone /file-upload?eventId=123 -> queryParam('eventId')
    const fromParent = Number(this.route.parent?.snapshot.paramMap.get('id'));
    const fromQuery  = Number(this.route.snapshot.queryParamMap.get('eventId'));
    const id = !Number.isNaN(fromParent) && fromParent ? fromParent :
               (!Number.isNaN(fromQuery) && fromQuery ? fromQuery : NaN);

    if (!id || Number.isNaN(id)) {
      this.listError = 'Missing event id. Open this page from the event.';
      this.loadingList = false;
      return;
    }

    this.eventId = id;
    this.refreshList();
  }

  // ---------- Existing files ----------
  refreshList() {
    this.loadingList = true;
    this.listError = '';
    this.eventSvc.getFilesMine(this.eventId).subscribe({
      next: (list) => { this.existingFiles = list ?? []; this.loadingList = false; },
      error: (err) => {
        this.listError = err?.error?.message || 'Failed to load files';
        this.loadingList = false;
      }
    });
  }

  deleteServerFile(fileId: number) {
    this.eventSvc.deleteFile(this.eventId, fileId).subscribe({
      next: () => { this.existingFiles = this.existingFiles.filter(f => f.id !== fileId); },
      error: (err) => { this.setError(err?.error?.message || 'Delete failed.'); }
    });
  }

  // ---------- Selecting new local files ----------
  onFilesSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files) return;

    const picked = Array.from(input.files);
    const valid: File[] = [];
    const maxBytes = this.maxSizeMB * 1024 * 1024;

    for (const f of picked) {
      if (f.size > maxBytes) { this.setError(`File ${f.name} exceeds ${this.maxSizeMB}MB.`); continue; }
      // (Optional) enforce MIME types stricter if needed
      valid.push(f);
    }

    this.files = this.allowMultiple ? valid : valid.slice(0, 1);
    this.clearMsg();
  }

  remove(i: number) {
    this.files.splice(i, 1);
    this.clearMsg();
  }

  clear() {
    this.files = [];
    this.clearMsg();
  }

  // ---------- Upload ----------
  onSubmit(e: Event) {
    e.preventDefault();
    if (!this.files.length || this.uploading) return;

    this.uploading = true;
    this.clearMsg();

    // Your EventService already supports multi-file upload in one request
    this.eventSvc.uploadFiles(this.eventId, this.files).subscribe({
      next: () => {
        this.success = true;
        this.message = 'Upload successful!';
        this.clear();
        this.refreshList(); // refresh server list
      },
      error: (err) => {
        console.error(err);
        this.success = false;
        this.message = err?.error?.message || 'Upload failed. Please try again.';
      },
      complete: () => { this.uploading = false; }
    });
  }

  // ---------- Helpers ----------
  private clearMsg() { this.message = ''; this.success = false; }
  private setError(msg: string) { this.message = msg; this.success = false; }

}
