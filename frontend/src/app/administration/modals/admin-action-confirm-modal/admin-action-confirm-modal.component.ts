import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  standalone: true,
  selector: 'app-admin-action-confirm-modal',
  templateUrl: './admin-action-confirm-modal.component.html',
  styleUrls: ['./admin-action-confirm-modal.component.css'],
  imports: [MatDialogModule, MatButtonModule],
})
export class AdminActionConfirmModalComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: { message: string }) {
  }

  ngOnInit() {
  }

}
