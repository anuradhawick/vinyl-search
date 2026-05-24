import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForumViewPageComponent } from './forum-view-page.component';

describe('ForumViewPageComponent', () => {
  let component: ForumViewPageComponent;
  let fixture: ComponentFixture<ForumViewPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ForumViewPageComponent],
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
