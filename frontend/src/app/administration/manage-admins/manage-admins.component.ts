import { Component, OnInit, signal } from '@angular/core';
import { AuthService } from '../../shared-modules/services/auth.service';
import { AdminService } from '../services/admin.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import {
  MatList,
  MatListItem,
  MatListItemAvatar,
  MatListItemTitle,
  MatListItemLine,
} from '@angular/material/list';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { LoaderComponent } from '../../shared-modules/loader/loader.component';
import { MatFormField, MatInput, MatError } from '@angular/material/input';

@Component({
  selector: 'app-manage-admins',
  templateUrl: './manage-admins.component.html',
  styleUrls: ['./manage-admins.component.css'],
  imports: [
    MatList,
    MatListItem,
    MatListItemAvatar,
    MatListItemTitle,
    MatListItemLine,
    MatIconButton,
    MatIcon,
    LoaderComponent,
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatError,
    MatButton,
  ],
})
export class ManageAdminsComponent implements OnInit {
  public admins = signal<any[]>([]);
  public loading = signal(true);
  public form: FormGroup;

  constructor(
    public auth: AuthService,
    private adminService: AdminService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private dg: MatDialog,
  ) {
    this.form = this.fb.group({
      email: [
        '',
        [
          Validators.email,
          Validators.required,
          Validators.pattern(/[.]+[a-zA-Z0-9]+$/),
        ],
      ],
    });
  }

  ngOnInit() {
    this.loadAdmins();
  }

  loadAdmins() {
    this.admins.set([]);
    this.loading.set(true);
    this.adminService.get_admins().then((res: any) => {
      this.admins.set(res.users);
      this.loading.set(false);
    });
  }

  async removeAdmin(uid: any, name: string, email: string) {
    const { AdminActionConfirmModalComponent } = await import(
      '../modals/admin-action-confirm-modal/admin-action-confirm-modal.component'
    );
    const dialogRef = this.dg.open(AdminActionConfirmModalComponent, {
      data: { message: `Removing ${name} (${email})` },
    });

    dialogRef.afterClosed().subscribe((yes) => {
      if (yes) {
        this.adminService.remove_admin(uid).then((res: any) => {
          if (res.success) {
            this.toastr.success('Admin removed successfully', 'Success');
            this.loadAdmins();
          } else {
            this.toastr.error(
              'Unable to remove admin, check email and try again',
              'Error',
            );
          }
        });
      }
    });
  }

  createAdmin() {
    if (!this.form.invalid) {
      const email = this.form.get('email')!.value;
      this.adminService
        .create_admin(email)
        .then((res: any) => {
          if (res.success) {
            this.toastr.success('Admin created successfully', 'Success');
            this.loadAdmins();
            this.form.reset();
          } else {
            this.toastr.error(
              'Unable to create admin, check email and try again',
              'Error',
            );
          }
        })
        .catch(() => {
          this.toastr.error(
            'Unable to create admin, check email and try again',
            'Error',
          );
        });
    }
  }

  cancel() {
    this.form.reset();
  }
}
