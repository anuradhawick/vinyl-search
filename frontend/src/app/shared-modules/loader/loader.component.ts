import { Component, Input, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformServer } from '@angular/common';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
})
export class LoaderComponent implements OnInit {
  @Input() public hidden;
  @Input() public loading;

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    this.hidden = true;
    this.loading = !this.hidden;
  }

  ngOnInit() {}

  show() {
    if (isPlatformServer(this.platformId)) {
      return;
    }
    this.hidden = false;
    this.loading = !this.hidden;
  }

  hide() {
    if (isPlatformServer(this.platformId)) {
      return;
    }
    this.hidden = true;
    this.loading = !this.hidden;
  }

  isHidden() {
    if (isPlatformServer(this.platformId)) {
      return true;
    }
    return this.hidden;
  }
}
