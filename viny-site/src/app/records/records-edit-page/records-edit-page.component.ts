import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
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
import { LoaderComponent } from '../../shared/loader/loader.component';
import { Observable } from 'rxjs';

declare const $;


@Component({
  selector: 'app-records-edit-page',
  templateUrl: './records-edit-page.component.html',
  styleUrls: ['./records-edit-page.component.css']
})
export class RecordsEditPageComponent implements OnInit {
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

  @ViewChild('recordImageLoader') image_loader: LoaderComponent;
  @ViewChild('table') table: ElementRef;

  private recordId: string = null;
  private newMode = true;

  // current entry
  private chosenImage = '/assets/images/records-new-sample.svg';
  private selectedGenres = [];
  private selectedGenre = null;
  private selectedStyles = [];
  private selectedDescr = [];
  private selectedSpeed = null;
  private selectedSize = null;
  private selectedCountry = null;
  private tracks: Array<any> = [{
    index: '',
    artists: [],
    title: '',
    credits: [],
    duration: ''
  }];
  private notes = null;
  private commonCredits = [];
  private name = null;
  private label = null;
  private mainArtist = null;

  // new genre related
  private newGenreName: string = null;
  private newStyleNames: string = null;

  // context control
  private saving = false;

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
    console.log("WEIRD")
    const new_index = _.map(arr, (item) => Number(_.split(item, '-').pop()) - 1);
    const newTracks = _.cloneDeep(this.tracks);

    _.forEach(new_index, (index, pos) => {
      newTracks[index] = this.tracks[pos];
    });

    this.ngZone.run(() => {
      this.tracks = newTracks;
    });
  }

  autoIndex() {
    const newTracks = _.cloneDeep(this.tracks);

    _.forEach(newTracks, (track, pos) => {
      track.index = pos + 1;
    });

    this.tracks = newTracks;
  }

  appendTrack() {
    const newTracks = _.cloneDeep(this.tracks);

    newTracks.push(
      {
        index: '',
        artists: [],
        title: '',
        credits: [],
        duration: ''
      });

    this.tracks = newTracks;
  }

  insertTrackBefore(index) {
    const newTracks = _.cloneDeep(this.tracks);

    newTracks.splice(index, 0,
      {
        index: '',
        artists: [{index: 1, name: ''}],
        title: '',
        credits: [],
        duration: '0.00'
      }
    );

    this.tracks = newTracks;
  }

  insertTrackAfter(index) {
    const newTracks = _.cloneDeep(this.tracks);

    newTracks.splice(index + 1, 0,
      {
        index: '',
        artists: [{index: 1, name: ''}],
        title: '',
        credits: [],
        duration: '0.00'
      }
    );

    this.tracks = newTracks;
  }

  addArtist(track) {
    track.artists.push(
      {
        index: track.artists.length + 1,
        name: ''
      });
  }

  addCommonCredit() {
    this.commonCredits.push(
      {
        index: this.commonCredits.length + 1,
        text: ''
      });
  }

  removeCommonCredit(credit) {
    _.remove(this.commonCredits, (c) => _.isEqual(c, credit));
  }

  removeArtist(oldtracks, ti, artist) {
    const tracks = _.cloneDeep(oldtracks);

    _.remove(tracks[ti].artists, (a) => _.isEqual(a, artist));

    this.tracks = tracks;
  }

  removeTrack(track) {
    _.remove(this.tracks, (t) => t === track);
  }

  removeCredit(oldtracks, ti, credit) {
    const tracks = _.cloneDeep(oldtracks);

    _.remove(tracks[ti].credits, (c) => _.isEqual(c, credit));

    this.tracks = tracks;
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

  async save() {
    const form: any = document.getElementsByClassName('needs-validation')[0];
    const valid = form.checkValidity();
    form.classList.add('was-validated');

    if (!valid) {
      return;
    }

    if (_.isEmpty(_.get(this.auth, 'auth.currentUser.uid'))) {
      alert('Please login before continue');
      return;
    }

    const newRecordObject = {
      tracks: this.tracks,
      name: this.name,
      label: this.label,
      notes: this.notes,
      speed: this.selectedSpeed,
      size: this.selectedSize,
      country: this.selectedCountry,
      genres: this.selectedGenres,
      styles: this.selectedStyles,
      descriptions: this.selectedDescr,
      recordImage: this.chosenImage,
      commonCredits: this.commonCredits,
      mainArtist: this.mainArtist
    };

    if (this.chosenImage === '/assets/images/records-new-sample.svg') {
      newRecordObject.recordImage = null;
    }

    const callable = this.fns.httpsCallable('new_record');
    const data = callable(newRecordObject);

    this.saving = true;

    data.subscribe(() => {
      alert('Successfully saved');
    }, () => {
      this.saving = false;
      alert('Failed to save. Try again later!');
    });
  }

  addImage(event) {
    if (_.isEmpty(_.get(this.auth, 'auth.currentUser.uid'))) {
      alert('Please login before continue');
      return;
    }
    if (!_.isEmpty(event.target.files)) {
      this.image_loader.show();
      const temp = this.chosenImage;
      this.chosenImage = null;
      const file = event.target.files[0];
      const filePath = `record-images/${this.auth.auth.currentUser.uid}/${uuid()}${file.name}`;
      const ref = this.storage.ref(filePath);
      const task = ref.put(file);
      task.then(() => {
        ref.getDownloadURL().subscribe((url) => {
          this.chosenImage = url;
          this.image_loader.hide();
        });
      }).catch(() => {
        alert('Image upload failed');
        this.chosenImage = temp;
        this.image_loader.hide();
      });
    }

  }

  selectGenre(genre, remove) {
    if (remove) {
      _.remove(this.selectedGenres, (item) => {
        return item === genre;
      });
      _.each(this.map[genre], s => _.remove(this.selectedStyles, (x) => s === x));
      delete this.map[genre];
    } else {
      if (_.isEmpty(genre)) {
        return;
      }
      this.selectedGenres.push(genre);
      this.selectedGenres = _.uniq(this.selectedGenres);
    }

    this.loadStyles();
  }

  async loadStyles() {
    this.styles = [];
    const genres = this.selectedGenres;
    const allgenres = await this.genres.toPromise();

    _.each(genres, (genre) => {
      const styles = _.find(allgenres, (g) => g.name === genre).styles;
      this.map[genre] = styles;
      this.styles = _.uniq(this.styles.concat(styles)).sort();
    });
  }

  selectStyle(style, remove) {
    if (remove) {
      _.remove(this.selectedStyles, (item) => {
        return item === style;
      });
    } else {
      if (_.isEmpty(style)) {
        return;
      }
      this.selectedStyles.push(style);
      this.selectedStyles = _.uniq(this.selectedStyles);
    }
  }

  selectDescr(descr, remove) {
    if (remove) {
      _.remove(this.selectedDescr, (item) => {
        return item === descr;
      });
    } else {
      if (_.isEmpty(descr)) {
        return;
      }
      this.selectedDescr.push(descr);
      this.selectedDescr = _.uniq(this.selectedDescr);
    }
  }

  fetchGenres() {
    const callable = this.fns.httpsCallable('fetch_genres');
    this.genres = callable({});

    return this.genres;
  }
}
