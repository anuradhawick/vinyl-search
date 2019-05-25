import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { AngularFireAuth } from '@angular/fire/auth';
import uuid from 'uuid';

@Component({
  selector: 'app-forum-editor-component',
  templateUrl: './forum-editor-component.component.html',
  styleUrls: ['./forum-editor-component.component.css']
})
export class ForumEditorComponentComponent implements OnInit {
  @Input() imageProgress = 0;
  @Output() imageProgressChange = new EventEmitter();
  private Editor = ClassicEditor;
  @Input() title;
  @Output() titleChange = new EventEmitter();
  @Input() data;
  @Output() dataChange = new EventEmitter();
  @Input() editorDisabled;


  constructor(private auth: AngularFireAuth, private storage: AngularFireStorage) {
  }

  onReady(Editor) {
    const auth = this.auth;
    const storage = this.storage;
    Editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return new MyUploadAdapter(loader, auth, storage, this);
    };
  }

  ngOnInit() {
    console.log(this.data);
  }

}


class MyUploadAdapter {
  task: AngularFireUploadTask;

  constructor(private loader,
              private auth: AngularFireAuth,
              private storage: AngularFireStorage,
              private ref: ForumEditorComponentComponent) {
    this.loader = loader;
    this.task = null;
    this.ref = ref;
  }

  upload() {
    this.ref.imageProgress++;
    this.ref.imageProgressChange.emit(this.ref.imageProgress);

    return new Promise((resolve, reject) => {
      this.loader.file.then((file) => {
        const filePath = `forum-images/${this.auth.auth.currentUser.uid}/${uuid()}${file.name}`;
        const ref = this.storage.ref(filePath);
        const task = ref.put(file);

        task.then(() => {
          ref.getDownloadURL().subscribe((url) => {
            this.ref.imageProgress--;
            this.ref.imageProgressChange.emit(this.ref.imageProgress);
            resolve({'default': url});
          });
        }).catch(() => reject());
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
