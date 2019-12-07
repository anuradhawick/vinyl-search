import { Component, OnInit, ViewChild } from '@angular/core';
import { PostEditorComponent } from '../post-editor/post-editor.component';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material';
import { LoaderComponent } from '../../shared-modules/loader/loader.component';
import { MarketService } from '../../services/market.service';

@Component({
  selector: 'app-new-post',
  templateUrl: './new-post.component.html',
  styleUrls: ['./new-post.component.css']
})
export class NewPostComponent implements OnInit {
  @ViewChild('editor', {static: false}) editor: PostEditorComponent;
  @ViewChild('loader', {static: false}) loader: LoaderComponent;
  private ready = true;

  public testPost = {
    chosenImage: 0,
    images: [],
    name: 'Test',
    description: 'Test Desc',
    currency: 'Rs',
    price: 1000,
    saleType: 'gear',
    saleSubtype: 'audio',
    isNegotiable: true
  };

  constructor(private marketService: MarketService,
              private router: Router,
              private toastr: ToastrService,
              public dialog: MatDialog) {

  }

  ngOnInit() {

  }

  save() {
    const post = this.editor.getReleaseData();

    if (post) {
      this.loader.show();
      this.ready = false;

      const data = this.marketService.save_post(post);

      data.then((result: any) => {
        if (result.recordId) {
          this.toastr.success(`Records saved successfully`, 'Success');
          this.router.navigate(['/market', result.recordId, 'view']);
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

  readyChange(event) {
    this.ready = event;
  }

}
