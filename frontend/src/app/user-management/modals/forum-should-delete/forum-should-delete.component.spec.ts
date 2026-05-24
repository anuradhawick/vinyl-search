import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForumShouldDeleteModalComponent } from './forum-should-delete.component';

describe('ForumShouldDeleteModalComponent', () => {
  let component: ForumShouldDeleteModalComponent;
  let fixture: ComponentFixture<ForumShouldDeleteModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ForumShouldDeleteModalComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForumShouldDeleteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
