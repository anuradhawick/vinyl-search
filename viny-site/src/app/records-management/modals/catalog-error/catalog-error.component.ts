import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-catalog-error',
  templateUrl: './catalog-error.component.html',
  styleUrls: ['./catalog-error.component.css']
})
export class CatalogErrorModalComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<CatalogErrorModalComponent>,
              @Inject(MAT_DIALOG_DATA) public data: string) {
  }

  close(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
  }

}
