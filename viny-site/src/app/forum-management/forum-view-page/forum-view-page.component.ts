import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderComponent } from '../../shared-modules/loader/loader.component';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import * as _ from 'lodash';
import { AuthService } from '../../shared-modules/auth/auth.service';
import { ForumService } from '../../services/forum.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material';
import { ActionConfirmModalComponent } from '../../shared-modules/modals/action-confirm-modal/action-confirm-modal.component';

@Component({
  selector: 'app-forum-view-page',
  templateUrl: './forum-view-page.component.html',
  styleUrls: ['./forum-view-page.component.css']
})
export class ForumViewPageComponent implements OnInit {
  public post;
  @ViewChild('postloader', {static: true}) loader: LoaderComponent;
  @ViewChild('commentloader', {static: true}) commentLoader: LoaderComponent;
  public Editor = ClassicEditor;
  public title = '';
  public data = '';
  public user = null;
  public editorDisabled = false;
  public imageProgress = 0;
  public comment_data = '';
  public comments = [];
  public enableCommentSection = false;
  private postId;


  constructor(public route: ActivatedRoute,
              public auth: AuthService,
              private forumService: ForumService,
              private router: Router,
              private toastr: ToastrService,
              private dialog: MatDialog) {
    this.user = auth.user.asObservable();
  }

  ngOnInit() {
    this.loader.show();
    this.commentLoader.show();

    this.route.paramMap.subscribe((map: any) => {
      const postId = _.get(map, 'params.postId', null);
      if (_.isEmpty(postId)) {
        return;
      }

      const data = this.forumService.fetch_post(postId);

      data.subscribe((res: any) => {
        const post = res.post;
        this.post = post;
        this.postId = postId;
        this.data = _.get(post, 'postHTML', '');
        this.title = _.get(post, 'postTitle', '');
        this.loader.hide();

        this.loadComments();
      });
    });
  }

  deletePost() {
    const modal = this.dialog.open(ActionConfirmModalComponent, {
      data: {
        message: `Are you sure you want to delete the forum post?`,
        title: `Are you sure?`
      }
    });

    modal.afterClosed().subscribe((ok) => {
      if (ok) {
        this.loader.show();
        const data = this.forumService.delete_post(this.post.id);
        data.then(() => {
          this.loader.hide();
          this.router.navigate(['/forum']);
        });
      }
    });
  }

  saveComment() {
    this.comments = [];
    this.editorDisabled = true;
    this.enableCommentSection = false;

    if (_.isEmpty(this.title) || _.isEmpty(this.data)) {
      this.editorDisabled = false;
      this.enableCommentSection = true;
      this.toastr.error('Title or the post body cannot be blank', 'Error');
      return;
    } else if (this.imageProgress > 0) {
      this.editorDisabled = false;
      this.enableCommentSection = true;
      this.toastr.warning('Images are still uploading... Please wait', 'Warning');
      return;
    }
    const object = {
      postHTML: this.comment_data,
      comment: true
    };

    if (this.comment_data.length < 10) {
      this.toastr.warning(`Your comment is either empty or too short for submission`, 'Error');
      this.editorDisabled = false;
      this.enableCommentSection = true;
      return;
    }
    this.comment_data = '';

    const data = this.forumService.comment_post(this.postId, object);
    data.then(() => {
      this.toastr.success(`Comment submitted successfully`, 'Success');
      this.editorDisabled = false;
      this.loadComments();
    }, (err) => {
      this.editorDisabled = false;
      this.enableCommentSection = true;
      this.toastr.error(`Saving failed! Please try again later`, 'Error');
    });
  }

  discardComment() {
    this.comment_data = '';
  }

  loadComments() {
    this.commentLoader.show();
    const data2 = this.forumService.fetch_post_comments(this.postId);

    data2.subscribe((res2: any) => {
      this.comments = res2.comments;
      this.commentLoader.hide();
      this.enableCommentSection = true;
    });
  }

  deleteComment(id) {
    const modal = this.dialog.open(ActionConfirmModalComponent, {
      data: {
        message: `Are you sure you want to delete your comment?`,
        title: `Are you sure?`
      }
    });

    modal.afterClosed().subscribe((ok) => {
      if (ok) {
        this.comments = [];
        this.commentLoader.show();
        this.enableCommentSection = false;

        const data = this.forumService.delete_post(id);

        data.then(() => {
          this.loader.hide();
          this.toastr.success(`Comment deleted successfully`, 'Success');
          this.loadComments();
        }, () => {
          this.toastr.error(`Action failed! Please try again later`, 'Error');
          this.loadComments();
          this.enableCommentSection = true;
        });
      }
    });
  }
}
