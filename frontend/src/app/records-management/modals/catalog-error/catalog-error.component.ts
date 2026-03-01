import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-catalog-error',
  templateUrl: './catalog-error.component.html',
  styleUrls: ['./catalog-error.component.css'],
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    RouterLink,
    MatDialogActions,
    MatButton,
  ],
})
export class CatalogErrorModalComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<CatalogErrorModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  ngOnInit() {}
}
