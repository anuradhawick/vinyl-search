import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-record-should-delete-modal',
  templateUrl: './record-should-delete-modal.component.html',
  styleUrls: ['./record-should-delete-modal.component.css']
})
export class RecordShouldDeleteModalComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<RecordShouldDeleteModalComponent>) {
  }

  close(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
  }

}
