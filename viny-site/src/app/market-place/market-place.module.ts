import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarketPlaceRoutingModule } from './market-place-routing.module';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { FormsModule } from '@angular/forms';
import { SharedModules } from '../shared-modules/shared.module';
import { NewPostComponent } from './new-post/new-post.component';
import { ImageViewerModule } from 'ngx-image-viewer';
import { PostViewPageComponent } from './post-view-page/post-view-page.component';
import { PostEditorModule } from './post-editor-module/post-editor-module.module';

@NgModule({
  declarations: [LandingPageComponent, NewPostComponent, PostViewPageComponent],
  imports: [
    ImageViewerModule,
    CommonModule,
    MarketPlaceRoutingModule,
    FormsModule,
    SharedModules,
    PostEditorModule
  ]
})
export class MarketPlaceModule { }
