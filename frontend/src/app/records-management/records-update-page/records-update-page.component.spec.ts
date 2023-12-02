import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordsUpdatePageComponent } from './records-update-page.component';

describe('RecordsUpdatePageComponent', () => {
  let component: RecordsUpdatePageComponent;
  let fixture: ComponentFixture<RecordsUpdatePageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecordsUpdatePageComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordsUpdatePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
