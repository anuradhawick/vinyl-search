import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../shared/services/auth.service';
import { uploadData } from 'aws-amplify/storage';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatChipInputEvent,
  MatChipListbox,
  MatChip,
  MatChipGrid,
  MatChipRow,
  MatChipRemove,
  MatChipInput,
} from '@angular/material/chips';
import { ENTER } from '@angular/cdk/keycodes';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
// @ts-ignore
import moment from 'moment';
// @ts-ignore
import genresJSON from '../../shared/data/genres.json';
// @ts-ignore
import countriesJSON from '../../shared/data/countries.json';
// @ts-ignore
import speedsJSON from '../../shared/data/speed.json';
// @ts-ignore
import sizesJSON from '../../shared/data/size.json';
// @ts-ignore
import descrJSON from '../../shared/data/description.json';
import { ImageViewerComponent } from '../../shared/components/image-viewer/image-viewer.component';
import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import {
  MatFormField,
  MatInput,
  MatError,
  MatLabel,
  MatSuffix,
} from '@angular/material/input';
import {
  MatDatepickerInput,
  MatDatepickerToggle,
  MatDatepicker,
} from '@angular/material/datepicker';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { AsyncPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export const DATE_FORMATS = {
  parse: {
    dateInput: 'YYYY-MM-DD',
  },
  display: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'YYYY MMM',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY MMMM',
  },
};

interface RecordArtist {
  index: number | null;
  name: string;
}

interface RecordCredit {
  index: number | null;
  text: string;
}

interface RecordTrack {
  index: number | null;
  artists: RecordArtist[];
  title: string;
  credits: RecordCredit[];
  duration: string;
}

interface RecordEditorModel {
  chosenImage: number;
  images: string[];
  date: string;
  genres: string[];
  styles: string[];
  descriptions: string[];
  speed: string | null;
  size: string | null;
  country: string | null;
  tracks: RecordTrack[];
  notes: string | null;
  commonCredits: RecordCredit[];
  songUrls: RecordCredit[];
  name: string | null;
  label: string | null;
  mainArtist: string | null;
  catalogNo: string | null;
  format: string | null;
  channelCoding: string | null;
}

interface GenreOption {
  name: string;
  styles: string[];
}

@Component({
  selector: 'app-records-editor-component',
  templateUrl: './records-editor-component.component.html',
  styleUrls: ['./records-editor-component.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
  ],
  imports: [
    ImageViewerComponent,
    MatButton,
    MatProgressBar,
    MatCard,
    MatCardContent,
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatError,
    MatLabel,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    MatSelect,
    MatOption,
    MatCardHeader,
    MatCardTitle,
    MatChipListbox,
    MatChip,
    MatChipGrid,
    MatChipRow,
    MatChipRemove,
    MatIcon,
    MatChipInput,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    AsyncPipe,
    CdkDropList,
    CdkDrag,
  ],
})
export class RecordsEditorComponentComponent implements OnInit, OnChanges {
  public genresJSON = genresJSON;
  public genres: GenreOption[] = [];
  public styles: string[] = [];
  public countriesJSON = countriesJSON;
  public descr = descrJSON;
  public sizesJSON = sizesJSON;
  public speedsJSON = speedsJSON;
  public map: Record<string, string[]> = {};

  @Input() record: RecordEditorModel | null = null;
  @Input() editorTitle = '';
  @Output() recordChange = new EventEmitter<RecordEditorModel>();
  @Output() readyStateChange = new EventEmitter<boolean>();

  // current entry
  public recordObject: RecordEditorModel = {
    chosenImage: 0,
    images: [],
    date: moment().format('YYYY-MM-DD'),
    genres: [],
    styles: [],
    descriptions: [],
    speed: null,
    size: null,
    country: null,
    tracks: [
      {
        index: null,
        artists: [],
        title: '',
        credits: [],
        duration: '',
      },
    ],
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
  // context control
  public uploadCount = 0;
  public percentages: Observable<unknown>[] = [];

  // image viewer config
  public imgvconfig = {
    zoomFactor: 0.1,
    wheelZoom: true,
    allowFullscreen: true,
    allowKeyboardNavigation: true,
    customBtns: [{ name: 'delete', icon: 'delete' }],
    btnShow: {
      next: true,
      prev: true,
      zoomIn: true,
      zoomOut: true,
    },
  };

  public form!: FormGroup;
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private auth: AuthService,
    private toastr: ToastrService,
    private fb: FormBuilder,
  ) {}

  get imageSources(): string[] {
    return this.recordObject.images.length
      ? this.recordObject.images
      : ['/assets/images/records-new-sample.svg'];
  }

  get tracks(): FormArray<FormGroup> {
    return this.form.get('tracks') as FormArray<FormGroup>;
  }

  get commonCredits(): FormArray<FormGroup> {
    return this.form.get('commonCredits') as FormArray<FormGroup>;
  }

  get songUrls(): FormArray<FormGroup> {
    return this.form.get('songUrls') as FormArray<FormGroup>;
  }

  ngOnInit() {
    this.rebuildEditor();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['record'] && !changes['record'].firstChange) {
      this.rebuildEditor();
    }
  }

  private rebuildEditor() {
    if (this.record) {
      this.recordObject = _.cloneDeep(this.record);
    }
    this.form = this.createForm(this.recordObject);

    // update record object to keep UI up to date
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((values: Partial<RecordEditorModel>) => {
        Object.assign(this.recordObject, values);
        // reformat date as string
        this.recordObject.date = moment(values.date).format('YYYY-MM-DD');
        this.recordChange.emit(this.recordObject);
      });

    const genres: any = [];
    _.forEach(this.genresJSON, (s, g) => {
      genres.push({
        name: g,
        styles: s,
      });
    });
    this.genres = _.concat(
      genres,
      _.map(this.recordObject.genres, (g: any) => {
        return { name: g };
      }),
    );

    this.genres = _.sortedUniqBy(this.genres, (g: any) => g.name);

    this.loadStyles();
  }

  private createForm(record: RecordEditorModel): FormGroup {
    return this.fb.group({
      name: [record.name, Validators.required],
      mainArtist: [record.mainArtist, Validators.required],
      date: [record.date, Validators.required],
      label: [record.label, Validators.required],
      catalogNo: [record.catalogNo, Validators.required],
      country: [record.country, Validators.required],
      channelCoding: [record.channelCoding],
      format: [record.format],
      size: [record.size],
      speed: [record.speed],
      tracks: this.fb.array(
        record.tracks.map((track) => this.createTrack(track)),
      ),
      commonCredits: this.fb.array(
        record.commonCredits.map((credit) => this.createCredit(credit)),
      ),
      songUrls: this.fb.array(
        record.songUrls.map((songUrl) => this.createSongUrl(songUrl)),
      ),
      notes: [record.notes],
    });
  }

  private createTrack(track?: Partial<RecordTrack>): FormGroup {
    return this.fb.group({
      index: [track?.index ?? '', Validators.required],
      artists: this.fb.array(
        (track?.artists ?? []).map((artist) => this.createArtist(artist)),
      ),
      title: [track?.title ?? '', Validators.required],
      credits: this.fb.array(
        (track?.credits ?? []).map((credit) => this.createCredit(credit)),
      ),
      duration: [
        track?.duration ?? '',
        Validators.pattern(/^[0-9]{1,2}:[0-9]{1,2}$/),
      ],
    });
  }

  private createArtist(artist?: Partial<RecordArtist>): FormGroup {
    return this.fb.group({
      index: [artist?.index ?? ''],
      name: [artist?.name ?? '', Validators.required],
    });
  }

  private createCredit(credit?: Partial<RecordCredit>): FormGroup {
    return this.fb.group({
      index: [credit?.index ?? ''],
      text: [credit?.text ?? '', Validators.required],
    });
  }

  private createSongUrl(songUrl?: Partial<RecordCredit>): FormGroup {
    return this.fb.group({
      index: [songUrl?.index ?? ''],
      text: [
        songUrl?.text ?? '',
        [
          Validators.required,
          Validators.pattern(
            /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/,
          ),
        ],
      ],
    });
  }

  private reindexArray(formArray: FormArray) {
    formArray.controls.forEach((control, index) => {
      control.patchValue({ index: index + 1 });
    });
  }

  dropTrack(event: CdkDragDrop<FormGroup[]>) {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    const movedTrack = this.tracks.at(event.previousIndex);
    this.tracks.removeAt(event.previousIndex);
    this.tracks.insert(event.currentIndex, movedTrack);
  }

  autoIndex() {
    this.reindexArray(this.tracks);
  }

  appendTrack(tracks: FormArray) {
    tracks.push(this.createTrack());
  }

  insertTrackBefore(tracks: FormArray, index: any) {
    tracks.insert(index, this.createTrack());
  }

  insertTrackAfter(tracks: FormArray, index: any) {
    tracks.insert(index + 1, this.createTrack());
  }

  addArtist(track: FormArray) {
    track.push(this.createArtist());
    this.reindexArray(track);
  }

  addCommonCredit(credits: FormArray) {
    credits.push(this.createCredit());
    this.reindexArray(credits);
  }

  addSongUrl(songUrls: FormArray) {
    songUrls.push(this.createSongUrl());
    this.reindexArray(songUrls);
  }

  addCredit(track: FormArray) {
    track.push(this.createCredit());
    this.reindexArray(track);
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
        styles: [],
      });
      this.recordObject.genres.push(candidateGenre);
      this.toastr.success(
        `Genre ${candidateGenre} added successfully`,
        'Success',
      );
    }
  }

  addStyle(event: MatChipInputEvent) {
    const newStyle: string = (event.value || '')
      .trim()
      .replace(/\w+/g, _.capitalize);

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
      this.recordObject.styles = _.sortedUniq(
        _.concat(this.recordObject.styles, [newStyle]),
      );
      this.toastr.success(`Styles were added successfully`, 'Success');
    }
  }

  getReleaseData() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return false;
    } else if (this.uploadCount > 0) {
      this.toastr.warning(
        `Images are still being uploaded. Please wait!`,
        'Warning',
      );
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
          uploadData({
            key: `temp/${filename}`,
            data: file,
            options: {
              onProgress: (progress: any) => {
                observer.next(
                  (progress.transferredBytes * 100) / progress.totalBytes,
                );
              },
            },
          })
            .result.then(() => {
              const url = `${environment.cdn_url}temp/${filename}`;

              this.recordObject.images.push(url);
              this.uploadCount--;
              if (this.uploadCount === 0) {
                this.readyStateChange.emit(true);
              }
              observer.complete();
              _.remove(this.percentages, (p) => p === progressObserver);
            })
            .catch(() => {
              this.toastr.error(
                'Image upload failed! Are you online?',
                'Error',
              );
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
      _.each(this.map[genre], (s) =>
        _.remove(this.recordObject.styles, (x) => s === x),
      );
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
      const styles = _.get(
        _.find(allgenres, (g) => g.name === genre),
        'styles',
        [],
      );
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
  }
}
