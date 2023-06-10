import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import * as _ from 'lodash';

@Component({
  selector: 'app-choose-filter',
  templateUrl: './choose-filter.component.html',
  styleUrls: ['./choose-filter.component.css']
})
export class ChooseFilterComponent implements OnInit {
  public selected = [];
  public _ = _;

  constructor(private dialogRef: MatDialogRef<ChooseFilterComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.selected = data.selected;
  }

  ngOnInit() {
  }

  isSelected(filter) {
    return _.isEmpty(_.find(this.selected, (item) => item === filter));
  }

  toggleFilter(filter) {
    if (_.find(this.selected, (item) => item === filter)) {
      _.remove(this.selected, (item) => item === filter);
    } else {
      this.selected.push(filter);
    }
  }

  done(filters, selected) {
    this.dialogRef.close({filters, selected});
  }

}
