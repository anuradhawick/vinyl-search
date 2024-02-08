import { Component, OnInit, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { LoaderComponent } from '../../shared-modules/loader/loader.component';
import { Router } from '@angular/router';
import { ForumService } from '../services/forum.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { ActionConfirmModalComponent } from '../../shared-modules/modals/action-confirm-modal/action-confirm-modal.component';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-forum-edit-page',
  templateUrl: './forum-edit-page.component.html',
  styleUrls: ['./forum-edit-page.component.css'],
})
export class ForumEditPageComponent implements OnInit {
  protected title = '';
  protected data = '';
  protected postId: string = '';
  protected editorDisabled = false;
  protected newMode = true;
  protected imageProgress = 0;
  protected loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private forumService: ForumService,
    private router: Router,
    private toastr: ToastrService,
    private confirmDialog: MatDialog,
  ) {}

  ngOnInit() {
    this.loading = true;
    this.route.paramMap.subscribe((map: any) => {
      const postId = _.get(map, 'params.postId', null);
      this.postId = postId;
      if (_.isEmpty(postId)) {
        this.title = '';
        this.data = '';
        this.loading = false;
        return;
      }
      this.newMode = false;
      this.forumService
        .fetch_post(this.postId)
        .pipe(catchError(() => of(null)))
        .subscribe((res: any) => {
          if (res) {
            this.data = _.get(res, 'post.postHTML', '');
            this.title = _.get(res, 'post.postTitle', '');
          }
          this.loading = false;
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
      this.toastr.warning(
        'Images are still uploading... Please wait',
        'Warning',
      );
      return;
    }
    const object = {
      postTitle: this.title,
      postHTML: this.data,
      id: null,
    };

    if (this.newMode) {
      const data = this.forumService.new_post(object);

      data.then(
        (result: any) => {
          this.toastr.success(`Post saved successfully`, 'Success');
          this.router.navigate(['/forum', result.postId, 'view']);
          this.editorDisabled = true;
        },
        (err) => {
          this.editorDisabled = false;
          console.log('error ', err);
          this.toastr.error(`Saving failed! Please try again later`, 'Error');
        },
      );
    } else {
      const data = this.forumService.update_post(this.postId, object);
      data.then(
        () => {
          this.router.navigate(['/forum', this.postId, 'view']);
          this.editorDisabled = true;
        },
        (err) => {
          this.editorDisabled = false;
          console.log('error ', err);
          this.toastr.error(`Saving failed! Please try again later`, 'Error');
        },
      );
    }
  }

  discardPost() {
    if (!_.isEmpty(this.title) || !_.isEmpty(this.data)) {
      const dialogRef = this.confirmDialog.open(ActionConfirmModalComponent, {
        data: {
          title: 'Are you sure?',
          message: 'You are about to discard your post.',
        },
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
