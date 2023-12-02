import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { v4 as uuid } from 'uuid';
import { Storage } from 'aws-amplify';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-forum-editor-component',
  templateUrl: './forum-editor-component.component.html',
  styleUrls: ['./forum-editor-component.component.css'],
})
export class ForumEditorComponentComponent implements OnInit {
  @Input() imageProgress = 0;
  @Output() imageProgressChange = new EventEmitter();
  public Editor = ClassicEditor;
  @Input() title!: any;
  @Output() titleChange = new EventEmitter();
  @Input() data!: any;
  @Output() dataChange = new EventEmitter();
  @Input() editorDisabled!: any;
  @Input() is_reply = false;

  constructor() {}

  onReady(Editor: any) {
    Editor.plugins.get('FileRepository').createUploadAdapter = (
      loader: any,
    ) => {
      return new MyUploadAdapter(loader, this);
    };
  }

  ngOnInit() {}
}

class MyUploadAdapter {
  constructor(
    private loader: any,
    private ref: ForumEditorComponentComponent,
  ) {
    this.loader = loader;
    this.ref = ref;
  }

  upload() {
    this.ref.imageProgress++;
    this.ref.imageProgressChange.emit(this.ref.imageProgress);

    return new Promise((resolve, reject) => {
      this.loader.file.then((file: any) => {
        const filename = `${uuid()}.${file.name.split('.').pop() || ''}`;
        const that = this;

        Storage.put(filename, file, {
          customPrefix: {
            public: 'temp/',
          },
          progressCallback(progress: any) {
            that.loader.uploadTotal = progress.total;
            that.loader.uploaded = progress.loaded;
          },
        })
          .then(() => {
            this.ref.imageProgress--;
            this.ref.imageProgressChange.emit(this.ref.imageProgress);

            resolve({
              default: `https://${environment.aws_config.Storage.AWSS3.bucket}.s3-${environment.aws_config.Storage.AWSS3.region}.amazonaws.com/temp/${filename}`,
            });
          })
          .catch((e: any) => {
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
  }
}
