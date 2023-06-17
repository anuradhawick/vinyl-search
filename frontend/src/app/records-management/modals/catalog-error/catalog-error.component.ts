import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-catalog-error',
  templateUrl: './catalog-error.component.html',
  styleUrls: ['./catalog-error.component.css']
})
export class CatalogErrorModalComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<CatalogErrorModalComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  close(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
  }

}
