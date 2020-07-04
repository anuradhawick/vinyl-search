import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-action-confirm-modal',
  templateUrl: './action-confirm-modal.component.html',
  styleUrls: ['./action-confirm-modal.component.css']
})
export class ActionConfirmModalComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
  }

}
