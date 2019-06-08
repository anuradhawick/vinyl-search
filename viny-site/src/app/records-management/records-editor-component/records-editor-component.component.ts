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

  @ViewChild('table') table: ElementRef;

  public recordId: string = null;

  // passed as prop
  @Input()
  set record(record) {
    if (!_.isEmpty(record)) {
      this.recordObject = record;
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
  public newGenreName: string = null;
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

  constructor(private auth: AuthService,
              public ngZone: NgZone,
              private toastr: ToastrService) {
  }

  ngOnInit() {
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

    this.loadStyles();
  }

  resort(arr) {
    const new_index = _.map(arr, (item) => Number(_.split(item, '-').pop()));
    const newTracks = _.cloneDeep(this.recordObject.tracks);

    _.forEach(new_index, (index, pos) => {
      newTracks[index] = this.recordObject.tracks[pos];
    });

    this.ngZone.run(() => {
      this.recordObject.tracks = newTracks;
    });
  }

  autoIndex() {
    const newTracks = _.cloneDeep(this.recordObject.tracks);

    _.forEach(newTracks, (track, pos) => {
      track.index = pos + 1;
    });

    this.recordObject.tracks = newTracks;
  }

  appendTrack() {
    const newTracks = _.cloneDeep(this.recordObject.tracks);

    newTracks.push(
      {
        index: '',
        artists: [],
        title: '',
        credits: [],
        duration: ''
      });

    this.recordObject.tracks = newTracks;
  }

  insertTrackBefore(index) {
    const newTracks = _.cloneDeep(this.recordObject.tracks);

    newTracks.splice(index, 0,
      {
        index: '',
        artists: [],
        title: '',
        credits: [],
        duration: ''
      }
    );

    this.recordObject.tracks = newTracks;
  }

  insertTrackAfter(index) {
    const newTracks = _.cloneDeep(this.recordObject.tracks);

    newTracks.splice(index + 1, 0,
      {
        index: '',
        artists: [],
        title: '',
        credits: [],
        duration: ''
      }
    );

    this.recordObject.tracks = newTracks;
  }

  addArtist(track) {
    _.forEach(track.artists, (a, i) => {
      a.index = i;
    });

    track.artists.push(
      {
        index: track.artists.length + 1,
        name: ''
      });
  }

  addCommonCredit() {
    const newCredits = _.cloneDeep(this.recordObject.commonCredits);
    // const new
    newCredits.push(
      {
        index: this.recordObject.commonCredits.length + 1,
        text: ''
      });
    _.forEach(newCredits, (c, i) => {
      c.index = i;
    });

    this.recordObject.commonCredits = newCredits;
  }

  removeCommonCredit(credit) {
    const newCredits = _.cloneDeep(this.recordObject.commonCredits);

    _.remove(newCredits, (c) => _.isEqual(c, credit));
    _.forEach(newCredits, (c, i) => {
      c.index = i;
    });

    this.recordObject.commonCredits = newCredits;
  }

  removeArtist(oldtracks, ti, artist) {
    const tracks = _.cloneDeep(oldtracks);

    _.remove(tracks[ti].artists, (a) => _.isEqual(a, artist));
    _.forEach(tracks[ti].artists, (a, i) => {
      a.index = i;
    });

    this.recordObject.tracks = tracks;
  }

  removeTrack(track) {
    _.remove(this.recordObject.tracks, (t) => t === track);
  }

  removeCredit(oldtracks, ti, credit) {
    const tracks = _.cloneDeep(oldtracks);

    _.remove(tracks[ti].credits, (c) => _.isEqual(c, credit));

    this.recordObject.tracks = tracks;
  }

  addCredit(track) {
    track.credits.push({
      index: track.credits.length + 1,
      text: ''
    });
  }

  addGenre() {
    const candidateGenre = _.startCase(_.lowerCase(this.newGenreName));
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

  addStyle() {
    const newStyles = _.map(_.split(_.trim(this.newStyleNames), '\n'), (i) => _.startCase(_.lowerCase(i)));

    this.recordObject.styles = _.sortedUniq(_.concat(this.recordObject.styles, newStyles));
    this.toastr.success(`Styles were added successfully`, 'Success');
  }

  getReleaseData() {
    const form: any = document.getElementsByClassName('needs-validation')[0];
    const valid = form.checkValidity();
    form.classList.add('was-validated');

    if (!valid) {
      return valid;
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
    _.remove(this.recordObject.images, (item) => _.isEqual(item, removeItem));
    this.imageDeleteButton();
  }
}
