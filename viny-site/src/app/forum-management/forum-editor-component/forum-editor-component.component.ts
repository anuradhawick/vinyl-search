import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import uuid from 'uuid';
import { Storage } from 'aws-amplify';
import { environment } from '../../../environments/environment';

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
  @Input() is_reply = false;


  constructor() {
  }

  onReady(Editor) {
    Editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return new MyUploadAdapter(loader, this);
    };
  }

  ngOnInit() {
  }

}


class MyUploadAdapter {

  constructor(private loader,
              private ref: ForumEditorComponentComponent) {
    this.loader = loader;
    this.ref = ref;
  }

  upload() {
    this.ref.imageProgress++;
    this.ref.imageProgressChange.emit(this.ref.imageProgress);

    return new Promise((resolve, reject) => {
      this.loader.file.then((file) => {
        const filename = `${uuid()}.${file.name.split('.').pop() || ''}`;
        const that = this;

        Storage.put(filename, file, {
          customPrefix: {
            public: 'temp/'
          },
          progressCallback(progress) {
            that.loader.uploadTotal = progress.total;
            that.loader.uploaded = progress.loaded;
          },
        }).then(() => {
          this.ref.imageProgress--;
          this.ref.imageProgressChange.emit(this.ref.imageProgress);

          resolve({'default': `https://${environment.aws_config.Storage.AWSS3.bucket}.s3-${environment.aws_config.Storage.AWSS3.region}.amazonaws.com/temp/${filename}`});
        }).catch((e) => {
          this.ref.imageProgress--;
          this.ref.imageProgressChange.emit(this.ref.imageProgress);

          reject(e);
        });
      });
    });
  }

  abort() {
    // if (this.task != null) {
    //   this.task.cancel();
      this.ref.imageProgress--;
      this.ref.imageProgressChange.emit(this.ref.imageProgress);
    // }
    console.log('cancel')
  }
}
