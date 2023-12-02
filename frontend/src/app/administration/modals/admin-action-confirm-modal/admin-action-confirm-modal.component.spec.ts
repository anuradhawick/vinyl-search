import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminActionConfirmModalComponent } from './admin-action-confirm-modal.component';

describe('AdminActionConfirmModalComponent', () => {
  let component: AdminActionConfirmModalComponent;
  let fixture: ComponentFixture<AdminActionConfirmModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdminActionConfirmModalComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminActionConfirmModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
