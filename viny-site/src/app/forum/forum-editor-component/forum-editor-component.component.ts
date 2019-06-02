import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { AngularFireAuth } from '@angular/fire/auth';
import uuid from 'uuid';
import Amplify, { Auth, Storage } from 'aws-amplify';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-forum-editor-component',
  templateUrl: './forum-editor-component.component.html',
  styleUrls: ['./forum-editor-component.component.css']
})
export class ForumEditorComponentComponent implements OnInit {
  @Input() imageProgress = 0;
  @Output() imageProgressChange = new EventEmitter();
  public Editor = ClassicEditor;
  @Input() title;
  @Output() titleChange = new EventEmitter();
  @Input() data;
  @Output() dataChange = new EventEmitter();
  @Input() editorDisabled;


  constructor(private auth: AuthService) {
  }

  onReady(Editor) {
    const auth = this.auth;
    Editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return new MyUploadAdapter(loader, auth, this);
    };
  }

  ngOnInit() {
  }

}


class MyUploadAdapter {
  task: AngularFireUploadTask;

  constructor(private loader,
              private auth: AuthService,
              private ref: ForumEditorComponentComponent) {
    this.loader = loader;
    this.task = null;
    this.ref = ref;
  }

  upload() {
    this.ref.imageProgress++;
    this.ref.imageProgressChange.emit(this.ref.imageProgress);

    // this.loader.file.then((file) => {
    //
    // });

    return new Promise((resolve, reject) => {
      this.loader.file.then((file) => {
        console.log(`${file.name}`)
        // Auth.currentCredentials().then((c) => {
        //   console.log(c)
        Storage.put(`${file.name}`, file, {
          customPrefix: {
            public: 'temp/'
          },
          progressCallback(progress) {
            console.log(`Uploaded: ${progress.loaded * 100 / progress.total}`);
          },
        }).then((res) => {
          console.log(res)
          Storage.get(file.name, {
            customPrefix: {
              public: 'temp/',
            }
          }).then((u) => {
            console.log(u)
          });

        }).catch(e => console.log(e));

        // Storage.remove(`a.jpg`, {
        //   level: 'private',
        //   customPrefix: {
        //     private: 'temp/'
        //   },
        // }).then((data) => {
        //   console.log(data)
        // }).catch(e => console.log(e));
        // })

        // const filePath = `forum-images/${this.auth.auth.currentUser.uid}/${uuid()}${file.name}`;
        // const ref = this.storage.ref(filePath);

        // const task = ref.put(file);
        //
        // task.then(() => {
        //   ref.getDownloadURL().subscribe((url) => {
        //     this.ref.imageProgress--;
        //     this.ref.imageProgressChange.emit(this.ref.imageProgress);
        //     resolve({'default': url});
        //   });
        // }).catch(() => reject());
      });
    });
  }

  abort() {
    if (this.task != null) {
      this.task.cancel();
      this.ref.imageProgress--;
      this.ref.imageProgressChange.emit(this.ref.imageProgress);
    }
  }
}
