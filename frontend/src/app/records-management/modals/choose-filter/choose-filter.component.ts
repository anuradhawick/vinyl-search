import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as _ from 'lodash';

@Component({
  selector: 'app-choose-filter',
  templateUrl: './choose-filter.component.html',
  styleUrls: ['./choose-filter.component.css']
})
export class ChooseFilterComponent implements OnInit {
  public selected: Array<string> = [];
  public _ = _;

  constructor(private dialogRef: MatDialogRef<ChooseFilterComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.selected = data.selected;
  }

  ngOnInit() {
  }

  isSelected(filter: string) {
    return _.findIndex(this.selected, (item) => item === filter) !== -1;
  }

  toggleFilter(filter: string) {
    if (_.find(this.selected, (item) => item === filter)) {
      _.remove(this.selected, (item) => item === filter);
    } else {
      this.selected.push(filter);
    }
    console.log(filter, this.selected)
  }

  done(filters: any, selected: any) {
    this.dialogRef.close({ filters, selected });
  }

}
