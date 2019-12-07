import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarketPlaceRoutingModule } from './market-place-routing.module';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { FormsModule } from '@angular/forms';
import { SharedModules } from '../shared-modules/shared.module';
import { NewPostComponent } from './new-post/new-post.component';
import { PostEditorComponent } from './post-editor/post-editor.component';
import { ImageViewerModule } from 'ngx-image-viewer';
import { PostViewPageComponent } from './post-view-page/post-view-page.component';

@NgModule({
  declarations: [LandingPageComponent, NewPostComponent, PostEditorComponent, PostViewPageComponent],
  imports: [
    ImageViewerModule,
    CommonModule,
    MarketPlaceRoutingModule,
    FormsModule,
    SharedModules
  ]
})
export class MarketPlaceModule { }
