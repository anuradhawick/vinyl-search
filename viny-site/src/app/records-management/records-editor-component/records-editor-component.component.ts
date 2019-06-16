import { Component, ElementRef, EventEmitter, Input, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import genresJSON from '../../shared-modules/data/genres.json';
import countriesJSON from '../../shared-modules/data/countries.json';
import speedsJSON from '../../shared-modules/data/speed.json';
import sizesJSON from '../../shared-modules/data/size.json';
import descrJSON from '../../shared-modules/data/description.json';
import * as _ from 'lodash';
import uuid from 'uuid';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../shared-modules/auth/auth.service';
import { Storage } from 'aws-amplify';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material';
import { ENTER } from '@angular/cdk/keycodes';

declare const $;

@Component({
  selector: 'app-records-editor-component',
  templateUrl: './records-editor-component.component.html',
  styleUrls: ['./records-editor-component.component.css']
})
export class RecordsEditorComponentComponent implements OnInit {
  public genresJSON = genresJSON;
  public genres = [];
  public styles = [];
  public countriesJSON = countriesJSON;
  public objectKeys = Object.keys;
  public _ = _;
  public descr = descrJSON;
  public sizesJSON = sizesJSON;
  public speedsJSON = speedsJSON;
  public map = {};

  @ViewChild('table', {static: true}) table: ElementRef;

  public recordId: string = null;

  // passed as prop
  @Input()
  set record(record) {
    if (!_.isEmpty(record)) {
      _.assign(this.recordObject, record);
    }
  }

  @Input() public editorTitle = 'New Release Details';

  @Output() recordChange = new EventEmitter();


  @Output()
  readyStateChange = new EventEmitter<boolean>();

  // current entry
  public recordObject = {
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
  public newStyleNames: string = null;

  // context control
  public uploadCount = 0;
  public percentages = [];

  // image viewer config
  public imgvconfig = {
    btnClass: 'default',
    zoomFactor: 0.1,
    containerBackgroundColor: '#ccc',
    wheelZoom: false,
    allowFullscreen: true,
    allowKeyboardNavigation: true,
    btnIcons: {
      zoomIn: 'fas fa-plus',
      zoomOut: 'fas fa-minus',
      next: 'fas fa-angle-double-right',
      prev: 'fas fa-angle-double-left',
      fullscreen: 'fas fa-arrows-alt',
    },
    customBtns: [],
    btnShow: {
      next: true,
      prev: true,
      zoomIn: true,
      zoomOut: true
    }
  };

  public form;

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
            artists: this.fb.array(_.map(track.artists, (artist) => {
              return this.fb.group(
                {
                  index: [artist.index],
                  name: [artist.name, Validators.required]
                });
            })),
            title: [track.title, Validators.required],
            credits: this.fb.array(_.map(track.credits, (credit) => {
              return this.fb.group({
                index: [credit.index],
                text: [credit.text, Validators.required]
              });
            })),
            duration: [track.duration, Validators.pattern(/^[0-9]{1,2}:[0-9]{1,2}$/)]
          });
        })
      ),
      commonCredits: this.fb.array(_.map(this.recordObject.commonCredits, (credit) => {
        return this.fb.group({
          index: [credit.index],
          text: [credit.text, Validators.required]
        });
      })),
      notes: [this.recordObject.notes],
    });
    this.form.valueChanges.subscribe((values) => {
      _.assign(this.recordObject, values);
    });

    const genres = [];
    _.forEach(this.genresJSON, (s, g) => {
      genres.push({
        name: g,
        styles: s
      });
    });
    this.genres = _.concat(genres, _.map(this.recordObject.genres, (g) => {
      return {name: g};
    }));

    this.genres = _.sortedUniqBy(this.genres, (g) => g.name);

    $(this.table.nativeElement).sortable({
      stop: (event) => {
        const arr = $(this.table.nativeElement).sortable('toArray');
        this.ngZone.runOutsideAngular(() => this.resort(arr));
      }
    });

    this.imageDeleteButton();
    this.loadStyles();
  }

  resort(arr) {
    const new_index = _.map(arr, (item) => Number(_.split(item, '-').pop()));
    const oldTracks = _.cloneDeep(this.form.get('tracks').controls);
    const updatedTracks = [];

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

      _.assign(value, {index: index + 1});
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

  insertTrackBefore(tracks: FormArray, index) {
    tracks.insert(index, this.fb.group({
      index: ['', Validators.required],
      artists: this.fb.array([]),
      title: ['', Validators.required],
      credits: this.fb.array([]),
      duration: ['', Validators.pattern(/^[0-9]{1,2}:[0-9]{1,2}$/)]
    }));
  }

  insertTrackAfter(tracks: FormArray, index) {
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

    _.each(track.controls, (control: FormControl, index) => {
      control.setValue({index: index + 1, name: control.get('name').value});
    });
  }

  addCommonCredit(credits: FormArray) {
    credits.push(this.fb.group({
      index: [''],
      text: ['', Validators.required]
    }));

    _.each(credits.controls, (control: FormControl, index) => {
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

    _.each(track.controls, (control: FormControl, index) => {
      control.setValue({index: index + 1, text: control.get('text').value});
    });
  }

  addGenre(event: MatChipInputEvent) {
    const input = event.input;
    const value = event.value;
    const candidateGenre: string = _.trim(_.get(event, 'value', '')).replace(/\w+/g, _.capitalize);

    // Reset the input value
    if (input) {
      input.value = '';
    }

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
    const input = event.input;
    const value = event.value;
    const newStyle: string = _.trim(_.get(event, 'value', '')).replace(/\w+/g, _.capitalize);

    // Reset the input value
    if (input) {
      input.value = '';
    }

    if (newStyle.length < 1) {
      return;
    }

    this.recordObject.styles = _.sortedUniq(_.concat(this.recordObject.styles, [newStyle]));
    this.toastr.success(`Styles were added successfully`, 'Success');
  }

  getReleaseData() {
    if (this.form.invalid) {
      return false;
    } else if (this.uploadCount > 0) {
      this.toastr.warning(`Images are still being uploaded. Please wait!`, 'Warning');
      return false;
    }

    return this.recordObject;
  }

  addImage(event) {
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
            const url = `https://${environment.aws_config.Storage.AWSS3.bucket}.s3-${environment.aws_config.Storage.AWSS3.region}.amazonaws.com/temp/${filename}`;

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
    const config = _.cloneDeep(this.imgvconfig);

    if (_.isEmpty(this.recordObject.images)) {
      config.customBtns = [];
      config.wheelZoom = false;
    } else {
      config.wheelZoom = true;
      if (_.isEmpty(this.imgvconfig.customBtns)) {
        config.customBtns = [{name: 'delete', icon: 'fas fa-trash-alt'}];
      }
    }

    this.ngZone.run(() => {
      this.imgvconfig = config;
    });
  }

  handleEvent(event) {
    switch (event.name) {
      case 'delete':
        this.deleteImage(event.imageIndex);
        break;
    }
  }

  selectGenre(genre, remove) {
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

  selectStyle(style, remove) {
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

  selectDescr(descr, remove) {
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

  deleteImage(index) {
    const removeItem = this.recordObject.images[index];
    this.recordObject.chosenImage = 0;
    _.remove(this.recordObject.images, (item) => _.isEqual(item, removeItem));
    this.imageDeleteButton();
  }
}
