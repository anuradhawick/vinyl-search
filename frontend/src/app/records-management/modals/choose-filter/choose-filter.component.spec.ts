import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChooseFilterComponent } from './choose-filter.component';

describe('ChooseFilterComponent', () => {
  let component: ChooseFilterComponent;
  let fixture: ComponentFixture<ChooseFilterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChooseFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
