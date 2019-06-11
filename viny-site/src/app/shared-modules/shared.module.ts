import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './loader/loader.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { AppModule } from '../app.module';

@NgModule({
  declarations: [LoaderComponent],
  providers: [],
  imports: [
    CommonModule,
    // BrowserAnimationsModule
    // BrowserAnimationsModule,
    // BrowserModule,

  ],
  exports: [
    LoaderComponent,
    // BrowserAnimationsModule,
    // BrowserModule
  ]
})
export class SharedModules {
}
