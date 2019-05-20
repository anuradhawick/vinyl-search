import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomePageComponent } from './home/home-page/home-page.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AuctionsPageComponent } from './events/auctions-page/auctions-page.component';
import { FormsModule } from '@angular/forms';
import { ForumHomePageComponent } from './forum/forum-home-page/forum-home-page.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ForumViewPageComponent } from './forum/forum-view-page/forum-view-page.component';
import { ForumEditPageComponent } from './forum/forum-edit-page/forum-edit-page.component';
import { AngularFireFunctionsModule, FunctionsRegionToken } from '@angular/fire/functions';
import { LoaderComponent } from './shared/loader/loader.component';
import { RecordsHomePageComponent } from './records/records-home-page/records-home-page.component';
import { RecordsEditPageComponent } from './records/records-edit-page/records-edit-page.component';

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
    RecordsEditPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    NgbModule,
    CKEditorModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features,
    AngularFireStorageModule, // imports firebase/storage only needed for storage features
    AngularFireFunctionsModule // to call firebase functions directly
  ],
  providers: [
    { provide: FunctionsRegionToken, useValue: 'us-central1' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
