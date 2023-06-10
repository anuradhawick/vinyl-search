import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-forum-should-delete',
  templateUrl: './forum-should-delete.component.html',
  styleUrls: ['./forum-should-delete.component.css']
})
export class ForumShouldDeleteModalComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ForumShouldDeleteModalComponent>) {
  }

  close(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
  }

}
