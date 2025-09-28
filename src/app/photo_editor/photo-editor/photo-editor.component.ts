import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModel, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ]
})

export class PhotoEditorComponent {

  previewUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  price = '';
  size = '';
  desc = '';
  pos: 'above' | 'below' = 'below';
  isLoading = false;

  constructor(private http: HttpClient) { }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.selectedFile = input.files[0];

    const reader = new FileReader();
    reader.onload = () => this.previewUrl = reader.result;
    reader.readAsDataURL(this.selectedFile);
  }

  async generateImage(): Promise<void> {
    if (!this.selectedFile) {
      alert('Please take/select a photo');
      return;
    }

    const text = [this.price, this.size, this.desc]
      .filter(Boolean)
      .join(' • ');

    const fd = new FormData();
    fd.append('photo', this.selectedFile);
    fd.append('text', text);
    fd.append('pos', this.pos);

    this.isLoading = true;

    this.http.post('/api/generate', fd, { responseType: 'blob' })
      .subscribe({
        next: async (blob) => {
          this.isLoading = false;
          const file = new File([blob], 'product-label.jpg', { type: blob.type });

          // Web Share API first
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({ files: [file], title: 'Product', text });
              return;
            } catch {
              // Fallback to download
            }
          }

          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'product-label.jpg';
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          this.isLoading = false;
          alert('Error: ' + (err.message || 'Server error'));
        }
      });
  }
}
