import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { LoaderComponent } from '../../shared/loader/loader.component';

@Component({
  selector: 'app-forum-home-page',
  templateUrl: './forum-home-page.component.html',
  styleUrls: ['./forum-home-page.component.css']
})
export class ForumHomePageComponent implements OnInit {
  private posts = [];
  @ViewChild('forumloader') loader: LoaderComponent;

  constructor(private fns: AngularFireFunctions) {
  }

  loadPosts() {
    const callable = this.fns.httpsCallable('retrieve_posts');
    const data = callable({limit: 50});

    data.subscribe((posts) => {
      this.posts = posts;
      this.loader.hide();
    });
  }

  ngOnInit() {
    this.loader.show();
    this.loadPosts();
  }
}
