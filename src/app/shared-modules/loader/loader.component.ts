import { Component, Input, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformServer } from '@angular/common';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit {
  @Input() public hidden;

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    this.hidden = true;
  }

  ngOnInit() {
  }

  show() {
    if (isPlatformServer(this.platformId)) {
      return;
    }
    this.hidden = false;
  }

  hide() {
    if (isPlatformServer(this.platformId)) {
      return;
    }
    this.hidden = true;
  }

  isHidden() {
    if (isPlatformServer(this.platformId)) {
      return true;
    }
    return this.hidden;
  }
}
