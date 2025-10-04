import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css'],
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class PhotoEditorComponent {
  previewUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  price = '';
  size = '';
  desc = '';
  isLoading = false;
  baseUrl: string = environment.PhotoEditorAPIBaseURL;

  availableSizes: string[] = [
    '0 X 0', '16 X 18', '20 X 24', '26 X 30', '20 X 30',
    '32 X 34', 'S', 'M', 'L', 'XL', 'XXL', '2 X 7',
    '5 X 10', '32 X 40', '28 X 32', '32 X 36'
  ];

  filteredSizes: string[] = [];
  showSuggestions = false;

  constructor(private http: HttpClient) { }

  filterSizes() {
    const value = this.size.toLowerCase();
    this.filteredSizes = this.availableSizes.filter(opt =>
      opt.toLowerCase().includes(value)
    );
    this.showSuggestions = this.filteredSizes.length > 0;
  }

  selectSize(option: string) {
    this.size = option;
    this.showSuggestions = false;
  }

  hideSuggestions() {
    setTimeout(() => this.showSuggestions = false, 150);
  }

  onCameraClick(input: HTMLInputElement): void {
    input.value = '';
    input.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.selectedFile = input.files[0];
    const reader = new FileReader();
    reader.onload = () => this.previewUrl = reader.result;
    reader.readAsDataURL(this.selectedFile);
  }

  async generateImage(): Promise<void> {
    if (!this.selectedFile) { alert('Please take a photo first'); return; }

    const text = [this.price, this.size, this.desc].filter(Boolean).join(' • ');

    const fd = new FormData();
    fd.append('photo', this.selectedFile);
    fd.append('text', text);
    fd.append('pos', 'below');

    this.isLoading = true;
    this.http.post(`${this.baseUrl}/api/generate`, fd, { responseType: 'blob' })
      .subscribe({
        next: (blob) => {
          this.isLoading = false;
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'product-label.jpg';
          a.click();
          window.URL.revokeObjectURL(url);

          // Reset only the photo
          this.previewUrl = null;
          this.selectedFile = null;
        },
        error: (err) => {
          this.isLoading = false;
          alert('Error: ' + (err.message || 'Server error'));
        }
      });
  }
}
