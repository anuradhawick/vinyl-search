import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

export interface Item { name: string;
}

@Component({
  selector: 'app-auctions-page',
  templateUrl: './auctions-page.component.html',
  styleUrls: ['./auctions-page.component.css']
})
export class AuctionsPageComponent implements OnInit {
  email: string;
  password: string;

  items: Observable<Item[]>;

  constructor() {

  }

  submit() {

  }

  addImage(event) {

  }

  ngOnInit() {
  }
}
