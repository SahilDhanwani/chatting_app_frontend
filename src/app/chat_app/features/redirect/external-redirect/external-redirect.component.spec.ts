import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalRedirectComponent } from './external-redirect.component';

describe('ExternalRedirectComponent', () => {
  let component: ExternalRedirectComponent;
  let fixture: ComponentFixture<ExternalRedirectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExternalRedirectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExternalRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
