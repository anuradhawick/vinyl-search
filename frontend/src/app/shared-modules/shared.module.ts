import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './loader/loader.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageViewerComponent } from './image-viewer/image-viewer.component';
import { ToggleFullscreenDirective } from './image-viewer/fullscreen.directive';
import { ActionConfirmModalComponent } from './modals/action-confirm-modal/action-confirm-modal.component';
import { LoginModalComponent } from './modals/login-modal/login-modal.component';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
// material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatTreeModule } from '@angular/material/tree';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';

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
    MatFormFieldModule,
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
    MatFormFieldModule,
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
  ]
})
export class SharedModules {
}
