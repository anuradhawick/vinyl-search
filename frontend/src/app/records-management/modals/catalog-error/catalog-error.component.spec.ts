import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogErrorModalComponent } from './catalog-error.component';

describe('CatalogErrorModalComponent', () => {
  let component: CatalogErrorModalComponent;
  let fixture: ComponentFixture<CatalogErrorModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CatalogErrorModalComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogErrorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
