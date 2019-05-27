import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireFunctions } from '@angular/fire/functions';
import { RecordsEditorComponentComponent } from '../records-editor-component/records-editor-component.component';
import { LoaderComponent } from '../../shared/loader/loader.component';

declare const $;


@Component({
  selector: 'app-records-edit-page',
  templateUrl: './records-edit-page.component.html',
  styleUrls: ['./records-edit-page.component.css']
})
export class RecordsEditPageComponent implements OnInit {
  @ViewChild('editor') editor: RecordsEditorComponentComponent;
  @ViewChild('loader') loader: LoaderComponent;
  private ready = true;
  // private testRecord = {
  //   'chosenImage': 0,
  //   'images': [],
  //   'date': '1993',
  //   'genres': ['American', 'Classical'],
  //   'styles': ['Chinese Modified', 'Red Indian'],
  //   'descriptions': ['Album', 'Special Edition'],
  //   'speed': '45 RPM',
  //   'size': '11"',
  //   'country': 'Angola',
  //   'tracks': [{
  //     'index': '1',
  //     'artists': [{'index': 1, 'name': 'Vijini'}],
  //     'title': 'Rosa Male Natuwe Katu',
  //     'credits': [{'index': 1, 'text': 'Music by Anuradha'}],
  //     'duration': '1:00'
  //   }],
  //   'notes': 'Mother was helping',
  //   'commonCredits': [{'index': 0, 'text': 'Support by Father'}],
  //   'name': 'Title A',
  //   'label': 'Sakura',
  //   'mainArtist': 'Name A',
  //   'catalogNo': '123',
  //   'format': '4-Track Cartridge',
  //   'channelCoding': 'Other/Unknown'
  // };

  constructor(private auth: AngularFireAuth,
              private storage: AngularFireStorage,
              private database: AngularFirestore,
              private route: ActivatedRoute,
              private fns: AngularFireFunctions,
              private router: Router,
              private ngZone: NgZone) {

  }

  ngOnInit() {

  }

  save() {
    const record = this.editor.getReleaseData();

    if (record) {
      this.loader.show();
      const callable = this.fns.httpsCallable('new_record');
      const data = callable(record);
      this.ready = false;
      data.subscribe((result) => {
        this.router.navigate(['/records', result.id, 'view']);
      }, () => {
        this.ready = true;
        this.loader.hide();
        alert('Saving failed! Please try again later');
      });
    }
  }

  readyChange(event) {
    this.ready = event;
  }
}
