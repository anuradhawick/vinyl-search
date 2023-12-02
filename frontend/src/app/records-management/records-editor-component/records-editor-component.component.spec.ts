import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordsEditorComponentComponent } from './records-editor-component.component';

describe('RecordsEditorComponentComponent', () => {
  let component: RecordsEditorComponentComponent;
  let fixture: ComponentFixture<RecordsEditorComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecordsEditorComponentComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordsEditorComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
