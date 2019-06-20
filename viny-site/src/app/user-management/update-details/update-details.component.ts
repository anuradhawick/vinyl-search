import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { Storage } from 'aws-amplify';
import { AuthService } from '../../shared-modules/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../services/user.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-update-details',
  templateUrl: './update-details.component.html',
  styleUrls: ['./update-details.component.css']
})
export class UpdateDetailsComponent implements OnInit {
  public uploadImageUrl = null;
  public uploadableFile = null;
  public uploading = false;
  public uploadingProgress = 0;
  private user = null; // TODO replace with a replay subject
  private originalUser = null;
  public form = new FormGroup(
    {
      'firstName': new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z]*$/)]),
      'lastName': new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z]*$/)])
    });


  constructor(private auth: AuthService,
              private toastr: ToastrService,
              private userService: UserService) {
  }

  ngOnInit() {
    this.auth.fetchDbUser().then((u) => {
      this.user = u;
      this.originalUser = _.cloneDeep(u);
      this.form.setValue({
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

  addImage(event) {
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
    this.userService.update_profile({
      given_name: this.user.given_name,
      family_name: this.user.family_name,
    }).then(() => {
      this.userService.get_profile().then((u: any) => {
        this.user = u;
        this.originalUser = _.cloneDeep(u);
        this.auth.setUser(u);
        this.form.reset({
          firstName: u.given_name,
          lastName: u.family_name
        });
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

    const file = this.uploadableFile;
    const filename = `${this.auth.user.uid}.${file.name.split('.').pop() || ''}`;

    this.uploadableFile = null;
    this.uploadImageUrl = null;
    this.uploading = true;
    this.uploadingProgress = 0;

    Storage.put(filename, file, {
      customPrefix: {
        public: 'profile-pictures/'
      },
      progressCallback: (progress) => {
        this.uploadingProgress = progress.loaded * 100 / progress.total;
      },
    }).then(() => {
      const url = `https://${environment.aws_config.Storage.AWSS3.bucket}.s3-${environment.aws_config.Storage.AWSS3.region}.amazonaws.com/profile-pictures/${filename}`;

      this.uploading = false;
      this.userService.update_profile({
        picture: url
      }).then(() => {
        this.userService.get_profile().then((u: any) => {
          this.user = u;
          this.auth.setUser(u);
        });
      });
    }).catch((e) => {
      this.uploading = false;
      this.toastr.error('Upload failed, Try again later!', 'Error');
      console.error(e);
    });
  }

}
