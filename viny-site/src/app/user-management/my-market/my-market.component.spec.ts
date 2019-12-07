import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyMarketComponent } from './my-market.component';

describe('MyMarketComponent', () => {
  let component: MyMarketComponent;
  let fixture: ComponentFixture<MyMarketComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyMarketComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyMarketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
