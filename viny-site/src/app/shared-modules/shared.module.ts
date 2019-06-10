import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './loader/loader.component';

@NgModule({
  declarations: [LoaderComponent],
  providers: [],
  imports: [
    CommonModule
  ],
  exports: [LoaderComponent]
})
export class SharedModules { }
