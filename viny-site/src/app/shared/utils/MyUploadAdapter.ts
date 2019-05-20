import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { AngularFireAuth } from '@angular/fire/auth';
import uuid from 'uuid';

export default class MyUploadAdapter {
  task: AngularFireUploadTask;

  constructor(private loader,
              private auth: AngularFireAuth,
              private storage: AngularFireStorage,
              private added: Function,
              private done: Function,
              private failed: Function) {
    this.loader = loader;
    this.task = null;
  }

  upload() {
    this.added();

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
            this.done();
            resolve({'default': url});
          });
        }).catch(() => {
          this.failed();
          reject();
        });
      });
    });
  }

  abort() {
    if (this.task != null) {
      this.task.cancel();
      this.done();
    }
  }
}
