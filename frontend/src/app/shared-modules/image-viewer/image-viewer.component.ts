import {
  Component,
  OnInit,
  Input,
  Optional,
  Inject,
  Output,
  EventEmitter,
  HostListener,
} from '@angular/core';
import { ToggleFullscreenDirective } from './fullscreen.directive';
import { NgStyle } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

interface ImageViewerConfig {
  zoomFactor?: number;
  containerBackgroundColor?: string;
  wheelZoom?: boolean;
  allowFullscreen?: boolean;
  allowKeyboardNavigation?: boolean;

  btnShow: {
    zoomIn?: boolean;
    zoomOut?: boolean;
    rotateClockwise?: boolean;
    rotateCounterClockwise?: boolean;
    next?: boolean;
    prev?: boolean;
  };

  btnIcons?: {
    zoomIn?: string;
    zoomOut?: string;
    rotateClockwise?: string;
    rotateCounterClockwise?: string;
    next?: string;
    prev?: string;
    fullscreen?: string;
    fullscreenExit?: string;
  };

  customBtns?: Array<{
    name: string;
    icon: string;
  }>;
}

class CustomEvent {
  name: string;
  imageIndex: number;

  constructor(name: any, imageIndex: any) {
    this.name = name;
    this.imageIndex = imageIndex;
  }
}

const DEFAULT_CONFIG: ImageViewerConfig = {
  zoomFactor: 0.1,
  containerBackgroundColor: '#000',
  wheelZoom: true,
  allowFullscreen: true,
  allowKeyboardNavigation: true,
  btnShow: {
    zoomIn: true,
    zoomOut: true,
    rotateClockwise: true,
    rotateCounterClockwise: true,
    next: true,
    prev: true,
  },
  btnIcons: {
    zoomIn: 'zoom_in',
    zoomOut: 'zoom_out',
    rotateClockwise: 'rotate_right',
    rotateCounterClockwise: 'rotate_left',
    next: 'navigate_next',
    prev: 'navigate_before',
    fullscreen: 'fullscreen',
    fullscreenExit: 'fullscreen_exit',
  },
};

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss'],
  imports: [
    ToggleFullscreenDirective,
    NgStyle,
    MatProgressSpinner,
    MatMiniFabButton,
    MatIcon,
  ],
})
export class ImageViewerComponent implements OnInit {
  @Input()
  src: string[] = [];

  @Input()
  index = 0;

  @Input()
  config: ImageViewerConfig = DEFAULT_CONFIG;

  @Output()
  indexChange: EventEmitter<number> = new EventEmitter();

  @Output()
  configChange: EventEmitter<ImageViewerConfig> = new EventEmitter();

  @Output()
  customEvent: EventEmitter<CustomEvent> = new EventEmitter();

  public style = {
    transform: '',
    msTransform: '',
    oTransform: '',
    webkitTransform: '',
  };
  public fullscreen = false;
  public loading = true;
  private scale = 1;
  private rotation = 0;
  private translateX = 0;
  private translateY = 0;
  private prevX: number = 0;
  private prevY: number = 0;
  private hovered = false;

  constructor(
    @Optional() @Inject('config') public moduleConfig: ImageViewerConfig,
  ) {}

  ngOnInit() {
    const merged = this.mergeConfig(DEFAULT_CONFIG, this.moduleConfig);
    this.config = this.mergeConfig(merged, this.config);
    this.triggerConfigBinding();
  }

  @HostListener('window:keyup.ArrowRight', ['$event'])
  nextImage(event: any) {
    if (this.canNavigate(event) && this.index < this.src.length - 1) {
      this.loading = true;
      this.index++;
      this.triggerIndexBinding();
      this.reset();
    }
  }

  @HostListener('window:keyup.ArrowLeft', ['$event'])
  prevImage(event: any) {
    if (this.canNavigate(event) && this.index > 0) {
      this.loading = true;
      this.index--;
      this.triggerIndexBinding();
      this.reset();
    }
  }

  @HostListener('document:fullscreenchange')
  @HostListener('document:webkitfullscreenchange')
  @HostListener('document:mozfullscreenchange')
  @HostListener('document:MSFullscreenChange')
  onEscPress() {
    if (!document.fullscreenElement) {
      this.fullscreen = false;
    }
  }

  @HostListener('mouseover')
  onMouseOver() {
    this.hovered = true;
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.hovered = false;
  }

  zoomIn() {
    this.scale *= 1 + this.config.zoomFactor!;
    this.updateStyle();
  }

  zoomOut() {
    if (this.scale > this.config.zoomFactor!) {
      this.scale /= 1 + this.config.zoomFactor!;
    }
    this.updateStyle();
  }

  scrollZoom(event: WheelEvent) {
    if (this.config.wheelZoom) {
      event.deltaY > 0 ? this.zoomOut() : this.zoomIn();
      return false;
    }
    return;
  }

  rotateClockwise() {
    this.rotation += 90;
    this.updateStyle();
  }

  rotateCounterClockwise() {
    this.rotation -= 90;
    this.updateStyle();
  }

  onLoad() {
    this.loading = false;
  }

  onLoadStart() {
    this.loading = true;
  }

  onDragOver(evt: any) {
    this.translateX += evt.clientX - this.prevX;
    this.translateY += evt.clientY - this.prevY;
    this.prevX = evt.clientX;
    this.prevY = evt.clientY;
    this.updateStyle();
  }

  onDragStart(evt: any) {
    if (evt.dataTransfer && evt.dataTransfer.setDragImage) {
      evt.dataTransfer.setDragImage(evt.target.nextElementSibling, 0, 0);
    }
    this.prevX = evt.clientX;
    this.prevY = evt.clientY;
  }

  toggleFullscreen() {
    this.fullscreen = !this.fullscreen;
    if (!this.fullscreen) {
      this.reset();
    }
  }

  triggerIndexBinding() {
    this.indexChange.emit(this.index);
  }

  triggerConfigBinding() {
    this.configChange.next(this.config);
  }

  fireCustomEvent(name: any, imageIndex: any) {
    this.customEvent.emit(new CustomEvent(name, imageIndex));
  }

  reset() {
    this.scale = 1;
    this.rotation = 0;
    this.translateX = 0;
    this.translateY = 0;
    this.updateStyle();
  }

  private canNavigate(event: any) {
    return (
      event == null || (this.config.allowKeyboardNavigation && this.hovered)
    );
  }

  private updateStyle() {
    this.style.transform = `translate(${this.translateX}px, ${this.translateY}px) rotate(${this.rotation}deg) scale(${this.scale})`;
    this.style.msTransform = this.style.transform;
    this.style.webkitTransform = this.style.transform;
    this.style.oTransform = this.style.transform;
  }

  private mergeConfig(
    defaultValues: ImageViewerConfig,
    overrideValues: ImageViewerConfig,
  ): ImageViewerConfig {
    let result: ImageViewerConfig = { ...defaultValues };
    if (overrideValues) {
      result = { ...defaultValues, ...overrideValues };

      if (overrideValues.btnIcons) {
        result.btnIcons = {
          ...defaultValues.btnIcons,
          ...overrideValues.btnIcons,
        };
      }
    }
    return result;
  }
}
