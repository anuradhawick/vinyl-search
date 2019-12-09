import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { RecordsEditorComponentComponent } from '../records-editor-component/records-editor-component.component';
import { LoaderComponent } from '../../shared-modules/loader/loader.component';
import { RecordsService } from '../../services/records.service';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { CatalogErrorModalComponent } from '../modals/catalog-error/catalog-error.component';

declare const $;


@Component({
  selector: 'app-records-edit-page',
  templateUrl: './records-edit-page.component.html',
  styleUrls: ['./records-edit-page.component.css'],
})
export class RecordsEditPageComponent implements OnInit {
  @ViewChild('editor', {static: false}) editor: RecordsEditorComponentComponent;
  @ViewChild('loader', {static: false}) loader: LoaderComponent;

  private ready = true;
  // public testRecord = {
  //   'chosenImage': 0,
  //   'images': [],
  //   'date': '1993',
  //   'genres': ["African", "Asian", "Country", "Anu"],
  //   'styles': [],
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
  public record = null;

  constructor(private recordsService: RecordsService,
              private router: Router,
              private toastr: ToastrService,
              public dialog: MatDialog) {

  }

  ngOnInit() {

  }

  save() {
    const record = this.editor.getReleaseData();

    if (record) {
      this.loader.show();
      this.ready = false;
      this.record = record;

      const data = this.recordsService.save_record(record);

      data.then((result: any) => {
        if (result.recordId) {
          this.toastr.success(`Records saved successfully`, 'Success');
          this.router.navigate(['/records', result.recordId, 'view']);
        } else {
          this.ready = true;
          this.loader.hide();
          this.dialog.open(CatalogErrorModalComponent, {data: {id: result.originalId}});
        }
      }, () => {
        this.ready = true;
        this.loader.hide();
        this.toastr.error(`Unable to save the records. Try again later`, 'Error');
      });
    }
  }

  readyChange(event) {
    this.ready = event;
  }
}
