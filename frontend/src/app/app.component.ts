import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { AuthService } from './shared-modules/services/auth.service';
import { TitleTagService } from './shared-modules/services/title-tag.service';
import * as _ from 'lodash';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  public _ = _;
  public user: Observable<any>;
  protected menuOpen = false;
  @ViewChild('navbar') nav!: ElementRef;

  constructor(
    public auth: AuthService,
    private tagService: TitleTagService,
  ) {
    this.user = auth.user;
    this.tagService.setTitle("Vinyl.LK: Sri Lanka's largest records database");
    this.tagService.setSocialMediaTags(
      'http://www.vinyl.lk',
      "Vinyl.LK: Sri Lanka's largest records database",
      'Join today to enjoy generations of classic music',
      'https://www.vinyl.lk/assets/images/social.jpeg',
    );
  }

  @HostListener('window:scroll')
  scrolled() {
    if (window.scrollY > 50) {
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
}
