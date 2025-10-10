import { Component, ElementRef, ViewChild } from '@angular/core';
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
  @ViewChild('imageRef') imageRef!: ElementRef<HTMLImageElement>;

  previewUrl: string | ArrayBuffer | null = null;
  croppedPreviewUrl: string | null = null;
  selectedFile: File | null = null;

  cropConfirmed = false;
  isDragging = false;
  cropBoxSet = false;
  startX = 0;
  startY = 0;

  cropBox = { left: 50, top: 50, width: 100, height: 100 };
  imageNaturalWidth = 0;
  imageNaturalHeight = 0;

  price = '';
  size = '';
  desc = '';
  isLoading = false;
  baseUrl: string = environment.PhotoEditorAPIBaseURL;
  sequence = 1;

  availableSizes: string[] = ['S', 'M', 'L', 'XL', 'XXL', 'FREE SIZE'];
  filteredSizes: string[] = [];
  showSuggestions = false;

  constructor(private http: HttpClient) {}

  filterSizes() {
    const value = this.size.toLowerCase();
    this.filteredSizes = this.availableSizes.filter(opt => opt.toLowerCase().includes(value));
    this.showSuggestions = this.filteredSizes.length > 0;
  }

  selectSize(option: string) {
    this.size = option;
    this.showSuggestions = false;
  }

  hideSuggestions() {
    setTimeout(() => (this.showSuggestions = false), 150);
  }

  onCameraClick(input: HTMLInputElement): void {
    input.value = '';
    input.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.selectedFile = input.files[0];

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result;
      this.cropConfirmed = false;
    };
    reader.readAsDataURL(this.selectedFile);
  }

  onImageLoad(image: HTMLImageElement) {
    this.imageNaturalWidth = image.naturalWidth;
    this.imageNaturalHeight = image.naturalHeight;
  }

  startCrop(event: MouseEvent) {
    this.isDragging = true;
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.startX = event.clientX - rect.left;
    this.startY = event.clientY - rect.top;
  }

  moveCrop(event: MouseEvent) {
    if (!this.isDragging) return;
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const currentX = event.clientX - rect.left;
    const currentY = event.clientY - rect.top;

    this.cropBox.left = Math.min(this.startX, currentX);
    this.cropBox.top = Math.min(this.startY, currentY);
    this.cropBox.width = Math.abs(currentX - this.startX);
    this.cropBox.height = Math.abs(currentY - this.startY);
    this.cropBoxSet = true;
  }

  endCrop() {
    this.isDragging = false;
  }

  confirmCrop() {
    const img = this.imageRef.nativeElement;
    const canvas = document.createElement('canvas');
    const scaleX = this.imageNaturalWidth / img.clientWidth;
    const scaleY = this.imageNaturalHeight / img.clientHeight;

    const sx = this.cropBox.left * scaleX;
    const sy = this.cropBox.top * scaleY;
    const sw = this.cropBox.width * scaleX;
    const sh = this.cropBox.height * scaleY;

    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

    this.croppedPreviewUrl = canvas.toDataURL('image/jpeg');
    this.cropConfirmed = true;
  }

  resetCrop() {
    this.cropBoxSet = false;
    this.cropBox = { left: 50, top: 50, width: 100, height: 100 };
  }

  async generateImage(): Promise<void> {
    const finalImage = this.croppedPreviewUrl || (this.previewUrl as string);
    if (!finalImage) { alert('Please take or crop an image first'); return; }

    const blob = await (await fetch(finalImage)).blob();
    const fd = new FormData();
    fd.append('photo', blob, 'cropped.jpg');
    fd.append('desc', this.desc);
    fd.append('text', `${this.size} ---- ₹${this.price}/-`);
    fd.append('pos', 'bottom');

    this.isLoading = true;
    this.http.post(`${this.baseUrl}/api/generate`, fd, { responseType: 'blob' })
      .subscribe({
        next: (blob) => {
          this.isLoading = false;
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