import { Component, Inject, OnInit } from '@angular/core';
import {
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-record-should-delete-modal',
  templateUrl: './record-should-delete-modal.component.html',
  styleUrls: ['./record-should-delete-modal.component.css'],
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatDialogClose,
  ],
})
export class RecordShouldDeleteModalComponent implements OnInit {
  constructor(
    @Inject(MatDialogRef<RecordShouldDeleteModalComponent>)
    public dialogRef: MatDialogRef<RecordShouldDeleteModalComponent>,
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  ngOnInit() {}
}
