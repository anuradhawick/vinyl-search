import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { uploadData } from 'aws-amplify/storage';
import { AuthService } from '../../shared-modules/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../shared-modules/services/user.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-update-details',
  templateUrl: './update-details.component.html',
  styleUrls: ['./update-details.component.css'],
})
export class UpdateDetailsComponent implements OnInit {
  public uploadImageUrl = null;
  public uploadableFile: any = null;
  public uploading = false;
  public uploadingProgress = 0;
  private user: any = null; // TODO replace with a replay subject
  private originalUser: any = null;
  public form = new FormGroup({
    firstName: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[a-zA-Z]*$/),
    ]),
    lastName: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[a-zA-Z]*$/),
    ]),
  });

  constructor(
    private auth: AuthService,
    private toastr: ToastrService,
    private userService: UserService,
  ) {}

  ngOnInit() {
    this.auth.user.asObservable().subscribe((u: any) => {
      this.user = u;
      this.originalUser = _.cloneDeep(u);
      this.form.reset({
        firstName: this.originalUser.given_name,
        lastName: this.originalUser.family_name,
      });
    });
    this.form.valueChanges.subscribe((value) => {
      if (this.user) {
        this.user.given_name = value.firstName;
        this.user.family_name = value.lastName;
      }
    });
  }

  addImage(event: any) {
    if (!_.isEmpty(event.target.files)) {
      const file = event.target.files[0];
      const reader = new FileReader();

      this.uploadableFile = file;
      reader.readAsDataURL(file);

      reader.onload = (e: any) => {
        this.uploadImageUrl = e.target.result;
      };
    }
  }

  updateDetails() {
    if (this.form.invalid) {
      return;
    }
    this.userService
      .update_profile({
        given_name: this.user.given_name,
        family_name: this.user.family_name,
      })
      .then(() => {
        this.userService.get_profile().then((u: any) => {
          this.user = u;
          this.originalUser = _.cloneDeep(u);
          this.auth.setUser(u);
        });
      });
  }

  discardDetails() {
    this.form.reset({
      firstName: this.originalUser.given_name,
      lastName: this.originalUser.family_name,
    });
  }

  upload() {
    if (_.isEmpty(this.user)) {
      return;
    }

    const file: File = this.uploadableFile;
    const filename = `${this.user._id}.${file.name.split('.').pop() || ''}`;

    this.uploadableFile = null;
    this.uploadImageUrl = null;
    this.uploading = true;
    this.uploadingProgress = 0;

    uploadData({
      key: `profile-pictures/${filename}`,
      data: file,
      options: {
        accessLevel: 'guest',
        onProgress: (progress: any) => {
          this.uploadingProgress =
            (progress.transferredBytes * 100) / progress.totalBytes;
        },
      },
    })
      .result.then(() => {
        const url = `${environment.cdn_url}profile-pictures/${filename}`;

        this.uploading = false;
        this.userService
          .update_profile({
            picture: url,
          })
          .then(() => {
            this.userService.get_profile().then((u: any) => {
              this.auth.setUser(u);
            });
          });
      })
      .catch((e: any) => {
        this.uploading = false;
        this.toastr.error('Upload failed, Try again later!', 'Error');
        console.error(e);
      });
  }
}
