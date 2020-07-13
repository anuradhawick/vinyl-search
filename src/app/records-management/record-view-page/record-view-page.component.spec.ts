import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordViewPageComponent } from './record-view-page.component';

describe('RecordViewPageComponent', () => {
  let component: RecordViewPageComponent;
  let fixture: ComponentFixture<RecordViewPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecordViewPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordViewPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
