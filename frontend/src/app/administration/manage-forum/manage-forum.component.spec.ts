import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageForumComponent } from './manage-forum.component';

describe('ManageForumComponent', () => {
  let component: ManageForumComponent;
  let fixture: ComponentFixture<ManageForumComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageForumComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageForumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
