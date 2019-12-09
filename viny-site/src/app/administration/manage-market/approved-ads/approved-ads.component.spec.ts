import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovedAdsComponent } from './approved-ads.component';

describe('ApprovedAdsComponent', () => {
  let component: ApprovedAdsComponent;
  let fixture: ComponentFixture<ApprovedAdsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApprovedAdsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprovedAdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
