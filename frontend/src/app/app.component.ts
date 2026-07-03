import { Component } from '@angular/core';
import { TitleTagService } from './shared-modules/services/title-tag.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false,
})
export class AppComponent {
  constructor(private tagService: TitleTagService) {
    this.tagService.setTitle("Vinyl.LK: Sri Lanka's largest records database");
    this.tagService.setSocialMediaTags(
      'http://www.vinyl.lk',
      "Vinyl.LK: Sri Lanka's largest records database",
      'Join today to enjoy generations of classic music',
      'https://www.vinyl.lk/assets/images/social.jpeg',
    );
  }
}
