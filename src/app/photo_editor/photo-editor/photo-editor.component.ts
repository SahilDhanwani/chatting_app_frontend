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
  resizeMode: string | null = null;
  isResizing = false;
  startX = 0;
  startY = 0;

  cropBox = { left: 0, top: 0, width: 100, height: 100 };
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

  constructor(private http: HttpClient) { }

  ngOnInit() {
    // Bind global listeners for dragging/resizing
    window.addEventListener('mousemove', (e) => this.moveDrag(e));
    window.addEventListener('mouseup', () => this.endDrag());
    window.addEventListener('touchmove', (e) => this.moveDrag(e));
    window.addEventListener('touchend', () => this.endDrag());
  }

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

    // Get image position inside container
    const rect = image.getBoundingClientRect();
    const containerRect = image.parentElement!.getBoundingClientRect();

    // Initialize crop box to exactly cover image
    this.cropBox.left = rect.left - containerRect.left;
    this.cropBox.top = rect.top - containerRect.top;
    this.cropBox.width = rect.width;
    this.cropBox.height = rect.height;
  }

  startDrag(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    if (this.resizeMode) {
      this.isResizing = true;
    } else {
      this.isDragging = true;
    }
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    this.startX = clientX - this.cropBox.left;
    this.startY = clientY - this.cropBox.top;
  }

  moveDrag(event: MouseEvent | TouchEvent) {
    if (!this.isDragging && !this.isResizing) return;
    event.preventDefault();

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const img = this.imageRef.nativeElement;
    const rect = img.getBoundingClientRect();
    const containerRect = img.parentElement!.getBoundingClientRect();

    // Relative coordinates inside container
    const relativeX = clientX - containerRect.left;
    const relativeY = clientY - containerRect.top;

    if (this.isResizing && this.resizeMode) {
      this.handleResize(relativeX, relativeY, img);
    } else if (this.isDragging) {
      this.cropBox.left = Math.min(Math.max(relativeX - this.startX, 0), img.clientWidth - this.cropBox.width);
      this.cropBox.top = Math.min(Math.max(relativeY - this.startY, 0), img.clientHeight - this.cropBox.height);
    }
  }

  endDrag() {
    this.isDragging = false;
    this.isResizing = false;
    this.resizeMode = null;
  }

  startResize(event: MouseEvent | TouchEvent, corner: string) {
    event.stopPropagation();
    this.resizeMode = corner;
    this.startDrag(event);
  }

  handleResize(clientX: number, clientY: number, img: HTMLImageElement) {
    const box = this.cropBox;

    switch (this.resizeMode) {
      case 'tl': box.width += box.left - clientX; box.height += box.top - clientY; box.left = clientX; box.top = clientY; break;
      case 'tr': box.width = clientX - box.left; box.height += box.top - clientY; box.top = clientY; break;
      case 'bl': box.width += box.left - clientX; box.left = clientX; box.height = clientY - box.top; break;
      case 'br': box.width = clientX - box.left; box.height = clientY - box.top; break;
      case 't': box.height += box.top - clientY; box.top = clientY; break;
      case 'b': box.height = clientY - box.top; break;
      case 'l': box.width += box.left - clientX; box.left = clientX; break;
      case 'r': box.width = clientX - box.left; break;
    }

    // Keep inside bounds
    if (box.left < 0) box.left = 0;
    if (box.top < 0) box.top = 0;
    if (box.left + box.width > img.clientWidth) box.width = img.clientWidth - box.left;
    if (box.top + box.height > img.clientHeight) box.height = img.clientHeight - box.top;
  }

  confirmCrop() {
    const img = this.imageRef.nativeElement;
    const canvas = document.createElement('canvas');
    const scaleX = this.imageNaturalWidth / img.clientWidth;
    const scaleY = this.imageNaturalHeight / img.clientHeight;

    canvas.width = this.cropBox.width * scaleX;
    canvas.height = this.cropBox.height * scaleY;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(
      img,
      this.cropBox.left * scaleX,
      this.cropBox.top * scaleY,
      this.cropBox.width * scaleX,
      this.cropBox.height * scaleY,
      0,
      0,
      this.cropBox.width * scaleX,
      this.cropBox.height * scaleY
    );

    this.croppedPreviewUrl = canvas.toDataURL('image/jpeg');
    this.cropConfirmed = true;
  }

  resetCrop() {
    const img = this.imageRef.nativeElement;
    this.cropBox = { left: 0, top: 0, width: img.clientWidth, height: img.clientHeight };
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
        next: (respBlob: Blob) => {
          this.isLoading = false;
          const safeDesc = this.desc.replace(/\s+/g, '_') || 'no-desc';
          const safeSize = this.size.replace(/\s+/g, '_') || 'no-size';
          const fileName = `${safeDesc}_${safeSize}_${this.sequence++}.jpg`;

          const url = window.URL.createObjectURL(respBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          a.click();
          window.URL.revokeObjectURL(url);

          this.previewUrl = null;
          this.selectedFile = null;
        },
        error: (error: any) => {
          this.isLoading = false;
          alert('Error: ' + (error.message || 'Server error'));
        }
      });
  }
}
