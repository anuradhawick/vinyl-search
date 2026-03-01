import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
  imports: [RouterLink],
})
export class HomePageComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
