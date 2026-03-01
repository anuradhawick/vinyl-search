import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../shared-modules/services/auth.service';
import { Observable } from 'rxjs';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-user-home-page',
  templateUrl: './user-home-page.component.html',
  styleUrls: ['./user-home-page.component.css'],
  imports: [MatButton, MatIcon, RouterLink, RouterOutlet, AsyncPipe],
})
export class UserHomePageComponent implements OnInit {
  public user: Observable<any>;
  @ViewChild('hscroll')
  private hscroll!: ElementRef;

  constructor(public auth: AuthService) {
    this.user = auth.user.asObservable();
  }

  ngOnInit() {}

  scroll(dir: string) {
    switch (dir) {
      case 'left':
        this.hscroll.nativeElement.scrollTo({
          left: this.hscroll.nativeElement.scrollLeft - 100,
          behavior: 'smooth',
        });
        break;
      case 'right':
        this.hscroll.nativeElement.scrollTo({
          left: this.hscroll.nativeElement.scrollLeft + 100,
          behavior: 'smooth',
        });
        break;

      default:
        break;
    }
  }
}
