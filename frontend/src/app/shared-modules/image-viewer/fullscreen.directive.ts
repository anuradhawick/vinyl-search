import {
  Directive,
  OnChanges,
  Input,
  ElementRef,
  SimpleChange,
} from '@angular/core';
import screenfull from 'screenfull';

@Directive({
  selector: '[appToggleFullscreen]',
})
export class ToggleFullscreenDirective implements OnChanges {
  @Input('appToggleFullscreen')
  isFullscreen: boolean = false;

  constructor(private el: ElementRef) {}

  ngOnChanges(change: any) {
    if (
      !!change.isFullscreen.previousValue === change.isFullscreen.currentValue
    ) {
      return;
    } else if (this.isFullscreen && screenfull.isEnabled) {
      screenfull.request(this.el.nativeElement);
    } else if (screenfull.isEnabled) {
      screenfull.exit();
    }
  }
}
