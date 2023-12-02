import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyForumComponent } from './my-forum.component';

describe('MyForumComponent', () => {
  let component: MyForumComponent;
  let fixture: ComponentFixture<MyForumComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MyForumComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyForumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
