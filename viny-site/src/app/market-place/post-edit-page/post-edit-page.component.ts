import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MarketService } from '../../services/market.service';
import { AuthService } from '../../shared-modules/auth/auth.service';
import { MatDialog } from '@angular/material';
import { LoaderComponent } from '../../shared-modules/loader/loader.component';
import { PostEditorComponent } from '../post-editor-module/post-editor.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-post-edit-page',
  templateUrl: './post-edit-page.component.html',
  styleUrls: ['./post-edit-page.component.css']
})
export class PostEditPageComponent implements OnInit {
  @ViewChild('editor', {static: false}) editor: PostEditorComponent;
  @ViewChild('loader', {static: false}) loader: LoaderComponent;
  public postObject = null;

  // context control
  public postLoading = true;
  private ready = true;

  constructor(public route: ActivatedRoute,
              private marketService: MarketService,
              public auth: AuthService,
              private toastr: ToastrService,
              private router: Router,
              public dialog: MatDialog) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe((map: any) => {
      const postId = _.get(map, 'params.postId', null);
      this.marketService.fetch_post(postId).toPromise().then((data) => {
        this.postObject = data;
      });
    });
  }

  readyChange(event) {
    this.ready = event;
  }

  save() {
    const post = this.editor.getReleaseData();

    if (post) {
      this.postObject = null;
      this.loader.show();
      this.ready = false;

      const data = this.marketService.update_post(post);

      data.then((result: any) => {
        if (result.id) {
          this.toastr.success(`Records saved successfully`, 'Success');
          this.router.navigate(['/market', result.id, 'view']);
        } else {
          this.ready = true;
          this.loader.hide();
        }
      }, () => {
        this.ready = true;
        this.loader.hide();
        this.toastr.error(`Unable to save the records. Try again later`, 'Error');
      });
    }
  }

}
