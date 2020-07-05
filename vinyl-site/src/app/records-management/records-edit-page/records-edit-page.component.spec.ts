import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordsEditPageComponent } from './records-edit-page.component';

describe('RecordsEditPageComponent', () => {
  let component: RecordsEditPageComponent;
  let fixture: ComponentFixture<RecordsEditPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecordsEditPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordsEditPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
