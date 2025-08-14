import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilesService } from '../services/files.service';
@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css'
})
export class FileUploadComponent {
   files: File[] = [];
  uploading = false;
  message = '';
  success = false;

  // Basic settings
  allowMultiple = true;
  maxSizeMB = 10;     // 10 MB per file
  acceptTypes = '';   // e.g. 'image/*,application/pdf'

  constructor(private filesService: FilesService) {}

  onFilesSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files) return;

    const picked = Array.from(input.files);
    const valid: File[] = [];
    const maxBytes = this.maxSizeMB * 1024 * 1024;

    for (const f of picked) {
      if (f.size > maxBytes) {
        this.setError(`File ${f.name} exceeds ${this.maxSizeMB}MB.`);
        continue;
      }
      // (Optional) validate f.type against acceptTypes here
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

  async onSubmit(e: Event) {
    e.preventDefault();
    if (!this.files.length || this.uploading) return;

    this.uploading = true;
    this.clearMsg();

    try {
      // Serial upload (we can switch to parallel later if you want)
      for (const f of this.files) {
        await this.filesService.uploadFile(f).toPromise();
      }
      this.success = true;
      this.message = 'Upload successful!';
      this.clear();
    } catch (err) {
      this.success = false;
      this.message = 'Upload failed. Please try again.';
      console.error(err);
    } finally {
      this.uploading = false;
    }
  }

  private clearMsg() { this.message = ''; this.success = false; }
  private setError(msg: string) { this.message = msg; this.success = false; }
}
