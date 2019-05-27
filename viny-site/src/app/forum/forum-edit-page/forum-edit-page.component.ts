import { Component, OnInit, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { AngularFireFunctions } from '@angular/fire/functions';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { Router } from '@angular/router';

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
  @ViewChild('editorloader') loader: LoaderComponent;
  public newMode = true;
  public postId = null;
  public imageProgress = 0;


  constructor(public route: ActivatedRoute,
              private fns: AngularFireFunctions,
              private router: Router) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe((map: any) => {
      const postId = _.get(map, 'params.postId', null);
      this.postId = postId;
      if (_.isEmpty(postId)) {
        this.title = 'Untitled forum post';
        this.data = '<h1>Say it loud!</h1>Start editing here<p></p><p></p><p></p><p></p>';
        this.hideView = false;
        return;
      }
      this.loader.show();
      this.newMode = false;
      const callable = this.fns.httpsCallable('retrieve_post');
      const data = callable({postId: postId});
      data.subscribe((post) => {
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
      alert('Title or the post body cannot be blank');
      return;
    } else if (this.imageProgress > 0) {
      this.editorDisabled = false;
      alert('Images are still uploading... Please wait');
      return;
    }
    const object = {
      postTitle: this.title,
      postHTML: this.data,
      id: null
    };
    if (this.newMode) {
      const callable = this.fns.httpsCallable('save_post');
      const data = callable(object);
      data.subscribe((result) => {
        this.router.navigate(['/forum', result.id, 'view']);
        this.editorDisabled = true;
      }, () => {
        this.editorDisabled = false;
        alert('Saving failed! Please try again later');
      });
    } else {
      this.editorDisabled = true;
      object.id = this.postId;
      const callable = this.fns.httpsCallable('save_post');
      const data = callable(object);
      data.subscribe((result) => {
        this.router.navigate(['/forum', this.postId, 'view']);
        this.editorDisabled = true;
      }, () => {
        this.editorDisabled = false;
        alert('Saving failed! Please try again later');
      });
    }
  }

  discardPost() {
  }

}
