import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordsRevisionViewPageComponent } from './records-revision-view-page.component';

describe('RecordsRevisionViewPageComponent', () => {
  let component: RecordsRevisionViewPageComponent;
  let fixture: ComponentFixture<RecordsRevisionViewPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecordsRevisionViewPageComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordsRevisionViewPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
