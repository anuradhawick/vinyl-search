import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit {
  public hidden;

  constructor() {
    this.hidden = true;
  }

  ngOnInit() {
  }

  show() {
    this.hidden = false;
  }

  hide() {
    this.hidden = true;
  }

  isHidden() {
    return this.hidden;
  }

}
