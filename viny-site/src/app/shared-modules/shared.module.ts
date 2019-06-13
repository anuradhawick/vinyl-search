import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './loader/loader.component';
import { MatBadgeModule, MatButtonModule, MatChipsModule, MatIconModule } from '@angular/material';

@NgModule({
  declarations: [LoaderComponent],
  providers: [],
  imports: [
    CommonModule,
    MatButtonModule,
    MatBadgeModule,
    MatChipsModule,
    MatIconModule

  ],
  exports: [
    LoaderComponent,
    MatButtonModule,
    MatBadgeModule,
    MatChipsModule,
    MatIconModule
  ]
})
export class SharedModules {
}
