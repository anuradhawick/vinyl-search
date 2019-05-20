import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs/index';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireAuth } from '@angular/fire/auth';

export interface Item { name: string;
}

@Component({
  selector: 'app-auctions-page',
  templateUrl: './auctions-page.component.html',
  styleUrls: ['./auctions-page.component.css']
})
export class AuctionsPageComponent implements OnInit {
  email: string;
  password: string;

  private itemsCollection: AngularFirestoreCollection<Item>;
  items: Observable<Item[]>;

  constructor(private auth: AngularFireAuth, private afs: AngularFirestore, private storage: AngularFireStorage) {
    this.itemsCollection = afs.collection<Item>('auctions');
    this.items = this.itemsCollection.valueChanges();
  }

  submit() {
    this.itemsCollection.add({name: this.email}).then(() => {
      alert('OK');
    }).catch(() => alert('Failed'));
  }

  addImage(event) {
    console.log(this.auth.auth.currentUser.displayName);
    const file = event.target.files[0];
    const filePath = `auction-images/${this.auth.auth.currentUser.uid}/sample.jpg`;
    console.log(this.auth.auth.currentUser.uid)
    const ref = this.storage.ref(filePath);
    const task = ref.put(file);
    task.percentageChanges().subscribe((val) => {
      console.log(val);


    });
    task.then(() => {
      ref.getDownloadURL().subscribe((val2) => {
        console.log('URL Found ', val2);
      });
    })
  }

  ngOnInit() {
  }
}
