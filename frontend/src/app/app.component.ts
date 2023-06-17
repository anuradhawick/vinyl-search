import { Component } from '@angular/core';
import { AuthService } from './shared-modules/services/auth.service';
import { TitleTagService } from './shared-modules/services/title-tag.service';
import * as _ from 'lodash';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public _ = _;
  public user: Observable<any>;

  constructor(public auth: AuthService, private tagService: TitleTagService) {
    this.user = auth.user.asObservable();
    this.tagService.setTitle('Vinyl.LK: Sri Lanka\'s largest records database');
    this.tagService.setSocialMediaTags(
      'http://www.vinyl.lk',
      'Vinyl.LK: Sri Lanka\'s largest records database',
      'Join today to enjoy generations of classic music',
      'https://www.vinyl.lk/assets/images/social.jpeg'
    );
  }
}
