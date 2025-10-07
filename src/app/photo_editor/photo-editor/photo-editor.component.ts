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
  sequence = 1;

  availableSizes: string[] = [
    '0X0', '16X18', '20X24', '26X30', '20X30',
    '32X34', 'S', 'M', 'L', 'XL', 'XXL', '2X7',
    '5X10', '32X40', '28X32', '32X36', 'FREE SIZE'
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

    const fd = new FormData();
    fd.append('photo', this.selectedFile);
    fd.append('desc', this.desc);
    fd.append('text', this.size + " ---- ₹" + this.price + "/-");
    fd.append('pos', 'bottom');

    this.isLoading = true;
    this.http.post(`${this.baseUrl}/api/generate`, fd, { responseType: 'blob' })
      .subscribe({
        next: (blob) => {
          this.isLoading = false;
          // Filename format: desc_size_sequence
          const safeDesc = this.desc.replace(/\s+/g, '_') || 'no-desc';
          const safeSize = this.size.replace(/\s+/g, '_') || 'no-size';
          const fileName = `${safeDesc}_${safeSize}_${this.sequence++}.jpg`;

          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          a.click();
          window.URL.revokeObjectURL(url);

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
