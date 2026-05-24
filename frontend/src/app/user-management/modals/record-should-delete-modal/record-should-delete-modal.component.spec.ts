import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordShouldDeleteModalComponent } from './record-should-delete-modal.component';

describe('RecordShouldDeleteModalComponent', () => {
  let component: RecordShouldDeleteModalComponent;
  let fixture: ComponentFixture<RecordShouldDeleteModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RecordShouldDeleteModalComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordShouldDeleteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
