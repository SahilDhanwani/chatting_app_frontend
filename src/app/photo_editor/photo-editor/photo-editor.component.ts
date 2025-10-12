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
  resizeMode: 'tl' | 'tr' | 'bl' | 'br' | null = null;
  startX = 0; startY = 0;

  cropBox = { left: 50, top: 50, width: 100, height: 100 };
  imageNaturalWidth = 0; imageNaturalHeight = 0;

  price = ''; size = ''; desc = ''; isLoading = false; baseUrl = environment.PhotoEditorAPIBaseURL; sequence = 1;
  availableSizes = ['S', 'M', 'L', 'XL', 'XXL', 'FREE SIZE']; filteredSizes: string[] = []; showSuggestions = false;

  constructor(private http: HttpClient) { }

  filterSizes() {
    const value = this.size.toLowerCase();
    this.filteredSizes = this.availableSizes.filter(opt => opt.toLowerCase().includes(value));
    this.showSuggestions = this.filteredSizes.length > 0;
  }
  selectSize(option: string) { this.size = option; this.showSuggestions = false; }
  hideSuggestions() { setTimeout(() => this.showSuggestions = false, 150); }
  onCameraClick(input: HTMLInputElement) { input.value = ''; input.click(); }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.selectedFile = input.files[0];
    const reader = new FileReader();
    reader.onload = () => { this.previewUrl = reader.result; this.cropConfirmed = false; };
    reader.readAsDataURL(this.selectedFile);
  }
  onImageLoad(image: HTMLImageElement) { this.imageNaturalWidth = image.naturalWidth; this.imageNaturalHeight = image.naturalHeight; }

  startCrop(event: MouseEvent | TouchEvent) {
    const e = 'touches' in event ? event.touches[0] : event;
    this.isDragging = true;
    const rect = this.imageRef.nativeElement.getBoundingClientRect();
    this.startX = e.clientX - rect.left; this.startY = e.clientY - rect.top;
  }

  moveCrop(event: MouseEvent | TouchEvent) {
    const e = 'touches' in event ? event.touches[0] : event;
    const rect = this.imageRef.nativeElement.getBoundingClientRect();
    const clientX = e.clientX - rect.left; const clientY = e.clientY - rect.top;

    if (this.resizeMode) {
      switch (this.resizeMode) {
        case 'tl':
          this.cropBox.width += this.cropBox.left - clientX;
          this.cropBox.height += this.cropBox.top - clientY;
          this.cropBox.left = clientX; this.cropBox.top = clientY; break;
        case 'tr':
          this.cropBox.width = clientX - this.cropBox.left;
          this.cropBox.height += this.cropBox.top - clientY;
          this.cropBox.top = clientY; break;
        case 'bl':
          this.cropBox.width += this.cropBox.left - clientX;
          this.cropBox.left = clientX;
          this.cropBox.height = clientY - this.cropBox.top; break;
        case 'br':
          this.cropBox.width = clientX - this.cropBox.left;
          this.cropBox.height = clientY - this.cropBox.top; break;
      }
      // keep inside bounds
      if (this.cropBox.left < 0) this.cropBox.left = 0;
      if (this.cropBox.top < 0) this.cropBox.top = 0;
      const img = this.imageRef.nativeElement;
      if (this.cropBox.left + this.cropBox.width > img.clientWidth) this.cropBox.width = img.clientWidth - this.cropBox.left;
      if (this.cropBox.top + this.cropBox.height > img.clientHeight) this.cropBox.height = img.clientHeight - this.cropBox.top;
      this.cropBoxSet = true;
    } else if (this.isDragging) {
      this.cropBox.left = clientX - this.cropBox.width / 2;
      this.cropBox.top = clientY - this.cropBox.height / 2;
      if (this.cropBox.left < 0) this.cropBox.left = 0;
      if (this.cropBox.top < 0) this.cropBox.top = 0;
      const img = this.imageRef.nativeElement;
      if (this.cropBox.left + this.cropBox.width > img.clientWidth) this.cropBox.left = img.clientWidth - this.cropBox.width;
      if (this.cropBox.top + this.cropBox.height > img.clientHeight) this.cropBox.top = img.clientHeight - this.cropBox.height;
      this.cropBoxSet = true;
    }
  }

  startResize(event: MouseEvent | TouchEvent, corner: 'tl' | 'tr' | 'bl' | 'br') { event.stopPropagation(); this.resizeMode = corner; }
  endCrop() { this.isDragging = false; this.resizeMode = null; }

  confirmCrop() {
    const img = this.imageRef.nativeElement;
    const canvas = document.createElement('canvas');
    const scaleX = this.imageNaturalWidth / img.clientWidth;
    const scaleY = this.imageNaturalHeight / img.clientHeight;
    const sx = this.cropBox.left * scaleX;
    const sy = this.cropBox.top * scaleY;
    const sw = this.cropBox.width * scaleX;
    const sh = this.cropBox.height * scaleY;
    canvas.width = sw; canvas.height = sh;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    this.croppedPreviewUrl = canvas.toDataURL('image/jpeg'); this.cropConfirmed = true;
  }

  resetCrop() { this.cropBoxSet = false; this.cropBox = { left: 50, top: 50, width: 100, height: 100 }; }

  async generateImage() {
    const finalImage = this.croppedPreviewUrl || (this.previewUrl as string);
    if (!finalImage) { alert('Please take or crop an image first'); return; }
    const blob = await (await fetch(finalImage)).blob();
    const fd = new FormData();
    fd.append('photo', blob, 'cropped.jpg');
    fd.append('desc', this.desc);
    fd.append('text', `${this.size} ---- ₹${this.price}/-`);
    fd.append('pos', 'bottom');

    this.isLoading = true;
    this.http.post(`${this.baseUrl}/api/generate`, fd, { responseType: 'blob' }).subscribe({
      next: blob => {
        this.isLoading = false;
        const safeDesc = this.desc.replace(/\s+/g, '_') || 'no-desc';
        const safeSize = this.size.replace(/\s+/g, '_') || 'no-size';
        const fileName = `${safeDesc}_${safeSize}_${this.sequence++}.jpg`;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = fileName; a.click();
        window.URL.revokeObjectURL(url);
        this.previewUrl = null; this.selectedFile = null;
      },
      error: err => { this.isLoading = false; alert('Error: ' + (err.message || 'Server error')); }
    });
  }
}
