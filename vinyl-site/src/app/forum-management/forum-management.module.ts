import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ForumManagementRoutingModule } from './forum-management-routing.module';
import { ForumHomePageComponent } from './forum-home-page/forum-home-page.component';
import { ForumViewPageComponent } from './forum-view-page/forum-view-page.component';
import { ForumEditPageComponent } from './forum-edit-page/forum-edit-page.component';
import { ForumEditorComponentComponent } from './forum-editor-component/forum-editor-component.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { FormsModule } from '@angular/forms';
import { SharedModules } from '../shared-modules/shared.module';
import { ForumService } from './services/forum.service';

@NgModule({
  declarations: [
    ForumHomePageComponent,
    ForumViewPageComponent,
    ForumEditPageComponent,
    ForumEditorComponentComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    ForumManagementRoutingModule,
    CKEditorModule,
    SharedModules
  ],
  providers: [ForumService]
})
export class ForumManagementModule { }
