import { Component, OnInit } from '@angular/core';
import genresJSON from '../../shared/data/genres.json';
import countriesJSON from '../../shared/data/countries.json';
import decadesJSON from '../../shared/data/decades.json';
import * as _ from 'lodash';

@Component({
  selector: 'app-records-home-page',
  templateUrl: './records-home-page.component.html',
  styleUrls: ['./records-home-page.component.css']
})
export class RecordsHomePageComponent implements OnInit {
  private genresJSON = genresJSON;
  private countriesJSON = countriesJSON;
  private decadesJSON = decadesJSON;
  private objectKeys = Object.keys;
  private _ = _;

  private newRecord: {
    genre: string,
    subtype: string,
    decade: number,
    country: string
  } = {
    genre: '',
    subtype: '',
    decade: null,
    country: ''
  };

  constructor() {
    // console.log(genresJSON)
    // _.forEach(genresJSON, (v, k) => console.log(k))
  }

  ngOnInit() {
  }


}
