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
  selector: 'app-forum-should-delete',
  templateUrl: './forum-should-delete.component.html',
  styleUrls: ['./forum-should-delete.component.css'],
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatDialogClose,
  ],
})
export class ForumShouldDeleteModalComponent implements OnInit {
  constructor(
    @Inject(MatDialogRef<ForumShouldDeleteModalComponent>)
    public dialogRef: MatDialogRef<ForumShouldDeleteModalComponent>,
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  ngOnInit() {}
}
