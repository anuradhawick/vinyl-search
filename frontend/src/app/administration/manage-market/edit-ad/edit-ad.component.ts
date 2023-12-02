import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PostEditorComponent } from '../../../market-place/post-editor-module/post-editor.component';
import { AdminService } from '../../services/admin.service';
import * as _ from 'lodash';
import { Location } from '@angular/common';

@Component({
  selector: 'app-edit-ad',
  templateUrl: './edit-ad.component.html',
  styleUrls: ['./edit-ad.component.css'],
})
export class EditAdComponent implements OnInit {
  @ViewChild('editor', { static: false }) editor!: PostEditorComponent;
  public ready = true;
  public post: any = null;
  public _ = _;
  public changesSaved = false;

  constructor(
    public route: ActivatedRoute,
    private adminService: AdminService,
    private router: Router,
    private toastr: ToastrService,
    public dialog: MatDialog,
    private location: Location,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((map: any) => {
      const postID = _.get(map, 'params.postId', null);
      const data = this.adminService.get_market_post(postID);

      data
        .then((post) => {
          this.post = post;
        })
        .catch(() => {
          console.log('Error');
        });
    });
  }

  save() {
    const post = this.editor.getReleaseData();

    if (post) {
      this.ready = false;
      this.post = post;

      const data = this.adminService.update_market_post(post);

      data.then(
        (result: any) => {
          if (result.success) {
            this.toastr.success(`Records saved successfully`, 'Success');
            this.changesSaved = true;
            this.ready = true;
          } else {
            this.ready = true;
            this.toastr.error(
              `Unable to save the records. Try again later`,
              'Error',
            );
          }
        },
        () => {
          this.ready = true;
          this.toastr.error(
            `Unable to save the records. Try again later`,
            'Error',
          );
        },
      );
    }
  }

  goBack() {
    this.location.back();
  }

  readyChange(event: any) {
    this.ready = event;
  }
}
