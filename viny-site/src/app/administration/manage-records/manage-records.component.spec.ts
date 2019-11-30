import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageRecordsComponent } from './manage-records.component';

describe('ManageRecordsComponent', () => {
  let component: ManageRecordsComponent;
  let fixture: ComponentFixture<ManageRecordsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageRecordsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
