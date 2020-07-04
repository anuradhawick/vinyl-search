import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarketPlaceRoutingModule } from './market-place-routing.module';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { FormsModule } from '@angular/forms';
import { SharedModules } from '../shared-modules/shared.module';
import { NewPostComponent } from './new-post/new-post.component';
import { PostViewPageComponent } from './post-view-page/post-view-page.component';
import { PostEditorModule } from './post-editor-module/post-editor-module.module';
import { ReportModalComponent } from './modals/report-modal/report-modal.component';
import { PostEditPageComponent } from './post-edit-page/post-edit-page.component';
import { MarketService } from './services/market.service';

@NgModule({
  declarations: [LandingPageComponent, NewPostComponent, PostViewPageComponent, ReportModalComponent, PostEditPageComponent],
  imports: [
    CommonModule,
    MarketPlaceRoutingModule,
    FormsModule,
    SharedModules,
    PostEditorModule
  ],
  entryComponents: [
    ReportModalComponent
  ],
  providers: [
    MarketService
  ]
})
export class MarketPlaceModule {
}
