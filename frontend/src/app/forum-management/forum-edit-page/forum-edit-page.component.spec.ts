import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForumEditPageComponent } from './forum-edit-page.component';

describe('ForumEditPageComponent', () => {
  let component: ForumEditPageComponent;
  let fixture: ComponentFixture<ForumEditPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ForumEditPageComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForumEditPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
