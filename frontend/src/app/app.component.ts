import {
  Component,
  computed,
  ElementRef,
  HostListener,
  signal,
  ViewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from './shared-modules/services/auth.service';
import { TitleTagService } from './shared-modules/services/title-tag.service';
import * as _ from 'lodash';
import { startWith } from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent {
  public _ = _;
  protected menuOpen = signal(false);
  protected currentUser = toSignal<any>(
    this.auth.user.pipe(startWith(null as any)),
    {
      initialValue: null,
    },
  );
  protected isAdmin = computed(
    () => !!this.currentUser()?.roles?.includes('Admin'),
  );
  @ViewChild('navbar') nav!: ElementRef;

  constructor(
    public auth: AuthService,
    private tagService: TitleTagService,
  ) {
    this.tagService.setTitle("Vinyl.LK: Sri Lanka's largest records database");
    this.tagService.setSocialMediaTags(
      'http://www.vinyl.lk',
      "Vinyl.LK: Sri Lanka's largest records database",
      'Join today to enjoy generations of classic music',
      'https://www.vinyl.lk/assets/images/social.jpeg',
    );
  }

  @HostListener('window:scroll', ['$event'])
  scrolled(event: Event) {
    if ((event.currentTarget as any).scrollY > 50) {
      (this.nav.nativeElement as HTMLElement).classList.contains(
        'bg-opacity-70',
      ) &&
        (this.nav.nativeElement as HTMLElement).classList.remove(
          'bg-opacity-70',
        );
    } else {
      !(this.nav.nativeElement as HTMLElement).classList.contains(
        'bg-opacity-70',
      ) &&
        (this.nav.nativeElement as HTMLElement).classList.add('bg-opacity-70');
    }
  }

  toggleMenu() {
    this.menuOpen.update((open) => !open);
  }
}
