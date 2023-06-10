import { Component, OnInit, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { LoaderComponent } from '../../shared-modules/loader/loader.component';
import { Router } from '@angular/router';
import { ForumService } from '../services/forum.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material';
import { ActionConfirmModalComponent } from '../../shared-modules/modals/action-confirm-modal/action-confirm-modal.component';

declare const $;

@Component({
  selector: 'app-forum-edit-page',
  templateUrl: './forum-edit-page.component.html',
  styleUrls: ['./forum-edit-page.component.css']
})
export class ForumEditPageComponent implements OnInit {
  public title = '';
  public data = '';
  public editorDisabled = false;
  public post = null;
  public hideView = true;
  @ViewChild('editorloader', {static: true}) loader: LoaderComponent;
  public newMode = true;
  public postId = null;
  public imageProgress = 0;


  constructor(public route: ActivatedRoute,
              private forumService: ForumService,
              private router: Router,
              private toastr: ToastrService,
              private confirmDialog: MatDialog) {

  }

  ngOnInit() {
    this.route.paramMap.subscribe((map: any) => {
      const postId = _.get(map, 'params.postId', null);
      this.postId = postId;
      if (_.isEmpty(postId)) {
        this.title = '';
        this.data = '';
        this.hideView = false;
        return;
      }
      this.loader.show();
      this.newMode = false;
      const data = this.forumService.fetch_post(this.postId);

      data.subscribe((res: any) => {
        const post = res.post;
        this.post = post;
        this.data = _.get(post, 'postHTML', '');
        this.title = _.get(post, 'postTitle', '');
        this.loader.hide();
        this.hideView = false;
      });
    });
  }

  savePost() {
    this.editorDisabled = true;

    if (_.isEmpty(this.title) || _.isEmpty(this.data)) {
      this.editorDisabled = false;
      this.toastr.error('Title or the post body cannot be blank', 'Error');
      return;
    } else if (this.imageProgress > 0) {
      this.editorDisabled = false;
      this.toastr.warning('Images are still uploading... Please wait', 'Warning');
      return;
    }
    const object = {
      postTitle: this.title,
      postHTML: this.data,
      id: null,
    };

    if (this.newMode) {
      const data = this.forumService.new_post(object);

      data.then((result: any) => {
        this.toastr.success(`Post saved successfully`, 'Success');
        this.router.navigate(['/forum', result.postId, 'view']);
        this.editorDisabled = true;
      }, (err) => {
        this.editorDisabled = false;
        console.log('error ', err);
        this.toastr.error(`Saving failed! Please try again later`, 'Error');
      });
    } else {
      const data = this.forumService.update_post(this.postId, object);
      data.then(() => {
        this.router.navigate(['/forum', this.postId, 'view']);
        this.editorDisabled = true;
      }, (err) => {
        this.editorDisabled = false;
        console.log('error ', err);
        this.toastr.error(`Saving failed! Please try again later`, 'Error');
      });
    }
  }

  discardPost() {
    if (!_.isEmpty(this.title) || !_.isEmpty(this.data)) {
      const dialogRef = this.confirmDialog.open(ActionConfirmModalComponent, {
        data: {
          title: 'Are you sure?',
          message: 'You are about to discard your post.'
        }
      });

      dialogRef.afterClosed().subscribe((ok) => {
        if (ok) {
          this.router.navigate(['/forum']);
        }
      });
    } else {
      this.router.navigate(['/forum']);
    }
  }

}
