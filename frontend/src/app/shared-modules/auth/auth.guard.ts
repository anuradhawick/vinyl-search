import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private user!: Observable<any>;

  constructor(private auth: AuthService, @Inject(PLATFORM_ID) private platformId: any) {
  }

  canActivate(next: ActivatedRouteSnapshot,
              state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return new Promise((resolve, reject) => {
      if (isPlatformServer(this.platformId)) {
        resolve(true);
      } else if (!this.auth.isLoggedIn) {
        this.auth.autoLogin.then((login: any) => {
          if (!login) {
            this.auth.login(JSON.stringify([state.url]));
            resolve(false);
          } else {
            resolve(true);
          }
        });
      } else {
        resolve(true);
      }
    });
  }
}
