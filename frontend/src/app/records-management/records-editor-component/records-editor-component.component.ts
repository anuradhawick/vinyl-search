import { Component, ElementRef, EventEmitter, Input, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../shared-modules/services/auth.service';
import { Storage } from '@aws-amplify/storage';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { ENTER } from '@angular/cdk/keycodes';
// @ts-ignore
import genresJSON from '../../shared-modules/data/genres.json';
// @ts-ignore
import countriesJSON from '../../shared-modules/data/countries.json';
// @ts-ignore
import speedsJSON from '../../shared-modules/data/speed.json';
// @ts-ignore
import sizesJSON from '../../shared-modules/data/size.json';
// @ts-ignore
import descrJSON from '../../shared-modules/data/description.json';

declare const $: any;

@Component({
  selector: 'app-records-editor-component',
  templateUrl: './records-editor-component.component.html',
  styleUrls: ['./records-editor-component.component.css']
})
export class RecordsEditorComponentComponent implements OnInit {
  public genresJSON = genresJSON;
  public genres: any = [];
  public styles: any = [];
  public countriesJSON = countriesJSON;
  public objectKeys = Object.keys;
  public _ = _;
  public descr = descrJSON;
  public sizesJSON = sizesJSON;
  public speedsJSON = speedsJSON;
  public map: any = {};

  @ViewChild('table', { static: true })
  table!: ElementRef;

  public recordId: string = '';

  // passed as prop
  @Input()
  set record(record: any) {
    if (!_.isEmpty(record)) {
      _.assign(this.recordObject, record);
    }
  }

  @Input() public editorTitle = 'New Release Details';

  @Output() recordChange = new EventEmitter();


  @Output()
  readyStateChange = new EventEmitter<boolean>();

  // current entry
  public recordObject: any = {
    chosenImage: 0,
    images: [],
    date: null,
    genres: [],
    styles: [],
    descriptions: [],
    speed: null,
    size: null,
    country: null,
    tracks: [{
      index: null,
      artists: [],
      title: '',
      credits: [],
      duration: ''
    }],
    notes: null,
    commonCredits: [],
    songUrls: [],
    name: null,
    label: null,
    mainArtist: null,
    catalogNo: null,
    format: null,
    channelCoding: null,
  };

  // new genre related
  readonly separatorKeysCodes: number[] = [ENTER];
  // public newGenreName: string = null;
  public newStyleNames: string = '';

  // context control
  public uploadCount = 0;
  public percentages: any = [];

  // image viewer config
  public imgvconfig = {
    zoomFactor: 0.1,
    wheelZoom: false,
    allowFullscreen: true,
    allowKeyboardNavigation: true,
    customBtns: [{ name: 'delete', icon: 'delete' }],
    btnShow: {
      next: true,
      prev: true,
      zoomIn: true,
      zoomOut: true
    }
  };

  public form: any;

  constructor(private auth: AuthService,
    public ngZone: NgZone,
    private toastr: ToastrService,
    private fb: FormBuilder) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      name: [this.recordObject.name, Validators.required],
      mainArtist: [this.recordObject.mainArtist],
      date: [this.recordObject.date, Validators.pattern(/([1-2]{1}[0-9]{3}){1}(-((0)?[1-9]|1[0-2])(-[0-9]{1,2})?)?/)],
      label: [this.recordObject.label, Validators.required],
      catalogNo: [this.recordObject.catalogNo, Validators.required],
      country: [this.recordObject.country, Validators.required],
      channelCoding: [this.recordObject.channelCoding],
      format: [this.recordObject.format],
      size: [this.recordObject.size],
      speed: [this.recordObject.speed],
      tracks: this.fb.array(
        _.map(this.recordObject.tracks, (track) => {
          return this.fb.group({
            index: [track.index, Validators.required],
            artists: this.fb.array(_.map(track.artists, (artist: any) => {
              return this.fb.group(
                {
                  index: [artist.index],
                  name: [artist.name, Validators.required]
                });
            })),
            title: [track.title, Validators.required],
            credits: this.fb.array(_.map(track.credits, (credit: any) => {
              return this.fb.group({
                index: [credit.index],
                text: [credit.text, Validators.required]
              });
            })),
            duration: [track.duration, Validators.pattern(/^[0-9]{1,2}:[0-9]{1,2}$/)]
          });
        })
      ),
      commonCredits: this.fb.array(_.map(this.recordObject.commonCredits, (credit: any) => {
        return this.fb.group({
          index: [credit.index],
          text: [credit.text, Validators.required]
        });
      })),
      songUrls: this.fb.array(_.map(this.recordObject.songUrls, (songUrl: any) => {
        return this.fb.group({
          index: [songUrl.index],
          text: [songUrl.text, [Validators.required, Validators.pattern(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/)]]
        });
      })),
      notes: [this.recordObject.notes],
    });
    this.form.valueChanges.subscribe((values: any) => {
      _.assign(this.recordObject, values);
    });

    const genres: any = [];
    _.forEach(this.genresJSON, (s, g) => {
      genres.push({
        name: g,
        styles: s
      });
    });
    this.genres = _.concat(genres, _.map(this.recordObject.genres, (g: any) => {
      return { name: g };
    }));

    this.genres = _.sortedUniqBy(this.genres, (g: any) => g.name);

    $(this.table.nativeElement).sortable({
      stop: (event: any) => {
        const arr = $(this.table.nativeElement).sortable('toArray');
        this.ngZone.runOutsideAngular(() => this.resort(arr));
      }
    });

    this.imageDeleteButton();
    this.loadStyles();
  }

  resort(arr: any) {
    const new_index = _.map(arr, (item) => Number(_.split(item, '-').pop()));
    const oldTracks = _.cloneDeep(this.form.get('tracks').controls);
    const updatedTracks: any = [];

    _.each(new_index, (i) => {
      updatedTracks.push(oldTracks[i]);
    });

    this.ngZone.run(() => {
      _.each(new_index, (i) => {
        this.form.get('tracks').setControl(i, updatedTracks[i]);
      });
    });
  }

  autoIndex() {
    _.each(this.form.get('tracks').controls, (control: FormControl, index) => {
      const value = control.value;

      _.assign(value, { index: index + 1 });
      control.setValue(value);
    });
  }

  appendTrack(tracks: FormArray) {
    tracks.push(this.fb.group({
      index: ['', Validators.required],
      artists: this.fb.array([]),
      title: ['', Validators.required],
      credits: this.fb.array([]),
      duration: ['', Validators.pattern(/^[0-9]{1,2}:[0-9]{1,2}$/)]
    }));
  }

  insertTrackBefore(tracks: FormArray, index: any) {
    tracks.insert(index, this.fb.group({
      index: ['', Validators.required],
      artists: this.fb.array([]),
      title: ['', Validators.required],
      credits: this.fb.array([]),
      duration: ['', Validators.pattern(/^[0-9]{1,2}:[0-9]{1,2}$/)]
    }));
  }

  insertTrackAfter(tracks: FormArray, index: any) {
    tracks.insert(index + 1, this.fb.group({
      index: ['', Validators.required],
      artists: this.fb.array([]),
      title: ['', Validators.required],
      credits: this.fb.array([]),
      duration: ['', Validators.pattern(/^[0-9]{1,2}:[0-9]{1,2}$/)]
    }));
  }

  addArtist(track: FormArray) {
    track.push(this.fb.group(
      {
        index: [''],
        name: ['', Validators.required]
      }));

    _.each(track.controls, (control: FormControl | any, index: any) => {
      control.setValue({ index: index + 1, name: control.get('name').value });
    });
  }

  addCommonCredit(credits: FormArray) {
    credits.push(this.fb.group({
      index: [''],
      text: ['', Validators.required]
    }));

    _.each(credits.controls, (control: FormControl | any, index) => {
      control.setValue({
        index: index + 1,
        text: control.get('text').value
      });
    });
  }

  addSongUrl(songUrls: FormArray) {
    songUrls.push(this.fb.group({
      index: [''],
      text: ['', [Validators.required, Validators.pattern(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/)]]
    }));

    _.each(songUrls.controls, (control: FormControl | any, index) => {
      control.setValue({
        index: index + 1,
        text: control.get('text').value
      });
    });
  }

  addCredit(track: FormArray) {
    track.push(this.fb.group({
      index: [''],
      text: ['', Validators.required]
    }));

    _.each(track.controls, (control: FormControl | any, index) => {
      control.setValue({ index: index + 1, text: control.get('text').value });
    });
  }

  addGenre(event: MatChipInputEvent) {
    const candidateGenre: string = (event.value || '').trim();

    // Reset the input value
    event.chipInput!.clear();

    if (candidateGenre.length < 1) {
      return;
    }

    const found = _.find(this.genres, (genre) => {
      return genre.name === candidateGenre;
    });

    if (found) {
      this.toastr.error(`Genre ${candidateGenre} already exists`, 'Error');
    } else {
      this.genres.push({
        name: candidateGenre,
        styles: []
      });
      this.recordObject.genres.push(candidateGenre);
      this.toastr.success(`Genre ${candidateGenre} added successfully`, 'Success');
    }
  }

  addStyle(event: MatChipInputEvent) {
    const newStyle: string = (event.value || '').trim().replace(/\w+/g, _.capitalize);

    // Reset the input value
    event.chipInput!.clear();


    if (newStyle.length < 1) {
      return;
    }

    const found = _.find(this.styles, (style) => {
      return style === newStyle;
    });

    if (found) {
      this.toastr.error(`Style ${newStyle} already exists`, 'Error');
    } else {
      this.styles.push(newStyle);
      this.recordObject.styles = _.sortedUniq(_.concat(this.recordObject.styles, [newStyle]));
      this.toastr.success(`Styles were added successfully`, 'Success');

    }
  }

  getReleaseData() {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(field => {
        const control = this.form.get(field);
        control.markAsTouched({ onlySelf: true });
      });
      return false;
    } else if (this.uploadCount > 0) {
      this.toastr.warning(`Images are still being uploaded. Please wait!`, 'Warning');
      return false;
    }

    return this.recordObject;
  }

  addImage(event: any) {
    if (!this.auth.isLoggedIn) {
      this.toastr.warning('Please login before continue', 'Warning');
      return;
    }
    if (!_.isEmpty(event.target.files)) {
      _.each(event.target.files, (file) => {
        const filename = `${uuid()}.${file.name.split('.').pop() || ''}`;

        this.uploadCount++;
        this.readyStateChange.emit(false);

        const progressObserver = new Observable((observer) => {
          Storage.put(filename, file, {
            customPrefix: {
              public: 'temp/'
            },
            progressCallback(progress) {
              observer.next(progress.loaded * 100 / progress.total);
            },
          }).then(() => {
            const url = `${environment.cdn_url}temp/${filename}`;

            this.recordObject.images.push(url);
            this.uploadCount--;
            if (this.uploadCount === 0) {
              this.readyStateChange.emit(true);
            }
            observer.complete();
            _.remove(this.percentages, (p) => p === progressObserver);
            this.imageDeleteButton();
          }).catch((e) => {
            this.toastr.error('Image upload failed! Are you online?', 'Error');
            this.uploadCount--;
            _.remove(this.percentages, (p) => p === progressObserver);
            if (this.uploadCount === 0) {
              this.readyStateChange.emit(true);
            }
            observer.complete();
          });
        });
        this.percentages.push(progressObserver);
      });
      event.target.value = '';
    }
  }

  imageDeleteButton() {
    // console.log(this.recordObject.images)
    // _.assign(this.imgvconfig, {customBtns});
    // this.ngZone.run(() => {
    //   let customBtns = [{name: 'delete', icon: 'delete'}];
    //
    //   if (_.isEmpty(this.recordObject.images)) {
    //     customBtns = [];
    //     this.imgvconfig.customBtns.pop()
    //   }
    //   this.imgvconfig.customBtns = customBtns;
    // });
    // if (_.isEmpty(this.recordObject.images)) {
    //   this.toastr.warning('No more images to remove', 'Ops!');
    // }
  }

  handleEvent(event: any) {
    switch (event.name) {
      case 'delete':
        this.deleteImage(event.imageIndex);
        break;
    }
  }

  selectGenre(genre: any, remove: any = false) {
    if (remove) {
      _.remove(this.recordObject.genres, (item) => {
        return item === genre;
      });
      _.each(this.map[genre], s => _.remove(this.recordObject.styles, (x) => s === x));
      delete this.map[genre];
    } else {
      if (_.isEmpty(genre)) {
        return;
      }
      this.recordObject.genres.push(genre);
      this.recordObject.genres = _.uniq(this.recordObject.genres);
    }

    this.loadStyles();
  }

  loadStyles() {
    this.styles = [];
    const genres = this.recordObject.genres;
    const allgenres = this.genres;

    _.each(genres, (genre) => {
      const styles = _.get(_.find(allgenres, (g) => g.name === genre), 'styles', []);
      this.map[genre] = styles;
      this.styles = _.uniq(this.styles.concat(styles)).sort();
    });
  }

  selectStyle(style: any, remove: any = false) {
    if (remove) {
      _.remove(this.recordObject.styles, (item) => {
        return item === style;
      });
    } else {
      if (_.isEmpty(style)) {
        return;
      }
      this.recordObject.styles.push(style);
      this.recordObject.styles = _.uniq(this.recordObject.styles);
    }
  }

  selectDescr(descr: any, remove: any = false) {
    if (remove) {
      _.remove(this.recordObject.descriptions, (item) => {
        return item === descr;
      });
    } else {
      if (_.isEmpty(descr)) {
        return;
      }
      this.recordObject.descriptions.push(descr);
      this.recordObject.descriptions = _.uniq(this.recordObject.descriptions);
    }
  }

  deleteImage(index: any) {
    const removeItem = this.recordObject.images[index];
    this.recordObject.chosenImage = 0;
    _.remove(this.recordObject.images, (item) => _.isEqual(item, removeItem));
    this.imageDeleteButton();
  }
}
