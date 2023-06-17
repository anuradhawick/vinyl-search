import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-forum-should-delete',
  templateUrl: './forum-should-delete.component.html',
  styleUrls: ['./forum-should-delete.component.css']
})
export class ForumShouldDeleteModalComponent implements OnInit {

  constructor(
    @Inject(MatDialogRef<ForumShouldDeleteModalComponent>) public dialogRef: MatDialogRef<ForumShouldDeleteModalComponent>
  ) {
  }

  close(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
  }

}
