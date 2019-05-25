import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForumEditorComponentComponent } from './forum-editor-component.component';

describe('ForumEditorComponentComponent', () => {
  let component: ForumEditorComponentComponent;
  let fixture: ComponentFixture<ForumEditorComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForumEditorComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForumEditorComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
