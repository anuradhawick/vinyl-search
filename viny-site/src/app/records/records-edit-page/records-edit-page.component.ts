import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireFunctions } from '@angular/fire/functions';
import { RecordsEditorComponentComponent } from '../records-editor-component/records-editor-component.component';

declare const $;


@Component({
  selector: 'app-records-edit-page',
  templateUrl: './records-edit-page.component.html',
  styleUrls: ['./records-edit-page.component.css']
})
export class RecordsEditPageComponent implements OnInit {
  @ViewChild('editor') editor: RecordsEditorComponentComponent;
  private ready = true;

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
    const data = this.editor.getReleaseData();

    if(data) {

    }
  }

  readyChange(event) {
    this.ready = event;
  }
}
