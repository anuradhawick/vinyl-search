import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomePageComponent } from './home/home-page/home-page.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AuctionsPageComponent } from './events/auctions-page/auctions-page.component';
import { FormsModule } from '@angular/forms';
import { ForumHomePageComponent } from './forum/forum-home-page/forum-home-page.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ForumViewPageComponent } from './forum/forum-view-page/forum-view-page.component';
import { ForumEditPageComponent } from './forum/forum-edit-page/forum-edit-page.component';
import { LoaderComponent } from './shared/loader/loader.component';
import { RecordsHomePageComponent } from './records/records-home-page/records-home-page.component';
import { RecordsEditPageComponent } from './records/records-edit-page/records-edit-page.component';
import { RecordViewPageComponent } from './records/record-view-page/record-view-page.component';
import { ImageViewerModule } from 'ngx-image-viewer';
import { ForumEditorComponentComponent } from './forum/forum-editor-component/forum-editor-component.component';
import { RecordsEditorComponentComponent } from './records/records-editor-component/records-editor-component.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { RecordsUpdatePageComponent } from './records/records-update-page/records-update-page.component';
import { RecordsRevisionViewPageComponent } from './records/records-revision-view-page/records-revision-view-page.component';

@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    AuctionsPageComponent,
    ForumHomePageComponent,
    ForumViewPageComponent,
    ForumEditPageComponent,
    LoaderComponent,
    RecordsHomePageComponent,
    RecordsEditPageComponent,
    RecordViewPageComponent,
    ForumEditorComponentComponent,
    RecordsEditorComponentComponent,
    RecordsUpdatePageComponent,
    RecordsRevisionViewPageComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    FormsModule,
    NgbModule,
    CKEditorModule,
    ImageViewerModule.forRoot(),
    HttpClientModule,
    BrowserAnimationsModule,
    CommonModule,
    ToastrModule.forRoot({
      preventDuplicates: true,
    })
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
