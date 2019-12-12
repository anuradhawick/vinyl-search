import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostEditorComponent } from './post-editor.component';
import { ImageViewerModule } from 'ngx-image-viewer';
import { SharedModules } from '../../shared-modules/shared.module';

@NgModule({
  declarations: [
    PostEditorComponent
  ],
  imports: [
    CommonModule,
    ImageViewerModule,
    SharedModules
  ],
  exports: [
    PostEditorComponent
  ]
})
export class PostEditorModule { }
