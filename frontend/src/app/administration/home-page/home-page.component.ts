import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
  @ViewChild('hscroll')
  private hscroll!: ElementRef;

  constructor() {
  }

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
