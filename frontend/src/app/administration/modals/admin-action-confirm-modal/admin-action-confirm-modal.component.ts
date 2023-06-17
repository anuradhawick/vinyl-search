import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-admin-action-confirm-modal',
  templateUrl: './admin-action-confirm-modal.component.html',
  styleUrls: ['./admin-action-confirm-modal.component.css']
})
export class AdminActionConfirmModalComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
  }

}
