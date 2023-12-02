import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpiredAdsComponent } from './expired-ads.component';

describe('ExpiredAdsComponent', () => {
  let component: ExpiredAdsComponent;
  let fixture: ComponentFixture<ExpiredAdsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExpiredAdsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpiredAdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
