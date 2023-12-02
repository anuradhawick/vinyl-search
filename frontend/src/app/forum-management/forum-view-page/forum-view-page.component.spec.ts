import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForumViewPageComponent } from './forum-view-page.component';

describe('ForumViewPageComponent', () => {
  let component: ForumViewPageComponent;
  let fixture: ComponentFixture<ForumViewPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ForumViewPageComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForumViewPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
