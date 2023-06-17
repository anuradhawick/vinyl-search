import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrivacyPolicyPageRoutingModule } from './privacy-policy-page-routing.module';
import { PrivacyPolicyPageComponent } from './privacy-policy-page.component';

@NgModule({
  declarations: [
    PrivacyPolicyPageComponent
  ],
  imports: [
    CommonModule,
    PrivacyPolicyPageRoutingModule
  ]
})
export class PrivacyPolicyPageModule {
  constructor () {
    console.log("working")
  }
}
