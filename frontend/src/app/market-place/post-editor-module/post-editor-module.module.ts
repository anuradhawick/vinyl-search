import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostEditorComponent } from './post-editor.component';
import { SharedModules } from '../../shared-modules/shared.module';

@NgModule({
  imports: [CommonModule, SharedModules, PostEditorComponent],
  exports: [PostEditorComponent],
})
export class PostEditorModule {}
