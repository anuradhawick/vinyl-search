import { ApplicationConfig } from '@angular/core';
import {
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
  provideRouter,
  RouteReuseStrategy,
} from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { appRoutes } from './app.routes';

class CustomReuseStrategy implements RouteReuseStrategy {
  private handlers: { [key: string]: DetachedRouteHandle } = {};

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return (
      route.url.at(-1)?.path !== 'edit' && route.url.at(-1)?.path !== 'new'
    );
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    this.handlers[this.getPath(route)] = handle;
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return !!this.handlers[this.getPath(route)] && !route.params['reload'];
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    if (!route.component) {
      return null;
    }
    return this.handlers[this.getPath(route)];
  }

  shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    curr: ActivatedRouteSnapshot,
  ): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  private getPath(route: ActivatedRouteSnapshot): string {
    let path: string = '';
    let next: ActivatedRouteSnapshot | null = route;

    while (next) {
      if (next.url.length) {
        path = next.url.join('/') + '/' + path;
      }
      next = next.parent;
    }
    return path;
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideClientHydration(),
    provideAnimations(),
    provideToastr({
      preventDuplicates: true,
    }),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    {
      provide: RouteReuseStrategy,
      useClass: CustomReuseStrategy,
    },
  ],
};
