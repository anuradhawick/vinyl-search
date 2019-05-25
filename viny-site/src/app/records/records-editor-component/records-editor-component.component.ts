import { Component, ElementRef, EventEmitter, Input, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireFunctions } from '@angular/fire/functions';
import genresJSON from '../../shared/data/genres.json';
import countriesJSON from '../../shared/data/countries.json';
import speedsJSON from '../../shared/data/speed.json';
import sizesJSON from '../../shared/data/size.json';
import descrJSON from '../../shared/data/description.json';
import * as _ from 'lodash';
import uuid from 'uuid';
import { Observable } from 'rxjs';

declare const $;

@Component({
  selector: 'app-records-editor-component',
  templateUrl: './records-editor-component.component.html',
  styleUrls: ['./records-editor-component.component.css']
})
export class RecordsEditorComponentComponent implements OnInit {
  private genresJSON = genresJSON;
  private genres: Observable<any[]>;
  private styles = [];
  private countriesJSON = countriesJSON;
  private objectKeys = Object.keys;
  private _ = _;
  private descr = descrJSON;
  private sizesJSON = sizesJSON;
  private speedsJSON = speedsJSON;
  private map = {};

  @ViewChild('table') table: ElementRef;

  private recordId: string = null;
  private newMode = true;

  // passed as prop
  @Input()
  set record(record) {
    if (!_.isEmpty(record)) {
      this.recordObject = record;
    }
  }

  @Output()
  readyStateChange = new EventEmitter<boolean>();

  // current entry
  private recordObject = {
    chosenImage: 0,
    images: [],
    date: null,
    selectedGenres: [],
    selectedStyles: [],
    selectedDescr: [],
    selectedSpeed: null,
    selectedSize: null,
    selectedCountry: null,
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
    selectedFormat: null,
    selectedChannelCoding: null,
  };

  // new genre related
  private newGenreName: string = null;
  private newStyleNames: string = null;
  private selectedGenre: string = null;


  // context control
  private uploadCount = 0;
  private percentages = [];

  // image viewer config
  private imgvconfig = {
    btnClass: 'default',
    zoomFactor: 0.1,
    containerBackgroundColor: '#ccc',
    wheelZoom: false,
    allowFullscreen: true,
    allowKeyboardNavigation: true,
    btnIcons: {
      next: 'fas fa-angle-double-right',
      prev: 'fas fa-angle-double-left',
      fullscreen: 'fas fa-arrows-alt',
    },
    customBtns: [],
    btnShow: {
      next: true,
      prev: true
    }
  };
// TODO update indexes before adding new one with index = length + 1 # CRITICAL ERROR MAY RAISE
  constructor(private auth: AngularFireAuth,
              private storage: AngularFireStorage,
              private database: AngularFirestore,
              private route: ActivatedRoute,
              private fns: AngularFireFunctions,
              private router: Router,
              private ngZone: NgZone) {
  }

  ngOnInit() {
    // loading genres
    this.fetchGenres();

    this.route.paramMap.subscribe((map: any) => {
      const recordId = _.get(map, 'params.recordId', null);

      if (_.isEmpty(recordId)) {
        return;
      }
      this.recordId = recordId;
      this.newMode = false;

      const callable = this.fns.httpsCallable('retrieve_record');
      const data = callable({recordId: recordId});
      data.subscribe((post) => {

      });
    });

    $(this.table.nativeElement).sortable({
      stop: (event) => {
        const arr = $(this.table.nativeElement).sortable('toArray');
        this.ngZone.runOutsideAngular(() => this.resort(arr));
      }
    });
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
    track.artists.push(
      {
        index: track.artists.length + 1,
        name: ''
      });
  }

  addCommonCredit() {
    // const new
    this.recordObject.commonCredits.push(
      {
        index: this.recordObject.commonCredits.length + 1,
        text: ''
      });
  }

  removeCommonCredit(credit) {
    _.remove(this.recordObject.commonCredits, (c) => _.isEqual(c, credit));
  }

  removeArtist(oldtracks, ti, artist) {
    const tracks = _.cloneDeep(oldtracks);

    _.remove(tracks[ti].artists, (a) => _.isEqual(a, artist));

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
    const callable = this.fns.httpsCallable('new_genre');
    const data = callable({genre: this.newGenreName});
    data.subscribe((result) => {
      this.fetchGenres();
      alert('Success!');
    }, () => {
      alert('Saving failed! Please try again later');
    });
  }

  addStyle() {
    if (_.isEmpty(this.selectedGenre)) {
      alert('Select a genre to add the style');
      return;
    }

    const callable = this.fns.httpsCallable('new_style');
    const data = callable({
      styles: _.map(_.split(this.newStyleNames, '\n'), (i) => _.startCase(_.lowerCase(i))),
      genre: this.selectedGenre
    });

    data.subscribe((result) => {
      this.fetchGenres().subscribe(() => {
        this.loadStyles();
      });
      alert('Success!');
    }, () => {
      alert('Saving failed! Please try again later');
    });
  }

  getReleaseData() {
    console.log(this.recordObject)
    const form: any = document.getElementsByClassName('needs-validation')[0];
    const valid = form.checkValidity();
    form.classList.add('was-validated');

    if (!valid) {
      return valid;
    } else if (this.uploadCount > 0) {
      alert('Images are still being uploaded. Please wait!');
      return false;
    }

    return this.recordObject;
  }

  addImage(event) {
    if (_.isEmpty(_.get(this.auth, 'auth.currentUser.uid'))) {
      alert('Please login before continue');
      return;
    }
    if (!_.isEmpty(event.target.files)) {
      _.each(event.target.files, (file) => {
        const filePath = `record-images/${this.auth.auth.currentUser.uid}/${uuid()}${file.name}`;
        const ref = this.storage.ref(filePath);
        const task = ref.put(file);
        const percentageEvent = task.percentageChanges();

        this.uploadCount++;
        this.percentages.push(percentageEvent);
        this.readyStateChange.emit(false);

        task.then(() => {
          ref.getDownloadURL().subscribe((url) => {
            this.recordObject.images.push(url);
            this.uploadCount--;
            _.remove(this.percentages, (p) => p === percentageEvent);
            this.imageDeleteButton();
            if (this.uploadCount === 0) {
              this.readyStateChange.emit(true);
            }
          }, () => {
            this.uploadCount--;
            _.remove(this.percentages, (p) => p === percentageEvent);
            this.imageDeleteButton();
            if (this.uploadCount === 0) {
              this.readyStateChange.emit(true);
            }
          });
        }).catch(() => {
          alert('Image upload failed');
          this.imageDeleteButton();
          this.uploadCount--;
          _.remove(this.percentages, (p) => p === percentageEvent);
          if (this.uploadCount === 0) {
            this.readyStateChange.emit(true);
          }
        });
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
      _.remove(this.recordObject.selectedGenres, (item) => {
        return item === genre;
      });
      _.each(this.map[genre], s => _.remove(this.recordObject.selectedStyles, (x) => s === x));
      delete this.map[genre];
    } else {
      if (_.isEmpty(genre)) {
        return;
      }
      this.recordObject.selectedGenres.push(genre);
      this.recordObject.selectedGenres = _.uniq(this.recordObject.selectedGenres);
    }

    this.loadStyles();
  }

  async loadStyles() {
    this.styles = [];
    const genres = this.recordObject.selectedGenres;
    const allgenres = await this.genres.toPromise();

    _.each(genres, (genre) => {
      const styles = _.find(allgenres, (g) => g.name === genre).styles;
      this.map[genre] = styles;
      this.styles = _.uniq(this.styles.concat(styles)).sort();
    });
  }

  selectStyle(style, remove) {
    if (remove) {
      _.remove(this.recordObject.selectedStyles, (item) => {
        return item === style;
      });
    } else {
      if (_.isEmpty(style)) {
        return;
      }
      this.recordObject.selectedStyles.push(style);
      this.recordObject.selectedStyles = _.uniq(this.recordObject.selectedStyles);
    }
  }

  selectDescr(descr, remove) {
    if (remove) {
      _.remove(this.recordObject.selectedDescr, (item) => {
        return item === descr;
      });
    } else {
      if (_.isEmpty(descr)) {
        return;
      }
      this.recordObject.selectedDescr.push(descr);
      this.recordObject.selectedDescr = _.uniq(this.recordObject.selectedDescr);
    }
  }

  fetchGenres() {
    const callable = this.fns.httpsCallable('fetch_genres');
    this.genres = callable({});

    return this.genres;
  }

  deleteImage(index) {
    const removeItem = this.recordObject.images[index];
    _.remove(this.recordObject.images, (item) => _.isEqual(item, removeItem));
    this.imageDeleteButton();
  }
}
