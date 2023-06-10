import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './loader/loader.component';
import {
  MatBadgeModule, MatButtonModule, MatCardModule, MatCheckboxModule, MatChipsModule, MatDialogModule,
  MatExpansionModule, MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatOptionModule, MatPaginatorModule, MatProgressBarModule, MatProgressSpinnerModule, MatSelectModule,
  MatTreeModule
} from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageViewerComponent } from './image-viewer/image-viewer.component';
import { ToggleFullscreenDirective } from './image-viewer/fullscreen.directive';
import { ActionConfirmModalComponent } from './modals/action-confirm-modal/action-confirm-modal.component';
import { LoginModalComponent } from './modals/login-modal/login-modal.component';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';

@NgModule({
  declarations: [
    LoaderComponent,
    ImageViewerComponent,
    ToggleFullscreenDirective,
    ActionConfirmModalComponent,
    LoginModalComponent,
    LoginModalComponent
  ],
  providers: [
    UserService,
    AuthService
  ],
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
    MatProgressSpinnerModule,
    MatCardModule,
    MatExpansionModule
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
    MatProgressSpinnerModule,
    ActionConfirmModalComponent,
    MatCardModule,
    MatExpansionModule
  ],
  entryComponents: [
    ActionConfirmModalComponent,
    LoginModalComponent
  ]
})
export class SharedModules {
}
