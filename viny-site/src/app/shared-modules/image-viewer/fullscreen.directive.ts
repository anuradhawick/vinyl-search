import { Directive, OnChanges, Input, ElementRef, SimpleChange } from '@angular/core';
import * as screenfull from 'screenfull';
import {Screenfull} from 'screenfull';

@Directive({
  selector: '[appToggleFullscreen]'
})
export class ToggleFullscreenDirective implements OnChanges {

  @Input('appToggleFullscreen')
  isFullscreen: boolean;

  constructor(private el: ElementRef) { }

  ngOnChanges(change) {
    if (!!change.isFullscreen.previousValue === change.isFullscreen.currentValue) {
      return;
    } else if (this.isFullscreen && (<Screenfull>screenfull).isEnabled) {
      (<Screenfull>screenfull).request(this.el.nativeElement);
    } else if ((<Screenfull>screenfull).isEnabled) {
      (<Screenfull>screenfull).exit();
    }
  }

}
