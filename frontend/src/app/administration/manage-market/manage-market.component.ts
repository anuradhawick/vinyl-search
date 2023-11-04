import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-manage-market',
  templateUrl: './manage-market.component.html',
  styleUrls: ['./manage-market.component.css']
})
export class ManageMarketComponent implements OnInit {
  @ViewChild('hscroll')
  private hscroll!: ElementRef;

  constructor() { }

  ngOnInit() {
  }

  scroll(dir: string) {
    switch (dir) {
      case 'left':
        this.hscroll.nativeElement.scrollTo({ left: (this.hscroll.nativeElement.scrollLeft - 100), behavior: 'smooth' });
        break;
      case 'right':
        this.hscroll.nativeElement.scrollTo({ left: (this.hscroll.nativeElement.scrollLeft + 100), behavior: 'smooth' });
        break;

      default:
        break;
    }
  }

}
