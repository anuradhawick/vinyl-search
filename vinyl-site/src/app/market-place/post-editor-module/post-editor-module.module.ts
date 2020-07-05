import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostEditorComponent } from './post-editor.component';
import { SharedModules } from '../../shared-modules/shared.module';

@NgModule({
  declarations: [
    PostEditorComponent
  ],
  imports: [
    CommonModule,
    SharedModules
  ],
  exports: [
    PostEditorComponent
  ]
})
export class PostEditorModule { }
