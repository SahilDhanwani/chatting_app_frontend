import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';

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
  isLoading = false;
  baseUrl: string = environment.PhotoEditorAPIBaseURL;

  constructor(private http: HttpClient) { }

  // Triggered when user clicks "📸 Take Photo"
  onCameraClick(input: HTMLInputElement): void {
    input.click();
  }

  // Fired after photo is captured
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
      alert('Please take a photo first');
      return;
    }

    // Join all non-empty fields
    const text = [this.price, this.size, this.desc]
      .filter(Boolean)
      .join(' • ');

    const fd = new FormData();
    fd.append('photo', this.selectedFile);
    fd.append('text', text);
    fd.append('pos', 'below');  // fixed: text always below image

    this.isLoading = true;

    this.http.post(`${this.baseUrl}/api/generate`, fd, { responseType: 'blob' })
      .subscribe({
        next: async (blob) => {
          this.isLoading = false;
          const file = new File([blob], 'product-label.jpg', { type: blob.type });

          // Try native Web Share first
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({ files: [file], title: 'Sai Fashions Product', text });
              return;
            } catch {
              // if share is cancelled or not supported, fall back to download
            }
          }

          // Fallback: auto-download
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
