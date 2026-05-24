import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordsHomePageComponent } from './records-home-page.component';

describe('RecordsHomePageComponent', () => {
  let component: RecordsHomePageComponent;
  let fixture: ComponentFixture<RecordsHomePageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RecordsHomePageComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordsHomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
