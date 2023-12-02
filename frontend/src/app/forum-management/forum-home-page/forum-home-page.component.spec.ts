import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForumHomePageComponent } from './forum-home-page.component';

describe('ForumHomePageComponent', () => {
  let component: ForumHomePageComponent;
  let fixture: ComponentFixture<ForumHomePageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ForumHomePageComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForumHomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
