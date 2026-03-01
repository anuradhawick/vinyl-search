import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrivacyPolicyPageRoutingModule } from './privacy-policy-page-routing.module';
import { PrivacyPolicyPageComponent } from './privacy-policy-page.component';

@NgModule({
  imports: [
    CommonModule,
    PrivacyPolicyPageRoutingModule,
    PrivacyPolicyPageComponent,
  ],
})
export class PrivacyPolicyPageModule {
  constructor() {
    console.log('working');
  }
}
