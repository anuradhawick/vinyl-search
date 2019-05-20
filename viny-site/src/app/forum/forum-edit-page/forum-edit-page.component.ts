import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { AngularFireAuth } from '@angular/fire/auth';
import uuid from 'uuid';
import * as _ from 'lodash';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-inline';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { AngularFireFunctions } from '@angular/fire/functions';
import { LoaderComponent } from '../../shared/loader/loader.component';
import {Router} from '@angular/router';

let imageProgress = 0;

@Component({
  selector: 'app-forum-edit-page',
  templateUrl: './forum-edit-page.component.html',
  styleUrls: ['./forum-edit-page.component.css']
})
export class ForumEditPageComponent implements OnInit {
  private Editor = ClassicEditor;
  private title = '';
  private data = '';
  private editorDisabled = false;
  private post = null;
  private hideView = true;
  @ViewChild('editorloader') loader: LoaderComponent;
  private newMode = true;
  private postId = null;


  constructor(private auth: AngularFireAuth,
              private storage: AngularFireStorage,
              private database: AngularFirestore,
              private route: ActivatedRoute,
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
        console.log(post);
        this.data = _.get(post, 'postHTML', '');
        this.title = _.get(post, 'postTitle', '');
        this.loader.hide();
        this.hideView = false;
      });
    });
  }

  onReady(Editor) {
    const auth = this.auth;
    const storage = this.storage;
    Editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return new MyUploadAdapter(loader, auth, storage);
    };
  }

  savePost() {
    this.editorDisabled = true;
    (<HTMLInputElement>document.getElementById('saveBtn')).disabled = true;

    if (_.isEmpty(this.title) || _.isEmpty(this.data)) {
      alert('Title or the post body cannot be blank');
      return;
    } else if (imageProgress > 0) {
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
        this.router.navigate(['/forum', result.id, 'view' ]);
        this.editorDisabled = true;
        (<HTMLInputElement>document.getElementById('saveBtn')).disabled = true;
      }, () => {
        this.editorDisabled = false;
        (<HTMLInputElement>document.getElementById('saveBtn')).disabled = false;
        alert('Saving failed! Please try again later');
      });
    } else {
      this.editorDisabled = true;
      (<HTMLInputElement>document.getElementById('saveBtn')).disabled = true;

      object.id = this.postId;
      const callable = this.fns.httpsCallable('save_post');
      const data = callable(object);
      data.subscribe((result) => {
        this.router.navigate(['/forum', result.id, 'view' ]);
        this.editorDisabled = true;
        (<HTMLInputElement>document.getElementById('saveBtn')).disabled = true;
      }, () => {
        this.editorDisabled = false;
        (<HTMLInputElement>document.getElementById('saveBtn')).disabled = false;
        alert('Saving failed! Please try again later');
      });
    }
  }

  discardPost() {

  }

}

class MyUploadAdapter {
  task: AngularFireUploadTask;

  constructor(private loader, private auth: AngularFireAuth, private storage: AngularFireStorage) {
    this.loader = loader;
    this.task = null;
  }

  upload() {
    imageProgress++;
    (<HTMLInputElement>document.getElementById('saveBtn')).disabled = true;
    document.getElementById('saveLoader').hidden = false;

    return new Promise((resolve, reject) => {
      this.loader.file.then((file) => {
        const filePath = `forum-images/${this.auth.auth.currentUser.uid}/${uuid()}${file.name}`;
        const ref = this.storage.ref(filePath);
        const task = ref.put(file);
        task.percentageChanges().subscribe((val) => {
          this.loader.uploadTotal = file.length;
          this.loader.uploaded = file.length * val / 100;
        });
        this.task = task;
        task.then(() => {
          ref.getDownloadURL().subscribe((url) => {
            imageProgress--;
            resolve({'default': url});
            if (imageProgress === 0) {
              (<HTMLInputElement>document.getElementById('saveBtn')).disabled = false;
              document.getElementById('saveLoader').hidden = true;
            }
          });
        }).catch(() => reject());
      });
    });
  }

  abort() {
    if (this.task != null) {
      this.task.cancel();
      imageProgress--;
      if (imageProgress === 0) {
        (<HTMLInputElement>document.getElementById('saveBtn')).disabled = true;
      }
    }
  }
}
