import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import * as _ from 'lodash';
import { AuthService } from '../../shared/services/auth.service';
import { ForumService } from '../services/forum.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { ActionConfirmModalComponent } from '../../shared/components/modals/action-confirm-modal/action-confirm-modal.component';
import { TitleTagService } from '../../shared/services/title-tag.service';
import { Observable } from 'rxjs';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { ForumEditorComponentComponent } from '../forum-editor-component/forum-editor-component.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AsyncPipe } from '@angular/common';

// TODO Edit/Delete not visible
@Component({
  selector: 'app-forum-view-page',
  templateUrl: './forum-view-page.component.html',
  styleUrls: ['./forum-view-page.component.scss'],
  imports: [
    LoaderComponent,
    CKEditorModule,
    FormsModule,
    MatButton,
    RouterLink,
    ForumEditorComponentComponent,
    MatProgressSpinner,
    AsyncPipe,
  ],
})
export class ForumViewPageComponent implements OnInit {
  public post = signal<any>(null);
  @ViewChild('postloader', { static: true }) loader!: LoaderComponent;
  @ViewChild('commentloader', { static: true }) commentLoader!: LoaderComponent;
  public Editor = ClassicEditor;
  public title = signal('');
  public data = signal<any>('');
  public user: Observable<any>;
  public editorDisabled = signal(false);
  public imageProgress = signal(0);
  public comment_data = signal('');
  public comments = signal<any[]>([]);
  public enableCommentSection = signal(false);
  private postId: string = '';

  constructor(
    public route: ActivatedRoute,
    public auth: AuthService,
    private forumService: ForumService,
    private router: Router,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private tagService: TitleTagService,
  ) {
    this.user = auth.user;
    this.tagService.setTitle('Vinyl.LK: The Forum');
    this.tagService.setSocialMediaTags(
      'http://www.vinyl.lk',
      "Vinyl.LK: Sri Lanka's largest records database",
      'Vinyl forum to talk about music, gear and many more!',
      'https://www.vinyl.lk/assets/images/social.jpeg',
    );
  }

  ngOnInit() {
    this.loader.show();
    this.commentLoader.show();

    this.route.paramMap.subscribe((map: any) => {
      const postId = _.get(map, 'params.postId', null);
      if (_.isEmpty(postId)) {
        return;
      }

      this.forumService.fetch_post(postId).subscribe((res: any) => {
        const post = res.post;
        this.post.set(post);
        this.postId = postId;
        this.data.set(_.get(post, 'postHTML', ''));
        this.title.set(_.get(post, 'postTitle', ''));
        this.loader.hide();

        this.loadComments();
      });
    });
  }

  deletePost() {
    const modal = this.dialog.open(ActionConfirmModalComponent, {
      data: {
        message: `Are you sure you want to delete the forum post?`,
        title: `Are you sure?`,
      },
    });

    modal.afterClosed().subscribe((ok) => {
      if (ok) {
        this.loader.show();
        const data = firstValueFrom(
          this.forumService.delete_post(this.post().id),
        );
        data.then(() => {
          this.loader.hide();
          this.router.navigate(['/forum']);
        });
      }
    });
  }

  saveComment() {
    this.comments.set([]);
    this.editorDisabled.set(true);
    this.enableCommentSection.set(false);

    if (_.isEmpty(this.title()) || _.isEmpty(this.data())) {
      this.editorDisabled.set(false);
      this.enableCommentSection.set(true);
      this.toastr.error('Title or the post body cannot be blank', 'Error');
      return;
    } else if (this.imageProgress() > 0) {
      this.editorDisabled.set(false);
      this.enableCommentSection.set(true);
      this.toastr.warning(
        'Images are still uploading... Please wait',
        'Warning',
      );
      return;
    }
    const object = {
      postHTML: this.comment_data(),
      comment: true,
    };

    if (this.comment_data().length < 10) {
      this.toastr.warning(
        `Your comment is either empty or too short for submission`,
        'Error',
      );
      this.editorDisabled.set(false);
      this.enableCommentSection.set(true);
      return;
    }
    this.comment_data.set('');

    const data = firstValueFrom(
      this.forumService.comment_post(this.postId, object),
    );
    data.then(
      () => {
        this.toastr.success(`Comment submitted successfully`, 'Success');
        this.editorDisabled.set(false);
        this.loadComments();
      },
      (err) => {
        this.editorDisabled.set(false);
        this.enableCommentSection.set(true);
        this.toastr.error(`Saving failed! Please try again later`, 'Error');
      },
    );
  }

  discardComment() {
    this.comment_data.set('');
  }

  loadComments() {
    this.commentLoader.show();
    const data2 = this.forumService.fetch_post_comments(this.postId);

    data2.subscribe((res2: any) => {
      this.comments.set(res2.comments);
      this.commentLoader.hide();
      this.enableCommentSection.set(true);
    });
  }

  deleteComment(id: string) {
    const modal = this.dialog.open(ActionConfirmModalComponent, {
      data: {
        message: `Are you sure you want to delete your comment?`,
        title: `Are you sure?`,
      },
    });

    modal.afterClosed().subscribe((ok) => {
      if (ok) {
        this.comments.set([]);
        this.commentLoader.show();
        this.enableCommentSection.set(false);

        const data = firstValueFrom(
          this.forumService.comment_delete(this.postId, id),
        );

        data.then(
          () => {
            this.loader.hide();
            this.toastr.success(`Comment deleted successfully`, 'Success');
            this.loadComments();
          },
          () => {
            this.toastr.error(`Action failed! Please try again later`, 'Error');
            this.loadComments();
            this.enableCommentSection.set(true);
          },
        );
      }
    });
  }
}
