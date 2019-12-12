import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private user: Observable<any> = null;

  constructor(private auth: AuthService, private router: Router) {
    this.user = auth.user.asObservable();
  }

  canActivate(next: ActivatedRouteSnapshot,
              state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return new Promise((resolve, reject) => {
      if (!this.auth.isLoggedIn) {
        this.auth.login(JSON.stringify([state.url]));
      }
      this.user.subscribe((user: any) => {
        if (user) {
          resolve(true);
        }
      });
    });
  }
}
