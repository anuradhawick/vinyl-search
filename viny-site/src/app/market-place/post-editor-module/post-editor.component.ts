import { Component, EventEmitter, Input, NgZone, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';
import { AuthService } from '../../shared-modules/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { Storage } from 'aws-amplify';
import uuid from 'uuid';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-post-editor',
  templateUrl: './post-editor.component.html',
  styleUrls: ['./post-editor.component.css']
})
export class PostEditorComponent implements OnInit {
  @Output() readyStateChange = new EventEmitter<boolean>();
  public _ = _;

  @Output() postChange = new EventEmitter();

  // current entry
  public postObject = {
    chosenImage: 0,
    images: [],
    name: '',
    description: '',
    currency: 'Rs',
    price: 0,
    saleType: null,
    saleSubtype: null,
    isNegotiable: false
  };

  // passed as prop
  @Input()
  set post(record) {
    if (!_.isEmpty(record)) {
      _.assign(this.postObject, record);
    }
  }

  // context control
  public uploadCount = 0;
  public percentages = [];

  // image viewer config
  public imgvconfig = {
    zoomFactor: 0.1,
    wheelZoom: false,
    allowFullscreen: true,
    allowKeyboardNavigation: true,
    customBtns: [{name: 'delete', icon: 'delete'}],
    btnShow: {
      next: true,
      prev: true,
      zoomIn: true,
      zoomOut: true
    }
  };

  public form;

  constructor(private auth: AuthService,
              public ngZone: NgZone,
              private toastr: ToastrService,
              private fb: FormBuilder) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      name: [this.postObject.name, Validators.required],
      description: [this.postObject.description, Validators.required],
      currency: [this.postObject.currency, Validators.required],
      price: [this.postObject.price, [Validators.required, Validators.pattern(/[0-9]+(\.[0-9]+)?/)]],
      saleType: [this.postObject.saleType, Validators.required],
      saleSubtype: [this.postObject.saleSubtype, Validators.required],
      isNegotiable: [this.postObject.isNegotiable]
    });
    this.form.valueChanges.subscribe((values) => {
      _.assign(this.postObject, values);
    });
  }

  getReleaseData() {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(field => {
        const control = this.form.get(field);
        control.markAsTouched({onlySelf: true});
      });
      return false;
    } else if (this.uploadCount > 0) {
      this.toastr.warning(`Images are still being uploaded. Please wait!`, 'Warning');
      return false;
    }
    if (this.postObject.images.length < 2) {
      this.toastr.warning(`An advertisement must carry at least 2 images of the item!`, 'Warning');
      return false;
    }

    return this.postObject;
  }

  addImage(event) {
    if (!this.auth.isLoggedIn) {
      this.toastr.warning('Please login before continue', 'Warning');
      return;
    }
    if (this.postObject.images.length >= 10) {
      this.toastr.warning('Maximum number of images supported is 10', 'Warning');
    }
    if (!_.isEmpty(event.target.files)) {
      _.each(event.target.files, (file) => {
        const filename = `${uuid()}.${file.name.split('.').pop() || ''}`;

        this.uploadCount++;
        this.readyStateChange.emit(false);

        const progressObserver = new Observable((observer) => {
          Storage.put(filename, file, {
            customPrefix: {
              public: 'temp/'
            },
            progressCallback(progress) {
              observer.next(progress.loaded * 100 / progress.total);
            },
          }).then(() => {
            const url = `https://${environment.aws_config.Storage.AWSS3.bucket}.s3-${environment.aws_config.Storage.AWSS3.region}.amazonaws.com/temp/${filename}`;

            this.postObject.images.push(url);
            this.uploadCount--;
            if (this.uploadCount === 0) {
              this.readyStateChange.emit(true);
            }
            observer.complete();
            _.remove(this.percentages, (p) => p === progressObserver);
          }).catch((e) => {
            this.toastr.error('Image upload failed! Are you online?', 'Error');
            this.uploadCount--;
            _.remove(this.percentages, (p) => p === progressObserver);
            if (this.uploadCount === 0) {
              this.readyStateChange.emit(true);
            }
            observer.complete();
          });
        });
        this.percentages.push(progressObserver);
      });
      event.target.value = '';
    }
  }

  deleteImage(index) {
    const removeItem = this.postObject.images[index];
    this.postObject.chosenImage = 0;
    _.remove(this.postObject.images, (item) => _.isEqual(item, removeItem));
  }


  handleEvent(event) {
    switch (event.name) {
      case 'delete':
        this.deleteImage(event.imageIndex);
        break;
    }
  }

}
