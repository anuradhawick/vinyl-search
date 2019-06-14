import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './loader/loader.component';
import {
  MatBadgeModule, MatButtonModule, MatChipsModule, MatDialogModule, MatIconModule, MatInputModule,
  MatOptionModule, MatProgressBarModule, MatSelectModule
} from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [LoaderComponent],
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
    MatProgressBarModule
  ],
  exports: [
    CommonModule,
    LoaderComponent,
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
    MatProgressBarModule
  ]
})
export class SharedModules {
}
