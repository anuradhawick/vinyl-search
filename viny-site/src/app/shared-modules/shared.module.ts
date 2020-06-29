import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './loader/loader.component';
import {
  MatBadgeModule, MatButtonModule, MatCheckboxModule, MatChipsModule, MatDialogModule, MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatOptionModule, MatPaginatorModule, MatProgressBarModule, MatProgressSpinnerModule, MatSelectModule,
  MatTreeModule
} from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageViewerComponent } from './image-viewer/image-viewer.component';
import { ToggleFullscreenDirective } from './image-viewer/fullscreen.directive';

@NgModule({
  declarations: [LoaderComponent, ImageViewerComponent, ToggleFullscreenDirective],
  providers: [],
  imports: [
    CommonModule,
    MatButtonModule,
    MatBadgeModule,
    MatChipsModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatIconModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatListModule,
    MatMenuModule,
    MatTreeModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  exports: [
    CommonModule,
    ToggleFullscreenDirective,
    LoaderComponent,
    ImageViewerComponent,
    MatButtonModule,
    MatBadgeModule,
    MatChipsModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatIconModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatListModule,
    MatMenuModule,
    MatTreeModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ]
})
export class SharedModules {
}
