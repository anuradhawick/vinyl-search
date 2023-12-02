import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionConfirmModalComponent } from './action-confirm-modal.component';

describe('AdminActionConfirmModalComponent', () => {
  let component: ActionConfirmModalComponent;
  let fixture: ComponentFixture<ActionConfirmModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ActionConfirmModalComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionConfirmModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
