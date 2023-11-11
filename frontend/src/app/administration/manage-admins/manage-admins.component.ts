import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared-modules/services/auth.service';
import { AdminService } from '../services/admin.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-manage-admins',
  templateUrl: './manage-admins.component.html',
  styleUrls: ['./manage-admins.component.css']
})
export class ManageAdminsComponent implements OnInit {
  public admins: any = [];
  public loading = true;
  public form: FormGroup;

  constructor(public auth: AuthService,
    private adminService: AdminService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private dg: MatDialog,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.email, Validators.required, Validators.pattern(/[.]+[a-zA-Z0-9]+$/)]]
    });
  }
  
  ngOnInit() {
    this.loadAdmins();
  }

  loadAdmins() {
    this.admins = [];
    this.loading = true;
    this.adminService.get_admins().then((res: any) => {
      this.admins = res.users;
      this.loading = false;
    });
  }

  async removeAdmin(uid: any, name: string, email: string) {
    const { AdminActionConfirmModalComponent } = await import('../modals/admin-action-confirm-modal/admin-action-confirm-modal.component');
    const dialogRef = this.dg.open(AdminActionConfirmModalComponent, { data: {message: `Removing ${name} (${email})`}});

    dialogRef.afterClosed().subscribe((yes) => {
      if (yes) {
        this.adminService.remove_admin(uid).then((res: any) => {
          if (res.success) {
            this.toastr.success('Admin removed successfully', 'Success');
            this.loadAdmins();
          } else {
            this.toastr.error('Unable to remove admin, check email and try again', 'Error');
          }
        });
      }
    })
  }

  createAdmin() {
    if (!this.form.invalid) {
      const email = this.form.get('email')!.value;
      this.adminService.create_admin(email).then((res: any) => {
        if (res.success) {
          this.toastr.success('Admin created successfully', 'Success');
          this.loadAdmins();
          this.form.reset();
        } else {
          this.toastr.error('Unable to create admin, check email and try again', 'Error');
        }
      }).catch(() => {
        this.toastr.error('Unable to create admin, check email and try again', 'Error');
      });
    }
  }

  cancel() {
    this.form.reset();
  }

}
