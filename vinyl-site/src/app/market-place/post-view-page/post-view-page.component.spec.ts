import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostViewPageComponent } from './post-view-page.component';

describe('PostViewPageComponent', () => {
  let component: PostViewPageComponent;
  let fixture: ComponentFixture<PostViewPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostViewPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostViewPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
